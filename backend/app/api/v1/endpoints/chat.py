"""
Chat endpoint — proxies user messages to the Groq AI service
and returns the assistant's response.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.groq_service import get_chat_response

logger = logging.getLogger("orbitx.chat")

router = APIRouter()


# ─── Request / Response schemas ──────────────────────────────────
class ChatMessage(BaseModel):
    role: str = Field(..., description="Either 'user' or 'assistant'")
    content: str = Field(..., description="The message text")


class ChatRequest(BaseModel):
    message: str = Field(
        ..., min_length=1, max_length=2000, description="The user's message"
    )
    history: Optional[List[ChatMessage]] = Field(
        default=None, description="Previous conversation turns"
    )


class ChatResponse(BaseModel):
    response: str = Field(..., description="The AI-generated reply")
    model: str = Field(..., description="Model used for the response")


# ─── POST /api/v1/chat ──────────────────────────────────────────
@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Accept a user message (and optional conversation history),
    forward it to Groq, and return the AI reply.
    """
    try:
        history_dicts = None
        if request.history:
            history_dicts = [
                {"role": msg.role, "content": msg.content}
                for msg in request.history
            ]

        reply = await get_chat_response(
            user_message=request.message,
            history=history_dicts,
        )

        from app.core.config import settings

        return ChatResponse(response=reply, model=settings.GROQ_MODEL)

    except ValueError as exc:
        # Known, user-friendly errors from groq_service
        logger.warning("Chat ValueError: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error("Chat unhandled error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred. Please try again later.",
        )
