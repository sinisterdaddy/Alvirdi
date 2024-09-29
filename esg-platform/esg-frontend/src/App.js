import React, { useState } from 'react';
import './App.css'; // Import the CSS file

function App() {
  const [companyName, setCompanyName] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [report, setReport] = useState('');
  const [file, setFile] = useState(null); // For file uploads

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('http://localhost:5000/api/esg-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, focusArea }),
    });

    const data = await response.json();
    setReport(data.report);
  };

  // Handle file upload for CSV/XML
  const handleFileUpload = async (type) => {
    const formData = new FormData();
    formData.append('file', file);

    const url = type === 'csv' 
      ? 'http://localhost:5000/api/import/csv' 
      : 'http://localhost:5000/api/import/xml';

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    alert(data.message);
  };

  // Download CSV/XML data
  const handleExport = (type) => {
    const url = type === 'csv' 
      ? 'http://localhost:5000/api/export/csv' 
      : 'http://localhost:5000/api/export/xml';

    window.open(url, '_blank');
  };

  return (
    <div className="App">
      <h1>AI-powered ESG Platform</h1>
      
      {/* ESG Report Form */}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Company Name" 
          value={companyName} 
          onChange={(e) => setCompanyName(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Focus Area" 
          value={focusArea} 
          onChange={(e) => setFocusArea(e.target.value)} 
        />
        <button type="submit">Generate Report</button>
      </form>
      
      {report && (
        <div className="report">
          <h2>ESG Report</h2>
          <p>{report}</p>
        </div>
      )}

      {/* File Upload for CSV/XML */}
      <div className="upload-section">
        <h3>Import Data</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={() => handleFileUpload('csv')}>Upload CSV</button>
        <button onClick={() => handleFileUpload('xml')}>Upload XML</button>
      </div>

      {/* Export Data as CSV/XML */}
      <div className="export-section">
        <h3>Export Data</h3>
        <button onClick={() => handleExport('csv')}>Download CSV</button>
        <button onClick={() => handleExport('xml')}>Download XML</button>
      </div>
    </div>
  );
}

export default App;
