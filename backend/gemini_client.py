import os
from dotenv import load_dotenv
import google.generativeai as genai

class GeminiClient:
    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        load_dotenv()
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("Missing GOOGLE_API_KEY")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def generate(self, message: str) -> str:
        r = self.model.generate_content(message)
        return r.text or ""
