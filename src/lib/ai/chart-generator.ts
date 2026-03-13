// ---------------------------------------------------------------------------
// SVG Chart Generator
// Generates embeddable SVG charts for pitch deck slides.
// Pure SVG — no external charting libraries required.
// ---------------------------------------------------------------------------

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartOptions {
  width?: number;
  height?: number;
  title?: string;
  showLabels?: boolean;
  showValues?: boolean;
  backgroundColor?: string;
  fontFamily?: string;
}

const DEFAULT_COLORS = [
  "#4F46E5", "#7C3AED", "#EC4899", "#F59E0B", "#10B981",
  "#3B82F6", "#EF4444", "#8B5CF6", "#14B8A6", "#F97316",
];

const DEFAULT_OPTIONS: Required<ChartOptions> = {
  width: 600,
  height: 400,
  title: "",
  showLabels: true,
  showValues: true,
  backgroundColor: "transparent",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getColor(index: number, custom?: string): string {
  return custom ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

// ---------------------------------------------------------------------------
// Bar Chart
// ---------------------------------------------------------------------------

export function generateBarChart(
  data: ChartDataPoint[],
  options?: ChartOptions,
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, title, showLabels, showValues, backgroundColor, fontFamily } = opts;

  const padding = { top: title ? 50 : 20, right: 20, bottom: showLabels ? 60 : 20, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.min(60, (chartW / data.length) * 0.7);
  const gap = (chartW - barWidth * data.length) / (data.length + 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  if (backgroundColor !== "transparent") {
    svg += `<rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8" />`;
  }

  if (title) {
    svg += `<text x="${width / 2}" y="30" text-anchor="middle" font-family="${fontFamily}" font-size="16" font-weight="600" fill="#1a1a1a">${escapeXml(title)}</text>`;
  }

  // Y-axis
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i;
    const val = Math.round(maxVal - (maxVal / gridLines) * i);
    svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
    svg += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-family="${fontFamily}" font-size="11" fill="#6b7280">${val}</text>`;
  }

  // Bars
  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * chartH;
    const x = padding.left + gap + i * (barWidth + gap);
    const y = padding.top + chartH - barH;
    const color = getColor(i, d.color);

    svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${color}" rx="4" />`;

    if (showValues) {
      svg += `<text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-family="${fontFamily}" font-size="12" font-weight="500" fill="#374151">${d.value}</text>`;
    }

    if (showLabels) {
      svg += `<text x="${x + barWidth / 2}" y="${height - padding.bottom + 20}" text-anchor="middle" font-family="${fontFamily}" font-size="11" fill="#6b7280">${escapeXml(d.label.slice(0, 12))}</text>`;
    }
  });

  svg += `</svg>`;
  return svg;
}

// ---------------------------------------------------------------------------
// Pie Chart
// ---------------------------------------------------------------------------

export function generatePieChart(
  data: ChartDataPoint[],
  options?: ChartOptions,
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, title, showLabels, backgroundColor, fontFamily } = opts;

  const centerX = width / 2;
  const centerY = (height + (title ? 30 : 0)) / 2;
  const radius = Math.min(width, height) / 2 - (showLabels ? 80 : 40);

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  if (backgroundColor !== "transparent") {
    svg += `<rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8" />`;
  }

  if (title) {
    svg += `<text x="${width / 2}" y="28" text-anchor="middle" font-family="${fontFamily}" font-size="16" font-weight="600" fill="#1a1a1a">${escapeXml(title)}</text>`;
  }

  let currentAngle = -Math.PI / 2; // Start from top

  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const endAngle = currentAngle + sliceAngle;
    const color = getColor(i, d.color);

    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    svg += `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${color}" stroke="white" stroke-width="2" />`;

    if (showLabels) {
      const midAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius + 24;
      const lx = centerX + labelRadius * Math.cos(midAngle);
      const ly = centerY + labelRadius * Math.sin(midAngle);
      const pct = Math.round((d.value / total) * 100);

      svg += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="11" fill="#374151">${escapeXml(d.label.slice(0, 10))} ${pct}%</text>`;
    }

    currentAngle = endAngle;
  });

  svg += `</svg>`;
  return svg;
}

// ---------------------------------------------------------------------------
// Line Chart
// ---------------------------------------------------------------------------

export function generateLineChart(
  data: ChartDataPoint[],
  options?: ChartOptions & { lineColor?: string; fillUnder?: boolean },
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, title, showLabels, showValues, backgroundColor, fontFamily } = opts;
  const lineColor = options?.lineColor ?? "#4F46E5";
  const fillUnder = options?.fillUnder ?? true;

  const padding = { top: title ? 50 : 20, right: 20, bottom: showLabels ? 60 : 20, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const stepX = data.length > 1 ? chartW / (data.length - 1) : chartW;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  if (backgroundColor !== "transparent") {
    svg += `<rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8" />`;
  }

  if (title) {
    svg += `<text x="${width / 2}" y="30" text-anchor="middle" font-family="${fontFamily}" font-size="16" font-weight="600" fill="#1a1a1a">${escapeXml(title)}</text>`;
  }

  // Grid
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i;
    const val = Math.round(maxVal - (maxVal / gridLines) * i);
    svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
    svg += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-family="${fontFamily}" font-size="11" fill="#6b7280">${val}</text>`;
  }

  // Build path
  const points = data.map((d, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + chartH - (d.value / maxVal) * chartH;
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Fill area under curve
  if (fillUnder && points.length > 0) {
    const fillD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;
    svg += `<path d="${fillD}" fill="${lineColor}" opacity="0.1" />`;
  }

  // Line
  svg += `<path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;

  // Dots and labels
  points.forEach((p, i) => {
    svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${lineColor}" stroke="white" stroke-width="2" />`;

    if (showValues) {
      svg += `<text x="${p.x}" y="${p.y - 12}" text-anchor="middle" font-family="${fontFamily}" font-size="11" font-weight="500" fill="#374151">${data[i].value}</text>`;
    }

    if (showLabels) {
      svg += `<text x="${p.x}" y="${height - padding.bottom + 20}" text-anchor="middle" font-family="${fontFamily}" font-size="11" fill="#6b7280">${escapeXml(data[i].label.slice(0, 10))}</text>`;
    }
  });

  svg += `</svg>`;
  return svg;
}

