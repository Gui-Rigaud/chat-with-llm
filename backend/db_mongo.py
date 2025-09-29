import os
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

def append_turn(phone_number: str, user_message: str, assistant_message: str, metadata: Optional[Dict[str, Any]] = None) -> str:
    """Append a turn to the conversation identified by phone_number."""
    turn = {
        "user": user_message,
        "assistant": assistant_message,
        "ts": datetime.now(),
        "meta": metadata or {},
    }

    # Verifica se assistant_message contém palavras-chave para triagem
    keywords = ["queixa principal", "sintomas detalhados"]
    if any(keyword in assistant_message.lower() for keyword in keywords):
        save_triage_summary(phone_number, {"summary": assistant_message})
    
    _coll.update_one(
        {"_id": phone_number},
        {
            "$setOnInsert": {"created_at": datetime.now()},
            "$push": {"turns": turn},
        },
        upsert=True,
    )
    return phone_number


def get_conversation(phone_number: str):
    return _coll.find_one({"_id": phone_number}, {"_id": 1, "turns": 1, "created_at": 1})


def save_triage_summary(phone_number: str, summary: Dict[str, Any]):
    _s_coll = _db["summaries"]
    _s_coll.update_one(
        {"_id": phone_number},
        {
            "$set": {
                "triage_summary": summary,
                "finalized_at": datetime.now(),
            }
        },
        upsert=True,
    )
    return True


def get_triage_summary(phone_number: str):
    return _db["summaries"].find_one({"_id": phone_number}, {"_id": 1, "triage_summary": 1, "finalized_at": 1})
