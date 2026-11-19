/**
 * Page actions for AG2 + Angular. Each drives the feature its doc page teaches and checks the
 * effect the page promises; a missing effect calls ctx.fail, so a broken page records as a
 * failing clip (with the failure terminal at the end) instead of a quiet pass.
 *
 * ❌/⚠️ pages (assignment.json) end with the level-1 tail: back to the doc, drag-select each
 * faulty snippet (FINDING_EVIDENCE), then the note typed into Notepad (humanizeNote, via
 * showFinding). ✅ pages are plain working takes (AUTORECORDER.md sections 2-3).
 */
import { execFile } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { type Page } from 'playwright';

import { type ActionContext, type PageActionHandler } from '../core/types';
import { runStandardAction, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { sleep } from '../core/overlays/cursor';
import { mark } from '../core/timeline';
import { registerDocEvidence } from '../core/doc-evidence';
import { attachImage } from './attach-image';
import { type DocEvidence, showFinding } from './doc-evidence';
import { glideClick, glideTo } from './glide-click';

// ---------------------------------------------------------------------------------------------
// Findings shown at the end of ❌/⚠️ clips. `text` is matched on the rendered doc page.
// ---------------------------------------------------------------------------------------------

export const FINDING_EVIDENCE: Record<string, DocEvidence[]> = {
  quickstart: [
    { text: 'Configure Copilot Runtime to register this backend', caption: 'The backend step is only this callout: no AG2 code (FINDINGS.md #1)' },
    { text: 'Start the selected agent backend and Copilot Runtime', caption: 'No page gives these commands for AG2 + Angular' },
  ],
  a2ui: [
    { text: 'catalog: productCatalog,', caption: 'productCatalog is never defined (FINDINGS.md #2)' },
    { text: 'Title: { props: z.object({ text: dynamicString }) },', caption: 'dynamicString is never defined' },
  ],
  'voice-multimodal': [
    { text: 'Follow the Voice backend setup to add a dedicated Runtime', caption: 'The link points to a #backend anchor that does not exist (FINDINGS.md #3)' },
    { text: 'component: WeatherCardComponent,', caption: 'WeatherCardComponent is never defined on the Voice page (defined on Render a tool result)' },
  ],
  'shared-state': [
    { text: 'Agent and application both read and write the value', caption: 'No AG2 code shows how the agent reads this state (FINDINGS.md #4)' },
    { text: 'agent.setState({ ...current, priority });', caption: 'The write the agent never sees' },
  ],
  'multi-agent-subagents': [
    { text: 'from ._loop_cap import loop_cap', caption: '_loop_cap is never shown: ModuleNotFoundError (FINDINGS.md #5)', clickTab: 'Code' },
    { text: 'from ._state import publish_state', caption: '_state is never shown either', clickTab: 'Code' },
    { text: 'registerRenderToolCall(subAgentRendererConfig(name));', caption: 'subAgentRendererConfig / readDelegations are never defined' },
  ],
  // Components and surfaces pages (Angular tab; the doc opens on it via docStorage). FINDINGS.md #14-#16.
  'cmp-components': [
    { text: 'import { provideGenerativeUI, standardUI } from "@copilotkit/angular/generative-ui";', caption: 'The entry point is not in @copilotkit/angular 0.6.0: TS2307 (FINDINGS.md #14)' },
    { text: 'Start it with npx tsx server.ts', caption: 'tsx in an Angular app: ERR_PACKAGE_PATH_NOT_EXPORTED on @tanstack/ai (FINDINGS.md #15)' },
    { text: 'return chat({', caption: 'No threadId: every run fails "chat() needs a threadId" (FINDINGS.md #15)' },
  ],
  'cmp-surfaces': [
    { text: 'import { CopilotGenerativeUISurface } from "@copilotkit/angular/generative-ui";', caption: 'TS2307 (FINDINGS.md #14)' },
    { text: 'readonly products = input.required<Product[]>();', caption: 'Product / ProductRow never defined (FINDINGS.md #16)' },
  ],
  'cmp-catalogs': [
    { text: '} from "@copilotkit/angular/generative-ui";', caption: 'createGenerativeUI from the missing entry point: TS2307 (FINDINGS.md #14)' },
    { text: 'extends: [standardUI, cartUI],', caption: 'cartUI / Hero never defined (FINDINGS.md #16)' },
  ],
  'cmp-standard-catalog': [
    { text: 'import { provideGenerativeUI, standardUI } from "@copilotkit/angular/generative-ui";', caption: 'TS2307 (FINDINGS.md #14)' },
    { text: 'ProductCard: { component: ProductCard, props: productSchema },', caption: 'ProductCard / productSchema never defined (FINDINGS.md #16)' },
  ],
  'cmp-state-and-actions': [
    { text: 'import { connectGenerativeUIState } from "@copilotkit/angular/generative-ui";', caption: 'TS2307 (FINDINGS.md #14)' },
    { text: 'import { CartStore } from "./cart.store";', caption: 'cart.store is never shown (FINDINGS.md #16)' },
  ],
  'cmp-theming': [
    { text: 'provideGenerativeUI({', caption: 'The whole theming setup is this provider (FINDINGS.md #14)' },
    { text: 'import type { GenerativeUITheme } from "@copilotkit/angular/generative-ui";', caption: 'TS2307 (FINDINGS.md #14)' },
  ],
  'cmp-transports': [
    { text: 'provideGenerativeUI({ ui: standardUI }),', caption: 'Tool transport: the provider from the missing entry point (FINDINGS.md #14)' },
    { text: 'provideGenerativeUI({ ui: standardUI, transport: "markdown" }),', caption: 'Markdown transport: same provider' },
  ],
  'cmp-markdown-mode': [
    { text: 'import { provideGenerativeUI, standardUI } from "@copilotkit/angular/generative-ui";', caption: 'TS2307 (FINDINGS.md #14)' },
    { text: 'provideGenerativeUI({ ui: standardUI, transport: "markdown" }),', caption: 'Markdown mode is this one option on that provider' },
  ],
  'cmp-from-a2ui': [
    { text: '} from "@copilotkit/angular/generative-ui";', caption: 'The After catalog imports the missing entry point: TS2307 (FINDINGS.md #14)' },
    { text: 'component: Airport,', caption: 'Airport / Arrow components never shown (FINDINGS.md #16)' },
  ],
};
// Doc step highlights these before the IDE (no KNOWN_ISSUE set in this repo, so no skip list).
registerDocEvidence(FINDING_EVIDENCE);

export const FINDING_NOTES: Record<string, string> = {
  quickstart: [
    "page says connect the selected ag2 backend and run backend runtime and angular app",
    "following it the chat has nothing to talk to, only works with a backend i wrote myself",
    "backend step is just a callout,no ag2 agent no runtime server.ts, @ag-ui/client not in the install",
    "the runtime page it links only has a next.js route,no commands to start anything for angular",
  ].join('\n'),
  'generative-ui-components': [
    "page says add provideGenerativeUI with standardUI and the agent renders real components",
    "asked for a product card, agent just wrote html code as text,no card",
    "provideGenerativeUI comes from @copilotkit/angular/generative-ui",
    "that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build, and ./cart.store is never shown",
  ].join('\n'),
  'a2ui': [
    "page says a catalog is required for a2ui and passes catalog productCatalog",
    "asked for a flight card, nothing renders,console says a2ui stays off",
    "productCatalog, dynamicString, createAngularCatalog are never defined anywhere",
    "typescript cannot find name productCatalog so ng serve fails",
  ].join('\n'),
  'voice-multimodal': [
    "page says the mic shows in the composer once the runtime has a transcription service,follow the voice backend setup",
    "no mic button in the chat at all",
    "the voice backend setup link goes to #backend on the same page and that section doesnt exist",
    "so the transcription route is never shown and audioFileTranscriptionEnabled stays false",
  ].join('\n'),
  'shared-state': [
    "page says agent and app both read and write the value",
    "set priority to high with agent.setState, asked the agent and it says it doesnt see any priority,every time",
    "page never shows how an ag2 agent reads that state,nothing puts it in the prompt",
  ].join('\n'),
  'multi-agent-subagents': [
    "page says this is the full sub agents setup,supervisor delegates and the log shows it",
    "python dies with modulenotfound no module named src.agents._loop_cap, delegation log stays empty",
    "subagents.py imports ._loop_cap and ._state which are never shown",
    "code tab frontend is react on the angular page, readDelegations and subAgentRendererConfig never defined",
  ].join('\n'),
  'cmp-components': [
    "page says add the provider in step 3 and start the runtime with npx tsx server.ts",
    "chat never replies at all",
    "provideGenerativeUI is from @copilotkit/angular/generative-ui, that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build",
    "server.ts crashes under tsx in an angular app, err package path not exported,renamed to .mts then every run fails chat needs a threadId",
  ].join('\n'),
  'cmp-surfaces': [
    "page says drop CopilotGenerativeUISurface in and the agent fills it",
    "asked for shoes, agent just wrote them as text, nothing rendered",
    "the surface comes from @copilotkit/angular/generative-ui, that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build",
    "Product and ProductRow are never shown either",
  ].join('\n'),
  'cmp-catalogs': [
    "page says build ur own catalog with createGenerativeUI",
    "asked for product cards, got html code as text,no cards",
    "createGenerativeUI is from @copilotkit/angular/generative-ui, that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build",
    "cartUI and Hero in the combine example are never defined",
  ].join('\n'),
  'cmp-standard-catalog': [
    "page says use the standard catalog as it is with provideGenerativeUI and standardUI",
    "asked for a card, got jsx code as text,no card",
    "both come from @copilotkit/angular/generative-ui, that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build",
    "ProductCard and productSchema in add ur own are never defined",
  ].join('\n'),
  'cmp-state-and-actions': [
    "page says connect ui state and actions so the product card can add to cart",
    "no product card no add to cart, agent wrote html as text",
    "connectGenerativeUIState comes from @copilotkit/angular/generative-ui, that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build",
    "cart.store is imported but never shown, z isnt imported",
  ].join('\n'),
  'cmp-theming': [
    "page says theme the components with the theme option on provideGenerativeUI",
    "no components render so theres nothing to theme,agent gave me jsx text",
    "provideGenerativeUI and GenerativeUITheme come from @copilotkit/angular/generative-ui",
    "that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build, snippet has no import either",
  ].join('\n'),
  'cmp-transports': [
    "page says pick tool or markdown transport on provideGenerativeUI",
    "asked for a table, agent replied with plain text,no table",
    "page never shows the import,the other pages use @copilotkit/angular/generative-ui",
    "that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build",
  ].join('\n'),
  'cmp-markdown-mode': [
    "page says turn on markdown mode with transport markdown on provideGenerativeUI",
    "no a2ui blocks rendered, agent just wrote html code as text",
    "provideGenerativeUI is from @copilotkit/angular/generative-ui, that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build",
  ].join('\n'),
  'cmp-from-a2ui': [
    "page says move ur a2ui catalog to the new engine with createGenerativeUI",
    "agent just wrote react code as text,nothing rendered",
    "createGenerativeUI is from @copilotkit/angular/generative-ui, that entry point isnt in the latest @copilotkit/angular on npm,cannot find module so ng serve wont build",
    "Airport and Arrow components are never shown and z isnt imported",
  ].join('\n'),
};

async function writeFinding(page: Page, id: string, config: Parameters<PageActionHandler>[1]): Promise<void> {
  await showFinding(page, config, FINDING_EVIDENCE[id], FINDING_NOTES[id]);
}

async function settle(page: Page, msgCount: number, ctx: ActionContext, quietMs = 3000): Promise<void> {
  try {
    await waitForAgentResponseCompletion(page, quietMs, msgCount);
  } catch (e) {
    ctx.warn(`Reply did not complete cleanly: ${String(e).slice(0, 160)}`);
  }
}

/**
 * Run a real command and append its output to a repo log (logs/<file>), so the failure terminal
 * at the end of the clip tails the real error. Never throws.
 */
function runToLog(root: string, file: string, cwd: string, cmd: string, args: string[]): Promise<void> {
  mkdirSync(join(root, 'logs'), { recursive: true });
  const log = join(root, 'logs', file);
  appendFileSync(log, `\n$ (cd ${cwd} && ${cmd} ${args.join(' ')})\n`);
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd: join(root, cwd), timeout: 180000, shell: process.platform === 'win32' }, (_err, stdout, stderr) => {
      appendFileSync(log, `${stdout ?? ''}${stderr ?? ''}`);
      resolve();
    });
  });
}

