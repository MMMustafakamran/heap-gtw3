# Sub-Agents

> Decompose work across multiple specialized agents with a visible delegation log.

<!-- interactive demo: subagents -->

## What is this? [#what-is-this]

Sub-agents are the canonical multi-agent pattern: a top-level
**supervisor** LLM orchestrates one or more specialized **sub-agents**
by exposing each of them as a tool. The supervisor decides what to
delegate, the sub-agents do their narrow job, and their results flow
back up to the supervisor's next step.

This is fundamentally the same shape as tool-calling, but each "tool"
is itself a full-blown agent with its own system prompt and (often) its
own tools, memory, and model.

## When should I use this? [#when-should-i-use-this]

Reach for sub-agents when a task has distinct specialized sub-tasks
that each benefit from their own focus:

- **Research → Write → Critique** pipelines, where each stage needs a
  different system prompt and temperature.
- **Router + specialists**, where one agent classifies the request and
  dispatches to the right expert.
- **Divide-and-conquer**, for any problem that fits cleanly into parallel
  or sequential sub-problems.

The example below uses the Research → Write → Critique shape as the
canonical example.

## Setting up sub-agents [#setting-up-sub-agents]

<Steps>
  <Step>
    ### Choose how the supervisor delegates

    The demo below wraps each sub-agent in a delegation tool that you write,
    which also records the delegation log in shared state. AG2 1.0 and later
    also has a built-in shortcut: `Agent.as_tool()` turns a specialist into a
    tool that the coordinator calls. The tool runs the specialist on its own
    isolated stream with its own history, so the coordinator's context stays
    small.

    ```bash
    pip install "ag2[ag-ui,openai]>=1.1.2"
    ```

    Build each specialist as a plain `Agent` and hand it to the coordinator as
    a tool. Only the coordinator is wrapped in `AGUIStream`:

    ```python title="agent.py"
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
    ```

    `as_tool()` names the tool `task_<agent name>` by default (`task_researcher`
    and `task_writer` above). Pass `name=` to override it. `description=` is
    required: it is the only thing the coordinator's model reads when it decides
    whether to delegate.

  </Step>
  <Step>
    ### Know what reaches the frontend

    Each `as_tool()` delegation produces one tool call and one AG-UI 1.0
    subagent invocation with its own `subagentRunId`, so two parallel
    delegations to the same agent can be told apart:

    ```text
    RUN_STARTED
    TOOL_CALL_START      toolCallName: "task_researcher"
    TOOL_CALL_ARGS
    SUBAGENT_STARTED     subagentRunId: "4f1c…", name: "researcher", description: "<the objective>"
    SUBAGENT_FINISHED    subagentRunId: "4f1c…", result: "<what it returned>"
    TOOL_CALL_RESULT
    TOOL_CALL_END
    …
    TEXT_MESSAGE_CHUNK
    RUN_FINISHED
    ```

    - A failed delegation ends with `SUBAGENT_ERROR` carrying the message, and
      the run carries on: the coordinator's model is told the delegation failed
      and may recover. A cancelled or timed-out one also ends with
      `SUBAGENT_ERROR` (`cancelled` or `expired`).
    - The events carry no usage. The run's own usage already includes what the
      delegation spent.
    - If a specialist asks the human a question, it reaches the client like any
      other interrupt, tagged with the invocation's `subagentRunId`.

    Three things to know before you build UI on top of it:

    - **Delegations are ordinary tool calls.** Render one with `useRenderTool`,
      or let the default tool renderer show it. A named `useRenderTool`
      registration needs a `parameters` schema. Every `as_tool()` delegation
      takes the same two arguments, `objective` and an optional `context`.
    - **The specialist's own tool calls stay inside its stream.** `search_docs`
      above runs in the researcher's isolated stream, so it does not appear as a
      separate `TOOL_CALL_*` pair in the coordinator's AG-UI output. If you need
      that visibility, give the specialist its own endpoint instead of
      delegating to it.
    - **Shared state does not flow back out of a specialist.** A delegation gets
      a *copy* of the coordinator's conversation variables, and writes that the
      specialist makes to `context.variables` are not merged back. A specialist
      that writes state changes nothing the UI sees, and nothing fails. Return
      the value from the delegation and have the coordinator write it instead.
      Dependencies are copied in the same way, so `Inject(...)` keeps working
      inside a specialist.

  </Step>
  <Step>
    ### Track delegations with `agent.subscribe`

    For a side panel or a progress list, subscribe to the invocation events on
    the agent from `useAgent`. A run is still running until a finished or error
    event with its `subagentRunId` arrives:

    ```tsx title="components/agent-panel.tsx"
    import type {
      SubagentErrorEvent,
      SubagentFinishedEvent,
      SubagentStartedEvent,
    } from "@ag-ui/client";
    import { useAgent } from "@copilotkit/react-core/v2";
    import { useEffect, useState } from "react";

    export function SubagentPanel() {
      const { agent } = useAgent({ agentId: "my_agent" });
      const [started, setStarted] = useState<SubagentStartedEvent[]>([]);
      const [finished, setFinished] = useState<Record<string, SubagentFinishedEvent>>({});
      const [failed, setFailed] = useState<Record<string, SubagentErrorEvent>>({});

      useEffect(() => {
        const subscription = agent.subscribe({
          onRunStartedEvent: () => {
            setStarted([]);
            setFinished({});
            setFailed({});
          },
          onSubagentStartedEvent: ({ event }) => setStarted((all) => [...all, event]),
          onSubagentFinishedEvent: ({ event }) =>
            setFinished((all) => ({ ...all, [event.subagentRunId]: event })),
          onSubagentErrorEvent: ({ event }) =>
            setFailed((all) => ({ ...all, [event.subagentRunId]: event })),
        });
        return () => subscription.unsubscribe();
      }, [agent]);

      return (
        <ul>
          {started.map((run) => (
            <li key={run.subagentRunId}>
              {run.name}:{" "}
              {failed[run.subagentRunId] ? "failed" : finished[run.subagentRunId] ? "done" : "running…"}
            </li>
          ))}
        </ul>
      );
    }
    ```

  </Step>
