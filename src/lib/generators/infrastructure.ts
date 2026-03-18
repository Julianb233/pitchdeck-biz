/**
 * Launch Infrastructure Document Generators
 *
 * Each generator returns a system prompt and user prompt for Claude
 * to produce comprehensive, investor-ready documents from business analysis data.
 */

import type { BusinessAnalysis } from "@/lib/types";
import type { InfraType } from "@/types/launch-infrastructure";

interface GeneratorPrompts {
  system: string;
  user: string;
}

function analysisContext(analysis: BusinessAnalysis): string {
  return `BUSINESS ANALYSIS:
Company Summary: ${analysis.summary}

Business Model:
- Type: ${analysis.businessModel.type}
- Revenue Streams: ${analysis.businessModel.revenueStreams.join(", ")}
${analysis.businessModel.costStructure ? `- Cost Structure: ${analysis.businessModel.costStructure.join(", ")}` : ""}
${analysis.businessModel.keyPartners ? `- Key Partners: ${analysis.businessModel.keyPartners.join(", ")}` : ""}

Value Proposition:
- Headline: ${analysis.valueProposition.headline}
- Description: ${analysis.valueProposition.description}
- Pain Points: ${analysis.valueProposition.painPoints.join("; ")}
- Solutions: ${analysis.valueProposition.solutions.join("; ")}
- Differentiators: ${analysis.valueProposition.uniqueDifferentiators.join("; ")}

Market:
- Target Audience: ${analysis.market.targetAudience}
${analysis.market.marketSize ? `- Market Size: ${analysis.market.marketSize}` : ""}
${analysis.market.competitors ? `- Competitors: ${analysis.market.competitors.join(", ")}` : ""}
${analysis.market.trends ? `- Trends: ${analysis.market.trends.join("; ")}` : ""}
${analysis.market.positioning ? `- Positioning: ${analysis.market.positioning}` : ""}

Team:
${analysis.team.members.map((m) => `- ${m.name} (${m.role})${m.background ? `: ${m.background}` : ""}`).join("\n")}
${analysis.team.teamStrengths ? `- Strengths: ${analysis.team.teamStrengths.join("; ")}` : ""}
${analysis.team.advisors ? `- Advisors: ${analysis.team.advisors.join(", ")}` : ""}

Financials:
- Stage: ${analysis.financials.stage}
${analysis.financials.fundingHistory ? `- Funding History: ${analysis.financials.fundingHistory.join("; ")}` : ""}
${analysis.financials.currentAsk ? `- Current Ask: ${analysis.financials.currentAsk}` : ""}
${analysis.financials.keyMetrics ? `- Key Metrics: ${analysis.financials.keyMetrics.map((m) => `${m.label}: ${m.value}`).join("; ")}` : ""}
${analysis.financials.projections ? `- Projections: ${analysis.financials.projections}` : ""}

Brand Essence:
- Mission: ${analysis.brandEssence.mission}
${analysis.brandEssence.vision ? `- Vision: ${analysis.brandEssence.vision}` : ""}
- Tone: ${analysis.brandEssence.tone}
${analysis.brandEssence.tagline ? `- Tagline: ${analysis.brandEssence.tagline}` : ""}`;
}

const MARKDOWN_JSON_SCHEMA = `You MUST return valid JSON matching this exact schema:
{
  "title": "string - document title",
  "sections": [
    { "title": "string - section heading", "content": "string - markdown content for this section" }
  ]
}

Return ONLY the JSON object. No markdown code fences. No text outside the JSON.
Use full markdown formatting within each section's content field (headers, bold, bullet points, tables, etc).`;

