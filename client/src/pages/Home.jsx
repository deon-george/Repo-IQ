import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <div className="home-card">
        <div className="home-content">
          <div className="home-tag">REPO-IQ</div>
          <h1 className="home-title">Repo-IQ</h1>
          <p className="home-desc">
            Press the <strong>Start Analyse</strong> button to submit any public GitHub URL, inspect the codebase, and chat with the AI model to explore the architecture.
          </p>
          <Link to="/analyzer" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Start Analyse</button>
          </Link>
        </div>
        
        <div className="home-badge">
          <div className="badge-small">AI Powered</div>
          <div className="badge-large">Repository<br />Explorer</div>
        </div>
      </div>
      
      <footer className="footer">
        Built by <a href="https://github.com/deon-george" target="_blank" rel="noopener noreferrer">Deon George</a> | 
        <a href="https://github.com/dhanush35-lab" target="_blank" rel="noopener noreferrer"> Dhanush M</a> | 
        <a href="https://github.com/iamkarthik2004" target="_blank" rel="noopener noreferrer"> Karthik Krishnan</a>
      </footer>
    </>
  );
}

export default Home;
