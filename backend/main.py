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
    phone_number: str = Field(validation_alias=AliasChoices("phone_number", "phoneNumber"))

class ChatResponse(BaseModel):
    reply: str
    phone_number: str

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        client = GeminiClient()
        history = None
        doc = get_conversation(req.phone_number)
        if doc and "turns" in doc:
            history = doc["turns"]
        text = client.generate(req.message, history=history)
        append_turn(req.phone_number, req.message, text)
        return {"reply": text, "phone_number": req.phone_number}
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{phone_number}")
def read_conversation(phone_number: str):
    doc = get_conversation(phone_number)
    if not doc:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return doc

@app.get("/summary")
def read_summary(phone_number: str = Query(..., alias="phoneNumber")):
    doc = get_triage_summary(phone_number)
    if not doc:
        raise HTTPException(status_code=404, detail="Summary not found")
    return doc

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
