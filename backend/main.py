from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import uvicorn
from dotenv import load_dotenv
from gemini_client import GeminiClient

load_dotenv()

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        client = GeminiClient()
        text = client.generate(req.message)
        return {"reply": text}
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
