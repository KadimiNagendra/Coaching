import { useState } from 'react';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const reports = [
  { label: 'Student Report', type: 'students', description: 'Student profiles, classes, subjects, and status.' },
  { label: 'Fee Collection Report', type: 'fees', description: 'All fee payments with paid and due amounts.' },
  { label: 'Expense Report', type: 'expenses', description: 'Business expenses with category and vendor details.' },
  { label: 'Income Report', type: 'income', description: 'Admission fees and other income entries.' },
  { label: 'Profit & Loss Report', type: 'profit-loss', description: 'Income, fee collections, expenses, and net profit.' },
  { label: 'Exam Performance Report', type: 'exams', description: 'Exam results with marks, percentage, and grades.' }
] as const;

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function download(type: string, label: string) {
    setDownloading(type);
    setError('');
    try {
      const blob = await api.downloadReport(type, 'xlsx');
      saveBlob(blob, `${type}-report.xlsx`);
    } catch {
      setError(`Unable to download ${label}. Please try again.`);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <PageHeader title="Reports" subtitle="Download Excel reports for students, fees, expenses, income, profit and loss, and exams." />
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {reports.map((report) => (
          <Card key={report.type}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <TableViewOutlinedIcon color="primary" />
                  <Typography variant="h6">{report.label}</Typography>
                </Box>
                <Typography color="text.secondary">{report.description}</Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadOutlinedIcon />}
                  onClick={() => download(report.type, report.label)}
                  disabled={downloading === report.type}
                >
                  {downloading === report.type ? 'Preparing...' : 'Download Excel'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
}
