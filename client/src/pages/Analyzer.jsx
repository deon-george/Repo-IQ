import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Update this to your deployed Railway API URL when deploying
const API_URL = 'http://localhost:5000';

function Analyzer() {
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState({ text: '', type: '' });
  const [isIngesting, setIsIngesting] = useState(false);
  const [isChatEnabled, setIsChatEnabled] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'system', text: 'Please analyze a repository to start chatting.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  const showStatus = (text, type) => {
    setStatus({ text, type });
  };

  const handleIngest = async () => {
    if (!repoUrl.trim()) {
      showStatus('Please enter a valid GitHub URL', 'error');
      return;
    }

    setIsIngesting(true);
    showStatus('Cloning & Analyzing repository (this may take a minute)...', 'loading');

    try {
      const response = await axios.post(`${API_URL}/ingest`, { repo_url: repoUrl.trim() });
      if (response.data.success) {
        showStatus('Repository analyzed successfully! You can now chat.', 'success');
        setIsChatEnabled(true);
        setChatMessages([{ type: 'system', text: 'System: Repository loaded. How can I help you?' }]);
      } else {
        showStatus(response.data.error || 'Failed to analyze repository', 'error');
      }
    } catch (err) {
      showStatus(err.response?.data?.error || 'Server connection failed. Is the backend running?', 'error');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleClearRepo = async () => {
    try {
      const response = await axios.post(`${API_URL}/clear-repo`);
      if (response.data.success) {
        setRepoUrl('');
        showStatus('Repository cleared.', 'success');
        setIsChatEnabled(false);
        setChatMessages([{ type: 'system', text: 'Please analyze a repository to start chatting.' }]);
      } else {
        showStatus(response.data.error || 'Failed to clear repository', 'error');
      }
    } catch (err) {
      showStatus('Server connection failed.', 'error');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const question = chatInput.trim();
    setChatMessages(prev => [...prev, { type: 'user', text: question }]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ask`, { question });
      setChatMessages(prev => [...prev, { type: 'bot', text: response.data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { type: 'bot', text: `Error: ${err.response?.data?.error || 'Could not connect to the server.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await axios.post(`${API_URL}/new-chat`);
      setChatMessages([{ type: 'system', text: 'Chat history cleared.' }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <>
      <div className="glass-container">
        <header>
          <h1>Repo-IQ</h1>
          <p>Explore and chat with any GitHub repository.</p>
        </header>

        <section className="ingestion-section">
          <div className="input-group">
            <input 
              type="text" 
              id="repo-url" 
              placeholder="Paste GitHub Repository URL (e.g., https://github.com/user/repo)"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <button id="ingest-btn" onClick={handleIngest} disabled={isIngesting}>
              {isIngesting ? 'Analyzing...' : 'Analyze'}
            </button>
            <button id="clear-repo-btn" title="Clear Repo" onClick={handleClearRepo}>🗑️</button>
          </div>
          <div id="status-message" className={`status-message status-${status.type}`}>
            {status.text}
          </div>
        </section>

        <section 
          id="chat-section" 
          className="chat-section" 
          style={{ 
            opacity: isChatEnabled ? 1 : 0.5, 
            pointerEvents: isChatEnabled ? 'auto' : 'none' 
          }}
        >
          <div id="chat-box" className="chat-box" ref={chatBoxRef}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}-message`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="loading-dots"><span></span><span></span><span></span></div>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <input 
              type="text" 
              id="chat-input" 
              placeholder="Ask a question about the repository..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button id="send-btn" onClick={handleSendMessage}>Send</button>
            <button id="clear-btn" title="Clear Chat" onClick={handleClearChat}>🗑️</button>
          </div>
        </section>
      </div>

      <footer style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', zIndex: 10, marginTop: '1.5rem' }}>
        Built by <a href="https://github.com/deon-george" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Deon George</a> | 
        <a href="https://github.com/dhanush35-lab" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}> Dhanush M</a> | 
        <a href="https://github.com/iamkarthik2004" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}> Karthik Krishnan</a>
      </footer>
    </>
  );
}

export default Analyzer;
