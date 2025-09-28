import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = "chat"
MONGODB_COLLECTION = "conversations"

_client = MongoClient(MONGODB_URI)
_db = _client[MONGODB_DB]
_coll = _db[MONGODB_COLLECTION]

def append_turn(conversation_id: Optional[str], user_message: str, assistant_message: str, metadata: Optional[Dict[str, Any]] = None) -> str:
    conv_id = conversation_id or str(uuid.uuid4())
    turn = {
        "user": user_message,
        "assistant": assistant_message,
        "ts": datetime.now(),
        "meta": metadata or {},
    }

    # Verifica se assistant_message contém palavras-chave para triagem
    keywords = ["queixa principal", "sintomas detalhados"]
    if any(keyword in assistant_message.lower() for keyword in keywords):
        save_triage_summary(conv_id, {"summary": assistant_message})
    
    _coll.update_one(
        {"_id": conv_id},
        {
            "$setOnInsert": {"created_at": datetime.now()},
            "$push": {"turns": turn},
        },
        upsert=True,
    )
    return conv_id

def get_conversation(conversation_id: str):
    return _coll.find_one({"_id": conversation_id}, {"_id": 1, "turns": 1, "created_at": 1})

def save_triage_summary(conversation_id: str, summary: Dict[str, Any]):
    _coll = _db["summaries"]
    _coll.update_one(
        {"_id": conversation_id},
        {
            "$set": {
                "triage_summary": summary,
                "finalized_at": datetime.now(),
            }
        },
        upsert=True,
    )
    return True

def get_triage_summary(conversation_id: str):
    return _db["summaries"].find_one({"_id": conversation_id}, {"_id": 1, "triage_summary": 1, "finalized_at": 1})
