// shared state : shared state chat start
/**
 * Mounts the page's read/write state panel against one chat.
 * https://docs.copilotkit.ai/angular/ag2/shared-state
 * 2026-11-19: the agent-context snippets (account-context, selection-context) are no longer
 * on the new Shared State page; their files stay on disk, not mounted here.
 */

import { Component } from '@angular/core';
import { CopilotChat } from '@copilotkit/angular';

import { WorkspaceComponent } from './workspace.component';

@Component({
  selector: 'app-shared-state-chat',
  imports: [
    CopilotChat,
    WorkspaceComponent,
  ],
  template: `
    <div style="display: flex; height: 100%; gap: 1rem">
      <div style="width: 20rem; overflow-y: auto; padding: 1rem">
        <app-workspace />
      </div>
      <div style="flex: 1; min-width: 0">
        <copilot-chat />
      </div>
    </div>
  `,
})
export class SharedStateChatComponent {}
// shared state : shared state chat end