// ---------------------------------------------------------------------------
// Growth Arrow
// ---------------------------------------------------------------------------

export function generateGrowthArrow(
  data: ChartDataPoint[],
  options?: ChartOptions & { arrowColor?: string },
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, title, backgroundColor, fontFamily } = opts;
  const arrowColor = options?.arrowColor ?? "#10B981";

  const padding = { top: title ? 55 : 25, right: 40, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  if (backgroundColor !== "transparent") {
    svg += `<rect width="${width}" height="${height}" fill="${backgroundColor}" rx="8" />`;
  }

  if (title) {
    svg += `<text x="${width / 2}" y="30" text-anchor="middle" font-family="${fontFamily}" font-size="16" font-weight="600" fill="#1a1a1a">${escapeXml(title)}</text>`;
  }

  if (data.length < 2) {
    svg += `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="${fontFamily}" font-size="14" fill="#6b7280">Need at least 2 data points</text>`;
    svg += `</svg>`;
    return svg;
  }

  const stepX = chartW / (data.length - 1);

  // Build smooth upward curve
  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + chartH - (d.value / maxVal) * chartH,
  }));

  // Thick arrow-like path
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Gradient definition
  svg += `<defs><linearGradient id="growthGrad" x1="0%" y1="0%" x2="100%" y2="0%">`;
  svg += `<stop offset="0%" stop-color="${arrowColor}" stop-opacity="0.3" />`;
  svg += `<stop offset="100%" stop-color="${arrowColor}" stop-opacity="1" />`;
  svg += `</linearGradient></defs>`;

  // Fill area
  const last = points[points.length - 1];
  const first = points[0];
  const fillD = `${pathD} L ${last.x} ${padding.top + chartH} L ${first.x} ${padding.top + chartH} Z`;
  svg += `<path d="${fillD}" fill="url(#growthGrad)" opacity="0.2" />`;

  // Line
  svg += `<path d="${pathD}" fill="none" stroke="url(#growthGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`;

  // Arrow head at end
  const arrowSize = 14;
  svg += `<polygon points="${last.x + arrowSize},${last.y} ${last.x - arrowSize / 2},${last.y - arrowSize} ${last.x - arrowSize / 2},${last.y + arrowSize}" fill="${arrowColor}" />`;

  // Labels under each point
  data.forEach((d, i) => {
    const p = points[i];
    svg += `<text x="${p.x}" y="${padding.top + chartH + 20}" text-anchor="middle" font-family="${fontFamily}" font-size="11" fill="#6b7280">${escapeXml(d.label.slice(0, 10))}</text>`;
    svg += `<text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-family="${fontFamily}" font-size="12" font-weight="600" fill="#374151">${d.value}</text>`;
  });

  svg += `</svg>`;
  return svg;
}
