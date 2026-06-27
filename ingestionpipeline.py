import os
import subprocess
import tempfile
import shutil
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
import chromadb

load_dotenv()


def clone_repository(repo_url: str, target_dir: str):
    """Clone a GitHub repository to a target directory"""
    print(f"Cloning {repo_url} into {target_dir}...")
    try:
        subprocess.run(["git", "clone", repo_url, target_dir], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to clone repository: {e.stderr.decode()}")
        return False


def load_documents(repo_path):
    """Load repository files"""
    print(f"Loading files from {repo_path}...")
    documents = []
    
    # We ignore the .git folder
    for root, dirs, files in os.walk(repo_path):
        if ".git" in dirs:
            dirs.remove(".git")
            
        for file in files:
            if file.endswith((
                ".py", ".js", ".ts", ".java", ".cpp", ".c",
                ".html", ".css", ".md", ".txt", ".json"
            )):
                file_path = os.path.join(root, file)
                try:
                    loader = TextLoader(file_path, encoding="utf-8")
                    docs = loader.load()
                    documents.extend(docs)
                except Exception:
                    pass

    print(f"Loaded {len(documents)} files")
    return documents


def split_documents(documents):
    """Split files into chunks"""
    print("Splitting documents...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks")
    return chunks


def create_vector_store(chunks):
    """Create or update ChromaDB"""
    print("Creating embeddings...")
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-2"
    )
    
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="db/chroma_db"
    )
    print("Vector store created/updated")
    return vectorstore


def clear_vector_store():
    """Delete existing vector store to ensure clean state for a new repo"""
    try:
        chromadb.api.client.SharedSystemClient.clear_system_cache()
    except Exception:
        pass
        
    if os.path.exists("db/chroma_db"):
        print("Clearing existing vector store...")
        shutil.rmtree("db/chroma_db", ignore_errors=True)


def ingest_repository(repo_url: str):
    """Main pipeline function to ingest a new repository"""
    print(f"=== Starting Ingestion Pipeline for {repo_url} ===")
    
    # 1. Clear old vector store (so we only query the current repo)
    clear_vector_store()
    
    # 2. Create temporary directory
    temp_dir = tempfile.mkdtemp()
    
    try:
        # 3. Clone repo
        success = clone_repository(repo_url, temp_dir)
        if not success:
            return False, "Failed to clone repository. Check the URL."
            
        # 4. Load docs
        documents = load_documents(temp_dir)
        if not documents:
            return False, "No valid source files found in the repository."
            
        # 5. Split docs
        chunks = split_documents(documents)
        
        # 6. Create Vector Store
        create_vector_store(chunks)
        
        print("\nIngestion Complete")
        return True, "Repository ingested successfully."
        
    finally:
        # 7. Cleanup temp directory
        print("Cleaning up temporary files...")
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        ingest_repository(sys.argv[1])
    else:
        print("Please provide a repository URL")