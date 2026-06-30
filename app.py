from flask import Flask, request, jsonify
from flask_cors import CORS

from historyaware import (
    reformulate_query,
    save_chat,
    clear_chat_history
)

from retrieval import retrieve_documents

from answergeneration import generate_answer

from ingestionpipeline import ingest_repository

app = Flask(__name__, static_folder='frontend', static_url_path='/')

CORS(app)

# -------------------------------------
# Health Check
# -------------------------------------

@app.route("/", methods=["GET"])
def home():
    # Serve the home.html from the frontend folder
    return app.send_static_file('home.html')


# -------------------------------------
# Ask Question
# -------------------------------------

@app.route("/ask", methods=["POST"])
def ask():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No JSON data received"
            }), 400

        user_question = data.get("question", "").strip()

        if user_question == "":
            return jsonify({
                "error": "Question cannot be empty"
            }), 400

        # ---------------------------------
        # Step 1: Reformulate Query
        # ---------------------------------

        search_query = reformulate_query(
            user_question
        )

        # ---------------------------------
        # Step 2: Retrieve Documents
        # ---------------------------------

        docs = retrieve_documents(
            search_query
        )

        # ---------------------------------
        # Step 3: Generate Answer
        # ---------------------------------

        answer = generate_answer(
            user_question,
            docs
        )

        # ---------------------------------
        # Step 4: Save History
        # ---------------------------------

        save_chat(
            user_question,
            answer
        )

        return jsonify({

            "question": user_question,

            "search_query": search_query,

            "answer": answer

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# -------------------------------------
# New Chat
# -------------------------------------

@app.route("/new-chat", methods=["POST"])
def new_chat():

    try:

        clear_chat_history()

        return jsonify({

            "success": True,

            "message": "Chat history cleared"

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# -------------------------------------
# Optional Chat History Endpoint
# -------------------------------------

@app.route("/chat-history", methods=["GET"])
def chat_history():

    try:

        from historyaware import get_chat_history

        return jsonify({
            "history": get_chat_history()
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# -------------------------------------
# Ingest Repository
# -------------------------------------

@app.route("/ingest", methods=["POST"])
def ingest():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        repo_url = data.get("repo_url", "").strip()
        if not repo_url:
            return jsonify({"error": "repo_url is required"}), 400
            
        success, message = ingest_repository(repo_url)
        
        if success:
            return jsonify({"success": True, "message": message})
        else:
            return jsonify({"success": False, "error": message}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------------
# Clear Repository
# -------------------------------------

@app.route("/clear-repo", methods=["POST"])
def clear_repo():
    try:
        from ingestionpipeline import clear_vector_store
        clear_vector_store()
        return jsonify({
            "success": True,
            "message": "Repository cleared successfully"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------------
# Run Flask
# -------------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )