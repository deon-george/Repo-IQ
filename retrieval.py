from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

persist_directory = "db/chroma_db"

def retrieve_documents(search_query: str):
    """
    Retrieve relevant documents for a given search query.
    """
    # Initialize connection dynamically to avoid SQLite file locking
    embedding_model = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-2"
    )

    db = Chroma(
        persist_directory=persist_directory,
        embedding_function=embedding_model
    )

    retriever = db.as_retriever(
        search_kwargs={"k": 5}
    )

    relevant_docs = retriever.invoke(search_query)
    return relevant_docs