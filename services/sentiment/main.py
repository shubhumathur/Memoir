from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import re

app = FastAPI(title="Sentiment Service")

class SentimentInput(BaseModel):
    text: str

class SentimentOutput(BaseModel):
    sentimentLabel: str
    emotions: List[str]
    keywords: List[str]
    confidence: float

# Enhanced emotion and sentiment detection
POSITIVE_WORDS = [
    "good", "great", "excellent", "amazing", "wonderful", "fantastic", "awesome",
    "happy", "joy", "joyful", "pleased", "delighted", "excited", "thrilled",
    "grateful", "thankful", "blessed", "lucky", "fortunate", "proud", "accomplished",
    "successful", "achieved", "progress", "improvement", "better", "love", "loved",
    "caring", "cared", "supported", "helped", "encouraged", "motivated", "inspired"
]

NEGATIVE_WORDS = [
    "bad", "terrible", "awful", "horrible", "worst", "hate", "hated", "angry",
    "frustrated", "annoyed", "irritated", "upset", "sad", "depressed", "anxious",
    "worried", "scared", "afraid", "fear", "stress", "stressed", "overwhelmed",
    "exhausted", "tired", "fatigued", "disappointed", "let down", "failed",
    "failure", "mistake", "regret", "guilty", "ashamed", "lonely", "isolated"
]

EMOTION_MAPPING = {
    "joy": ["happy", "joy", "delight", "excitement", "pleasure", "gratitude", "pride"],
    "sadness": ["sad", "depressed", "unhappy", "down", "blue", "melancholy", "grief"],
    "anger": ["angry", "frustrated", "irritated", "annoyed", "rage", "fury", "mad"],
    "fear": ["anxious", "worried", "scared", "afraid", "fear", "panic", "nervous"],
    "surprise": ["surprised", "shocked", "amazed", "astonished", "unexpected"],
    "disgust": ["disgusted", "repulsed", "gross", "sick", "nauseous"],
    "trust": ["trust", "confident", "secure", "safe", "reliable"],
    "anticipation": ["hopeful", "expectant", "excited", "looking forward"],
    "love": ["love", "affection", "caring", "tender", "warm"],
    "guilt": ["guilty", "ashamed", "regret", "sorry", "remorse"],
    "shame": ["ashamed", "embarrassed", "humiliated", "disgraced"]
}

def extract_keywords(text: str) -> List[str]:
    """Extract meaningful keywords from text"""
    # Remove punctuation and split
    words = re.findall(r'\b\w+\b', text.lower())

    # Filter out common stop words and short words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'my', 'your', 'his', 'her', 'our', 'their', 'this', 'that', 'these', 'those', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'cant', 'wont', 'dont', 'im', 'ive', 'youre', 'hes', 'shes', 'its', 'were', 'theyre', 'thats', 'theres', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'some', 'many', 'much', 'few', 'little', 'first', 'last', 'next', 'new', 'old', 'good', 'bad', 'big', 'small', 'long', 'short', 'right', 'wrong', 'true', 'false'}

    keywords = [word for word in words if len(word) > 3 and word not in stop_words]

    # Remove duplicates while preserving order
    seen = set()
    unique_keywords = []
    for word in keywords:
        if word not in seen:
            unique_keywords.append(word)
            seen.add(word)

    return unique_keywords[:8]  # Return top 8 keywords

def detect_emotions(text: str) -> List[str]:
    """Detect emotions present in the text"""
    text_lower = text.lower()
    detected_emotions = []

    for emotion, keywords in EMOTION_MAPPING.items():
        if any(keyword in text_lower for keyword in keywords):
            detected_emotions.append(emotion.capitalize())

    # If no specific emotions detected, add general ones based on sentiment
    if not detected_emotions:
        if any(word in text_lower for word in POSITIVE_WORDS):
            detected_emotions.extend(["Joy", "Contentment"])
        elif any(word in text_lower for word in NEGATIVE_WORDS):
            detected_emotions.extend(["Sadness", "Anxiety"])
        else:
            detected_emotions.append("Neutral")

    return list(set(detected_emotions))[:3]  # Return up to 3 unique emotions

@app.post("/sentiment", response_model=SentimentOutput)
def analyze(inp: SentimentInput):
    text = inp.text.lower()

    # Count positive and negative words
    positive_count = sum(1 for word in POSITIVE_WORDS if word in text)
    negative_count = sum(1 for word in NEGATIVE_WORDS if word in text)

    # Determine sentiment
    if positive_count > negative_count:
        label = "Positive"
        confidence = min(0.9, 0.5 + (positive_count - negative_count) * 0.1)
    elif negative_count > positive_count:
        label = "Negative"
        confidence = min(0.9, 0.5 + (negative_count - positive_count) * 0.1)
    else:
        label = "Neutral"
        confidence = 0.5

    # Get emotions and keywords
    emotions = detect_emotions(inp.text)
    keywords = extract_keywords(inp.text)

    return SentimentOutput(
        sentimentLabel=label,
        emotions=emotions,
        keywords=keywords,
        confidence=round(confidence, 2)
    )



