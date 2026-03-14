_registry: dict = {}

FRONT_DESK_AGENT_IDS = frozenset({
    "ai-front-desk",
    "vision-eye-clinic",
    "dental-care-clinic",
})


def _init_registry():
    global _registry
    if not _registry:
        _registry = {}


def get_agent_graph(agent_id: str):
    _init_registry()
    return _registry.get(agent_id)


def list_available_agents() -> list[str]:
    _init_registry()
    out = list(_registry.keys())
    for fd in FRONT_DESK_AGENT_IDS:
        if fd not in out:
            out.append(fd)
    return out


def is_configurable_front_desk(agent_kind: str | None) -> bool:
    return (agent_kind or "").strip() == "configurable_front_desk"
