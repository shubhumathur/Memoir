from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Summary Service")

class SummaryInput(BaseModel):
    journals: List[str]
    start: Optional[str] = None
    end: Optional[str] = None

@app.post("/summary")
def summarize(inp: SummaryInput):
    total_words = sum(len(j.split()) for j in inp.journals)
    return {
        "summary": f"Summarized {len(inp.journals)} entries with {total_words} words. Emotions balanced; habits improving.",
        "keyFindings": ["weekday anxiety", "walks help", "consistent evenings"],
    }






