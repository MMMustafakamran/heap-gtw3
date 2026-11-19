import { Component } from '@angular/core';

import { RouteHeader } from '../components/route-header';
import { Callout, Panel, SourceCode, TryIt } from '../components/ui';

// Rebuilt 2026-11-19 for the new Voice page (https://docs.copilotkit.ai/angular/ag2/voice).
// The old attachments content moved to the Multimodal Attachments page.
@Component({
  selector: 'app-voice-page',
  imports: [RouteHeader, Panel, Callout, TryIt, SourceCode],
  template: `
    <app-route-header path="/voice-multimodal" />

    <div class="space-y-6">
      <ui-try-it>
        <p class="mt-1 text-slate-700">
          Open the demo. The page says the mic button shows in the composer when
          the runtime has a transcription service, and that voice requests can
          call the same backend tools (getWeather rendered by WeatherCardComponent).
        </p>
      </ui-try-it>

      <ui-callout tone="warn" title="No transcription route">
        The page's "Voice backend setup" link points to a #backend section that
        does not exist, so no transcription service is configured here and the
        chat hides the mic.
      </ui-callout>

      <ui-panel heading="Voice chat + tool renderer">
        <ui-source path="src/app/features/media/voice-chat.component.ts" />
      </ui-panel>
      <ui-panel heading="WeatherCardComponent (HARNESS, from Render a tool result)">
        <ui-source path="src/app/features/media/weather-card.component.ts" />
      </ui-panel>
    </div>
  `,
})
export default class VoiceMultimodalPage {}
