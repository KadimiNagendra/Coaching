import { useQuery } from '@tanstack/react-query';
import { Box } from '@mui/material';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { UpcomingExamsCard } from '../components/UpcomingExamsCard';

export default function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="A daily operational command center for your tuition classes." />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <StatCard label="Total Students" value={data?.totalStudents ?? 0} helper={`${data?.activeStudents ?? 0} active`} accent="primary" />
        <StatCard label="Today's Classes" value={data?.todayClasses ?? 0} helper="Scheduled batches" accent="info" />
        <StatCard label="Present Today" value={data?.attendancePresentToday ?? 0} helper={`${data?.attendanceAbsentToday ?? 0} absent`} accent="success" />
      </Box>

      <Box sx={{ mt: 2 }}>
        <UpcomingExamsCard exams={data?.upcomingExams} />
      </Box>
    </Box>
  );
}
