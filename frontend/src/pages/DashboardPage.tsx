import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { api } from '../api/client';
import { FinancialPieChart } from '../components/FinancialPieChart';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { UpcomingExamsCard } from '../components/UpcomingExamsCard';
import { chartColors } from '../theme/theme';

const formatCurrency = (value?: number) => `Rs ${Number(value ?? 0).toLocaleString('en-IN')}`;
const currentMonthLabel = () => new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

export default function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });

  const financialPie = useMemo(() => {
    const income = Number(data?.monthlyIncome ?? 0);
    const expenses = Number(data?.monthlyExpenses ?? 0);
    const profit = Number(data?.netProfit ?? 0);
    return [
      { name: 'Income', value: income, color: chartColors.income },
      { name: 'Expenses', value: expenses, color: chartColors.expenses },
      { name: 'Profit', value: Math.max(profit, 0), color: chartColors.profit }
    ].filter((item) => item.value > 0);
  }, [data]);

  const financialSummary = useMemo(() => ({
    income: Number(data?.monthlyIncome ?? 0),
    expenses: Number(data?.monthlyExpenses ?? 0),
    profit: Number(data?.netProfit ?? 0)
  }), [data]);

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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentMonthLabel()} · Net profit {formatCurrency(data?.netProfit)}
            </Typography>
            {financialPie.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 10, textAlign: 'center' }}>
                No income or expense data for this month yet.
              </Typography>
            ) : (
              <Box sx={{ py: 1 }}>
                <FinancialPieChart data={financialPie} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Income: {formatCurrency(financialSummary.income)}</Typography>
                  <Typography variant="body2" color="text.secondary">Expenses: {formatCurrency(financialSummary.expenses)}</Typography>
                  <Typography variant="body2" color="text.secondary">Profit: {formatCurrency(financialSummary.profit)}</Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
        <UpcomingExamsCard exams={data?.upcomingExams} />
      </Box>
    </Box>
  );
}
