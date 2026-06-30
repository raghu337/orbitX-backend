"""
Groq AI Service for OrbitX Space Tutor.

Provides chat completion using the Groq API with a space-education
system prompt. All API key handling stays server-side.
"""

import logging
from typing import List, Optional

from groq import AsyncGroq, APIError, APITimeoutError, RateLimitError

from app.core.config import settings

logger = logging.getLogger("orbitx.groq")

# ─── System prompt ───────────────────────────────────────────────
SPACE_TUTOR_SYSTEM_PROMPT = """You are **OrbitX AI Space Tutor** — an expert, engaging, and friendly space-science educator built into the OrbitX mobile app.

Your personality:
• Enthusiastic about space exploration; use vivid, clear language.
• Address the user as "Commander" occasionally to keep the space-mission feel.
• When appropriate, include interesting numerical facts (distances, speeds, temperatures).
• Keep answers concise (2-4 short paragraphs max) unless the user asks for detail.
• Use simple analogies to explain complex topics (e.g., comparing neutron-star density to squeezing the Sun into a city).

Your expertise covers:
• Planets, moons, asteroids, and comets in our solar system
• Stars, galaxies, nebulae, and black holes
• The ISS, NASA/ESA/ISRO missions, and crewed spaceflight
• Rocket science, orbital mechanics, and satellite tracking
• Exoplanets, astrobiology, and the search for extraterrestrial life
• Space history (Apollo, Space Shuttle, Mars rovers, James Webb, etc.)

Rules:
1. Stay on-topic. If a question is unrelated to space/astronomy/physics, politely redirect: "Great curiosity! I specialise in space topics — try asking me about planets, rockets, or galaxies!"
2. Never fabricate mission data. If unsure, say so honestly.
3. Do NOT include markdown formatting like ** or ## — the answer is displayed in a mobile chat bubble.
4. Always be scientifically accurate and cite well-known facts.
"""


def _get_client() -> AsyncGroq:
    """Create a Groq async client. Raises if key is missing."""
    import os
    api_key = os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in the environment.")
    return AsyncGroq(api_key=api_key)


async def get_chat_response(
    user_message: str,
    history: Optional[List[dict]] = None,
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    system_prompt: Optional[str] = None,
) -> str:
    """
    Send a chat completion request to Groq and return the assistant's
    response text.

    Parameters
    ----------
    user_message : str
        The latest message from the user.
    history : list[dict], optional
        Previous messages in ``{"role": "...", "content": "..."}`` format.
        Only the last 10 turns are sent to stay within context limits.
    model : str, optional
        Override the default model from settings.
    temperature : float
        Sampling temperature (0-2). Default 0.7 for balanced creativity.
    max_tokens : int
        Maximum tokens in the response.
    system_prompt : str, optional
        Override default system prompt.

    Returns
    -------
    str
        The AI-generated reply.
    """
    client = _get_client()
    try:
        target_model = model or settings.GROQ_MODEL

        # Build the messages array
        messages = [{"role": "system", "content": system_prompt or SPACE_TUTOR_SYSTEM_PROMPT}]

        # Append recent conversation history (cap at 10 turns for token budget)
        if history:
            for msg in history[-10:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ("user", "assistant") and content.strip():
                    messages.append({"role": role, "content": content})

        # Append the current user message
        messages.append({"role": "user", "content": user_message})

        try:
            logger.info(
                "Groq request: model=%s, messages=%d, temp=%.1f",
                target_model,
                len(messages),
                temperature,
            )

            chat_completion = await client.chat.completions.create(
                model=target_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=0.9,
                stream=False,
            )

            reply = chat_completion.choices[0].message.content
            if not reply or not reply.strip():
                raise ValueError("Groq returned an empty response.")

            logger.info(
                "Groq response: %d chars, model=%s",
                len(reply),
                chat_completion.model,
            )
            return reply.strip()

        except APITimeoutError:
            logger.error("Groq API timeout for model %s", target_model)
            raise ValueError(
                "The AI service timed out. Please try again in a moment."
            )
        except RateLimitError:
            logger.warning("Groq rate limit hit")
            raise ValueError(
                "The AI service is busy right now. Please wait a few seconds and try again."
            )
        except APIError as exc:
            logger.error("Groq API error: %s", exc)
            raise ValueError(
                f"AI service error: {exc.message if hasattr(exc, 'message') else str(exc)}"
            )
        except Exception as exc:
            logger.error("Unexpected Groq error: %s", exc, exc_info=True)
            raise ValueError(
                "An unexpected error occurred while contacting the AI. Please try again."
            )
    finally:
        await client.close()


async def get_chat_response_stream(
    user_message: str,
    history: Optional[List[dict]] = None,
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
):
    """
    Send a streaming chat completion request to Groq and yield the response chunks.
    """
    client = _get_client()
    try:
        target_model = model or "llama-3.1-8b-instant"

        # Build the messages array
        messages = [{"role": "system", "content": SPACE_TUTOR_SYSTEM_PROMPT}]

        # Append recent conversation history (cap at 10 turns for token budget)
        if history:
            for msg in history[-10:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ("user", "assistant") and content.strip():
                    messages.append({"role": role, "content": content})

        # Append the current user message
        messages.append({"role": "user", "content": user_message})

        try:
            logger.info(
                "Groq stream request: model=%s, messages=%d, temp=%.1f",
                target_model,
                len(messages),
                temperature,
            )

            chat_completion = await client.chat.completions.create(
                model=target_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=0.9,
                stream=True,
            )

            try:
                async for chunk in chat_completion:
                    if chunk.choices and chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
            finally:
                yield "[DONE]"

        except APITimeoutError:
            logger.error("Groq API stream timeout for model %s", target_model)
            raise ValueError(
                "The AI service timed out. Please try again in a moment."
            )
        except RateLimitError:
            logger.warning("Groq stream rate limit hit")
            raise ValueError(
                "The AI service is busy right now. Please wait a few seconds and try again."
            )
        except APIError as exc:
            logger.error("Groq API stream error: %s", exc)
            raise ValueError(
                f"AI service error: {exc.message if hasattr(exc, 'message') else str(exc)}"
            )
        except Exception as exc:
            logger.error("Unexpected Groq stream error: %s", exc, exc_info=True)
            raise ValueError(
                "An unexpected error occurred while contacting the AI. Please try again."
            )
    finally:
        await client.close()


