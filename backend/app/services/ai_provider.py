import json
import re
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

class AIService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        
    async def generate_flashcards(self, text: str, count: int = 5) -> List[Dict[str, str]]:
        """Generates flashcards from source text with LLM or smart rule extractor."""
        if self.gemini_key:
            try:
                return await self._gemini_flashcards(text, count)
            except Exception:
                pass
        return self._smart_rule_flashcards(text, count)
        
    async def generate_quiz(self, text: str, quiz_type: str = "mcq", count: int = 4) -> List[Dict[str, Any]]:
        """Generates multiple choice, descriptive, or interview questions."""
        if self.gemini_key:
            try:
                return await self._gemini_quiz(text, quiz_type, count)
            except Exception:
                pass
        return self._smart_rule_quiz(text, quiz_type, count)

    async def explain_concept(self, concept: str, audience: str = "beginner") -> Dict[str, str]:
        """Provides intuitive explanation and analogies."""
        if self.gemini_key:
            try:
                return await self._gemini_explain(concept, audience)
            except Exception:
                pass
        return self._smart_rule_explain(concept, audience)

    # --- Fallback / Smart Rule Synthesizers (100% Offline & Deterministic) ---

    def _smart_rule_flashcards(self, text: str, count: int) -> List[Dict[str, str]]:
        cards = []
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        
        # Look for colon or definition patterns: "Term: Definition" or "Term is ..."
        for line in lines:
            if ":" in line and len(line) > 15:
                parts = line.split(":", 1)
                term = parts[0].strip(" -*#")
                definition = parts[1].strip()
                if 2 < len(term) < 60 and len(definition) > 10:
                    cards.append({"front": f"What is {term}?", "back": definition, "difficulty": "medium"})
            elif " is " in line and len(line) > 20:
                parts = line.split(" is ", 1)
                term = parts[0].strip(" -*#")
                definition = "It is " + parts[1].strip()
                if 2 < len(term) < 50 and len(definition) > 15:
                    cards.append({"front": f"Define {term}:", "back": definition, "difficulty": "medium"})
            if len(cards) >= count:
                break
                
        # If not enough, create cards from key sentences
        if len(cards) < count:
            sentences = re.split(r'(?<=[.!?]) +', text)
            for s in sentences:
                s = s.strip()
                if len(s) > 30 and len(s) < 200:
                    words = s.split()
                    prompt = f"Key takeaway regarding: {' '.join(words[:4])}..."
                    cards.append({"front": prompt, "back": s, "difficulty": "easy"})
                if len(cards) >= count:
                    break
                    
        if not cards:
            cards.append({
                "front": "Core concept summary",
                "back": text[:200] + ("..." if len(text) > 200 else ""),
                "difficulty": "medium"
            })
        return cards[:count]

    def _smart_rule_quiz(self, text: str, quiz_type: str, count: int) -> List[Dict[str, Any]]:
        quiz_items = []
        sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', text) if len(s.strip()) > 25]
        
        for idx, sentence in enumerate(sentences[:count]):
            words = sentence.split()
            key_term = words[0].strip(".,") if words else "Concept"
            
            if quiz_type == "mcq":
                correct = sentence[:80] + ("..." if len(sentence) > 80 else "")
                quiz_items.append({
                    "question": f"Which statement accurately describes the role of {key_term} in this topic?",
                    "quiz_type": "mcq",
                    "options": [
                        {"id": "A", "text": correct},
                        {"id": "B", "text": "It serves merely as a temporary placeholder without state retention."},
                        {"id": "C", "text": "It completely contradicts the fundamental retention principle."},
                        {"id": "D", "text": "None of the above statements apply."}
                    ],
                    "correct_answer": "A",
                    "explanation": f"Based on the notes: '{sentence}'"
                })
            else:
                quiz_items.append({
                    "question": f"Explain the core function and significance of {key_term}.",
                    "quiz_type": quiz_type,
                    "explanation": f"Reference: '{sentence}'"
                })
        return quiz_items

    def _smart_rule_explain(self, concept: str, audience: str) -> Dict[str, str]:
        return {
            "concept": concept,
            "audience": audience,
            "simple_explanation": f"In simple terms, {concept} is a foundational building block designed to organize, process, and retain critical knowledge systematically.",
            "real_world_analogy": f"Think of {concept} like a personal library catalog: instead of keeping loose papers in random boxes, it indexes key concepts so your mind can retrieve them in seconds under examination or interview conditions.",
            "why_it_matters": "Mastering this concept eliminates cognitive overload and strengthens long-term memory pathways through targeted spaced recall."
        }

    # --- External Provider Integrations ---
    async def _gemini_flashcards(self, text: str, count: int) -> List[Dict[str, str]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        prompt = (
            f"Generate exactly {count} active recall flashcards from the text below.\n"
            f"Respond ONLY with a valid JSON array of objects with keys 'front', 'back', and 'difficulty' ('easy'|'medium'|'hard').\n\n"
            f"Text:\n{text[:3000]}"
        )
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Clean markdown backticks if any
                clean_json = re.sub(r"^```json\s*", "", raw_text)
                clean_json = re.sub(r"\s*```$", "", clean_json)
                return json.loads(clean_json)
        raise Exception("Gemini API call failed")

ai_service = AIService()
