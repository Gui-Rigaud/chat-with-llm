from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from gemini_client import GeminiClient
from db_mongo import append_turn

load_dotenv()

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    reply: str
    conversation_id: str

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        client = GeminiClient()
        text = client.generate(req.message)
        conv_id = append_turn(req.conversation_id, req.message, text)
        return {"reply": text, "conversation_id": conv_id}
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
