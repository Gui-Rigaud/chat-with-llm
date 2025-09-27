from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.post("/chat")
def chat():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
