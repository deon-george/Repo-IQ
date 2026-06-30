import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <div className="hero-card">
        <div className="hero-content">
          <div className="hero-tag">REPO-IQ</div>
          <h1 className="hero-title">Repo-IQ</h1>
          <p className="hero-desc">
            Press the <strong>Start Analyse</strong> button to submit any public GitHub URL, inspect the codebase, and chat with the AI model to explore the architecture.
          </p>
          <Link to="/analyzer" style={{ textDecoration: 'none' }}>
            <button className="hero-btn">Start Analyse</button>
          </Link>
        </div>
        
        <div className="hero-badge">
          <div className="badge-small">AI Powered</div>
          <div className="badge-large">Repository<br />Explorer</div>
        </div>
      </div>
      
      <footer style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', zIndex: 10, marginTop: '1.5rem' }}>
        Built by <a href="https://github.com/deon-george" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Deon George</a> | 
        <a href="https://github.com/dhanush35-lab" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}> Dhanush M</a> | 
        <a href="https://github.com/iamkarthik2004" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}> Karthik Krishnan</a>
      </footer>
    </>
  );
}

export default Home;
