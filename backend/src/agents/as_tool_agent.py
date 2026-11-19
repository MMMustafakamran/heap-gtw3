# Sub-Agents page, step "Choose how the supervisor delegates" (agent.py), verbatim, added 2026-11-19.
# https://docs.copilotkit.ai/angular/ag2/multi-agent/subagents
# HARNESS: header comment only; not wired into main.py or any route (the page never says how to serve or connect it).
from typing import Annotated

from fastapi import FastAPI, Header
from fastapi.responses import StreamingResponse
from pydantic import Field

from ag2 import Agent, tool
from ag2.ag_ui import AGUIStream, RunAgentInput
from ag2.config import OpenAIResponsesConfig

@tool
def search_docs(
    query: Annotated[str, Field(description="What to look up")],
) -> str:
    """Look a topic up in the product documentation."""
    return f"Docs say: {query} is supported since v1.0."

researcher = Agent(
    name="researcher",
    prompt="You research topics using the documentation tool and report findings plainly.",
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
    tools=[search_docs],
)

writer = Agent(
    name="writer",
    prompt="You turn research notes into a single tight paragraph.",
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
)

coordinator = Agent(
    name="coordinator",
    prompt=(
        "You coordinate specialists. Delegate research to `task_researcher`, "
        "then hand the findings to `task_writer`. Do not answer from memory."
    ),
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
    tools=[
        researcher.as_tool(description="Research a topic in the product docs."),
        writer.as_tool(description="Turn research notes into one paragraph."),
    ],
)

stream = AGUIStream(coordinator)
app = FastAPI()

@app.post("/chat")
async def run_agent(
    message: RunAgentInput,
    accept: str | None = Header(None),
) -> StreamingResponse:
    return StreamingResponse(
        stream.dispatch(message, accept=accept),
        media_type=accept or "text/event-stream",
    )
