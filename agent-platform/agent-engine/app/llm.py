"""Shared LLM singleton for all agents. Import get_llm() wherever you need the model."""
from __future__ import annotations

from langchain_openai import ChatOpenAI

from app.config import OPENAI_API_KEY, OPENAI_MODEL, OPENAI_MODEL_FAST

_llm_instance: ChatOpenAI | None = None
_llm_fast_instance: ChatOpenAI | None = None


def is_llm_configured() -> bool:
    return bool(OPENAI_API_KEY and OPENAI_API_KEY.strip())


def get_llm(temperature: float = 0.4, max_tokens: int = 2048) -> ChatOpenAI:
    """Primary model for agent conversations (default: OPENAI_MODEL, e.g. gpt-5.2)."""
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = ChatOpenAI(
            model=OPENAI_MODEL,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    return _llm_instance


def get_llm_fast(temperature: float = 0.2, max_tokens: int = 256) -> ChatOpenAI:
    """Lower-cost / quick paths (default: OPENAI_MODEL_FAST, e.g. gpt-4o-mini)."""
    global _llm_fast_instance
    if _llm_fast_instance is None:
        _llm_fast_instance = ChatOpenAI(
            model=OPENAI_MODEL_FAST,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    return _llm_fast_instance
