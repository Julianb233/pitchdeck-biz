export type DocumentType =
  | "executive-summary"
  | "investor-update"
  | "board-deck"
  | "company-overview";

export interface BusinessDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: DocumentContent;
  version: number;
  feedback?: string[];
  status: "draft" | "final";
  createdAt: string;
  updatedAt: string;
}

export interface DocumentContent {
  sections: Array<{
    title: string;
    body: string;
    subsections?: Array<{ title: string; body: string }>;
  }>;
  metadata: {
    companyName: string;
    date: string;
    confidential: boolean;
  };
}

export interface RevisionRequest {
  documentId: string;
  feedback: string;
  specificSections?: string[];
}

export const DOCUMENT_TYPE_INFO: Record<
  DocumentType,
  { label: string; description: string; icon: string }
> = {
  "executive-summary": {
    label: "Executive Summary",
    description:
      "2-page investor brief with company overview, problem/solution, market opportunity, business model, traction, team, financials, and investment ask.",
    icon: "briefcase",
  },
  "investor-update": {
    label: "Investor Update",
    description:
      "Monthly/quarterly update with KPIs, highlights, lowlights, asks, and upcoming milestones.",
    icon: "chart",
  },
  "board-deck": {
    label: "Board Deck",
    description:
      "Board reporting format with financials, KPIs, strategic updates, challenges, and decisions needed.",
    icon: "building",
  },
  "company-overview": {
    label: "Company Overview",
    description:
      "Comprehensive company description document for partners, clients, and stakeholders.",
    icon: "globe",
  },
};
