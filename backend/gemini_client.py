import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

class GeminiClient:
    def __init__(self, system_instruction: str = None):
        load_dotenv()
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("Missing GOOGLE_API_KEY")
        genai.configure(api_key=self.api_key)
        name = "gemini-2.5-flash"
        temperature = 0.4
        top_p = 0.95
        top_k = 40
        max_output_tokens = 1024
        prompt_text = system_instruction
        if not prompt_text:
            prompt_path = os.path.join(os.path.dirname(__file__), "prompt.json")
            with open(prompt_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                si = data.get("system_instruction")
                if isinstance(si, str):
                    prompt_text = si
                else:
                    prompt_text = json.dumps(si, ensure_ascii=False)
        self.model = genai.GenerativeModel(
            name,
            system_instruction=prompt_text,
            generation_config={
                "temperature": temperature,
                "top_p": top_p,
                "top_k": top_k,
                "max_output_tokens": max_output_tokens,
            },
        )

    def generate(self, message: str) -> str:
        r = self.model.generate_content(message)
        return r.text or ""
