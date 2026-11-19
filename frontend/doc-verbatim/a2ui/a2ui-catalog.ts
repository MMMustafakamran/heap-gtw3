import { ChildListSchema, createAngularCatalog } from "@copilotkit/angular/a2ui";
import { z } from "zod";

const catalog = createAngularCatalog(
  {
    Badge: { props: z.object({ label: z.string() }) },
    Panel: { props: z.object({ children: ChildListSchema }) },
  },
  {
    Badge: { tagName: "acme-badge", element: AcmeBadge },
    Panel: PanelComponent,
  },
  { includeBasicCatalog: true },
);
