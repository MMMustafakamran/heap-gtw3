// "Configure attachments", verbatim: the three snippets as the page shows them.
// https://docs.copilotkit.ai/angular/ag2/multimodal-attachments#configure-attachments
// HARNESS: the page gives a const, a bare class field and a template line, no imports
// and no component around them; kept here as published (type-checked, not served).
const MULTIMODAL_ATTACHMENTS: AttachmentsConfig = {
  enabled: true,
  accept: "image/*,application/pdf",
  maxSize: 10 * 1024 * 1024,
};

// Expose the config as a field on your chat component:
// protected readonly multimodalAttachments = MULTIMODAL_ATTACHMENTS;

// media-chat.component.html:
// <copilot-chat [attachments]="multimodalAttachments" />
