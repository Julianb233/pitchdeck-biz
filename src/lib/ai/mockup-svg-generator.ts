// ---------------------------------------------------------------------------
// Mockup SVG Generator
// Produces professional SVG mockup templates for product-mockup brand assets.
// Each template accepts brand colors and a brand name for personalization.
// ---------------------------------------------------------------------------

interface MockupColors {
  primary: string;
  secondary: string;
  accent: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Device Mockup: Phone + laptop frame with brand content
// ---------------------------------------------------------------------------

function deviceMockupSvg(colors: MockupColors, brandName: string): string {
  const w = 1200;
  const h = 800;
  const name = escapeXml(brandName);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="dm-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <linearGradient id="dm-screen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>
    <filter id="dm-shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.15" />
    </filter>
    <filter id="dm-shadow-sm" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" fill="url(#dm-bg)" />

  <!-- Decorative dots -->
  <circle cx="100" cy="100" r="3" fill="${colors.accent}" opacity="0.3" />
  <circle cx="140" cy="80" r="2" fill="${colors.primary}" opacity="0.2" />
  <circle cx="1080" cy="700" r="3" fill="${colors.accent}" opacity="0.3" />
  <circle cx="1120" cy="720" r="2" fill="${colors.primary}" opacity="0.2" />

  <!-- Laptop body -->
  <g filter="url(#dm-shadow)">
    <!-- Laptop base / lid -->
    <rect x="150" y="140" width="620" height="420" rx="12" fill="#1e293b" />
    <!-- Screen bezel -->
    <rect x="165" y="155" width="590" height="370" rx="6" fill="#0f172a" />
    <!-- Screen -->
    <rect x="175" y="165" width="570" height="350" rx="4" fill="url(#dm-screen)" />
    <!-- Screen content -->
    <text x="460" y="310" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="36" font-weight="700" fill="white" opacity="0.95">${name}</text>
    <rect x="360" y="340" width="200" height="3" rx="2" fill="white" opacity="0.4" />
    <text x="460" y="375" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="14" fill="white" opacity="0.6">Your product, beautifully presented</text>
    <!-- Nav dots on screen -->
    <circle cx="220" cy="190" r="5" fill="#ef4444" opacity="0.8" />
    <circle cx="240" cy="190" r="5" fill="#eab308" opacity="0.8" />
    <circle cx="260" cy="190" r="5" fill="#22c55e" opacity="0.8" />
    <!-- Laptop bottom / keyboard area -->
    <path d="M130,560 L150,540 L770,540 L790,560 Z" fill="#334155" />
    <rect x="130" y="560" width="660" height="20" rx="0 0 8 8" fill="#475569" />
    <rect x="370" y="565" width="180" height="10" rx="4" fill="#64748b" />
  </g>

  <!-- Phone -->
  <g filter="url(#dm-shadow-sm)" transform="translate(820, 200)">
    <!-- Phone body -->
    <rect x="0" y="0" width="220" height="420" rx="24" fill="#1e293b" />
    <!-- Screen -->
    <rect x="12" y="16" width="196" height="388" rx="16" fill="url(#dm-screen)" />
    <!-- Notch -->
    <rect x="70" y="16" width="80" height="20" rx="10" fill="#1e293b" />
    <!-- Phone screen content -->
    <text x="110" y="200" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="22" font-weight="700" fill="white" opacity="0.95">${name}</text>
    <rect x="50" y="220" width="120" height="2" rx="1" fill="white" opacity="0.3" />
    <!-- App-like UI elements -->
    <rect x="30" y="260" width="160" height="30" rx="8" fill="white" opacity="0.15" />
    <rect x="30" y="300" width="160" height="30" rx="8" fill="white" opacity="0.1" />
    <rect x="30" y="340" width="160" height="30" rx="8" fill="white" opacity="0.08" />
    <!-- Home indicator -->
    <rect x="75" y="388" width="70" height="4" rx="2" fill="white" opacity="0.4" />
  </g>

  <!-- Accent decoration -->
  <circle cx="1100" cy="150" r="40" fill="${colors.accent}" opacity="0.12" />
  <circle cx="80" cy="650" r="30" fill="${colors.primary}" opacity="0.08" />
</svg>`;
}

// ---------------------------------------------------------------------------
// Lifestyle Mockup: Scene layout with product placement area
// ---------------------------------------------------------------------------

function lifestyleMockupSvg(colors: MockupColors, brandName: string): string {
  const w = 1200;
  const h = 800;
  const name = escapeXml(brandName);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="ls-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fefce8" />
      <stop offset="100%" stop-color="#fef3c7" />
    </linearGradient>
    <linearGradient id="ls-brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>
    <linearGradient id="ls-table" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d4a574" />
      <stop offset="100%" stop-color="#b8956a" />
    </linearGradient>
    <filter id="ls-shadow" x="-5%" y="-5%" width="110%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.1" />
    </filter>
    <filter id="ls-shadow-sm" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.08" />
    </filter>
    <radialGradient id="ls-light" cx="30%" cy="20%">
      <stop offset="0%" stop-color="white" stop-opacity="0.3" />
      <stop offset="100%" stop-color="white" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background: warm ambient -->
  <rect width="${w}" height="${h}" fill="url(#ls-bg)" />
  <rect width="${w}" height="${h}" fill="url(#ls-light)" />

  <!-- Wall element -->
  <rect x="0" y="0" width="${w}" height="380" fill="#faf5ee" />
  <line x1="0" y1="380" x2="${w}" y2="380" stroke="#e5d5c0" stroke-width="2" />

  <!-- Wooden table surface -->
  <rect x="0" y="380" width="${w}" height="420" fill="url(#ls-table)" />
  <!-- Table wood grain lines -->
  <line x1="0" y1="440" x2="${w}" y2="442" stroke="#c4956a" stroke-width="1" opacity="0.3" />
  <line x1="0" y1="520" x2="${w}" y2="518" stroke="#c4956a" stroke-width="1" opacity="0.2" />
  <line x1="0" y1="620" x2="${w}" y2="622" stroke="#c4956a" stroke-width="1" opacity="0.15" />

  <!-- Plant in background -->
  <g transform="translate(80, 180)">
    <rect x="20" y="120" width="50" height="60" rx="4" fill="#d4a574" />
    <ellipse cx="45" cy="120" rx="30" ry="60" fill="#16a34a" opacity="0.7" />
    <ellipse cx="30" cy="100" rx="20" ry="45" fill="#22c55e" opacity="0.6" />
    <ellipse cx="60" cy="110" rx="18" ry="40" fill="#15803d" opacity="0.5" />
  </g>

  <!-- Product card/box on table -->
  <g filter="url(#ls-shadow)" transform="translate(380, 320)">
    <!-- Box front -->
    <rect x="0" y="0" width="280" height="350" rx="8" fill="url(#ls-brand)" />
    <!-- Box label area -->
    <rect x="30" y="60" width="220" height="180" rx="6" fill="white" opacity="0.15" />
    <text x="140" y="140" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="32" font-weight="700" fill="white">${name}</text>
    <rect x="80" y="165" width="120" height="2" rx="1" fill="white" opacity="0.4" />
    <text x="140" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="13" fill="white" opacity="0.7">Premium Quality</text>
    <!-- Accent stripe -->
    <rect x="0" y="280" width="280" height="6" fill="${colors.accent}" opacity="0.8" />
  </g>

  <!-- Coffee cup -->
  <g filter="url(#ls-shadow-sm)" transform="translate(760, 440)">
    <ellipse cx="55" cy="0" rx="55" ry="16" fill="#f5f5f4" />
    <rect x="0" y="0" width="110" height="100" rx="4" fill="#e7e5e4" />
    <ellipse cx="55" cy="100" rx="55" ry="12" fill="#d6d3d1" />
    <ellipse cx="55" cy="8" rx="45" ry="12" fill="#78350f" opacity="0.8" />
    <!-- Handle -->
    <path d="M110,30 Q140,30 140,60 Q140,90 110,90" stroke="#d6d3d1" stroke-width="8" fill="none" />
  </g>

  <!-- Notebook -->
  <g filter="url(#ls-shadow-sm)" transform="translate(150, 470) rotate(-5)">
    <rect x="0" y="0" width="160" height="200" rx="4" fill="white" />
    <line x1="20" y1="40" x2="140" y2="40" stroke="#e5e7eb" stroke-width="1" />
    <line x1="20" y1="60" x2="140" y2="60" stroke="#e5e7eb" stroke-width="1" />
    <line x1="20" y1="80" x2="140" y2="80" stroke="#e5e7eb" stroke-width="1" />
    <line x1="20" y1="100" x2="100" y2="100" stroke="#e5e7eb" stroke-width="1" />
    <rect x="0" y="0" width="6" height="200" rx="3" fill="${colors.primary}" opacity="0.6" />
  </g>

  <!-- Window light cast -->
  <rect x="800" y="30" width="300" height="320" fill="white" opacity="0.05" rx="4" />
</svg>`;
}

// ---------------------------------------------------------------------------
// 3D Packaging: Box visualization
// ---------------------------------------------------------------------------

function packaging3dSvg(colors: MockupColors, brandName: string): string {
  const w = 1200;
  const h = 800;
  const name = escapeXml(brandName);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="pk-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <linearGradient id="pk-front" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>
    <linearGradient id="pk-side" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.secondary}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${colors.primary}" stop-opacity="0.5" />
    </linearGradient>
    <linearGradient id="pk-top" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.primary}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0.4" />
    </linearGradient>
    <filter id="pk-shadow" x="-15%" y="-5%" width="130%" height="130%">
      <feDropShadow dx="8" dy="20" stdDeviation="24" flood-color="#000" flood-opacity="0.18" />
    </filter>
    <linearGradient id="pk-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="${colors.primary}" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" fill="url(#pk-bg)" />

