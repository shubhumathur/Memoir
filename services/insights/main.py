from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Insights Extractor")

class InsightsInput(BaseModel):
    journals: List[str]

@app.post("/insights")
def extract(inp: InsightsInput):
    text = " ".join(inp.journals).lower()
    triggers = [w for w in ["deadline","sleep","work","social"] if w in text]
    habits = [w for w in ["walk","coffee","reading"] if w in text]
    return {"triggers": triggers, "habits": habits, "trends": ["more calm evenings"]}






