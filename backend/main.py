from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, AliasChoices
import uvicorn
from dotenv import load_dotenv
from gemini_client import GeminiClient
from db_mongo import append_turn, get_conversation, get_triage_summary

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str = Field(validation_alias=AliasChoices("message", "content"))
    conversation_id: str | None = Field(default=None, validation_alias=AliasChoices("conversation_id", "conversationId"))

class ChatResponse(BaseModel):
    reply: str
    conversation_id: str

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        client = GeminiClient()
        history = None
        if req.conversation_id:
            doc = get_conversation(req.conversation_id)
            if doc and "turns" in doc:
                history = doc["turns"]
        text = client.generate(req.message, history=history)
        conv_id = append_turn(req.conversation_id, req.message, text)
        return {"reply": text, "conversation_id": conv_id}
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{conversation_id}")
def read_conversation(conversation_id: str):
    doc = get_conversation(conversation_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return doc

@app.get("/summary")
def read_summary(conversationId: str = Query(...)):
    doc = get_triage_summary(conversationId)
    if not doc:
        raise HTTPException(status_code=404, detail="Summary not found")
    return doc

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
