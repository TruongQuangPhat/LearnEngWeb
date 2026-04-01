from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import json

router = APIRouter(prefix="/chat/grammar", tags=["Grammar Tutor"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

@router.post("")
async def chat_grammar(request: Request, body: ChatRequest):
    """
    Simulated RAG streaming endpoint for Grammar Tutor.
    Requires LangChain & Supabase pgvector in full implementation.
    Streams back Markdown to the Next.js client.
    """
    
    async def chat_streamer():
        if not body.messages:
            yield "data: [DONE]\n\n"
            return
            
        last_msg = body.messages[-1].content
        
        # Simulated "Thinking/Retrieving" delay
        await asyncio.sleep(0.5)
        
        # Simulated response chunks representing retrieved context logic
        response_text = f"**RAG Context Retrieved!**\n\nYou asked about: *{last_msg}*.\n\nIn English grammar, this concept entails understanding word order, tenses, or semantic structures. (This is a simulated Streaming LLM response from the AI microservice)."
        
        words = response_text.split(" ")
        for word in words:
            chunk = {"content": f"{word} "}
            yield f"data: {json.dumps(chunk)}\n\n"
            await asyncio.sleep(0.05)
            
        yield "data: [DONE]\n\n"

    return StreamingResponse(chat_streamer(), media_type="text/event-stream")
