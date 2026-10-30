import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.note import Note
from app.schemas.ai import AIRAGResponse, RAGCitation

def tokenize(text: str) -> set:
    return set(re.findall(r'\b\w{3,}\b', text.lower()))

def chunk_text(text: str, chunk_size: int = 300) -> List[str]:
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
    if not paragraphs:
        paragraphs = [p.strip() for p in text.splitlines() if len(p.strip()) > 30]
    return paragraphs if paragraphs else ([text[:chunk_size]] if text.strip() else [])

def query_personal_rag(
    db: Session,
    user_id: str,
    query: str,
    subject_id: Optional[str] = None
) -> AIRAGResponse:
    """
    Retrieval-Augmented Generation over the user's private notes.
    Extracts chunks, computes relevance scores, cites exact notes, and synthesizes answers.
    """
    notes_query = db.query(Note).filter(
        Note.user_id == user_id,
        Note.is_archived == False
    )
    if subject_id:
        notes_query = notes_query.filter(Note.subject_id == subject_id)
        
    notes = notes_query.all()
    query_tokens = tokenize(query)
    
    scored_chunks = []
    for note in notes:
        # Combine freeform and structured content
        combined_text = note.content or ""
        if note.structured_content:
            for k, v in note.structured_content.items():
                if v and isinstance(v, str):
                    combined_text += f"\n{k}: {v}"
                    
        chunks = chunk_text(combined_text)
        for chunk in chunks:
            chunk_tokens = tokenize(chunk)
            common = query_tokens.intersection(chunk_tokens)
            if common:
                score = len(common) / (len(query_tokens) + 0.1)
                scored_chunks.append({
                    "score": score,
                    "note_id": note.id,
                    "note_title": note.title,
                    "chunk": chunk
                })
                
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    top_chunks = scored_chunks[:3]
    
    citations = [
        RAGCitation(
            note_id=item["note_id"],
            note_title=item["note_title"],
            snippet=item["chunk"][:150] + ("..." if len(item["chunk"]) > 150 else "")
        )
        for item in top_chunks
    ]
    
    if top_chunks:
        answer = (
            f"According to your personal notes on **{top_chunks[0]['note_title']}**:\n\n"
            f"> \"{top_chunks[0]['chunk']}\"\n\n"
            f"This matches your query for '{query}'. Revising this topic periodically will solidify your retention."
        )
    else:
        answer = (
            f"No direct matches were found for '{query}' in your saved notes. "
            f"Try creating a new note or exploring related subjects to build up your knowledge base."
        )
        
    return AIRAGResponse(
        answer=answer,
        citations=citations,
        provider="mindvault-rag-engine"
    )
