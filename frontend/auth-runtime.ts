/**
 * Authentication guide: "Validate every runtime request" (verbatim block below).
 * https://docs.copilotkit.ai/angular/ag2/auth
 *
 * HARNESS: the guide shows only the `createCopilotNodeListener(...)` call and its
 * import. `runtime` and `verifySession` are not on the page (FINDINGS.md #10).
 * server.ts serves this listener under /auth on port 8240, so the listener sees
 * the guide's own basePath "/api/copilotkit".
 * Doc change 2026-11-19: Express handler -> createCopilotNodeListener with cors: true
 * (the old hand-written HARNESS CORS middleware is gone, the doc's cors: true covers it).
 */
import { CopilotRuntime } from "@copilotkit/runtime/v2"; // HARNESS
import { HttpAgent } from "@ag-ui/client"; // HARNESS

const agentUrl = process.env["AG2_AGENT_URL"] ?? "http://localhost:8241/agent/"; // HARNESS
const runtime = new CopilotRuntime({ agents: { default: new HttpAgent({ url: agentUrl }) } }); // HARNESS
// HARNESS: the guide never defines verifySession; accept the Showcase's demo token only.
const verifySession = async (token: string) => (token === "demo-token-123" ? { userId: "demo" } : null);

// auth : validate every runtime request start
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";

const listener = createCopilotNodeListener({
  runtime,
  basePath: "/api/copilotkit",
  cors: true,
  hooks: {
    onRequest: async ({ request }) => {
      const token = request.headers
        .get("authorization")
        ?.replace(/^Bearer\s+/i, "");
      const session = token ? await verifySession(token) : null;

      if (!session) {
        throw new Response("Unauthorized", { status: 401 });
      }
    },
  },
});
// auth : validate every runtime request end

export const authApp = listener; // HARNESS: server.ts mounts it under /auth
