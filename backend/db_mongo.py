import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "clinicai")
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "conversations")

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
    _coll.update_one(
        {"_id": conv_id},
        {
            "$setOnInsert": {"created_at": datetime.now()},
            "$push": {"turns": turn},
        },
        upsert=True,
    )
    return conv_id