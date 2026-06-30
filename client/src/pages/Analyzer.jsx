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
        showStatus('Analyse complete, you can ask questions about the repo', 'success');
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
      <div className="analyzer-card">
        <header className="analyzer-header">
          <h1>Repo Analyzer</h1>
          <p>AI-Powered GitHub Repository Exploration</p>
        </header>

        <div className="input-row">
          <input 
            type="text" 
            className="input-field"
            placeholder="https://github.com/username/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <button className="btn-primary" onClick={handleIngest} disabled={isIngesting}>
            {isIngesting ? 'Analyzing...' : 'Analyze'}
          </button>
          <button className="btn-icon" onClick={handleClearRepo} title="Clear Repo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M9 3V4H4V6H5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z"></path>
            </svg>
          </button>
        </div>
        
        {status.text && (
          <div style={{ color: status.type === 'error' ? '#f87171' : (status.type === 'success' ? '#10b981' : '#fcd34d'), textAlign: 'center', fontSize: '0.9rem' }}>
            {status.text}
          </div>
        )}

        <div 
          className="chat-area" 
          ref={chatBoxRef}
        >
          {chatMessages.length === 1 && chatMessages[0].text === 'Please analyze a repository to start chatting.' ? (
             <div className="chat-placeholder">{chatMessages[0].text}</div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} className={msg.type === 'system' ? 'chat-placeholder' : `message ${msg.type}-message`}>
                {msg.text}
              </div>
            ))
          )}
          {isLoading && (
            <div className="message bot-message">
              <div className="loading-dots"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>

        <div className="input-row" style={{ opacity: isChatEnabled ? 1 : 0.5, pointerEvents: isChatEnabled ? 'auto' : 'none' }}>
          <input 
            type="text" 
            className="input-field"
            placeholder="Ask a question about the codebase..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="btn-primary" onClick={handleSendMessage}>
            Send
          </button>
          <button className="btn-icon" onClick={handleClearChat} title="Clear Chat">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M9 3V4H4V6H5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z"></path>
            </svg>
          </button>
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

export default Analyzer;
