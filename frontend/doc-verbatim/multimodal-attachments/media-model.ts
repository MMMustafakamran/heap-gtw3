// "Send media programmatically", verbatim.
// https://docs.copilotkit.ai/angular/ag2/multimodal-attachments#send-media-programmatically
export function createMultimodalMessage(
  spec: Pick<SampleSpec, "filename" | "mimeType" | "autoPrompt">,
  base64: string,
  size: number,
  id: string,
): MediaAgentMessage {
  return {
    id,
    role: "user",
    content: [
      { type: "text", text: spec.autoPrompt },
      {
        type: spec.mimeType === "application/pdf" ? "document" : "image",
        source: {
          type: "data",
          value: base64,
          mimeType: spec.mimeType,
        },
        metadata: { filename: spec.filename, size },
      },
    ],
  };
}
