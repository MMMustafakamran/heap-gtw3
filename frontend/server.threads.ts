// HARNESS (whole file): Threads runtime (port 8243) for the Threads Drawer and Headless Threads pages.
// Neither AG2 Angular threads page shows any runtime code: the Threads Drawer page only says the drawer
// "reads the platform's `threads` license feature", and Headless Threads says the list is
// "server-authoritative". Threads need CopilotKit Intelligence, so this runtime adds it, in the shape
// of the CopilotKit Intelligence runtime used by the other harnesses.
// Key: CPK_INTELLIGENCE_API_KEY from the environment (CI writes it to backend/.env, start-all.sh loads
// it), or locally from the gitignored frontend/.env.intelligence.
import { createServer } from "node:http";
import { HttpAgent } from "@ag-ui/client";
import {
  CopilotKitIntelligence,
  CopilotRuntime,
} from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";

try {
  process.loadEnvFile(".env.intelligence"); // HARNESS: local key file (gitignored); CI passes the env var
} catch {}

// HARNESS: the same AG2 backend as server.ts (trailing slash load-bearing, see server.ts).
const agentUrl =
  process.env["AG2_AGENT_URL"] ?? "http://localhost:8241/agent/";
const agent = new HttpAgent({ url: agentUrl });

const runtime = new CopilotRuntime({
  agents: {
    default: agent,
    support: agent, // HARNESS: the threads pages use agentId="support"
  },
  intelligence: new CopilotKitIntelligence({
    apiKey: process.env["CPK_INTELLIGENCE_API_KEY"]!,
  }),
  // HARNESS: no auth in this harness, every request is one fixed QA user.
  identifyUser: async () => ({ id: "ag2-angular-qa-user", name: "AG2 Angular QA" }),
});

const port = Number(process.env["THREADS_PORT"] ?? 8243); // HARNESS: workspace port plan
createServer(
  createCopilotNodeListener({ runtime, basePath: "/api/copilotkit", cors: true }), // HARNESS: cors, ng serve (4240) is another origin
).listen(port, () =>
  console.log(`Threads runtime (Intelligence) listening at http://localhost:${port}/api/copilotkit`),
);
