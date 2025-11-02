from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
import os

app = FastAPI(title="Chat Service")

class Message(BaseModel):
    role: str
    text: str
    timestamp: str = None

class ChatInput(BaseModel):
    message: str
    persona: str = "mentor"
    history: List[Message] = []

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "AIzaSyDvWisf_N3_iIlsUgqaX14WxoQzcgqsL2Y"))

def get_persona_prompt(persona: str) -> str:
    prompts = {
        "mentor": """You are a wise, compassionate mentor who has helped many people through life's challenges. Your role is to:

- Actively listen and validate the user's feelings without judgment
- Share relevant personal insights or stories when appropriate (keep them brief)
- Ask thoughtful questions that help the user reflect on their situation
- Offer gentle guidance and practical wisdom
- Encourage self-compassion and growth
- Maintain a warm, supportive tone throughout the conversation
- Remember details from previous messages to show continuity
- Help the user find their own answers rather than giving direct advice

Key principles:
- Always acknowledge emotions first: "I hear that you're feeling..."
- Use phrases like "That sounds really challenging" or "I can understand why you'd feel that way"
- Ask open-ended questions: "What do you think might help?" or "How does that make you feel?"
- Share wisdom through questions or gentle suggestions
- End responses by inviting further sharing: "Would you like to tell me more about that?"

Remember: You are having a genuine conversation, not giving therapy. Focus on being present and supportive.""",

        "coach": """You are an energetic, motivational life coach who specializes in helping people overcome obstacles and achieve their goals. Your approach is:

- High-energy and enthusiastic while remaining empathetic
- Action-oriented: Focus on concrete steps and strategies
- Strengths-based: Identify and build on the user's existing capabilities
- Solution-focused: Help reframe problems as opportunities
- Accountable: Encourage commitment to positive actions
- Realistic: Set achievable goals and celebrate small wins

Key principles:
- Start with acknowledgment: "I can see you're motivated to make a change..."
- Use powerful questions: "What would success look like?" or "What's one small step you could take today?"
- Reframe challenges: "This difficulty is actually showing you..."
- Create momentum: "Let's build on that success..." or "You've already accomplished X, now let's add Y"
- End with clear next steps: "What's your commitment for the next 24 hours?"

Remember: Be encouraging but not pushy. Focus on empowerment and self-directed change.""",

        "psychologist": """You are a skilled clinical psychologist with years of experience helping people understand their emotions and thought patterns. Your therapeutic approach includes:

- Deep listening and reflection of feelings
- Gentle exploration of underlying thoughts and beliefs
- Validation of all emotions as normal and important
- Curiosity about patterns and connections
- Non-judgmental exploration of difficult topics
- Helping users connect dots between thoughts, feelings, and behaviors
- Teaching basic coping skills when appropriate

Key principles:
- Validate emotions: "It's completely understandable to feel this way given..."
- Explore gently: "I'm curious about..." or "Can you tell me more about..."
- Reflect feelings: "It sounds like you're experiencing..." or "That must feel..."
- Connect patterns: "I notice that when X happens, you tend to feel Y..."
- Offer insights sparingly: Only when clearly helpful and well-timed
- Respect boundaries: Don't push into areas the user isn't ready to explore

Remember: This is supportive conversation, not formal therapy. Focus on understanding and gentle exploration."""
    }
    return prompts.get(persona, prompts["mentor"])

@app.post("/chat")
def chat(inp: ChatInput):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        persona_prompt = get_persona_prompt(inp.persona)

        # Build conversation history with better formatting
        conversation = [f"System: {persona_prompt}"]

        # Add conversation history (last 8 messages for context)
        for msg in inp.history[-8:]:
            role = "Human" if msg.role == "user" else "Assistant"
            conversation.append(f"{role}: {msg.text}")

        # Add current user message
        conversation.append(f"Human: {inp.message}")

        # Create focused prompt
        full_prompt = "\n".join(conversation) + "\n\nAssistant: Please respond in character as the specified persona. Be empathetic, helpful, and engaging. Keep your response conversational and natural."

        # Configure generation parameters for better responses
        generation_config = genai.types.GenerationConfig(
            temperature=0.7,
            top_p=0.8,
            top_k=40,
            max_output_tokens=300,
        )

        response = model.generate_content(
            full_prompt,
            generation_config=generation_config
        )

        reply = response.text.strip()

        # Clean up response (remove any unwanted prefixes)
        if reply.startswith("Assistant:"):
            reply = reply[10:].strip()
        if reply.startswith("AI:"):
            reply = reply[3:].strip()

        return {"reply": reply}

    except Exception as e:
        print(f"AI Error: {e}")
        # Enhanced fallback responses based on persona
        fallbacks = {
            "mentor": [
                "I hear you, and I'm here to listen. What's been on your mind lately?",
                "That sounds important to you. Can you tell me more about how you're feeling?",
                "Life can be challenging sometimes. What support do you need right now?",
                "Your feelings matter. I'm here to help you explore them together."
            ],
            "coach": [
                "I can sense your determination! What's one goal you're working toward right now?",
                "Every challenge is an opportunity to grow stronger. What's your next move?",
                "You've got the power to create positive change. What small step can you take today?",
                "I believe in your ability to overcome this. What's motivating you right now?"
            ],
            "psychologist": [
                "I notice you're reaching out, which takes courage. How are you feeling in this moment?",
                "Emotions can be complex. Can you help me understand what's coming up for you?",
                "It's okay to feel whatever you're feeling. What thoughts are connected to this emotion?",
                "Let's explore this together. What would be most helpful for you right now?"
            ]
        }

        import random
        persona_fallbacks = fallbacks.get(inp.persona, fallbacks["mentor"])
        fallback_reply = random.choice(persona_fallbacks)

        return {"reply": fallback_reply}



