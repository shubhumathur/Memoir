from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Chat Service")

class ChatInput(BaseModel):
    message: str
    persona: str = "mentor"

@app.post("/chat")
def chat(inp: ChatInput):
    tone = "I hear you." if inp.persona == "mentor" else ("You can do this." if inp.persona == "coach" else "Let us explore this together.")
    return {"reply": f"{tone} {inp.message}"}



