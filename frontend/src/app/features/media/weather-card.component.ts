// HARNESS: the Voice page (https://docs.copilotkit.ai/angular/ag2/voice) uses WeatherCardComponent
// but never defines it; it points to "Render a tool result". Copied verbatim from
// https://docs.copilotkit.ai/angular/ag2/generative-ui/tool-rendering#render-a-tool-result
import { Component, input } from "@angular/core";
import {
  type AngularToolCall,
  type ToolRenderer,
} from "@copilotkit/angular";

type WeatherArgs = { city: string };

@Component({
  selector: "app-weather-card",
  template: `
    @let call = toolCall();
    @if (call.status === "complete") {
      <article>
        <strong>{{ call.args.city }}</strong>
        <p>{{ call.result }}</p>
      </article>
    } @else {
      <p>Loading weather for {{ call.args.city ?? "…" }}</p>
    }
  `,
})
export class WeatherCardComponent implements ToolRenderer<WeatherArgs> {
  readonly toolCall = input.required<AngularToolCall<WeatherArgs>>();
}
