from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

# Create Gemini model
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)

def generate_answer(user_question: str, docs: list) -> str:
    """
    Generate an answer using the retrieved context documents.
    """
    context_text = "\n\n".join([doc.page_content for doc in docs])
    
    combined_input = f"""
Based on the following repository context, answer the question.

Question:
{user_question}

Repository Context:

{context_text}

Provide a clear answer using only the information from the repository.
Follow these formatting rules strictly:
1. Provide your response in short, concise bullet points.
2. Keep the answer extremely brief unless the user specifically asks for a "descriptive explanation", "details", or a "long answer" in their question.
3. If the answer is not present in the context, say: "I could not find enough information in the repository."
"""
    
    result = model.invoke(combined_input)
    return result.content