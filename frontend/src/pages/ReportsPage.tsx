import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import { PageHeader } from '../components/PageHeader';

const reports = [
  ['Student Report', '/api/v1/reports/students.csv'],
  ['Fee Collection Report', '/api/v1/reports/fees.csv'],
  ['Expense Report', '/api/v1/reports/expenses.csv'],
  ['Income Report', '/api/v1/reports/income.csv'],
  ['Profit & Loss Report', '/api/v1/reports/profit-loss.csv'],
  ['Exam Performance Report', '/api/v1/reports/exams.csv']
];

export default function ReportsPage() {
  return <><PageHeader title="Reports" subtitle="Export CSV reports today. PDF and Excel adapters are documented for production rollout." /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>{reports.map(([label, url]) => <Card key={label}><CardContent><Stack spacing={2}><Typography variant="h6">{label}</Typography><Typography color="text.secondary">Download and share with parents or keep for monthly records.</Typography><Button component="a" href={url}>Download CSV</Button></Stack></CardContent></Card>)}</Box></>;
}
