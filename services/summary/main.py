from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import google.generativeai as genai
from datetime import datetime

app = FastAPI(title="Summary Service")

class SummaryInput(BaseModel):
    journals: List[str]  # List of journal content strings
    start: str
    end: str
    emotions: Dict[str, int]
    keywords: Dict[str, int]
    sentiments: Dict[str, int]

class JournalEntry(BaseModel):
    content: str
    date: str
    emotions: List[str]
    keywords: List[str]
    sentiment: Optional[str] = None

@app.post("/summary")
def summarize(inp: SummaryInput):
    try:
        # Initialize Gemini client
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        if not os.getenv("GEMINI_API_KEY"):
            # Fallback if no API key - generate basic summary
            return generate_basic_summary(inp)

        # Prepare journal content for analysis
        journal_texts = inp.journals if inp.journals else []

        # Create comprehensive prompt for NLG
        prompt = create_nlg_prompt(inp, journal_texts)

        # Generate AI summary using Gemini
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Configure generation parameters for better responses
        generation_config = genai.types.GenerationConfig(
            temperature=0.7,
            top_p=0.8,
            top_k=40,
            max_output_tokens=800,
        )

        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )

        ai_summary = response.text.strip()

        # Extract key insights and recommendations using Gemini
        insights_prompt = f"Extract 3-5 key insights and actionable recommendations from this journaling summary. Keep each insight to 1-2 sentences. Format as a simple list:\n\n{ai_summary}"

        insights_response = model.generate_content(
            insights_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.6,
                max_output_tokens=300,
            )
        )

        key_insights = insights_response.text.strip().split('\n')

        return {
            "summary": ai_summary,
            "keyFindings": [insight.strip('- •').strip() for insight in key_insights if insight.strip()],
            "generatedAt": datetime.now().isoformat(),
            "model": "gemini-1.5-flash"
        }

    except Exception as e:
        print(f"Error generating AI summary: {e}")
        return generate_basic_summary(inp)

def create_nlg_prompt(inp: SummaryInput, journal_texts: List[str]) -> str:
    """Create a detailed prompt for NLG summary generation"""

    # Format emotions and keywords for better readability
    emotions_str = ", ".join([f"{emotion} ({count})" for emotion, count in inp.emotions.items()]) if inp.emotions else "various emotions"
    keywords_str = ", ".join(list(inp.keywords.keys())[:15]) if inp.keywords else "various topics"
    sentiments_str = ", ".join([f"{sentiment}: {count}" for sentiment, count in inp.sentiments.items()]) if inp.sentiments else "mixed sentiments"

    # Sample some journal entries for context (first 1000 chars total)
    sample_content = ""
    if journal_texts:
        total_content = " ".join(journal_texts)
        sample_content = total_content[:1000] + ("..." if len(total_content) > 1000 else "")

    prompt = f"""
Create a compassionate, insightful reflection summary for a user's journaling period from {inp.start} to {inp.end}.

JOURNALING DATA OVERVIEW:
- Total journal entries: {len(journal_texts) if journal_texts else 'N/A'}
- Date range: {inp.start} to {inp.end}
- Primary emotions detected: {emotions_str}
- Key themes/keywords: {keywords_str}
- Sentiment distribution: {sentiments_str}

SAMPLE JOURNAL CONTENT:
{sample_content}

WRITING INSTRUCTIONS:
Write a 4-5 paragraph reflection that:
1. **Acknowledges their journey**: Recognize their commitment to self-reflection and emotional awareness
2. **Identifies patterns**: Note emotional trends, recurring themes, and behavioral patterns
3. **Highlights growth**: Point out positive developments, resilience, and areas of progress
4. **Offers gentle guidance**: Suggest areas for continued focus or exploration
5. **Celebrates their effort**: End with encouragement and recognition of their self-discovery process

Use warm, supportive language throughout. Focus on patterns rather than specific entries. Emphasize emotional intelligence development and mental wellness growth. Avoid clinical terminology - keep it conversational and empathetic.

Structure the response as coherent paragraphs, not bullet points.
"""

    return prompt.strip()

def generate_basic_summary(inp: SummaryInput) -> Dict[str, Any]:
    """Fallback summary generation when AI is not available"""

    total_entries = len(inp.journals)
    emotion_count = len(inp.emotions) if inp.emotions else 0
    keyword_count = len(inp.keywords) if inp.keywords else 0

    summary = f"""
During your journaling journey from {inp.start} to {inp.end}, you've maintained a consistent practice of self-reflection with {total_entries} entries.

Your emotional landscape during this period included {emotion_count} different emotions, showing the natural variety of human experience. The themes you've explored - {', '.join(list(inp.keywords.keys())[:5]) if inp.keywords else 'various topics'} - reflect your engagement with important aspects of your life and growth.

This consistent journaling practice itself demonstrates your commitment to mental wellness and self-awareness. Consider reflecting on which emotions and themes appear most frequently, as they might offer insights into your current life patterns and areas of focus.

Remember that every step in self-discovery is valuable, and your dedication to this practice is already a significant achievement in your journey toward emotional well-being.
"""

    return {
        "summary": summary.strip(),
        "keyFindings": [
            "Consistent journaling practice shows commitment to self-reflection",
            f"Emotional variety with {emotion_count} different emotions detected",
            f"Key themes explored: {', '.join(list(inp.keywords.keys())[:3]) if inp.keywords else 'various topics'}",
            "Focus on patterns may reveal insights for personal growth"
        ],
        "generatedAt": datetime.now().isoformat(),
        "model": "basic-fallback"
    }






