import { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDetect = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to analyze')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze prompt')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the prompt')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return '#dc2626'
      case 'high': return '#ea580c'
      case 'medium': return '#ca8a04'
      case 'low': return '#16a34a'
      default: return '#6b7280'
    }
  }

  const getRiskBadge = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return 'CRITICAL'
      case 'high': return 'HIGH'
      case 'medium': return 'MEDIUM'
      case 'low': return 'LOW'
      default: return 'UNKNOWN'
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🛡️ AI Agent Security</h1>
        <p>Prompt Injection Detection System</p>
      </header>

      <main className="main">
        <div className="input-section">
          <label htmlFor="prompt-input">Enter your prompt to analyze:</label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste or type the prompt you want to check for injection attacks..."
            rows={8}
          />
          <button 
            onClick={handleDetect} 
            disabled={loading}
            className="detect-button"
          >
            {loading ? 'Analyzing...' : 'Detect Injection'}
          </button>
          {error && <div className="error">{error}</div>}
        </div>

        {result && (
          <div className="results-section">
            <div className="risk-summary" style={{ borderColor: getRiskColor(result.riskLevel) }}>
              <div className="risk-badge" style={{ backgroundColor: getRiskColor(result.riskLevel) }}>
                {getRiskBadge(result.riskLevel)}
              </div>
              <div className="risk-details">
                <h2>Risk Level: {result.riskLevel.toUpperCase()}</h2>
                <p>Risk Score: {result.riskScore}/20</p>
                <p>Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                <p>Injection Detected: {result.isInjection ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {result.findings.length > 0 && (
              <div className="findings">
                <h3>Detection Findings</h3>
                {result.findings.map((finding, index) => (
                  <div key={index} className="finding-category">
                    <h4>{finding.category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p>{finding.count} match(es) found</p>
                    <div className="finding-matches">
                      {finding.matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="finding-match">
                          <span className="severity severity-{match.severity}">
                            Severity: {match.severity}
                          </span>
                          {match.pattern && <code>{match.pattern}</code>}
                          {match.type && <span>Type: {match.type}</span>}
                          {match.data && <pre>{JSON.stringify(match.data, null, 2)}</pre>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="timestamp">
              Analyzed at: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