</Steps>

Define one agent per role, each with its own system prompt:

```python title="src/agents/subagents.py"
import logging
import uuid
from textwrap import dedent
from typing import List, Literal

from ag2 import Agent, Context, tool
from ag2.ag_ui import AGUIStream
from ag2.config.openai import OpenAIResponsesConfig
from fastapi import FastAPI
from pydantic import BaseModel, Field

from ._loop_cap import loop_cap
from ._state import publish_state

logger = logging.getLogger(__name__)


SubAgentName = Literal["research_agent", "writing_agent", "critique_agent"]
DelegationStatus = Literal["running", "completed", "failed"]


class Delegation(BaseModel):
    """One entry in the delegation log shown by the UI."""

    id: str
    sub_agent: SubAgentName
    task: str
    status: DelegationStatus = "completed"
    result: str = ""


class SubagentsSnapshot(BaseModel):
    """Shape of the shared `delegations` state slot rendered by the UI."""

    delegations: List[Delegation] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Sub-agents (real AG2 Agents under the hood)
# ---------------------------------------------------------------------------
#
# Each sub-agent is its own LLM Agent with a focused system
# prompt. They don't share memory or tools with the supervisor — the
# supervisor only sees what each sub-agent's final reply produces.

_SUB_LLM_CONFIG = OpenAIResponsesConfig(model="gpt-6-luna", streaming=False)

_research_agent = Agent(
    "research_sub_agent",
    prompt=dedent(
        """
        You are a research sub-agent. Given a topic, produce a concise
        bulleted list of 3-5 key facts. No preamble, no closing.
        """
    ).strip(),
    config=_SUB_LLM_CONFIG,
    middleware=[loop_cap(1)],
)

_writing_agent = Agent(
    "writing_sub_agent",
    prompt=dedent(
        """
        You are a writing sub-agent. Given a brief and optional source
        facts, produce a polished 1-paragraph draft. Be clear and
        concrete. No preamble.
        """
    ).strip(),
    config=_SUB_LLM_CONFIG,
    middleware=[loop_cap(1)],
)

_critique_agent = Agent(
    "critique_sub_agent",
    prompt=dedent(
        """
        You are an editorial critique sub-agent. Given a draft, produce
        2-3 crisp, actionable critiques. No preamble.
        """
    ).strip(),
    config=_SUB_LLM_CONFIG,
    middleware=[loop_cap(1)],
)
```

Each sub-agent is an isolated agent call with its own model, system
prompt, and optional tools. They don't share memory or tools with the
supervisor; the supervisor only ever sees what the sub-agent returns.

Keep sub-agent system prompts narrow and focused. The point of this pattern
is that each one does one thing well. If a sub-agent needs to know
the whole user context to do its job, that's a signal the boundary is
wrong.

