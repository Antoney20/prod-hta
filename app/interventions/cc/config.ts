import { Tab } from "./guidline";

export type TabId = "interventions" | "system-categorisation";

export const GUIDANCE_TABS: Tab[] = [
  {
    id: "interventions",
    label: "Interventions submitted",
  },
  {
    id: "system-categorisation",
    label: "Status Update",
  },
];

export const TAB_HERO_CONFIG: Record<
  TabId,
  {
    title: string;
    description: string;
    badge?: string;          
    statsKey?: "proposals" | "status"; 
  }
> = {
  interventions: {
    title: "Towards Advancing Universal Health Coverage in Kenya",
    description: `The Benefits Package and Tariffs Advisory Panel (BPTAP) supports transparent,
    evidence-informed healthcare decision-making in Kenya through independent
    assessment and guidance. Our work strengthens the operationalization of the
    Social Health Authority (SHA) programme, ensuring equitable access to
    high-quality and sustainable health services for all Kenyans.`,
    badge: "BPTAP Guidance Framework",
    statsKey: "proposals",
  },
  "system-categorisation": {
    title: "Intervention Review Status",
    description: `This page shows the current review status for all health technology
    interventions submitted to BPTAP. Decisions and formal recommendations are
    published here once the review process has concluded.`,
    badge: "Review Outcomes",
    statsKey: "status",
  },
};