  <!-- Subtle radial highlight -->
  <circle cx="600" cy="350" r="400" fill="white" opacity="0.3" />

  <!-- Floor reflection -->
  <ellipse cx="600" cy="680" rx="320" ry="40" fill="url(#pk-reflection)" />

  <!-- 3D Box -->
  <g filter="url(#pk-shadow)">
    <!-- Front face -->
    <path d="M300,200 L700,200 L700,600 L300,600 Z" fill="url(#pk-front)" />

    <!-- Right side face (perspective) -->
    <path d="M700,200 L900,130 L900,530 L700,600 Z" fill="url(#pk-side)" />

    <!-- Top face (perspective) -->
    <path d="M300,200 L500,130 L900,130 L700,200 Z" fill="url(#pk-top)" />

    <!-- Edge highlights -->
    <line x1="700" y1="200" x2="700" y2="600" stroke="white" stroke-width="1" opacity="0.3" />
    <line x1="300" y1="200" x2="700" y2="200" stroke="white" stroke-width="1" opacity="0.2" />
    <line x1="700" y1="200" x2="900" y2="130" stroke="white" stroke-width="1" opacity="0.15" />

    <!-- Front face content -->
    <!-- Brand name -->
    <text x="500" y="370" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="48" font-weight="800" fill="white" letter-spacing="2">${name}</text>

