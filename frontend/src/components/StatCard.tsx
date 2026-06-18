import { Box, Card, CardContent, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

type Accent = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export function StatCard({ label, value, helper, accent = 'primary' }: { label: string; value: string | number; helper?: string; accent?: Accent }) {
  const theme = useTheme();
  const color = theme.palette[accent].main;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          bgcolor: color,
          borderRadius: '12px 0 0 12px'
        }
      }}
    >
      <CardContent sx={{ pl: 2.5 }}>
        <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ my: 1, fontWeight: 700, color: 'text.primary' }}>
          {value}
        </Typography>
        {helper && (
          <Box
            sx={{
              display: 'inline-block',
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: alpha(color, 0.1),
              color
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {helper}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
