from typing import TypedDict, Annotated, Callable, Awaitable, Any
import operator


class AgentState(TypedDict):
    messages: Annotated[list[dict], operator.add]
    current_input: str
    intent: str
    tool_results: dict
    response: str


EventCallback = Callable[[dict[str, Any]], Awaitable[None]]