export function generateBusinessPlan(analysis: BusinessAnalysis): GeneratorPrompts {
  return {
    system: `You are an expert business plan writer who has helped hundreds of startups raise funding. Write comprehensive, investor-grade business plans that are detailed, specific, and immediately usable.

${MARKDOWN_JSON_SCHEMA}

The business plan must be genuinely comprehensive (20-30 page equivalent when rendered). Include specific numbers, realistic projections, and actionable strategies based on the business data provided. Do NOT produce generic templates — every section must be tailored to this specific business.`,
    user: `Generate a comprehensive business plan for the following business. This should be a complete, professional document ready to present to investors, banks, or partners.

${analysisContext(analysis)}

Required sections (each should be substantial — multiple paragraphs with data-driven analysis):

1. **Executive Summary** — 1-2 page overview of the entire plan. Include mission, the opportunity, business model, competitive advantage, financial highlights, and funding ask.

2. **Company Description** — Company history/background, legal structure, location, mission/vision statements, short-term and long-term goals.

3. **Market Analysis — Industry Overview** — Industry size, growth rate, key trends, regulatory environment, and macro factors affecting the market.

4. **Market Analysis — Target Market** — Detailed customer segments with demographics, psychographics, buying behavior, market size per segment, and personas.

5. **Market Analysis — Competitive Analysis** — Direct and indirect competitors. Competitive matrix comparing features, pricing, market share. SWOT analysis for the company.

6. **Organization & Management** — Organizational chart description, management team bios and relevant experience, board of directors/advisors, hiring plan for next 12-18 months.

7. **Products & Services** — Detailed product/service descriptions, development stage and roadmap, intellectual property status, product lifecycle plans.

8. **Marketing & Sales Strategy** — Go-to-market strategy, customer acquisition channels, sales process and funnel, pricing strategy with justification, brand positioning, partnership strategy.

9. **Financial Projections — Revenue Model** — Revenue model assumptions, pricing tiers, conversion rates, growth assumptions with justification.

10. **Financial Projections — 5-Year Forecast** — Year-by-year revenue, COGS, gross margin, operating expenses, EBITDA, and net income projections in table format.

11. **Financial Projections — Cash Flow** — Monthly cash flow for Year 1, annual for Years 2-5. Include working capital requirements.

12. **Financial Projections — Unit Economics** — LTV, CAC, LTV:CAC ratio, payback period, gross margin per unit, contribution margin.

13. **Funding Request** — Amount sought, proposed terms, use of funds breakdown (with percentages), milestones the funding will achieve, future funding plans.

14. **Risk Analysis** — Key risks (market, technical, regulatory, competitive, financial), mitigation strategies for each.

15. **Appendix** — Supporting data references, glossary of terms, assumptions log.

Make all numbers realistic and internally consistent. If exact data isn't available, make reasonable assumptions clearly labeled as such.`,
  };
}

export function generateFinancialModel(analysis: BusinessAnalysis): GeneratorPrompts {
  return {
    system: `You are a startup financial modeling expert with experience at top VC firms and investment banks. Create detailed, realistic financial models that investors trust.

${MARKDOWN_JSON_SCHEMA}

Include actual numbers in markdown tables. All assumptions must be clearly stated and realistic for the business stage. Use conservative, base, and optimistic scenarios where appropriate.`,
    user: `Generate a comprehensive financial model for the following business:

${analysisContext(analysis)}

Required sections:

1. **Revenue Model Assumptions** — Pricing structure, customer segments, conversion rates, churn rates, growth rate assumptions with rationale. Present in a clear assumptions table.

2. **Monthly Projections — Year 1** — Month-by-month breakdown in table format: revenue (by stream), COGS, gross profit, operating expenses (by category: salaries, marketing, infrastructure, G&A, other), EBITDA, net income, cash position.

3. **Annual Projections — Years 1-5** — Annual summary table with revenue, COGS, gross margin %, operating expenses, EBITDA, EBITDA margin %, net income, headcount.

4. **Unit Economics** — Detailed calculation of: Customer Lifetime Value (LTV), Customer Acquisition Cost (CAC), LTV:CAC ratio, Payback period in months, Gross margin per customer, Contribution margin. Show the math step by step.

5. **Burn Rate & Runway** — Monthly burn rate calculation, current/projected runway in months, cash balance projections, when additional funding is needed.

6. **Break-Even Analysis** — Fixed costs, variable costs per unit, contribution margin, break-even point in units and revenue, time to break-even from current state.

7. **Sensitivity Analysis** — Three scenarios (conservative, base, optimistic) with different assumptions for: growth rate, churn, pricing, CAC. Show how each scenario affects 3-year revenue and runway.

8. **Key Financial Ratios** — Gross margin, operating margin, burn multiple, rule of 40 score, revenue per employee, magic number (SaaS efficiency).

Use markdown tables extensively. All numbers should be realistic for a ${analysis.financials.stage} stage ${analysis.businessModel.type} business.`,
  };
}

