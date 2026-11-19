/**
 * HARNESS host: the Threads Drawer page's verbatim ConversationsComponent, full height.
 * https://docs.copilotkit.ai/angular/ag2/prebuilt-components/copilot-threads-drawer
 */
import { Component, inject } from '@angular/core';
import { CopilotKit } from '@copilotkit/angular'; // HARNESS: per-page runtime switch

import { ConversationsComponent } from './conversations.component';

@Component({
  selector: 'app-threads-drawer-demo',
  imports: [ConversationsComponent],
  template: `<div style="display: flex; height: 100%"><app-conversations /></div>`,
})
export class ThreadsDrawerDemoComponent {
  // HARNESS: threads need CopilotKit Intelligence; point this page at the Threads runtime
  // (frontend/server.threads.ts, 8243). Set in the constructor so it runs before the child
  // components (drawer / injectThreads) are created.
  constructor() {
    inject(CopilotKit).updateRuntime({ runtimeUrl: 'http://localhost:8243/api/copilotkit' }); // HARNESS: Threads runtime (Intelligence)
  }
}
