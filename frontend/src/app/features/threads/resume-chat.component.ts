// threads : resume a specific thread start
/**
 * "Resume a specific thread": the template line is verbatim from
 * https://docs.copilotkit.ai/angular/ag2/headless-threads
 * HARNESS: the page shows only the template line; the host component, its imports and the
 * `selectedThreadId` signal are never shown, so they are added here (undefined = a new thread).
 */
import { Component, signal } from '@angular/core'; // HARNESS
import { CopilotChat } from '@copilotkit/angular'; // HARNESS

@Component({
  selector: 'app-resume-chat', // HARNESS
  imports: [CopilotChat], // HARNESS
  styles: [':host { display: block; width: 100%; height: 520px; }'], // HARNESS: layout only, the page shows no host
  template: `
    <copilot-chat agentId="support" [threadId]="selectedThreadId()" />
  `,
})
export class ResumeChatComponent {
  readonly selectedThreadId = signal<string | undefined>(undefined); // HARNESS: never defined on the page
}
// threads : resume a specific thread end
