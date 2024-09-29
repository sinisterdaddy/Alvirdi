const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // For handling CORS
const multer = require('multer'); // For file uploads
const csvParser = require('csv-parser'); // CSV parser
const { parseString } = require('xml2js'); // XML parser
const { Parser } = require('json2csv'); // JSON to CSV converter
const fs = require('fs');
require('dotenv').config(); // For loading environment variables

const { generateESGSummary } = require('./openaiService'); // Your OpenAI service

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for cross-origin requests (allows React app on localhost:3000 to access this backend)
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for file upload handling
const upload = multer({ dest: uploadDir });

// MongoDB model for storing ESG data
const ESGData = mongoose.model('ESGData', new mongoose.Schema({
  companyName: String,
  focusArea: String,
  data: Object, // Storing data from CSV/XML
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));

// API to import CSV file
app.post('/api/import/csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      results.forEach(async (row) => {
        const esgData = new ESGData({
          companyName: row.companyName,
          focusArea: row.focusArea,
          data: row,
        });
        await esgData.save();
      });

      // Optionally, delete the file after processing
      fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });

      res.json({ message: 'CSV data imported successfully' });
    });
});

// API to import XML file
app.post('/api/import/xml', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;

  fs.readFile(filePath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    // Parse XML data
    parseString(data, async (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to parse XML' });

      const xmlData = result.records.record;
      xmlData.forEach(async (item) => {
        const esgData = new ESGData({
          companyName: item.companyName[0],
          focusArea: item.focusArea[0],
          data: item,
        });
        await esgData.save();
      });

      // Optionally, delete the file after processing
      fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });

      res.json({ message: 'XML data imported successfully' });
    });
  });
});

// API to export data as CSV
app.get('/api/export/csv', async (req, res) => {
  try {
    const data = await ESGData.find().lean(); // Fetch all data from MongoDB
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('esg-data.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV data' });
  }
});

// API to export data as XML
app.get('/api/export/xml', async (req, res) => {
  try {
    const data = await ESGData.find().lean(); // Fetch all data from MongoDB
    const xmlBuilder = new require('xml2js').Builder();
    const xml = xmlBuilder.buildObject({ records: { record: data } });

    res.header('Content-Type', 'application/xml');
    res.attachment('esg-data.xml');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export XML data' });
  }
});

// Route to generate ESG report (existing functionality)
app.post('/api/esg-report', async (req, res) => {
  const { companyName, focusArea } = req.body;

  if (!companyName || !focusArea) {
    return res.status(400).json({ error: 'Company name and focus area are required' });
  }

  try {
    const report = await generateESGSummary(companyName, focusArea);
    return res.json({ report });
  } catch (error) {
    console.error('Error generating ESG report:', error);  // Log error details for debugging
    return res.status(500).json({ error: 'Failed to generate ESG report' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
