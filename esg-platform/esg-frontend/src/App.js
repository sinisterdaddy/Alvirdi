import React, { useState } from 'react';

function App() {
  const [companyName, setCompanyName] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading
  const [error, setError] = useState(null); // New state for error handling

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(null); // Reset any previous error

    try {
      const response = await fetch('http://localhost:5000/api/esg-report', { // Full backend URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, focusArea }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report'); // Handle non-200 responses
      }

      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      setError(err.message); // Capture error and display
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="App" style={styles.container}>
      <h1>AI-powered ESG Platform</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="text" 
          placeholder="Company Name" 
          value={companyName} 
          onChange={(e) => setCompanyName(e.target.value)} 
          style={styles.input}
        />
        <input 
          type="text" 
          placeholder="Focus Area" 
          value={focusArea} 
          onChange={(e) => setFocusArea(e.target.value)} 
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </form>

      {/* Display loading, error, or report */}
      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {report && (
        <div style={styles.report}>
          <h2>ESG Report</h2>
          <p>{report}</p>
        </div>
      )}
    </div>
  );
}

// Basic inline styles
const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  form: {
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    margin: '10px',
    fontSize: '16px',
    width: '200px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  report: {
    backgroundColor: '#f4f4f4',
    padding: '20px',
    marginTop: '20px',
    borderRadius: '8px',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
};

export default App;