const typecheck = (root: string, folder: string) =>
  runToLog(root, 'doc-typecheck.log', 'frontend', 'node', [
    'node_modules/typescript/bin/tsc',
    '-p',
    `doc-verbatim/${folder}/tsconfig.json`,
  ]);

// ---------------------------------------------------------------------------------------------
// ❌ / ⚠️ pages
// ---------------------------------------------------------------------------------------------

/** Quickstart: the chat answers, but only on the harness backend + runtime (FINDINGS.md #1). */
export const runQuickstartAction: PageActionHandler = async (page, config, root, ctx) => {
  try {
    await runStandardAction(page, config, root, ctx);
  } finally {
    await writeFinding(page, config.id, config);
  }
};

/** Native generative UI: ask for a product card; no surface renders; the verbatim code won't compile. */
export const runGenUiAction: PageActionHandler = async (page, config, root, ctx) => {
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  const surface = page.locator('copilot-generative-ui-surface, copilot-generative-ui-surface-view, app-product-card');
  const rendered = await surface.first().waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
  if (!rendered) mark('error');
  await sleep(2000);
  await typecheck(root, 'generative-ui-components');
  await writeFinding(page, config.id, config);
  if (!rendered) ctx.fail("No generative UI rendered: the page's provideGenerativeUI comes from @copilotkit/angular/generative-ui, which doesn't exist (TS2307, FINDINGS.md #6).");
};