export function generateCapTable(analysis: BusinessAnalysis): GeneratorPrompts {
  return {
    system: `You are a corporate attorney and startup advisor specializing in equity structures, cap table management, and fundraising mechanics. Provide clear, actionable cap table guidance.

${MARKDOWN_JSON_SCHEMA}

Use markdown tables for all ownership breakdowns. Include specific percentages and share counts.`,
    user: `Generate a comprehensive cap table and equity structure guide for the following business:

${analysisContext(analysis)}

Required sections:

1. **Current Ownership Breakdown** — Pre-funding cap table showing founders, their ownership percentages, share classes, vesting status. Use a clear table format. If team composition suggests co-founders, allocate equity based on roles and typical startup splits.

2. **Option Pool Recommendation** — Recommended option pool size (typically 10-20%), justification based on hiring plan, impact on founder dilution. Table showing pool allocation by role tier.

3. **Pre-Money vs Post-Money Valuation** — Explain the difference with concrete examples using this business. Show how valuation affects ownership.

4. **Post-Funding Ownership — Seed Round** — Modeled scenario assuming a typical seed round for this business type. Table showing ownership before and after with dilution calculations. Include the option pool shuffle.

5. **Post-Funding Ownership — Series A** — Projected cap table after Series A, showing cumulative dilution from seed through A. Include anti-dilution protection scenarios.

6. **Vesting Schedule Template** — Standard 4-year vesting with 1-year cliff explained. Acceleration provisions (single vs double trigger). Table showing vesting over 48 months for each founder.

7. **SAFEs & Convertible Notes** — When to use each, key terms (valuation cap, discount rate, MFN), conversion mechanics with worked examples, pro-rata rights. Compare SAFE vs convertible note in a table.

8. **Equity Compensation Guide** — ISO vs NSO stock options, RSUs, phantom equity. Tax implications overview. Recommended approach for early employees vs later hires.

9. **Cap Table Management Best Practices** — Tools to use (Carta, Pulley, Captable.io), common mistakes to avoid, when to hire a corporate attorney, 409A valuation requirements.

Make all numbers realistic. Use ${analysis.team.members.length} founders in the model.`,
  };
}

export function generateTermSheetGuide(analysis: BusinessAnalysis): GeneratorPrompts {
  return {
    system: `You are a venture capital attorney and serial entrepreneur who has negotiated hundreds of term sheets. Provide practical, founder-friendly guidance on term sheet negotiation.

${MARKDOWN_JSON_SCHEMA}

Be specific and actionable. Include real-world examples and concrete negotiation tactics.`,
    user: `Generate a comprehensive term sheet negotiation guide for the following business:

${analysisContext(analysis)}

Required sections:

1. **Term Sheet Overview** — What a term sheet is, binding vs non-binding provisions, typical timeline from term sheet to close, and what to expect in the process.

2. **Economic Terms Explained** — Pre-money valuation, price per share, liquidation preference (1x, participating, capped participating), anti-dilution protection (broad-based weighted average vs full ratchet), dividends, pay-to-play. For each: what it means, what's standard, what to push back on.

3. **Control Terms Explained** — Board composition and seats, protective provisions (veto rights), drag-along rights, information rights, ROFR and co-sale. For each: what's negotiable and founder-friendly positions.

4. **What's Negotiable vs Standard** — Clear table with three columns: Term, Standard/Market, and Negotiability Level (High/Medium/Low). Cover all major terms.

5. **Red Flags to Watch For** — Specific terms that are predatory or unusual: full ratchet anti-dilution, participating preferred with no cap, excessive board control, broad protective provisions, redemption rights, personal guarantees. Explain why each is problematic.

6. **Sample Term Sheet Structure** — Complete term sheet outline with typical terms filled in for a ${analysis.financials.stage} stage ${analysis.businessModel.type} company. Include specific numbers and percentages.

7. **Negotiation Tips by Investor Type** — Different strategies for: angels, seed funds, Series A VCs, strategic/corporate investors, family offices. What each cares about most and how to negotiate effectively.

8. **Post-Term-Sheet Process** — Due diligence expectations, definitive document drafting, conditions to closing, timeline management, managing multiple term sheets, no-shop provisions.

9. **Common Mistakes Founders Make** — Top 10 negotiation mistakes with how to avoid each one. Real-world examples.

10. **When to Walk Away** — Clear criteria for when a deal isn't worth taking, alternatives to VC funding, and how to respectfully decline.`,
  };
}

