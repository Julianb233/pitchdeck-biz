/**
 * Investor-tailored deck generation profiles.
 *
 * Each profile defines slide order, tone, emphasis, financial framing,
 * and a system prompt addition that shapes AI deck generation for a
 * specific investor audience.
 */

export type InvestorType =
  | "vc"
  | "angel"
  | "bank_sba"
  | "crowdfunding"
  | "family_office"
  | "general";

export interface InvestorProfile {
  type: InvestorType;
  label: string;
  description: string;
  slideOrder: string[];
  emphasisAreas: string[];
  toneGuide: string;
  financialFraming: string;
  keyMetrics: string[];
  systemPromptAddition: string;
}

export const INVESTOR_PROFILES: Record<InvestorType, InvestorProfile> = {
  vc: {
    type: "vc",
    label: "Venture Capital",
    description: "Series Seed through Series C funding from VC firms",
    slideOrder: [
      "title",
      "problem",
      "solution",
      "market",
      "product",
      "business-model",
      "traction",
      "competition",
      "team",
      "financials",
      "ask",
      "why-now",
    ],
    emphasisAreas: [
      "market-size",
      "growth-rate",
      "competitive-moat",
      "scalability",
      "team-pedigree",
    ],
    toneGuide:
      "Data-driven, ambitious but credible. Lead with market opportunity. Show you understand unit economics. Demonstrate category-defining potential.",
    financialFraming:
      "Focus on growth metrics: MRR growth rate, LTV/CAC, burn rate, runway. Show hockey stick potential with realistic milestones. Include clear use of funds with expected outcomes.",
    keyMetrics: [
      "TAM/SAM/SOM",
      "MRR/ARR",
      "Growth Rate",
      "LTV/CAC",
      "Burn Rate",
      "Runway",
    ],
    systemPromptAddition:
      "This deck targets venture capital investors. They care most about: massive market opportunity, defensible competitive advantage, strong founding team, and a clear path to 10-100x returns. Use data-heavy slides. Include TAM/SAM/SOM analysis. Show unit economics if available. Frame everything in terms of scalability and growth potential.",
  },
  angel: {
    type: "angel",
    label: "Angel Investor",
    description: "Individual angel investors or angel groups",
    slideOrder: [
      "title",
      "founder-story",
      "problem",
      "solution",
      "product",
      "traction",
      "market",
      "business-model",
      "team",
      "financials",
      "ask",
      "closing",
    ],
    emphasisAreas: [
      "founder-story",
      "vision",
      "early-traction",
      "capital-efficiency",
      "passion",
    ],
    toneGuide:
      "Personal, passionate, authentic. Lead with your story and why you care. Show early validation. Demonstrate resourcefulness and hustle.",
    financialFraming:
      "Focus on capital efficiency: what you've accomplished with limited resources. Show how this investment specifically unlocks the next milestone. Keep projections grounded and milestone-based.",
    keyMetrics: [
      "Revenue/Users",
      "Growth %",
      "Capital Raised",
      "Key Milestones",
      "Team Size",
    ],
    systemPromptAddition:
      "This deck targets angel investors. They invest in people first, ideas second. Lead with the founder's story and personal connection to the problem. Show early traction and resourcefulness. Angels want to see passion, coachability, and a realistic plan for their money to make a specific impact.",
  },
  bank_sba: {
    type: "bank_sba",
    label: "Bank / SBA Loan",
    description: "Traditional bank loans or SBA-backed financing",
    slideOrder: [
      "title",
      "executive-summary",
      "business-overview",
      "market",
      "financials",
      "cash-flow",
      "collateral",
      "management-team",
      "loan-request",
      "repayment-plan",
    ],
    emphasisAreas: [
      "cash-flow",
      "collateral",
      "repayment-ability",
      "business-stability",
      "management-experience",
    ],
    toneGuide:
      "Conservative, professional, risk-aware. Emphasize stability and predictability. Show strong financial discipline. Focus on ability to repay.",
    financialFraming:
      "Focus on cash flow projections, debt service coverage ratio, collateral value, and repayment timeline. Show existing revenue and profitability. Include personal guarantees if applicable. Conservative projections with stress testing.",
    keyMetrics: [
      "Monthly Revenue",
      "Cash Flow",
      "Debt Service Coverage",
      "Collateral Value",
      "Time in Business",
    ],
    systemPromptAddition:
      "This deck targets bank lenders or SBA loan officers. They care about: ability to repay, cash flow stability, collateral, management experience, and business viability. Avoid hype. Use conservative projections. Show existing revenue if any. Emphasize business stability and market position. Include specific loan amount, purpose, and repayment plan.",
  },
  crowdfunding: {
    type: "crowdfunding",
    label: "Crowdfunding",
    description:
      "Platforms like Kickstarter, Republic, Wefunder, StartEngine",
    slideOrder: [
      "title",
      "hook",
      "problem",
      "solution",
      "product",
      "social-proof",
      "market",
      "business-model",
      "team",
      "campaign-details",
      "rewards",
      "closing",
    ],
    emphasisAreas: [
      "consumer-appeal",
      "social-proof",
      "community",
      "viral-potential",
      "reward-value",
    ],
    toneGuide:
      "Exciting, accessible, community-driven. Tell a compelling story. Make people feel like they're part of something. Use emotional hooks and social proof.",
    financialFraming:
      "Focus on campaign goals, stretch goals, reward tiers, and what backers get. Show community size and engagement. If equity crowdfunding, show valuation rationale simply.",
    keyMetrics: [
      "Community Size",
      "Email List",
      "Social Following",
      "Pre-orders",
      "Campaign Goal",
    ],
    systemPromptAddition:
      "This deck targets crowdfunding backers/investors. Lead with an emotional hook and compelling story. Show the product/service in action. Social proof is critical — show community engagement, waitlist numbers, social media traction. Make the audience feel like early adopters joining a movement. Keep financial details simple and accessible.",
  },
  family_office: {
    type: "family_office",
    label: "Family Office",
    description: "Private wealth management and family offices",
    slideOrder: [
      "title",
      "executive-summary",
      "problem",
      "solution",
      "market",
      "business-model",
      "competitive-landscape",
      "financials",
      "team",
      "values-impact",
      "ask",
      "closing",
    ],
    emphasisAreas: [
      "long-term-value",
      "stable-returns",
      "values-alignment",
      "risk-management",
      "wealth-preservation",
    ],
    toneGuide:
      "Sophisticated, measured, long-term focused. Emphasize sustainable value creation. Show alignment with family values. Demonstrate risk awareness.",
    financialFraming:
      "Focus on long-term value creation, sustainable margins, risk-adjusted returns. Show multiple exit scenarios. Include ESG/impact considerations if relevant. Conservative but compelling growth trajectory.",
    keyMetrics: [
      "Revenue Growth",
      "Margins",
      "Market Position",
      "Risk Factors",
      "Long-term Projections",
    ],
    systemPromptAddition:
      "This deck targets family office investors. They think in decades, not quarters. Emphasize sustainable competitive advantages, long-term market positioning, and stable value creation. Show alignment with values (ESG, impact, legacy). Include thorough risk analysis. Demonstrate management maturity and governance.",
  },
  general: {
    type: "general",
    label: "General",
    description: "Balanced pitch for mixed audiences",
    slideOrder: [
      "title",
      "problem",
      "solution",
      "market",
      "product",
      "business-model",
      "traction",
      "team",
      "financials",
      "ask",
      "closing",
    ],
    emphasisAreas: ["balanced"],
    toneGuide:
      "Professional, clear, compelling. Cover all bases without over-indexing on any one area.",
    financialFraming:
      "Balanced financial presentation covering revenue, growth, projections, and use of funds.",
    keyMetrics: ["Revenue", "Growth", "Market Size", "Team", "Funding Ask"],
    systemPromptAddition:
      "This is a general-purpose pitch deck. Create a balanced presentation covering problem, solution, market opportunity, business model, traction, team, and financials. Keep it professional and clear.",
  },
};

/**
 * Returns the investor profile for the given type, falling back to "general".
 */
export function getInvestorProfile(
  type: string | undefined | null,
): InvestorProfile {
  if (type && type in INVESTOR_PROFILES) {
    return INVESTOR_PROFILES[type as InvestorType];
  }
  return INVESTOR_PROFILES.general;
}