/** A2UI: ask for a flight card; A2UI stays off without the never-defined catalog. */
export const runA2uiAction: PageActionHandler = async (page, config, root, ctx) => {
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  const surface = page.locator('copilot-a2ui-surface, a2ui-surface, [class*="a2ui-"]');
  const rendered = await surface.first().waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
  if (!rendered) mark('error');
  await sleep(2000);
  await typecheck(root, 'a2ui');
  await writeFinding(page, config.id, config);
  if (!rendered) ctx.fail('No A2UI surface rendered: "no a2ui.catalog is configured, so A2UI stays off"; the page\'s productCatalog is never defined (TS2304, FINDINGS.md #2).');
};

/**
 * Voice (new page 2026-11-19): the main feature is the composer mic (transcription through the
 * Runtime); the page's "Voice backend setup" link has no target, so no transcription service is
 * set up and the mic should be hidden. Also checks the page's getWeather renderer
 * (WeatherCardComponent, HARNESS copy from Render a tool result) for a typed weather request.
 */
export const runVoiceAction: PageActionHandler = async (page, config, _root, ctx) => {
  try {
    const mic = page.locator('button[aria-label*="microphone" i], button[aria-label*="voice" i], button[aria-label*="record" i], button[aria-label*="transcri" i]');
    const hasMic = (await mic.count()) > 0;
    if (!hasMic) {
      mark('error', 'no mic button in the composer');
      ctx.fail('No mic in the composer: the runtime has no transcription service, the page\'s "Voice backend setup" link points to a #backend section that does not exist (FINDINGS.md #3).');
    }
    await glideTo(page, page.locator('copilot-chat-input, textarea').first(), 2500);
    const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
    await settle(page, msgCount, ctx);
    const card = page.locator('app-weather-card').last();
    const shown = await card.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
    if (shown) await glideTo(page, card, 2500);
    else ctx.warn('getWeather was not rendered by WeatherCardComponent.');
  } finally {
    await writeFinding(page, config.id, config);
  }
};

