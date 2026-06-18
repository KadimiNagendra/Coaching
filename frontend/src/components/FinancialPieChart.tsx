import { Box, Typography } from '@mui/material';

export type PieSlice = { name: string; value: number; color: string };

const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

function point(cx: number, cy: number, radius: number, angle: number) {
  const rad = toRad(angle);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function donutSegment(cx: number, cy: number, innerR: number, outerR: number, start: number, end: number) {
  const sweep = Math.min(end - start, 359.999);
  if (sweep <= 0) return '';
  const largeArc = sweep > 180 ? 1 : 0;
  const outerStart = point(cx, cy, outerR, start);
  const outerEnd = point(cx, cy, outerR, start + sweep);
  const innerStart = point(cx, cy, innerR, start + sweep);
  const innerEnd = point(cx, cy, innerR, start);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z'
  ].join(' ');
}

export function FinancialPieChart({ data, size = 260 }: { data: PieSlice[]; size?: number }) {
  const slices = data.filter((item) => item.value > 0);
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.38;
  const innerR = size * 0.24;
  let cursor = 0;

  const segments = slices.map((item) => {
    const angle = (item.value / total) * 360;
    const segment = { ...item, start: cursor, end: cursor + angle };
    cursor += angle;
    return segment;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Income expenses profit chart">
        {segments.map((segment) => (
          <path
            key={segment.name}
            d={donutSegment(cx, cy, innerR, outerR, segment.start, segment.end)}
            fill={segment.color}
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fill="#64748b" fontWeight="600">
          Total
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="14" fill="#0f172a" fontWeight="700">
          Rs {total.toLocaleString('en-IN')}
        </text>
      </svg>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {segments.map((segment) => (
          <Box key={segment.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 0.75, bgcolor: segment.color }} />
            <Typography variant="body2" color="text.secondary">
              {segment.name} ({((segment.value / total) * 100).toFixed(0)}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
