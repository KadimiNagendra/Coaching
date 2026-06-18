import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

type ExamItem = Record<string, unknown>;

function formatExamDate(value: unknown) {
  if (!value) return 'Date TBD';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function relativeExamDate(value: unknown) {
  if (!value) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(String(value));
  if (Number.isNaN(exam.getTime())) return '';
  exam.setHours(0, 0, 0, 0);
  const diff = Math.round((exam.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1) return `In ${diff} days`;
  return '';
}

export function UpcomingExamsCard({ exams = [] }: { exams?: ExamItem[] }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
          <Box>
            <Typography variant="h6">Upcoming Exams</Typography>
            <Typography variant="body2" color="text.secondary">
              Scheduled tests from today onward
            </Typography>
          </Box>
          <Chip
            label={`${exams.length} scheduled`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {exams.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              px: 2,
              py: 4,
              borderRadius: 2,
              bgcolor: alpha('#4f46e5', 0.04),
              border: '1px dashed',
              borderColor: alpha('#4f46e5', 0.18)
            }}
          >
            <AssessmentOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1.5, opacity: 0.8 }} />
            <Typography sx={{ fontWeight: 600 }}>No upcoming exams</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              New exams added from the Exams page will appear here.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {exams.map((exam, index) => {
              const examName = String(exam.examName ?? 'Untitled exam');
              const subject = String(exam.subject ?? 'General');
              const classGrade = String(exam.classGrade ?? '');
              const examDate = exam.examDate;
              const relative = relativeExamDate(examDate);

              return (
                <Box
                  key={`${examName}-${index}`}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                    p: 1.75,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha('#0f172a', 0.08),
                    bgcolor: alpha('#ffffff', 0.9),
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      bgcolor: alpha('#4f46e5', 0.1),
                      color: 'primary.main'
                    }}
                  >
                    <AssessmentOutlinedIcon fontSize="small" />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.75 }}>
                      {examName}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      <Chip label={subject} size="small" color="primary" variant="outlined" />
                      {classGrade && <Chip label={classGrade} size="small" variant="outlined" />}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
                      <EventOutlinedIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {formatExamDate(examDate)}
                      </Typography>
                    </Box>
                    {relative && (
                      <Chip
                        label={relative}
                        size="small"
                        color={relative === 'Today' ? 'warning' : 'success'}
                        sx={{ fontWeight: 600, height: 22 }}
                      />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