    <!-- Decorative line -->
    <rect x="380" y="395" width="240" height="3" rx="2" fill="white" opacity="0.4" />

    <!-- Tagline -->
    <text x="500" y="435" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="16" fill="white" opacity="0.6" letter-spacing="4">PREMIUM</text>

    <!-- Accent bar at bottom of front -->
    <rect x="300" y="560" width="400" height="40" fill="${colors.accent}" opacity="0.3" />

    <!-- Corner accent -->
    <rect x="320" y="220" width="40" height="40" rx="2" fill="white" opacity="0.1" />
    <rect x="325" y="225" width="30" height="30" rx="2" fill="none" stroke="white" stroke-width="1" opacity="0.2" />
  </g>

  <!-- Small floating elements for depth -->
  <circle cx="160" cy="300" r="6" fill="${colors.accent}" opacity="0.15" />
  <circle cx="1040" cy="250" r="8" fill="${colors.primary}" opacity="0.1" />
  <circle cx="180" cy="550" r="4" fill="${colors.secondary}" opacity="0.12" />
  <circle cx="1020" cy="500" r="5" fill="${colors.accent}" opacity="0.1" />
</svg>`;
}

// ---------------------------------------------------------------------------
// Hero Product Shot: Full-width hero composition
// ---------------------------------------------------------------------------

function heroShotSvg(colors: MockupColors, brandName: string): string {
  const w = 1200;
  const h = 800;
  const name = escapeXml(brandName);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="hs-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="50%" stop-color="${colors.secondary}" />
      <stop offset="100%" stop-color="${colors.primary}" stop-opacity="0.8" />
    </linearGradient>
    <radialGradient id="hs-glow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0" />
    </radialGradient>
    <filter id="hs-shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000" flood-opacity="0.2" />
    </filter>
    <filter id="hs-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="hs-card" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="white" stop-opacity="0.15" />
      <stop offset="100%" stop-color="white" stop-opacity="0.05" />
    </linearGradient>
  </defs>

  <!-- Background gradient -->
  <rect width="${w}" height="${h}" fill="url(#hs-bg)" />

  <!-- Glow effect -->
  <rect width="${w}" height="${h}" fill="url(#hs-glow)" />

  <!-- Geometric background elements -->
  <circle cx="200" cy="150" r="200" fill="white" opacity="0.03" />
  <circle cx="1000" cy="650" r="250" fill="white" opacity="0.03" />
  <circle cx="600" cy="400" r="300" fill="white" opacity="0.02" />

  <!-- Grid lines for depth -->
  <line x1="0" y1="400" x2="${w}" y2="400" stroke="white" stroke-width="0.5" opacity="0.06" />
  <line x1="600" y1="0" x2="600" y2="${h}" stroke="white" stroke-width="0.5" opacity="0.06" />

  <!-- Central product card -->
  <g filter="url(#hs-shadow)">
    <rect x="280" y="180" width="640" height="440" rx="20" fill="url(#hs-card)" />
    <rect x="280" y="180" width="640" height="440" rx="20" fill="none" stroke="white" stroke-width="1" opacity="0.15" />

    <!-- Inner content -->
    <!-- Accent line at top -->
    <rect x="440" y="220" width="320" height="4" rx="2" fill="${colors.accent}" opacity="0.8" />

    <!-- Brand name large -->
    <text x="600" y="330" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="56" font-weight="800" fill="white" letter-spacing="3">${name}</text>

    <!-- Divider -->
    <line x1="420" y1="360" x2="780" y2="360" stroke="white" stroke-width="1" opacity="0.2" />

    <!-- Tagline -->
    <text x="600" y="400" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="18" fill="white" opacity="0.6" letter-spacing="6">INNOVATION DELIVERED</text>

    <!-- CTA button -->
    <rect x="470" y="440" width="260" height="50" rx="25" fill="${colors.accent}" opacity="0.9" />
    <text x="600" y="472" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="16" font-weight="600" fill="white" letter-spacing="2">GET STARTED</text>

    <!-- Feature pills -->
    <rect x="340" y="530" width="90" height="28" rx="14" fill="white" opacity="0.08" />
    <text x="385" y="549" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="11" fill="white" opacity="0.5">Fast</text>

    <rect x="450" y="530" width="90" height="28" rx="14" fill="white" opacity="0.08" />
    <text x="495" y="549" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="11" fill="white" opacity="0.5">Secure</text>

    <rect x="560" y="530" width="90" height="28" rx="14" fill="white" opacity="0.08" />
    <text x="605" y="549" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="11" fill="white" opacity="0.5">Simple</text>

    <rect x="670" y="530" width="90" height="28" rx="14" fill="white" opacity="0.08" />
    <text x="715" y="549" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
          font-size="11" fill="white" opacity="0.5">Modern</text>
  </g>

  <!-- Floating accent elements -->
  <g filter="url(#hs-glow-filter)">
    <circle cx="180" cy="350" r="8" fill="${colors.accent}" opacity="0.4" />
    <circle cx="1020" cy="300" r="6" fill="${colors.accent}" opacity="0.3" />
    <circle cx="150" cy="600" r="5" fill="white" opacity="0.2" />
    <circle cx="1050" cy="550" r="7" fill="white" opacity="0.15" />
  </g>

  <!-- Corner accents -->
  <path d="M0,0 L80,0 L0,80 Z" fill="white" opacity="0.03" />
  <path d="M${w},${h} L${w - 80},${h} L${w},${h - 80} Z" fill="white" opacity="0.03" />
</svg>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type MockupTemplateId = "device-mockup" | "lifestyle-shot" | "packaging-3d" | "hero-product";

const MOCKUP_GENERATORS: Record<MockupTemplateId, (colors: MockupColors, brandName: string) => string> = {
  "device-mockup": deviceMockupSvg,
  "lifestyle-shot": lifestyleMockupSvg,
  "packaging-3d": packaging3dSvg,
  "hero-product": heroShotSvg,
};

const MOCKUP_TEMPLATE_IDS = new Set<string>(Object.keys(MOCKUP_GENERATORS));

/**
 * Generate a professional SVG mockup for the given template.
 * Returns an SVG string (not data URI).
 */
export function generateMockupSVG(
  templateId: string,
  brandColors: { primary?: string; secondary?: string; accent?: string },
  brandName?: string,
): string | null {
  if (!MOCKUP_TEMPLATE_IDS.has(templateId)) return null;

  const colors: MockupColors = {
    primary: brandColors.primary ?? "#4F46E5",
    secondary: brandColors.secondary ?? "#7C3AED",
    accent: brandColors.accent ?? "#F59E0B",
  };

  const name = brandName || "Brand";
  return MOCKUP_GENERATORS[templateId as MockupTemplateId](colors, name);
}

/**
 * Check if a template ID is a mockup template.
 */
export function isMockupTemplate(templateId: string): boolean {
  return MOCKUP_TEMPLATE_IDS.has(templateId);
}