/** Shared state: the UI writes priority with agent.setState, then asks the agent what it is. */
export const runSharedStateAction: PageActionHandler = async (page, config, _root, ctx) => {
  const workspace = page.locator('app-workspace').first();
  await glideTo(page, workspace, 1500);
  await glideClick(page, page.getByRole('button', { name: 'Mark high priority' }).first());
  await sleep(2000);
  await glideTo(page, workspace, 1500);
  const msgCount = await sendPrompt(page, 'What is the priority set to right now?', { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  const reply = (await page.locator('copilot-chat-assistant-message').last().innerText().catch(() => '')) || '';
  const sawPriority = /\bhigh\b/i.test(reply);
  if (!sawPriority) mark('error');
  await glideTo(page, page.locator('copilot-chat-assistant-message').last(), 2500);
  await writeFinding(page, config.id, config);
  if (!sawPriority) {
    ctx.fail(`The agent never saw the priority the app wrote with agent.setState: "${reply.slice(0, 160)}" (FINDINGS.md #4).`);
  }
};

/** Authentication: signed out the hooked runtime answers 401 (no reply); signed in it replies. */
export const runAuthAction: PageActionHandler = async (page, config, _root, ctx) => {
  await sendPrompt(page, config.prompt, { timeoutMs: 15000, expectInputToEmpty: false }).catch(() => {});
  await sleep(9000);
  mark('action', 'signed out: runtime answers 401, no reply');
  await glideClick(page, page.getByRole('button', { name: 'Sign in' }).first());
  await sleep(1500);
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  const reply = (await page.locator('copilot-chat-assistant-message').last().innerText().catch(() => '')) || '';
  if (!reply.trim()) ctx.warn('No reply after signing in.');
  await glideTo(page, page.locator('copilot-chat-assistant-message').last(), 2500);
};

/** Sub-agents: ask for research -> write -> critique; the delegation log stays empty; the doc's agent won't import. */
export const runSubagentsAction: PageActionHandler = async (page, config, root, ctx) => {
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  const log = page.getByText('No delegations yet.').first();
  const empty = await log.isVisible().catch(() => false);
  await glideTo(page, log, 2500);
  if (empty) mark('error');
  await runToLog(root, 'subagents-import.log', 'backend', 'uv', ['run', 'python', '-c', 'import src.agents.subagents']);
  await writeFinding(page, config.id, config);
  if (empty) ctx.fail("No delegation ran: the page's subagents.py can't be imported (ModuleNotFoundError: No module named 'src.agents._loop_cap', FINDINGS.md #5).");
};

// ---------------------------------------------------------------------------------------------
// ✅ pages
// ---------------------------------------------------------------------------------------------

/** Frontend tools (new page 2026-11-19): change_background changes the page. */
export const runFrontendToolsAction: PageActionHandler = async (page, config, _root, ctx) => {
  const host = page.locator('app-tools-chat > div').first();
  const before = await host.evaluate((el) => (el as HTMLElement).style.background).catch(() => '');
  const msgCount = await sendPrompt(page, 'Could you change the background to violet?', { timeoutMs: 15000 });
  const changed = await page
    .waitForFunction(
      (prev) => (document.querySelector('app-tools-chat > div') as HTMLElement | null)?.style.background !== prev,
      before,
      { timeout: 60000 },
    )
    .then(() => true)
    .catch(() => false);
  if (!changed) ctx.fail('change_background never ran: the background did not change.');
  await settle(page, msgCount, ctx);
  await sleep(1500);
};

/** HITL: the approval card appears, the user approves, the run resumes. */
export const runHitlAction: PageActionHandler = async (page, config, _root, ctx) => {
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  const card = page.locator('app-approval-card').last();
  const shown = await card.waitFor({ state: 'visible', timeout: 90000 }).then(() => true).catch(() => false);
  if (!shown) {
    ctx.fail('The approval card never appeared: requestApproval was not called.');
    return;
  }
  await glideTo(page, card, 2000);
  await glideClick(page, card.getByRole('button', { name: 'Approve' }));
  await sleep(1500);
  await settle(page, msgCount, ctx);
  await sleep(2000);
};

/** Inspector: run one turn, open the launcher, walk the panes the quickstart names. */
export const runInspectorAction: PageActionHandler = async (page, config, _root, ctx) => {
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  const inspector = page.locator('cpk-web-inspector');
  if ((await inspector.count()) === 0) {
    ctx.fail('No <cpk-web-inspector> on the page.');
    return;
  }
  await glideClick(page, inspector.locator('button').first());
  await sleep(2500);
  for (const pane of ['Agent', 'AG-UI Events', 'Rich Threads']) {
    const link = inspector.getByText(pane, { exact: true }).first();
    if (await link.isVisible().catch(() => false)) {
      await glideClick(page, link);
      await sleep(3000);
    } else {
      ctx.warn(`Inspector pane "${pane}" not found.`);
    }
  }
};

// ---------------------------------------------------------------------------------------------
// Components and surfaces (nine pages under /ag2/generative-ui/components, Angular tab), 2026-11-09
// ---------------------------------------------------------------------------------------------

/** Anything the generative UI engine would mount: a surface, a target, a standard component. */
const GENERATED_UI =
  'copilot-generative-ui-surface, [data-generative-ui-surface], .a2ui-surface, app-product-card, app-product-grid';

/**
 * Each page: send its prompt; nothing generated renders (the verbatim provider can't be added:
 * @copilotkit/angular/generative-ui doesn't exist); type-check the verbatim files into
 * logs/doc-typecheck.log for the failure terminal; doc evidence + Notepad. The Components page
 * runs on the doc's own TanStack runtime, which fails every run ("chat() needs a threadId").
 */
export const runComponentsAction: PageActionHandler = async (page, config, root, ctx) => {
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx, config.id === 'cmp-components' ? 20000 : 3000);
  const last = page.locator('copilot-chat-assistant-message').last();
  const reply = (await last.innerText().catch(() => '')) || '';
  const rendered = await page
    .locator(GENERATED_UI)
    .first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  if (reply.trim()) await glideTo(page, last, 2500);
  else await glideTo(page, page.locator('copilot-chat-input, textarea').first(), 2500);
  if (!rendered) mark('error', reply.trim() ? 'reply is text, no generated UI' : 'no reply');
  await sleep(1500);
  await typecheck(root, config.id);
  // The doc's server.ts as published (.ts, `npx tsx server.ts`) in an Angular workspace: crashes on
  // the ESM-only @tanstack packages. The take's runtime is the HARNESS .mts copy.
  if (config.id === 'cmp-components') {
    await runToLog(root, 'components-runtime-verbatim.log', 'frontend', 'npx', ['tsx', 'components-runtime.ts']);
  }
  await writeFinding(page, config.id, config);
  if (!rendered) {
    ctx.fail(
      reply.trim()
        ? `No generated UI rendered, the agent answered in text: "${reply.slice(0, 120)}". The page's provider comes from @copilotkit/angular/generative-ui, which @copilotkit/angular 0.6.0 doesn't have (TS2307).`
        : 'The agent never replied: every run of the page\'s TanStack agent fails with "chat() needs a threadId", and the page\'s provider comes from @copilotkit/angular/generative-ui, which doesn\'t exist (TS2307).',
    );
  }
};

// --- Multimodal Attachments / Agent Read-Only Context / Threads Drawer (2026-11-19) ---
const lastReplyText = async (page: Page): Promise<string> =>
  (await page.locator('copilot-chat-assistant-message').last().innerText().catch(() => '')) || '';

/** Multimodal Attachments: attach the chart image, ask about it, the reply must read it. */
export const runMultimodalAttachmentsAction: PageActionHandler = async (page, config, root, ctx) => {
  await attachImage(page, root);
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  const reply = await lastReplyText(page);
  await glideTo(page, page.locator('copilot-chat-assistant-message').last(), 2500);
  const ok = /quarterly|revenue|q4|300/i.test(reply);
  if (!ok) mark('error', 'reply did not read the attached image');
  await writeFinding(page, config.id, config);
  if (!ok) ctx.fail(`The agent did not read the attached chart: "${reply.slice(0, 160)}"`);
};

/** Agent Read-Only Context: switch to London time, ask for name/timezone/record. */
export const runAgentReadonlyAction: PageActionHandler = async (page, config, _root, ctx) => {
  await glideClick(page, page.getByRole('button', { name: 'Use London time' }).first());
  await sleep(1500);
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  const reply = await lastReplyText(page);
  await glideTo(page, page.locator('copilot-chat-assistant-message').last(), 2500);
  const ok = /ada/i.test(reply) && /london/i.test(reply);
  if (ok && !/record-42/i.test(reply)) ctx.warn(`Reply did not name the selected record: "${reply.slice(0, 160)}"`);
  if (!ok) mark('error', 'agent never saw the app context');
  await writeFinding(page, config.id, config);
  if (!ok) ctx.fail(`The agent never saw the app context (Ada, Europe/London): "${reply.slice(0, 160)}"`);
};

/** Threads Drawer: chat once, then read the drawer: a list or its locked state must show. */
export const runThreadsDrawerAction: PageActionHandler = async (page, config, _root, ctx) => {
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  await sleep(3000);
  const drawer = page.locator('copilot-threads-drawer').first();
  const text = (await drawer.innerText().catch(() => '')).trim();
  await glideTo(page, drawer, 2500);
  ctx.warn(`Drawer text: ${text.slice(0, 300).replace(/\s+/g, ' ')}`);
  if (!text) mark('error', 'drawer renders empty: no list, no locked state');
  await writeFinding(page, config.id, config);
  if (!text) ctx.fail('CopilotThreadsDrawer renders an empty panel: no thread list and no locked state.');
};