## Exposing sub-agents as tools [#exposing-sub-agents-as-tools]

The supervisor delegates by calling tools. Each delegation tool is a thin
wrapper around a specialized agent call that:

1. Runs the sub-agent on the supplied `task` string.
2. Records the delegation into a `delegations` slot in [shared agent
   state](/angular/ag2/shared-state) (so the UI can render a live log). In the Built-in Agent
   example, the tool code below does not write this entry. The agent
   loop writes it: after each delegation tool result, the loop emits a
   `STATE_DELTA` event that sets `/delegations`.
3. Returns the sub-agent's final message as the tool result, which the
   supervisor sees on its next turn.

```python title="src/agents/subagents.py"
import logging
import uuid
from textwrap import dedent
from typing import List, Literal

from ag2 import Agent, Context, tool
from ag2.ag_ui import AGUIStream
from ag2.config.openai import OpenAIResponsesConfig
from fastapi import FastAPI
from pydantic import BaseModel, Field

from ._loop_cap import loop_cap
from ._state import publish_state

logger = logging.getLogger(__name__)


SubAgentName = Literal["research_agent", "writing_agent", "critique_agent"]
DelegationStatus = Literal["running", "completed", "failed"]


class Delegation(BaseModel):
    """One entry in the delegation log shown by the UI."""

    id: str
    sub_agent: SubAgentName
    task: str
    status: DelegationStatus = "completed"
    result: str = ""


class SubagentsSnapshot(BaseModel):
    """Shape of the shared `delegations` state slot rendered by the UI."""

    delegations: List[Delegation] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Sub-agents (real AG2 Agents under the hood)
# ---------------------------------------------------------------------------
#
# Each sub-agent is its own LLM Agent with a focused system
# prompt. They don't share memory or tools with the supervisor — the
# supervisor only sees what each sub-agent's final reply produces.

_SUB_LLM_CONFIG = OpenAIResponsesConfig(model="gpt-6-luna", streaming=False)

_research_agent = Agent(
    "research_sub_agent",
    prompt=dedent(
        """
        You are a research sub-agent. Given a topic, produce a concise
        bulleted list of 3-5 key facts. No preamble, no closing.
        """
    ).strip(),
    config=_SUB_LLM_CONFIG,
    middleware=[loop_cap(1)],
)

_writing_agent = Agent(
    "writing_sub_agent",
    prompt=dedent(
        """
        You are a writing sub-agent. Given a brief and optional source
        facts, produce a polished 1-paragraph draft. Be clear and
        concrete. No preamble.
        """
    ).strip(),
    config=_SUB_LLM_CONFIG,
    middleware=[loop_cap(1)],
)

_critique_agent = Agent(
    "critique_sub_agent",
    prompt=dedent(
        """
        You are an editorial critique sub-agent. Given a draft, produce
        2-3 crisp, actionable critiques. No preamble.
        """
    ).strip(),
    config=_SUB_LLM_CONFIG,
    middleware=[loop_cap(1)],
)


async def _invoke_sub_agent(sub_agent: Agent, task: str) -> str:
    """Run a sub-agent on `task` and return its final reply text.

    `ask` runs one turn against a one-shot user message on the sub-agent's
    own stream, so none of its events leak into the supervisor's AG-UI run.
    """
    reply = await sub_agent.ask(task)
    return reply.body or ""


def _load_snapshot(ctx: Context) -> SubagentsSnapshot:
    """Best-effort load of the SubagentsSnapshot from the run's variables.

    Logs at WARNING when state fails validation so silent corruption is
    visible in server logs instead of degrading to an empty snapshot
    without a trace.
    """
    data = dict(ctx.variables)
    try:
        return SubagentsSnapshot.model_validate(data)
    except Exception as exc:
        logger.warning(
            "subagents: failed to validate SubagentsSnapshot from run "
            "variables (%s: %s); falling back to empty snapshot",
            exc.__class__.__name__,
            exc,
        )
        return SubagentsSnapshot()


async def _record_delegation(
    ctx: Context,
    sub_agent: SubAgentName,
    task: str,
    result: str,
    status: DelegationStatus = "completed",
) -> str:
    """Append a delegation entry to shared state, publish it, return the result."""
    snapshot = _load_snapshot(ctx)
    snapshot.delegations.append(
        Delegation(
            id=str(uuid.uuid4()),
            sub_agent=sub_agent,
            task=task,
            status=status,
            result=result,
        )
    )
    ctx.variables.update(snapshot.model_dump())
    await publish_state(ctx)
    return result


async def _run_delegation(
    ctx: Context,
    sub_agent_name: SubAgentName,
    sub_agent: Agent,
    task: str,
) -> str:
    """Invoke a sub-agent and record the outcome (completed or failed).

    If the underlying ``ask`` raises (transport error, quota,
    SDK bug, ...), we record the delegation with ``status='failed'`` and
    return a sane result string so the supervisor can recover instead of
    crashing the turn. The full traceback is logged server-side; the
    user-facing ``result`` text only mentions the exception class to
    avoid leaking internals.
    """
    try:
        result = await _invoke_sub_agent(sub_agent, task)
    except Exception as exc:
        logger.exception(
            "subagents: sub-agent %s failed while handling task", sub_agent_name
        )
        failure_message = (
            f"sub-agent call failed: {exc.__class__.__name__} (see server logs)"
        )
        return await _record_delegation(
            ctx,
            sub_agent_name,
            task,
            failure_message,
            status="failed",
        )

    return await _record_delegation(
        ctx,
        sub_agent_name,
        task,
        result,
        status="completed",
    )


# ---------------------------------------------------------------------------
# Supervisor tools (each tool delegates to one sub-agent)
# ---------------------------------------------------------------------------


# Each @tool wraps a sub-agent invocation. The supervisor LLM "calls"
# these tools to delegate work; each call asynchronously runs the
# matching sub-agent, records the delegation into shared state via the
# run's variables, and returns the sub-agent's text the supervisor reads
# as its tool output on the next step.
@tool
async def research_agent(
    ctx: Context,
    task: str,
) -> str:
    """Delegate a research task to the research sub-agent.

    Use for: gathering facts, background, definitions, statistics. Returns
    a bulleted list of key facts.

    Args:
        task: The specific research question or topic to investigate.
    """
    return await _run_delegation(ctx, "research_agent", _research_agent, task)


@tool
async def writing_agent(
    ctx: Context,
    task: str,
) -> str:
    """Delegate a drafting task to the writing sub-agent.

    Use for: producing a polished paragraph, draft, or summary. Pass
    relevant facts from prior research inside ``task``.

    Args:
        task: The brief plus any relevant facts the writer should use.
    """
    return await _run_delegation(ctx, "writing_agent", _writing_agent, task)


@tool
async def critique_agent(
    ctx: Context,
    task: str,
) -> str:
    """Delegate a critique task to the critique sub-agent.

    Use for: reviewing a draft and suggesting concrete improvements.

    Args:
        task: The draft to critique (paste it directly into ``task``).
    """
    return await _run_delegation(ctx, "critique_agent", _critique_agent, task)

```

