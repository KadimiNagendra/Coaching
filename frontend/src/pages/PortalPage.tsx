import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Chip, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const money = (value?: number) => `Rs ${Number(value ?? 0).toLocaleString('en-IN')}`;

export default function PortalPage() {
  const [tab, setTab] = useState(0);
  const { data: overview } = useQuery({ queryKey: ['portal-overview'], queryFn: api.portalOverview });
  const { data: fees = [] } = useQuery({ queryKey: ['portal-fees'], queryFn: api.portalFees });
  const { data: attendance = [] } = useQuery({ queryKey: ['portal-attendance'], queryFn: api.portalAttendance });
  const { data: exams = [] } = useQuery({ queryKey: ['portal-exams'], queryFn: api.portalExams });
  const { data: homework = [] } = useQuery({ queryKey: ['portal-homework'], queryFn: api.portalHomework });
  const { data: notifications = [] } = useQuery({ queryKey: ['portal-notifications'], queryFn: api.portalNotifications });

  const roleLabel = overview?.role === 'PARENT' ? 'Parent portal' : 'Student portal';

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
      <Card>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, borderBottom: 1, borderColor: alpha('#0f172a', 0.08) }}>
          <Tab label="Fees" />
          <Tab label="Attendance" />
          <Tab label="Exams" />
          <Tab label="Homework" />
          <Tab label="Notifications" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
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
          {tab === 1 && (
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
          {tab === 2 && (
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
          {tab === 3 && (
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
          {tab === 4 && (
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
