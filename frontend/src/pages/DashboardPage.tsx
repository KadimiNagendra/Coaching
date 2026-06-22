import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Card, CardContent, Typography, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Stack, Chip } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { UpcomingExamsCard } from '../components/UpcomingExamsCard';

const today = () => new Date().toISOString().slice(0, 10);

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });
  const { data: batches = [] } = useQuery({ queryKey: ['batches'], queryFn: api.batches });
  const { data: sessions = [] } = useQuery({ queryKey: ['class-sessions'], queryFn: api.classSessions });

  // Form State
  const [sessionDate, setSessionDate] = useState(today());
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [subject, setSubject] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [remarks, setRemarks] = useState('');

  // Filter State
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<number | 'ALL'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  // Mutation to create session
  const createSession = useMutation({
    mutationFn: (session: any) => api.createClassSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-sessions'] });
      // Reset form
      setSelectedBatchId('');
      setSubject('');
      setClassGrade('');
      setTopicsCovered('');
      setRemarks('');
      setSessionDate(today());
    }
  });

  // Mutation to delete session
  const deleteSession = useMutation({
    mutationFn: (id: number) => api.deleteClassSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-sessions'] });
    }
  });

  const handleBatchChange = (batchId: number | '') => {
    setSelectedBatchId(batchId);
    if (batchId === '') {
      setSubject('');
      setClassGrade('');
    } else {
      const b = batches.find(x => x.id === batchId);
      if (b) {
        setSubject(b.subject);
        setClassGrade(b.classGrade);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      alert('Please select a batch.');
      return;
    }
    createSession.mutate({
      sessionDate,
      batch: { id: Number(selectedBatchId) },
      subject,
      classGrade,
      topicsCovered,
      remarks
    });
  };

  const handleDelete = (id?: number) => {
    if (!id || !window.confirm('Delete this class session log?')) return;
    deleteSession.mutate(id);
  };

  // Filter derivations
  const classes = useMemo(() => {
    return Array.from(new Set(batches.map(b => b.classGrade))).filter(Boolean);
  }, [batches]);

  const subjects = useMemo(() => {
    return Array.from(new Set(batches.map(b => b.subject))).filter(Boolean);
  }, [batches]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s: any) => {
      const matchClass = classFilter === 'ALL' || s.classGrade === classFilter;
      const matchBatch = batchFilter === 'ALL' || s.batch?.id === Number(batchFilter);
      const matchSubject = subjectFilter === 'ALL' || s.subject === subjectFilter;
      return matchClass && matchBatch && matchSubject;
    }).sort((a: any, b: any) => b.sessionDate.localeCompare(a.sessionDate)); // Sort by date descending
  }, [sessions, classFilter, batchFilter, subjectFilter]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader title="Dashboard" subtitle="A daily operational command center for your tuition classes." />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <StatCard label="Total Students" value={data?.totalStudents ?? 0} helper={`${data?.activeStudents ?? 0} active`} accent="primary" />
        <StatCard label="Today's Classes" value={data?.todayClasses ?? 0} helper="Scheduled batches" accent="info" />
        <StatCard label="Present Today" value={data?.attendancePresentToday ?? 0} helper={`${data?.attendanceAbsentToday ?? 0} absent`} accent="success" />
      </Box>

      {/* Upcoming Exams in the first place */}
      <UpcomingExamsCard exams={data?.upcomingExams} />

      {/* Log Class Session */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Log Class Session</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Record class schedule history, topics taught, and optional remarks.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Session Date"
              type="date"
              required
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              select
              label="Select Batch"
              required
              value={selectedBatchId}
              onChange={(e) => handleBatchChange(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">-- Select Batch --</MenuItem>
              {batches.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.batchName} ({b.classGrade})</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <TextField
              label="Class/Grade"
              required
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value)}
            />

            <TextField
              label="Topics Covered"
              required
              multiline
              minRows={2}
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              sx={{ gridColumn: { sm: 'span 2' } }}
            />

            <TextField
              label="Remarks"
              multiline
              minRows={1}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              sx={{ gridColumn: { sm: 'span 2' } }}
            />

            <Box sx={{ gridColumn: { sm: 'span 2' }, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" disabled={createSession.isPending} sx={{ minWidth: 150 }}>
                {createSession.isPending ? 'Saving...' : 'Save Class'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Class History & Schedule */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Class History & Schedule</Typography>
          
          {/* Filter controls */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              select
              label="Filter by Class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="ALL">All Classes</MenuItem>
              {classes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            
            <TextField
              select
              label="Filter by Batch"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value as any)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="ALL">All Batches</MenuItem>
              {batches.map(b => <MenuItem key={b.id} value={b.id}>{b.batchName}</MenuItem>)}
            </TextField>

            <TextField
              select
              label="Filter by Subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="ALL">All Subjects</MenuItem>
              {subjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Stack>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Class Grade</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Topics Covered</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSessions.map((session: any) => (
                <TableRow key={session.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.sessionDate}</TableCell>
                  <TableCell><Chip label={session.classGrade} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell>{session.batch?.batchName ?? '—'}</TableCell>
                  <TableCell>{session.subject}</TableCell>
                  <TableCell sx={{ maxWidth: 200, wordBreak: 'break-word' }}>{session.topicsCovered}</TableCell>
                  <TableCell sx={{ maxWidth: 150, wordBreak: 'break-word' }}>{session.remarks || '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" aria-label="Delete log" onClick={() => handleDelete(session.id)}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No class session records found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
