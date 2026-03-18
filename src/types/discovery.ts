/**
 * Discovery Session Types
 *
 * The 6-step AI-guided onboarding flow that is the core product experience.
 */

export interface DiscoveryStep {
  id: number;
  title: string;
  question: string;
  description: string;
  inputTypes: ("voice" | "text" | "upload")[];
  followUpQuestions?: string[];
}

export interface StepResponse {
  stepId: number;
  textInput?: string;
  audioTranscription?: string;
  uploadedFiles?: Array<{ name: string; extractedText: string }>;
  aiExtraction?: Record<string, unknown>;
}

export interface DiscoverySession {
  id: string;
  userId?: string;
  steps: StepResponse[];
  summary?: BusinessDiscoverySummary;
  status: "in-progress" | "summarizing" | "confirmed" | "generating";
  investorType?: string;
  createdAt: string;
}

export interface BusinessDiscoverySummary {
  businessDescription: string;
  businessModel: string;
  product: string;
  market: string;
  uniqueValue: string;
  goals: string[];
  primaryGoal: string;
  investorType: string;
  investorDetails: string;
  fundingAmount: string;
  timeline: string;
  useOfFunds: string[];
  fundingSource: string;
  platform?: string;
  geography?: string;
  stage: string;
  teamSize: string;
  traction: string[];
  existingInvestors?: string;
  confidence: number;
}

// ── Step Configuration ────────────────────────────────────────────────────

export const DISCOVERY_STEPS: DiscoveryStep[] = [
  {
    id: 1,
    title: "Your Business",
    question: "Tell me about your business",
    description:
      "What do you do? What problem do you solve? What makes you different?",
    inputTypes: ["voice", "text", "upload"],
    followUpQuestions: [
      "What industry are you in?",
      "Who are your customers?",
      "What's your business model?",
    ],
  },
  {
    id: 2,
    title: "Your Goals",
    question: "What are your goals?",
    description:
      "Why do you need a pitch deck? What are you trying to achieve?",
    inputTypes: ["voice", "text"],
    followUpQuestions: [
      "Are you raising capital?",
      "Looking to sell your business?",
      "Seeking strategic partners?",
    ],
  },
  {
    id: 3,
    title: "Your Investors",
    question: "Who are your target investors?",
    description:
      "What type of investor or funding source are you targeting?",
    inputTypes: ["voice", "text"],
    followUpQuestions: [
      "Angel investors or VCs?",
      "Bank loans or SBA?",
      "Crowdfunding platforms?",
    ],
  },
  {
    id: 4,
    title: "Ideal Outcome",
    question: "What's your ideal outcome?",
    description:
      "How much are you looking to raise? What's your timeline? How will you use the funds?",
    inputTypes: ["voice", "text"],
  },
  {
    id: 5,
    title: "Fundraising Source",
    question: "Where are you raising from?",
    description:
      "Any specific platforms, networks, or geographic focus?",
    inputTypes: ["voice", "text"],
  },
  {
    id: 6,
    title: "Your Stage",
    question: "What stage is your business at?",
    description:
      "Idea, MVP, generating revenue, or scaling? Tell us about your team and traction.",
    inputTypes: ["voice", "text", "upload"],
  },
];
