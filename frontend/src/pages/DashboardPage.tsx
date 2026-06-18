import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { chartColors } from '../theme/theme';

const formatCurrency = (value?: number) => `Rs ${Number(value ?? 0).toLocaleString('en-IN')}`;
const trend = [
  { month: 'Jan', income: 42000, expenses: 9000, profit: 33000 },
  { month: 'Feb', income: 46000, expenses: 9500, profit: 36500 },
  { month: 'Mar', income: 50000, expenses: 10000, profit: 40000 },
  { month: 'Apr', income: 52000, expenses: 12000, profit: 40000 },
  { month: 'May', income: 56000, expenses: 11500, profit: 44500 },
  { month: 'Jun', income: 60000, expenses: 12500, profit: 47500 }
];

export default function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });
  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="A mobile-friendly daily command center for your tuition classes." />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        <StatCard label="Total Students" value={data?.totalStudents ?? 0} helper={`${data?.activeStudents ?? 0} active`} accent="primary" />
        <StatCard label="Today's Classes" value={data?.todayClasses ?? 0} helper="Scheduled batches" accent="info" />
        <StatCard label="Monthly Income" value={formatCurrency(data?.monthlyIncome)} helper="Fees plus other income" accent="success" />
        <StatCard label="Net Profit" value={formatCurrency(data?.netProfit)} helper={`${formatCurrency(data?.monthlyExpenses)} expenses`} accent="secondary" />
        <StatCard label="Pending Fees" value={formatCurrency(data?.pendingFees)} helper="Needs follow-up" accent="warning" />
        <StatCard label="Present Today" value={data?.attendancePresentToday ?? 0} helper={`${data?.attendanceAbsentToday ?? 0} absent`} accent="success" />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2, mt: 2 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Income, Expenses and Profit</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#0f172a', 0.08)} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="income" stroke={chartColors.income} fill={chartColors.incomeFill} strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" stroke={chartColors.expenses} fill={chartColors.expensesFill} strokeWidth={2} />
                <Area type="monotone" dataKey="profit" stroke={chartColors.profit} fill={chartColors.profitFill} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Upcoming Exams</Typography>
            {(data?.upcomingExams ?? []).map((exam, index) => (
              <Typography
                key={index}
                sx={{
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: alpha('#0f172a', 0.06),
                  '&:last-child': { borderBottom: 0 }
                }}
              >
                {String(exam.examName)} · {String(exam.subject)} · {String(exam.examDate)}
              </Typography>
            ))}
            {(data?.upcomingExams ?? []).length === 0 && <Typography color="text.secondary">No upcoming exams.</Typography>}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
