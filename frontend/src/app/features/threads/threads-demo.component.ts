/**
 * Harness wrapper for the Headless Threads page (2026-11-19): the hand-built list on
 * `injectThreads` and the "Resume a specific thread" chat. The drawer moved to the
 * Threads Drawer page (conversations.component.ts kept on disk, no longer mounted here).
 */
import { Component, inject } from '@angular/core';
import { CopilotKit } from '@copilotkit/angular'; // HARNESS: per-page runtime switch

import { ResumeChatComponent } from './resume-chat.component';
import { ThreadListComponent } from './thread-list.component';

@Component({
  selector: 'app-threads-demo',
  imports: [ThreadListComponent, ResumeChatComponent],
  template: `
    <div class="flex h-full flex-col gap-4 p-4">
      <section class="rounded-lg border border-slate-200 bg-white p-4">
        <h2 class="mb-2 text-sm font-semibold text-slate-900">
          Headless list — injectThreads
        </h2>
        <app-thread-list />
      </section>

      <section
        class="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-200 bg-white p-4"
      >
        <h2 class="mb-2 text-sm font-semibold text-slate-900">
          Resume a specific thread
        </h2>
        <div class="flex min-h-0 flex-1 gap-4">
          <app-resume-chat />
        </div>
      </section>
    </div>
  `,
})
export class ThreadsDemoComponent {
  // HARNESS: threads need CopilotKit Intelligence; point this page at the Threads runtime
  // (frontend/server.threads.ts, 8243). Set in the constructor so it runs before the child
  // components (drawer / injectThreads) are created.
  constructor() {
    inject(CopilotKit).updateRuntime({ runtimeUrl: 'http://localhost:8243/api/copilotkit' }); // HARNESS: Threads runtime (Intelligence)
  }
}
