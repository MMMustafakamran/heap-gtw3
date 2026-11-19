// voice : accept voice input start
/**
 * Voice page, verbatim (rebuilt 2026-11-19 on the new page):
 * https://docs.copilotkit.ai/angular/ag2/voice
 * "No component option is required to display the microphone": a plain CopilotChat.
 * The registerRenderToolCall snippet is called from an Angular injection context (the constructor),
 * as the page says. The Runtime transcription route is NOT added: the page's
 * "Voice backend setup" link points to a #backend section that does not exist (FINDINGS.md #3).
 */

import { Component } from '@angular/core';
import { CopilotChat, registerRenderToolCall } from '@copilotkit/angular'; // HARNESS: imports the page never shows
import { z } from 'zod'; // HARNESS: import the page never shows

import { WeatherCardComponent } from './weather-card.component'; // HARNESS: WeatherCardComponent is defined on another page

@Component({
  selector: 'app-voice-chat',
  imports: [CopilotChat],
  template: `
    <div style="height: 100%">
      <copilot-chat />
    </div>
  `,
})
export class VoiceChatComponent {
  constructor() {
    registerRenderToolCall({
      name: "getWeather",
      args: z.object({ city: z.string() }),
      component: WeatherCardComponent,
    });
  }
}
// voice : accept voice input end
