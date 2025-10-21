from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Sentiment Service")

class SentimentInput(BaseModel):
    text: str

class SentimentOutput(BaseModel):
    sentimentLabel: str
    emotions: List[str]
    keywords: List[str]

@app.post("/sentiment", response_model=SentimentOutput)
def analyze(inp: SentimentInput):
    text = inp.text.lower()
    label = "Positive" if any(w in text for w in ["good","great","joy","happy"]) else ("Negative" if any(w in text for w in ["bad","sad","angry","anxious"]) else "Neutral")
    emotions = ["Joy"] if label == "Positive" else (["Anxiety"] if label == "Negative" else ["Calm"])
    words = [w.strip('.,!') for w in text.split() if len(w) > 4]
    keywords = list(dict.fromkeys(words))[:5]
    return SentimentOutput(sentimentLabel=label, emotions=emotions, keywords=keywords)



