const API_URL = "";

const elements = {
    repoUrl: document.getElementById('repo-url'),
    ingestBtn: document.getElementById('ingest-btn'),
    clearRepoBtn: document.getElementById('clear-repo-btn'),
    statusMessage: document.getElementById('status-message'),
    chatSection: document.getElementById('chat-section'),
    chatBox: document.getElementById('chat-box'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    clearBtn: document.getElementById('clear-btn')
};

// --- Ingestion Flow ---

elements.ingestBtn.addEventListener('click', async () => {
    const url = elements.repoUrl.value.trim();
    if (!url) {
        showStatus('Please enter a valid GitHub URL', 'error');
        return;
    }

    // Set Loading state
    elements.ingestBtn.disabled = true;
    showStatus('Cloning & Analyzing repository (this may take a minute)...', 'loading');

    try {
        const response = await fetch(`${API_URL}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repo_url: url })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showStatus('Repository analyzed successfully! You can now chat.', 'success');
            enableChat();
        } else {
            showStatus(data.error || 'Failed to analyze repository', 'error');
        }
    } catch (err) {
        showStatus('Server connection failed. Is the backend running?', 'error');
    } finally {
        elements.ingestBtn.disabled = false;
    }
});

elements.clearRepoBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/clear-repo`, { method: 'POST' });
        const data = await response.json();
        if (response.ok && data.success) {
            elements.repoUrl.value = '';
            showStatus('Repository cleared.', 'success');
            elements.chatSection.style.opacity = '0.5';
            elements.chatSection.style.pointerEvents = 'none';
            elements.chatBox.innerHTML = `
                <div class="message system-message">
                    Please analyze a repository to start chatting.
                </div>
            `;
        } else {
            showStatus(data.error || 'Failed to clear repository', 'error');
        }
    } catch (err) {
        showStatus('Server connection failed.', 'error');
    }
});

function showStatus(text, type) {
    elements.statusMessage.textContent = text;
    elements.statusMessage.className = 'status-message';
    if (type === 'loading') elements.statusMessage.classList.add('status-loading');
    if (type === 'success') elements.statusMessage.classList.add('status-success');
    if (type === 'error') elements.statusMessage.classList.add('status-error');
}

function enableChat() {
    elements.chatSection.style.opacity = '1';
    elements.chatSection.style.pointerEvents = 'auto';
    elements.chatBox.innerHTML = ''; 
    addMessage('system', 'System: Repository loaded. How can I help you?');
}

// --- Chat Flow ---

elements.sendBtn.addEventListener('click', sendMessage);
elements.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const question = elements.chatInput.value.trim();
    if (!question) return;

    // Add user msg
    addMessage('user', question);
    elements.chatInput.value = '';
    
    // Add loading dots
    const loadingId = addLoading();

    try {
        const response = await fetch(`${API_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        
        const data = await response.json();
        removeLoading(loadingId);

        if (response.ok) {
            addMessage('bot', data.answer);
        } else {
            addMessage('bot', `Error: ${data.error}`);
        }
    } catch (err) {
        removeLoading(loadingId);
        addMessage('bot', 'Error: Could not connect to the server.');
    }
}

elements.clearBtn.addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/new-chat`, { method: 'POST' });
        elements.chatBox.innerHTML = '';
        addMessage('system', 'Chat history cleared.');
    } catch (err) {
        console.error(err);
    }
});

// --- UI Helpers ---

function addMessage(type, text) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    div.textContent = text;
    elements.chatBox.appendChild(div);
    elements.chatBox.scrollTop = elements.chatBox.scrollHeight;
}

function addLoading() {
    const id = 'load-' + Date.now();
    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.id = id;
    div.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;
    elements.chatBox.appendChild(div);
    elements.chatBox.scrollTop = elements.chatBox.scrollHeight;
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
