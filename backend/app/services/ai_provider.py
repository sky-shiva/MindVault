import json
import re
import httpx
from typing import Dict, Any, List, Optional, Tuple
from app.core.config import settings

class AIService:
    def __init__(self):
        self.default_provider = settings.AI_PROVIDER
        self.system_gemini_key = settings.GEMINI_API_KEY
        self.system_openai_key = settings.OPENAI_API_KEY

    # -------------------------------------------------------------
    # Provider Connection Testing
    # -------------------------------------------------------------
    async def test_connection(self, provider: str, api_key: str, model_name: Optional[str] = None) -> Tuple[bool, str]:
        """
        Validates the provided API key against the target provider's live endpoint.
        Returns (success: bool, message: str). Never logs or leaks the key.
        """
        if not api_key or not api_key.strip():
            return False, "API key cannot be empty."

        clean_key = api_key.strip()

        if provider == "gemini":
            url = f"https://generativelanguage.googleapis.com/v1beta/models?key={clean_key}"
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        model_count = len(data.get("models", []))
                        return True, f"Connection verified successfully. {model_count} Gemini models accessible."
                    elif resp.status_code == 400 or resp.status_code == 403:
                        err_msg = "Invalid API key or API not enabled for this project in Google Cloud / AI Studio."
                        try:
                            err_detail = resp.json().get("error", {}).get("message")
                            if err_detail:
                                err_msg = f"Google Gemini Error: {err_detail}"
                        except Exception:
                            pass
                        return False, err_msg
                    else:
                        return False, f"Provider returned HTTP {resp.status_code}. Please verify your key."
            except httpx.TimeoutException:
                return False, "Connection timed out while reaching Google Gemini servers."
            except Exception as e:
                return False, f"Network error connecting to Google Gemini: {str(e)}"

        elif provider == "openai":
            url = "https://api.openai.com/v1/models"
            headers = {"Authorization": f"Bearer {clean_key}"}
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code == 200:
                        return True, "Connection verified successfully. OpenAI API access confirmed."
                    elif resp.status_code == 401:
                        return False, "Invalid OpenAI API key. Check key format (starts with 'sk-')."
                    elif resp.status_code == 429:
                        return False, "OpenAI rate limit or insufficient quota exceeded on this key."
                    else:
                        return False, f"OpenAI returned HTTP {resp.status_code}."
            except httpx.TimeoutException:
                return False, "Connection timed out while reaching OpenAI servers."
            except Exception as e:
                return False, f"Network error connecting to OpenAI: {str(e)}"

        return False, f"Unsupported provider: '{provider}'."

    # -------------------------------------------------------------
    # Conversational Assistant
    # -------------------------------------------------------------
    async def chat(
        self,
        message: str,
        history: List[Dict[str, str]],
        provider: str,
        api_key: Optional[str],
        model_name: Optional[str],
        notes_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Processes conversational queries.
        Uses real LLM when API key is provided, or returns intelligent offline assistance.
        """
        effective_key = api_key or (self.system_gemini_key if provider == "gemini" else self.system_openai_key)

        # Real Gemini Execution
        if provider == "gemini" and effective_key:
            model = model_name or "gemini-1.5-flash"
            try:
                reply = await self._gemini_chat(message, history, effective_key, model, notes_context)
                return {
                    "reply": reply,
                    "provider_used": "Google Gemini",
                    "model_used": model,
                    "is_real_ai": True,
                }
            except Exception as e:
                # Log general failure without key
                return {
                    "reply": f"Could not reach Gemini ({str(e)}). Ensure your API key is valid in AI Settings.",
                    "provider_used": "Offline Fallback",
                    "model_used": "deterministic-rules",
                    "is_real_ai": False,
                }

        # Real OpenAI Execution
        if provider == "openai" and effective_key:
            model = model_name or "gpt-4o-mini"
            try:
                reply = await self._openai_chat(message, history, effective_key, model, notes_context)
                return {
                    "reply": reply,
                    "provider_used": "OpenAI",
                    "model_used": model,
                    "is_real_ai": True,
                }
            except Exception as e:
                return {
                    "reply": f"Could not reach OpenAI ({str(e)}). Check your API key or quota in AI Settings.",
                    "provider_used": "Offline Fallback",
                    "model_used": "deterministic-rules",
                    "is_real_ai": False,
                }

        # Friendly Unconfigured / Offline Mode
        offline_reply = self._generate_offline_chat_reply(message, notes_context)
        return {
            "reply": offline_reply,
            "provider_used": "Offline Knowledge Engine",
            "model_used": "local-retrieval",
            "is_real_ai": False,
        }

    # -------------------------------------------------------------
    # Flashcards, Quiz, Explain (Per-user Key Aware)
    # -------------------------------------------------------------
    async def generate_flashcards(
        self,
        text: str,
        count: int = 5,
        provider: str = "gemini",
        api_key: Optional[str] = None,
        model_name: Optional[str] = None
    ) -> List[Dict[str, str]]:
        effective_key = api_key or self.system_gemini_key
        if provider == "gemini" and effective_key:
            try:
                model = model_name or "gemini-1.5-flash"
                return await self._gemini_flashcards(text, count, effective_key, model)
            except Exception:
                pass
        elif provider == "openai" and (api_key or self.system_openai_key):
            try:
                model = model_name or "gpt-4o-mini"
                return await self._openai_flashcards(text, count, api_key or self.system_openai_key, model)
            except Exception:
                pass
        return self._smart_rule_flashcards(text, count)

    async def generate_quiz(
        self,
        text: str,
        quiz_type: str = "mcq",
        count: int = 4,
        provider: str = "gemini",
        api_key: Optional[str] = None,
        model_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        effective_key = api_key or self.system_gemini_key
        if provider == "gemini" and effective_key:
            try:
                model = model_name or "gemini-1.5-flash"
                return await self._gemini_quiz(text, quiz_type, count, effective_key, model)
            except Exception:
                pass
        elif provider == "openai" and (api_key or self.system_openai_key):
            try:
                model = model_name or "gpt-4o-mini"
                return await self._openai_quiz(text, quiz_type, count, api_key or self.system_openai_key, model)
            except Exception:
                pass
        return self._smart_rule_quiz(text, quiz_type, count)

    async def explain_concept(
        self,
        concept: str,
        audience: str = "beginner",
        provider: str = "gemini",
        api_key: Optional[str] = None,
        model_name: Optional[str] = None
    ) -> Dict[str, str]:
        effective_key = api_key or self.system_gemini_key
        if provider == "gemini" and effective_key:
            try:
                model = model_name or "gemini-1.5-flash"
                return await self._gemini_explain(concept, audience, effective_key, model)
            except Exception:
                pass
        elif provider == "openai" and (api_key or self.system_openai_key):
            try:
                model = model_name or "gpt-4o-mini"
                return await self._openai_explain(concept, audience, api_key or self.system_openai_key, model)
            except Exception:
                pass
        return self._smart_rule_explain(concept, audience)

    # -------------------------------------------------------------
    # Gemini Implementations
    # -------------------------------------------------------------
    async def _gemini_chat(
        self,
        message: str,
        history: List[Dict[str, str]],
        api_key: str,
        model: str,
        notes_context: Optional[str]
    ) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        
        system_instruction = (
            "You are MindVault AI, a personal learning companion focused on active recall, spaced repetition, "
            "and deep concept comprehension. Be concise, pedagogical, and encouraging. "
            "Always cite the user's notes when answering from their context."
        )
        if notes_context:
            system_instruction += f"\n\nUSER'S PERSONAL SAVED NOTES CONTEXT:\n{notes_context}"

        contents = []
        for h in history[-6:]:  # Keep recent history
            role = "user" if h.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
            
        contents.append({"role": "user", "parts": [{"text": f"{system_instruction}\n\nUser Question: {message}"}]})

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json={"contents": contents})
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
            raise Exception(f"Gemini error {resp.status_code}: {resp.text[:120]}")

    async def _gemini_flashcards(self, text: str, count: int, api_key: str, model: str) -> List[Dict[str, str]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        prompt = (
            f"Generate exactly {count} active recall flashcards from the text below.\n"
            f"Respond ONLY with a valid JSON array of objects with keys 'front', 'back', and 'difficulty' ('easy'|'medium'|'hard').\n\n"
            f"Text:\n{text[:3500]}"
        )
        async with httpx.AsyncClient(timeout=18.0) as client:
            resp = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
            if resp.status_code == 200:
                raw_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                clean = re.sub(r"^```json\s*", "", raw_text)
                clean = re.sub(r"\s*```$", "", clean)
                return json.loads(clean)
        raise Exception("Gemini flashcard call failed")

    async def _gemini_quiz(self, text: str, quiz_type: str, count: int, api_key: str, model: str) -> List[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        prompt = (
            f"Generate {count} {quiz_type} questions from the text below.\n"
            f"Respond ONLY with a valid JSON array of objects with keys: "
            f"'question', 'quiz_type' ('{quiz_type}'), 'options' (array of {{id, text}} if mcq, else null), "
            f"'correct_answer' ('A'|'B'|'C'|'D' if mcq else null), 'explanation'.\n\n"
            f"Text:\n{text[:3500]}"
        )
        async with httpx.AsyncClient(timeout=18.0) as client:
            resp = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
            if resp.status_code == 200:
                raw_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                clean = re.sub(r"^```json\s*", "", raw_text)
                clean = re.sub(r"\s*```$", "", clean)
                return json.loads(clean)
        raise Exception("Gemini quiz call failed")

    async def _gemini_explain(self, concept: str, audience: str, api_key: str, model: str) -> Dict[str, str]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        prompt = (
            f"Explain the concept '{concept}' for a {audience} audience using the Feynman Technique.\n"
            f"Respond ONLY with a JSON object with keys: 'concept', 'audience', 'simple_explanation', "
            f"'real_world_analogy', 'why_it_matters'."
        )
        async with httpx.AsyncClient(timeout=18.0) as client:
            resp = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
            if resp.status_code == 200:
                raw_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                clean = re.sub(r"^```json\s*", "", raw_text)
                clean = re.sub(r"\s*```$", "", clean)
                return json.loads(clean)
        raise Exception("Gemini explain call failed")

    # -------------------------------------------------------------
    # OpenAI Implementations
    # -------------------------------------------------------------
    async def _openai_chat(
        self,
        message: str,
        history: List[Dict[str, str]],
        api_key: str,
        model: str,
        notes_context: Optional[str]
    ) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        sys_msg = "You are MindVault AI, an encouraging and insightful learning assistant. Answer clearly."
        if notes_context:
            sys_msg += f"\n\nContext from student's notes:\n{notes_context}"

        messages = [{"role": "system", "content": sys_msg}]
        for h in history[-6:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": message})

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, headers=headers, json={"model": model, "messages": messages})
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"].strip()
            raise Exception(f"OpenAI error {resp.status_code}: {resp.text[:120]}")

    async def _openai_flashcards(self, text: str, count: int, api_key: str, model: str) -> List[Dict[str, str]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        prompt = (
            f"Generate exactly {count} active recall flashcards from the text below.\n"
            f"Respond ONLY with a valid JSON array of objects with keys 'front', 'back', and 'difficulty'."
            f"\n\nText:\n{text[:3500]}"
        )
        async with httpx.AsyncClient(timeout=18.0) as client:
            resp = await client.post(
                url,
                headers=headers,
                json={"model": model, "messages": [{"role": "user", "content": prompt}], "response_format": {"type": "json_object"}}
            )
            if resp.status_code == 200:
                raw = resp.json()["choices"][0]["message"]["content"]
                parsed = json.loads(raw)
                return parsed if isinstance(parsed, list) else parsed.get("flashcards", [])
        raise Exception("OpenAI flashcards failed")

    async def _openai_quiz(self, text: str, quiz_type: str, count: int, api_key: str, model: str) -> List[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        prompt = f"Generate {count} {quiz_type} questions in JSON array with keys 'question', 'quiz_type', 'options', 'correct_answer', 'explanation' from:\n{text[:3500]}"
        async with httpx.AsyncClient(timeout=18.0) as client:
            resp = await client.post(
                url,
                headers=headers,
                json={"model": model, "messages": [{"role": "user", "content": prompt}]}
            )
            if resp.status_code == 200:
                raw = resp.json()["choices"][0]["message"]["content"]
                clean = re.sub(r"^```json\s*", "", raw.strip())
                clean = re.sub(r"\s*```$", "", clean)
                return json.loads(clean)
        raise Exception("OpenAI quiz failed")

    async def _openai_explain(self, concept: str, audience: str, api_key: str, model: str) -> Dict[str, str]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        prompt = f"Explain '{concept}' for a {audience} audience using Feynman method in JSON with keys: concept, audience, simple_explanation, real_world_analogy, why_it_matters."
        async with httpx.AsyncClient(timeout=18.0) as client:
            resp = await client.post(
                url,
                headers=headers,
                json={"model": model, "messages": [{"role": "user", "content": prompt}]}
            )
            if resp.status_code == 200:
                raw = resp.json()["choices"][0]["message"]["content"]
                clean = re.sub(r"^```json\s*", "", raw.strip())
                clean = re.sub(r"\s*```$", "", clean)
                return json.loads(clean)
        raise Exception("OpenAI explain failed")

    # -------------------------------------------------------------
    # Offline Fallback Synthesizer
    # -------------------------------------------------------------
    def _generate_offline_chat_reply(self, message: str, notes_context: Optional[str]) -> str:
        if notes_context and len(notes_context.strip()) > 30:
            return (
                f"I found relevant passages in your personal notes related to your query:\n\n"
                f"> \"{notes_context[:280]}...\"\n\n"
                f"**Tip**: To unlock full conversational intelligence and automated question generation, "
                f"connect your own Google Gemini or OpenAI API key in **Settings &rarr; AI Settings**."
            )
        return (
            f"I received your question about **{message[:40]}**.\n\n"
            f"Your AI assistant is currently running in **Offline Mode**. "
            f"To enable real-time generation, concept simplification, and interactive quizzes, "
            f"please add your Gemini or OpenAI API key under **Settings &rarr; AI Settings**.\n\n"
            f"In the meantime, you can continue taking structured notes, running active recall drills, and scheduling spaced revisions!"
        )

    def _smart_rule_flashcards(self, text: str, count: int) -> List[Dict[str, str]]:
        cards = []
        lines = [line.strip() for line in text.splitlines() if line.strip()]
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
                    "question": f"Which statement accurately describes {key_term}?",
                    "quiz_type": "mcq",
                    "options": [
                        {"id": "A", "text": correct},
                        {"id": "B", "text": "It serves merely as a temporary placeholder without state retention."},
                        {"id": "C", "text": "It completely contradicts the fundamental retention principle."},
                        {"id": "D", "text": "None of the above statements apply."}
                    ],
                    "correct_answer": "A",
                    "explanation": f"Based on your notes: '{sentence}'"
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

ai_service = AIService()
