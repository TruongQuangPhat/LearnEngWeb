from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import asyncio
import base64

router = APIRouter(tags=["speaking"])

class SpeakingPayload(BaseModel):
    audio_data: str # Base64 string from browser
    prompt: Optional[str] = None
    expected_text: Optional[str] = None

@router.post("/evaluate-speaking")
async def evaluate_speaking(payload: SpeakingPayload):
    # Simulated processing delay representing Whisper + LLM
    await asyncio.sleep(1.5)
    
    # Determine mock response based on inputs
    is_valid_audio = len(payload.audio_data) > 100
    transcript = "This is a simulated Whisper transcription."
    if payload.expected_text:
        transcript = payload.expected_text + " (Simulation offset)"
        
    if not is_valid_audio:
        return {
            "status": "error",
            "message": "Audio payload appears empty or corrupt."
        }
        
    return {
        "status": "success",
        "message": "Speaking evaluation completed successfully",
        "data": {
            "score": 88.5,
            "transcript": transcript,
            "feedback": "Great effort! Your intonation is improving. Pay attention to linking words to sound more fluent.",
            "metrics": {
                "fluency": 85,
                "pronunciation": 90,
                "vocabulary": 88,
                "grammar": 92
            }
        }
    }
