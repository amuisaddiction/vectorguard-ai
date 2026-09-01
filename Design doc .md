# System Design & Architecture: VectorGuard AI

## 1. High-Level Architecture
VectorGuard AI operates as an API middleware between the raw data source and the Vector Database. 

```mermaid
graph TD
    A[Streamlit UI: File Upload] -->|POST /ingest| B(FastAPI Backend)
    B --> C[LangChain Text Splitter]
    C --> D{LLM Semantic Scanner}
    D -- Malicious Intent Detected --> E[Write to Audit Log]
    D -- Chunk is Safe --> F[Generate Embeddings]
    F --> G[(ChromaDB Vector Store)]
    E --> H[Streamlit UI: Threat Alert]
    G --> I[Streamlit UI: Safe Chat Query]