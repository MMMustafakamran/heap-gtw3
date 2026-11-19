/**
 * HARNESS host: the Threads Drawer page's verbatim ConversationsComponent, full height.
 * https://docs.copilotkit.ai/angular/ag2/prebuilt-components/copilot-threads-drawer
 */
import { Component } from '@angular/core';

import { ConversationsComponent } from './conversations.component';

@Component({
  selector: 'app-threads-drawer-demo',
  imports: [ConversationsComponent],
  template: `<div style="display: flex; height: 100%"><app-conversations /></div>`,
})
export class ThreadsDrawerDemoComponent {}