export function generateDDChecklist(analysis: BusinessAnalysis): GeneratorPrompts {
  return {
    system: `You are a due diligence specialist who has managed DD processes for venture capital firms and helped startups prepare for investor scrutiny. Create thorough, actionable checklists.

${MARKDOWN_JSON_SCHEMA}

Format each checklist item as a markdown checkbox: "- [ ] Item description". Group items logically. Include priority levels and notes about common gaps.`,
    user: `Generate a comprehensive due diligence preparation checklist for the following business:

${analysisContext(analysis)}

Required sections:

1. **Corporate Documents** — Articles of incorporation, bylaws, board minutes, shareholder agreements, stock certificates, cap table, 409A valuations, state registrations, good standing certificates, operating agreements. Each as a checkbox item with brief description of what's needed.

2. **Financial Documents** — Financial statements (3 years if available), tax returns, bank statements, accounts receivable/payable aging, budget vs actuals, audit reports, financial projections model, revenue recognition policy, billing/invoicing records.

3. **Legal Documents** — All contracts over $10K, customer agreements (template + key accounts), vendor agreements, partnership agreements, lease agreements, loan documents, litigation history, regulatory filings, insurance policies, NDAs.

4. **Intellectual Property** — Patent filings/grants, trademark registrations, copyright registrations, trade secrets documentation, open source license compliance, domain registrations, IP assignment agreements from founders/contractors, technology stack documentation.

5. **Team & HR Documents** — Organizational chart, employee list with titles/start dates/compensation, employment agreements, offer letter templates, employee handbook, benefits summary, contractor agreements (with IP assignment), equity grant records, key person insurance.

6. **Customer & Revenue Proof** — Customer list with revenue per account, customer contracts (top 10), churn/retention data, NPS or satisfaction scores, case studies, testimonials/references (with permission), pipeline report, cohort analysis.

7. **Technical Documentation** — System architecture overview, technology stack documentation, security audit results, SOC 2/compliance certifications, uptime/reliability metrics, development process documentation, data privacy compliance (GDPR, CCPA), disaster recovery plan.

8. **Compliance & Regulatory** — Industry-specific licenses/permits, data privacy policies and compliance, terms of service, privacy policy, accessibility compliance, environmental compliance (if applicable), export control compliance.

9. **Data Room Organization Tips** — Suggested folder structure, naming conventions, version control practices, access permission levels, what to prepare first vs what can wait.

10. **Priority Checklist Summary** — Top 20 most critical items that investors ask for first, with estimated time to prepare each. Sorted by priority.

Format ALL items as checkboxes that the user can work through. Add notes like "(Critical - prepare first)" or "(Can wait until LOI)" where appropriate.`,
  };
}

export function generateInvestorOutreach(analysis: BusinessAnalysis): GeneratorPrompts {
  return {
    system: `You are a fundraising strategist and former VC who has seen thousands of cold emails. Write compelling, conversion-optimized investor outreach templates that actually get responses.

${MARKDOWN_JSON_SCHEMA}

Each email template should have a clear Subject line, body, and notes about personalization. Write in the founder's voice — confident but not arrogant, specific but concise.`,
    user: `Generate a comprehensive investor outreach kit for the following business:

${analysisContext(analysis)}

Required sections:

1. **Cold Outreach Email — Direct** — Subject line + body for reaching out to a VC/angel directly (no warm intro). Under 150 words. Include the hook, the ask, and one compelling metric. Include 3 subject line variations.

2. **Cold Outreach Email — Warm Intro Request** — Template to send to a mutual connection asking for an introduction. Include what to say about the business and why this specific investor. Under 120 words.

3. **Follow-Up Sequence — Email 2 (Day 3-5)** — Short follow-up after no response. Add a new data point or traction update. Under 80 words.

4. **Follow-Up Sequence — Email 3 (Day 10-14)** — Final follow-up with a different angle (press mention, new milestone, social proof). Under 80 words.

5. **Follow-Up Sequence — Email 4 (Day 30 — Breakup)** — Polite closing email that leaves the door open. Under 60 words.

6. **Meeting Confirmation Template** — Confirming a scheduled meeting. Include what you'll cover, any pre-read materials, and logistics. Professional but warm.

7. **Post-Meeting Follow-Up** — Same-day follow-up after an investor meeting. Thank them, recap key discussion points, answer any outstanding questions, propose next steps. Include a framework for customizing based on meeting outcome.

8. **Investor Update Template — Monthly** — Monthly update email for investors (both committed and prospective). Include sections for: Key Metrics, Highlights, Challenges, Asks, and Next Month Goals. With placeholder data structure.

9. **Thank You / Pass Response** — Graceful response to an investor who passes. Keep the relationship warm for future rounds. Under 80 words.

10. **Investor CRM Tracking** — Recommended fields to track per investor: name, firm, email, intro source, status, last contact, notes, follow-up date. Include a sample row filled out.

11. **Investor Targeting Criteria** — Guide for identifying the right investors: stage fit, sector focus, check size, geographic preference, portfolio conflicts, value-add areas. Tailored to this specific business.

For ALL email templates, include:
- Subject line (with alternatives)
- Body text (with [PERSONALIZATION] placeholders clearly marked)
- Timing notes
- Tips for customization`,
  };
}

