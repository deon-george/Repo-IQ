from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# ----------------------------------
# Gemini Model
# ----------------------------------

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)

# ----------------------------------
# Chat History Storage
# ----------------------------------

chat_history = []

# ----------------------------------
# Clear Chat
# ----------------------------------

def clear_chat_history():

    global chat_history

    chat_history = []

    return True

# ----------------------------------
# Save Conversation
# ----------------------------------

def save_chat(user_question, answer):

    global chat_history

    chat_history.append({
        "role": "user",
        "content": user_question
    })

    chat_history.append({
        "role": "assistant",
        "content": answer
    })

# ----------------------------------
# Get Chat History
# ----------------------------------

def get_chat_history():

    global chat_history

    return chat_history

# ----------------------------------
# Query Reformulation
# ----------------------------------

def reformulate_query(user_question):

    global chat_history

    # New chat → no reformulation needed
    if len(chat_history) == 0:
        return user_question

    history_text = ""

    for message in chat_history:

        history_text += (
            f"{message['role']}: "
            f"{message['content']}\n"
        )

    reformulation_prompt = f"""
You are assisting a GitHub Repository Analyzer.

Conversation History:

{history_text}

Current User Question:

{user_question}

Rewrite the current user question into a
complete standalone search query.

Rules:

1. Resolve references such as:
   - it
   - this
   - that
   - they
   - those
   - function
   - class
   - file
   - module

2. Preserve repository context.

3. Do not answer the question.

4. Return only the rewritten query.

Standalone Query:
"""

    rewritten_query = model.invoke(
        reformulation_prompt
    ).content.strip()

    return rewritten_query