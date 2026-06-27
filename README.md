# GitHub Repo Analyzer 🚀

An AI-powered GitHub Repository exploration tool built using a **RAG (Retrieval-Augmented Generation)** pipeline. This project dynamically clones a GitHub repository, processes its source files into vector embeddings using **ChromaDB**, and allows you to chat with the codebase using **Google's Gemini AI**.

---

## ✨ Features

- **Dynamic Ingestion**: Pass any public GitHub URL and the pipeline automatically clones, chunks, and vectorizes the codebase.
- **Context-Aware AI Answers**: Ask complex questions about the architecture, logic, or flow of the codebase. The Gemini model will answer using only the context retrieved from the source code.
- **Memory/History Aware**: The AI remembers your previous questions in the session, allowing for conversational follow-ups.
- **Glassmorphism Frontend**: A stunning, modern, and responsive UI built with vanilla HTML/CSS/JS that communicates seamlessly with the Flask backend.

---

## 🛠️ Tech Stack

- **Backend**: Python, Flask, Flask-CORS
- **AI/LLM**: Google Gemini 2.5 Flash (`langchain-google-genai`)
- **Vector Database**: ChromaDB (`langchain-chroma`)
- **RAG Orchestration**: LangChain (`langchain`, `langchain-community`)
- **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript

---

## ⚙️ Installation & Setup

### 1. Navigate to the project directory
```bash
cd repoanalyzer
```

### 2. Install Dependencies
Make sure you have Python installed. Then, install the required packages:
```bash
pip install flask flask-cors langchain langchain-community langchain-chroma langchain-google-genai python-dotenv
```

### 3. Set up the Environment Variables
You need a Google Gemini API Key. A `.env` file has been provided in the root directory. Open it and replace the placeholder with your actual key:
```env
GOOGLE_API_KEY=your_actual_api_key_here
```

---

## 🚀 How to Run

1. **Start the Backend Server**:
   ```bash
   python app.py
   ```
   *The server will start on `http://127.0.0.1:5000`.*

2. **Open the Frontend**:
   Simply navigate to the `frontend/` folder and double-click the `index.html` file to open it in your web browser. (Alternatively, serve it using an extension like VSCode Live Server).

3. **Analyze a Repository**:
   - Paste a public GitHub URL into the UI (e.g., `https://github.com/username/project`).
   - Click **Analyze**.
   - Wait for the cloning and vector embedding to complete.
   - Start chatting with the codebase!

***Made with ❤️ by Team: Chicken Biryani (Members are : Deon George, Karthik Krishnan and Dhanush M)***
***In Association with BeyondPrompt-26 by IEEE CS GECT***