If the excerpt uses a header-forwarding helper, such as `forwardingFetch` or `HeaderForwardingMiddleware`, leave it out of your app. The showcase uses it only to send request headers to its test server.

This is where CopilotKit's shared-state channel earns its keep: the
supervisor's tool calls mutate `delegations` as they happen, and the
frontend renders every new entry live.

<Callout type="warn">
  Give every delegation a stable `id` and merge new entries by that `id`. The
  client sends its copy of shared state back as run input on every run. A slot
  that appends everything it receives, such as a LangGraph
  `Annotated[list, operator.add]` reducer, adds those entries again. Then the
  log doubles when a thread continues. The LangGraph excerpt above uses
  `operator.add`, so in your app, write a reducer that merges by `id`.
</Callout>

## Rendering a live delegation log [#rendering-a-live-delegation-log]

On the frontend, the delegation log is a reactive render of the
`delegations` slot.

Read the selected agent's state through `injectAgentStore`, derive the
delegations with `computed`, and register one typed renderer for each sub-agent
tool. The Angular Showcase uses this source:

```typescript title="features/agent-state/agent-state-feature.component.ts"
  private readonly agentStore = injectAgentStore(this.agentId);
  protected readonly delegations = computed(() =>
    readDelegations(this.agentStore().state()),
  );

  constructor() {
    if (this.feature === "subagents") {
      this.registerSubAgent("research_agent");
      this.registerSubAgent("writing_agent");
      this.registerSubAgent("critique_agent");
    }
  }

  private registerSubAgent(name: SubAgentName): void {
    registerRenderToolCall(subAgentRendererConfig(name));
  }
```

To stream each sub-agent's output token by token inside its log entry, see
[State streaming](/angular/ag2/shared-state/streaming).

The log grows in real time as the supervisor delegates. The user sees each
step while it happens, not a long spinner.
