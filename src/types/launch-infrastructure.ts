export type InfraType =
  | "business-plan"
  | "financial-model"
  | "cap-table"
  | "term-sheet-guide"
  | "dd-checklist"
  | "investor-outreach"
  | "data-room-guide";

export interface LaunchDocumentSection {
  title: string;
  content: string;
}

export interface LaunchDocument {
  id: string;
  type: InfraType;
  title: string;
  content: string; // full markdown content
  sections: LaunchDocumentSection[];
  version: number;
  createdAt: string;
}

export interface InfraDocumentMeta {
  type: InfraType;
  title: string;
  description: string;
  icon: string;
  estimatedPages: string;
  color: string;
}

export const INFRA_DOCUMENTS: InfraDocumentMeta[] = [
  {
    type: "business-plan",
    title: "Business Plan",
    description:
      "Comprehensive 20-30 page business plan with executive summary, market analysis, financial projections, and funding strategy.",
    icon: "briefcase",
    estimatedPages: "20-30 pages",
    color: "#ff006e",
  },
  {
    type: "financial-model",
    title: "Financial Model",
    description:
      "5-year financial projections with revenue model, unit economics, burn rate, runway, and sensitivity analysis.",
    icon: "chart",
    estimatedPages: "8-12 pages",
    color: "#8b5cf6",
  },
  {
    type: "cap-table",
    title: "Cap Table",
    description:
      "Ownership structure with option pool, post-funding dilution math, vesting schedules, and SAFEs/convertible notes.",
    icon: "pie-chart",
    estimatedPages: "5-8 pages",
    color: "#00d4ff",
  },
  {
    type: "term-sheet-guide",
    title: "Term Sheet Guide",
    description:
      "Negotiation playbook covering key terms, red flags, sample structures, and investor-type strategies.",
    icon: "file-text",
    estimatedPages: "10-15 pages",
    color: "#10b981",
  },
  {
    type: "dd-checklist",
    title: "Due Diligence Checklist",
    description:
      "Complete preparation checklist for corporate, financial, legal, IP, team, customer, and compliance documentation.",
    icon: "check-list",
    estimatedPages: "6-10 pages",
    color: "#f59e0b",
  },
  {
    type: "investor-outreach",
    title: "Investor Outreach Kit",
    description:
      "Cold outreach emails, follow-up sequences, meeting templates, investor updates, and CRM-ready formats.",
    icon: "mail",
    estimatedPages: "8-12 pages",
    color: "#ef4444",
  },
  {
    type: "data-room-guide",
    title: "Data Room Guide",
    description:
      "Virtual data room setup with folder structure, document lists, naming conventions, and access permissions.",
    icon: "folder",
    estimatedPages: "5-8 pages",
    color: "#6366f1",
  },
];
