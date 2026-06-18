import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export function PageHeader({ title, subtitle, actionLabel, onAction }: { title: string; subtitle?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        mb: 3,
        pb: 2.5,
        borderBottom: '1px solid',
        borderColor: alpha('#0f172a', 0.08)
      }}
    >
      <Box>
        <Typography variant="h4" gutterBottom={Boolean(subtitle)} sx={{ mb: subtitle ? 0.5 : 0 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ maxWidth: 640, lineHeight: 1.6 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actionLabel && (
        <Button onClick={onAction} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