export function generateDataRoomGuide(analysis: BusinessAnalysis): GeneratorPrompts {
  return {
    system: `You are a fundraising operations expert who has set up data rooms for dozens of successful raises. Provide clear, practical guidance on data room organization.

${MARKDOWN_JSON_SCHEMA}

Be specific about folder structures, naming conventions, and organization. Include platform comparisons and best practices.`,
    user: `Generate a comprehensive data room setup guide for the following business:

${analysisContext(analysis)}

Required sections:

1. **Data Room Overview** — Purpose of a data room, when to set it up (hint: before you need it), expected timeline for preparation, and who should have access at each stage.

2. **Recommended Folder Structure** — Complete folder hierarchy with descriptions. Use a tree-style format:
   - 01_Corporate
   - 02_Financial
   - 03_Legal
   - 04_IP_Technology
   - 05_Team_HR
   - 06_Customer_Revenue
   - 07_Product
   - 08_Marketing
   - 09_Compliance
   - 10_Pitch_Materials
   Each with 5-10 sub-items showing what documents go where.

3. **Document List Per Folder** — Detailed list of every document that should be in each folder, with notes on format (PDF preferred, Excel for models) and whether it's required or optional.

4. **Naming Conventions** — Standardized naming format: [Category]_[DocumentName]_[Version]_[Date]. Examples for each document type. Why consistency matters.

5. **Access Permissions Guide** — Permission tiers: Full Access (partners), Limited Access (associates), View Only (advisors). Which folders/documents for each tier. How to handle sensitive information (compensation, customer data).

6. **Version Control Best Practices** — How to manage document versions, when to update (quarterly minimum), how to track what investors have viewed, changelog practices.

7. **Platform Comparison** — Compare DocSend, Google Drive, Notion, Dropbox, Dealroom, and dedicated platforms. Table with: Features, Cost, Best For, Limitations. Recommendation for each stage (pre-seed, seed, Series A).

8. **Data Room Readiness Checklist** — Quick-reference checklist of everything needed before sharing with investors. Priority order. Estimated time to prepare each item.

9. **Security Considerations** — Watermarking, download restrictions, NDA requirements, activity tracking, revoking access, GDPR compliance for EU investors.

10. **Common Data Room Mistakes** — Top 10 mistakes founders make with data rooms and how to avoid each one.

Tailor the document requirements to a ${analysis.financials.stage} stage ${analysis.businessModel.type} business.`,
  };
}

export function getGeneratorForType(
  type: InfraType,
  analysis: BusinessAnalysis,
): GeneratorPrompts {
  switch (type) {
    case "business-plan":
      return generateBusinessPlan(analysis);
    case "financial-model":
      return generateFinancialModel(analysis);
    case "cap-table":
      return generateCapTable(analysis);
    case "term-sheet-guide":
      return generateTermSheetGuide(analysis);
    case "dd-checklist":
      return generateDDChecklist(analysis);
    case "investor-outreach":
      return generateInvestorOutreach(analysis);
    case "data-room-guide":
      return generateDataRoomGuide(analysis);
    default:
      throw new Error(`Unknown infrastructure type: ${type}`);
  }
}
