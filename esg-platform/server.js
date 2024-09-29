const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // CORS to handle cross-origin requests
require('dotenv').config();  // Load .env file

const { generateESGSummary } = require('./openaiService');  // Your OpenAI service

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json()); 

// Middleware to handle CORS (allow requests from different origins, like your frontend)
app.use(cors());

// MongoDB connection
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    setTimeout(connectToMongoDB, 5000);  // Retry connection after 5 seconds if it fails
  }
};
connectToMongoDB();  // Connect to MongoDB

// Route to generate ESG report
app.post('/api/esg-report', async (req, res) => {
  const { companyName, focusArea } = req.body;

  // Validate input
  if (!companyName || !focusArea) {
    return res.status(400).json({ error: 'Company name and focus area are required' });
  }

  try {
    console.log("Generating ESG report for:", companyName, focusArea);  // Log inputs
    
    const report = await generateESGSummary(companyName, focusArea);

    console.log("Generated report:", report);  // Log the generated report
    
    return res.json({ report });
  } catch (error) {
    console.error("Error in API route:", error.message);  // Log any errors
    return res.status(500).json({ error: 'Failed to generate ESG report' });
  }
});

// Catch-all route to handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
