## Doc drift

**Drift.** 34 pages under /angular/ag2: 1 same, 13 changed, 0 gone, 8 moved, 0 unreadable, 12 without a snapshot.

### Held: not recorded today (12 pages, 0 recorder ids)

Review each change (DRIFT.md), update the harness, then `drift.mjs --sync=<docPath>` and rerun those pages.

| Page | Recorder ids | Why |
|---|---|---|
| [auth](https://docs.copilotkit.ai/angular/ag2/auth) | - | HIGH code (+21 / -4) |
| [https://docs.copilotkit.ai/ag2/generative-ui/components](https://docs.copilotkit.ai/ag2/generative-ui/components) | - | MEDIUM banner (+6 / -8) |
| [https://docs.copilotkit.ai/ag2/generative-ui/components/catalogs](https://docs.copilotkit.ai/ag2/generative-ui/components/catalogs) | - | HIGH code, structure (+52 / -7) |
| [https://docs.copilotkit.ai/ag2/generative-ui/components/from-a2ui](https://docs.copilotkit.ai/ag2/generative-ui/components/from-a2ui) | - | MEDIUM structure (+8 / -9) |
| [https://docs.copilotkit.ai/ag2/generative-ui/components/state-and-actions](https://docs.copilotkit.ai/ag2/generative-ui/components/state-and-actions) | - | HIGH code (+22 / -12) |
| [https://docs.copilotkit.ai/ag2/generative-ui/components/surfaces](https://docs.copilotkit.ai/ag2/generative-ui/components/surfaces) | - | LOW prose (+2 / -2): prose on a ❌ page |
| [https://docs.copilotkit.ai/ag2/generative-ui/components/theming](https://docs.copilotkit.ai/ag2/generative-ui/components/theming) | - | LOW prose (+1 / -1): prose on a ❌ page |
| [https://docs.copilotkit.ai/ag2/generative-ui/components/transports](https://docs.copilotkit.ai/ag2/generative-ui/components/transports) | - | HIGH code (+3 / -1) |
| [https://docs.copilotkit.ai/generative-ui/components/standard-catalog](https://docs.copilotkit.ai/generative-ui/components/standard-catalog) | - | MEDIUM structure (+7 / -10) |
| [inspector](https://docs.copilotkit.ai/angular/ag2/inspector) | - | MEDIUM structure (+15 / -13) |
| [multi-agent/subagents](https://docs.copilotkit.ai/angular/ag2/multi-agent/subagents) | - | HIGH code, install, structure (+198 / -23) |
| [webmcp](https://docs.copilotkit.ai/angular/ag2/webmcp) | - | MEDIUM structure (+17 / -17) |

### Changed, recorded anyway

| Page | State | Detail |
|---|---|---|
| [frontend-tools](https://docs.copilotkit.ai/angular/ag2/frontend-tools) | no-snapshot |  |
| [generative-ui](https://docs.copilotkit.ai/angular/ag2/generative-ui) | no-snapshot |  |
| [generative-ui/a2ui](https://docs.copilotkit.ai/angular/ag2/generative-ui/a2ui) | no-snapshot |  |
| [guides/a2ui](https://docs.copilotkit.ai/angular/ag2/guides/a2ui) | moved (untracked) | /angular/ag2/generative-ui/a2ui |
| [guides/chat-ui](https://docs.copilotkit.ai/angular/ag2/guides/chat-ui) | moved (untracked) | /angular/ag2/prebuilt-components |
| [guides/frontend-tools-generative-ui](https://docs.copilotkit.ai/angular/ag2/guides/frontend-tools-generative-ui) | moved (untracked) | /angular/ag2/frontend-tools |
| [guides/generative-ui-components](https://docs.copilotkit.ai/angular/ag2/guides/generative-ui-components) | moved (untracked) | /angular/ag2/generative-ui |
| [guides/human-in-the-loop](https://docs.copilotkit.ai/angular/ag2/guides/human-in-the-loop) | moved (untracked) | /angular/ag2/human-in-the-loop |
| [guides/shared-state](https://docs.copilotkit.ai/angular/ag2/guides/shared-state) | moved (untracked) | /angular/ag2/shared-state |
| [guides/threads-memory-attachments-headless](https://docs.copilotkit.ai/angular/ag2/guides/threads-memory-attachments-headless) | moved (untracked) | /angular/ag2/headless-threads |
| [guides/voice-multimodal](https://docs.copilotkit.ai/angular/ag2/guides/voice-multimodal) | moved (untracked) | /angular/ag2/voice |
| [headless-threads](https://docs.copilotkit.ai/angular/ag2/headless-threads) | no-snapshot |  |
| [https://docs.copilotkit.ai/angular/ag2](https://docs.copilotkit.ai/angular/ag2) | no-snapshot |  |
| [human-in-the-loop](https://docs.copilotkit.ai/angular/ag2/human-in-the-loop) | no-snapshot |  |
| [multimodal-attachments](https://docs.copilotkit.ai/angular/ag2/multimodal-attachments) | no-snapshot |  |
| [prebuilt-components](https://docs.copilotkit.ai/angular/ag2/prebuilt-components) | no-snapshot |  |
| [prebuilt-components/copilot-threads-drawer](https://docs.copilotkit.ai/angular/ag2/prebuilt-components/copilot-threads-drawer) | no-snapshot |  |
| [quickstart](https://docs.copilotkit.ai/angular/ag2/quickstart) | changed (untracked) | MEDIUM structure (+36 / -54) |
| [shared-state](https://docs.copilotkit.ai/angular/ag2/shared-state) | no-snapshot |  |
| [shared-state/agent-readonly](https://docs.copilotkit.ai/angular/ag2/shared-state/agent-readonly) | no-snapshot |  |
| [voice](https://docs.copilotkit.ai/angular/ag2/voice) | no-snapshot |  |

### New pages to decide

- [runtime-server-adapter](https://docs.copilotkit.ai/angular/ag2/runtime-server-adapter): sidebar: Backend > Runtime > Deploy to any runtime
- [vs-code-extension](https://docs.copilotkit.ai/angular/ag2/vs-code-extension): sidebar: Backend > Debugging > VS Code Extension

### Sidebar vs baseline

- added: Basics > Threads > Frontend Tools (/angular/ag2/frontend-tools)
- added: Generative UI > Overview (/angular/ag2/generative-ui)
- added: Basics > Chat > Prebuilt Components (/angular/ag2/prebuilt-components)
- added: Basics > Custom Look and Feel > Multimodal Attachments (/angular/ag2/multimodal-attachments)
- added: Basics > Custom Look and Feel > Voice (/angular/ag2/voice)
- added: Interactivity > Human-in-the-loop > HITL Overview (/angular/ag2/human-in-the-loop)
- added: Generative UI > Declarative > A2UI (/angular/ag2/generative-ui/a2ui)
- added: Interactivity > Shared state > Shared State (/angular/ag2/shared-state)
- added: Interactivity > Shared state > Agent Read-Only Context (/angular/ag2/shared-state/agent-readonly)
- added: Basics > Threads > Threads Drawer (/angular/ag2/prebuilt-components/copilot-threads-drawer)
- added: Basics > Threads > Headless Threads (/angular/ag2/headless-threads)
- added: Backend > Runtime > Deploy to any runtime (/angular/ag2/runtime-server-adapter) (untracked)
- added: Backend > Debugging > VS Code Extension (/angular/ag2/vs-code-extension) (untracked)
- removed:  > Quickstart (/angular/ag2/quickstart)
- removed: Intelligence > Features > Automatic Learning > Automatic Learning (/angular/ag2/learning)
- removed: Backend > Runtime > Runtime > Copilot Runtime (/angular/ag2/copilot-runtime)
- removed: Backend > Runtime > Runtime > AG-UI (/angular/ag2/ag-ui)
- removed: Learn > Angular guides > Using the Angular docs (/angular/ag2/using-these-docs)
- removed: Learn > Angular guides > Feature examples (/angular/ag2/features)
- removed: Learn > Angular guides > Chat UI and customization (/angular/ag2/guides/chat-ui)
- removed: Learn > Angular guides > Frontend tools and generative UI (/angular/ag2/guides/frontend-tools-generative-ui)
- removed: Learn > Angular guides > A2UI schemas, styling, and recovery (/angular/ag2/guides/a2ui)
- removed: Learn > Angular guides > Voice and multimodal input (/angular/ag2/guides/voice-multimodal)
- removed: Learn > Angular guides > Human-in-the-loop and interrupts (/angular/ag2/guides/human-in-the-loop)
- removed: Learn > Angular guides > Shared state and agent context (/angular/ag2/guides/shared-state)
- removed: Learn > Angular guides > Threads, memory, attachments, and headless UI (/angular/ag2/guides/threads-memory-attachments-headless)
- removed: Learn > Angular guides > Troubleshooting Angular apps (/angular/ag2/guides/troubleshooting)
- removed: Other > Contributing > Code contributions > Advanced: Package Linking (/angular/ag2/contributing/code-contributions/package-linking)
- removed: Other > Contributing > Documentation Contributions (/angular/ag2/contributing/docs-contributions)
- removed: Other > Troubleshooting > Common Copilot Issues (/angular/ag2/troubleshooting/common-issues)
- renamed/moved:  > Introduction -> Search⌘K > Quickstart
- renamed/moved:  > Build with agents -> Search⌘K > Build with agents
- renamed/moved: Interactivity > WebMCP -> Interactivity > Human-in-the-loop > WebMCP
- renamed/moved: Other > Open-source telemetry -> Other > Troubleshooting > Open-source telemetry
- renamed/moved: Other > Community frameworks -> Other > Troubleshooting > Community frameworks
- renamed/moved: Agent capabilities > AG2 > Authentication -> Backend > Runtime > Authentication
- renamed/moved: Backend > Runtime > Debugging > Inspector -> Backend > Debugging > Inspector

### Dead links

- https://docs.copilotkit.ai/angular/ag2/shared-state/streaming: linked from /angular/ag2/multi-agent/subagents

Live copies and line diffs of changed pages: `drift/live/`. CI never updates the snapshot.
