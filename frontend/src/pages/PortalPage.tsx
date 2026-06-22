import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { api, getUser } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { buildStudentPerformance, formatPercent } from '../utils/performance';

const money = (value?: number) => `Rs ${Number(value ?? 0).toLocaleString('en-IN')}`;

type TabKey = 'fees' | 'attendance' | 'exams' | 'homework' | 'notifications';

export default function PortalPage() {
  const user = getUser();
  const isParent = user?.role === 'PARENT';
  const [activeTab, setActiveTab] = useState<TabKey>(isParent ? 'fees' : 'attendance');

  const { data: overview } = useQuery({ queryKey: ['portal-overview'], queryFn: api.portalOverview });
  const { data: fees = [] } = useQuery({ queryKey: ['portal-fees'], queryFn: api.portalFees, enabled: isParent });
  const { data: results = [] } = useQuery({ queryKey: ['portal-results'], queryFn: api.portalResults });
  const { data: attendance = [] } = useQuery({ queryKey: ['portal-attendance'], queryFn: api.portalAttendance });
  const { data: exams = [] } = useQuery({ queryKey: ['portal-exams'], queryFn: api.portalExams });
  const { data: homework = [] } = useQuery({ queryKey: ['portal-homework'], queryFn: api.portalHomework });
  const { data: notifications = [] } = useQuery({ queryKey: ['portal-notifications'], queryFn: api.portalNotifications });

  const roleLabel = overview?.role === 'PARENT' ? 'Parent portal' : 'Student portal';
  const tabs = useMemo(() => {
    const items: { key: TabKey; label: string }[] = [];
    if (isParent) items.push({ key: 'fees', label: 'Fees' });
    items.push(
      { key: 'attendance', label: 'Attendance' },
      { key: 'exams', label: 'Exams' },
      { key: 'homework', label: 'Homework' },
      { key: 'notifications', label: 'Notifications' }
    );
    return items;
  }, [isParent]);

  const performance = useMemo(
    () => buildStudentPerformance(overview?.students ?? [], results, attendance),
    [overview?.students, results, attendance]
  );

  return (
    <Box>
      <PageHeader
        title={roleLabel}
        subtitle={`Welcome ${overview?.fullName ?? ''}. View your linked student records in read-only mode.`}
      />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Linked students</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(overview?.students ?? []).map((student) => (
              <Chip key={student.id} label={`${student.studentName} · ${student.classGrade}`} color="primary" variant="outlined" />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
          {isParent ? 'Children Performance' : 'Student Performance'}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {performance.map((item) => (
            <Card key={item.student.id}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.student.studentName}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.student.classGrade}</Typography>
                  </Box>
                  <Chip label={item.label} color={item.accent} size="small" sx={{ fontWeight: 600 }} />
                </Stack>

                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" sx={{ mb: 0.75, justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Overall score</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatPercent(item.overallScore)}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={item.overallScore ?? 0}
                      color={item.accent === 'default' ? 'primary' : item.accent}
                      sx={{ height: 8, borderRadius: 99 }}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Exam average</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{formatPercent(item.examAverage)}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.examCount} exam{item.examCount === 1 ? '' : 's'} taken</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Attendance</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{formatPercent(item.attendanceRate)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.totalAttendance ? `${item.presentCount}/${item.totalAttendance} present` : 'No records yet'}
                      </Typography>
                    </Box>
                  </Box>

                  {item.latestResult && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 2,
                        bgcolor: alpha('#4f46e5', 0.06),
                        border: '1px solid',
                        borderColor: alpha('#4f46e5', 0.12)
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">Latest exam</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.latestResult.exam?.examName} · {formatPercent(Number(item.latestResult.percentage ?? 0))}
                        {item.latestResult.grade ? ` · Grade ${item.latestResult.grade}` : ''}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
          {performance.length === 0 && (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  {isParent ? 'No linked students found for performance tracking.' : 'No performance data available yet.'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, value: TabKey) => setActiveTab(value)}
          sx={{ px: 2, borderBottom: 1, borderColor: alpha('#0f172a', 0.08) }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} value={tab.key} />
          ))}
        </Tabs>
        <CardContent>
          {activeTab === 'fees' && (
            <Table>
              <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Month</TableCell><TableCell>Paid</TableCell><TableCell>Due</TableCell></TableRow></TableHead>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}><TableCell>{fee.student?.studentName}</TableCell><TableCell>{fee.feeMonth}</TableCell><TableCell>{money(fee.paidAmount)}</TableCell><TableCell>{money(fee.dueAmount)}</TableCell></TableRow>
                ))}
                {fees.length === 0 && <TableRow><TableCell colSpan={4}>No fee records found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
          {activeTab === 'attendance' && (
            <Table>
              <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}><TableCell>{record.student?.studentName}</TableCell><TableCell>{record.attendanceDate}</TableCell><TableCell><Chip label={record.status} size="small" /></TableCell></TableRow>
                ))}
                {attendance.length === 0 && <TableRow><TableCell colSpan={3}>No attendance records found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
          {activeTab === 'exams' && (
            <Table>
              <TableHead><TableRow><TableCell>Exam</TableCell><TableCell>Subject</TableCell><TableCell>Class</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}><TableCell>{exam.examName}</TableCell><TableCell>{exam.subject}</TableCell><TableCell>{exam.classGrade}</TableCell><TableCell>{exam.examDate}</TableCell></TableRow>
                ))}
                {exams.length === 0 && <TableRow><TableCell colSpan={4}>No exams found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
          {activeTab === 'homework' && (
            <Table>
              <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Subject</TableCell><TableCell>Due Date</TableCell><TableCell>Description</TableCell></TableRow></TableHead>
              <TableBody>
                {homework.map((item) => (
                  <TableRow key={item.id}><TableCell>{item.title}</TableCell><TableCell>{item.subject}</TableCell><TableCell>{item.dueDate}</TableCell><TableCell>{item.description}</TableCell></TableRow>
                ))}
                {homework.length === 0 && <TableRow><TableCell colSpan={4}>No homework found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
          {activeTab === 'notifications' && (
            <Table>
              <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Subject</TableCell><TableCell>Message</TableCell></TableRow></TableHead>
              <TableBody>
                {notifications.map((item) => (
                  <TableRow key={item.id}><TableCell>{item.student?.studentName}</TableCell><TableCell>{item.subject}</TableCell><TableCell>{item.message}</TableCell></TableRow>
                ))}
                {notifications.length === 0 && <TableRow><TableCell colSpan={3}>No notifications found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
