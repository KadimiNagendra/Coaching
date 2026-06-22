import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Card, CardContent, Typography, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, alpha } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
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
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: api.students });
  
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { data: todayAttendance = [] } = useQuery({ 
    queryKey: ['attendance', 'today', todayStr], 
    queryFn: () => api.attendance(todayStr, todayStr) 
  });

  // Modal Detail States
  const [activeModal, setActiveModal] = useState<'students' | 'batches' | 'attendance' | null>(null);
  const [modalSearch, setModalSearch] = useState('');

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

  // Derived state for the modals
  const activeStudentsList = useMemo(() => {
    return students.filter((s: any) => s.status === 'ACTIVE');
  }, [students]);

  const filteredActiveStudents = useMemo(() => {
    const q = modalSearch.toLowerCase().trim();
    if (!q) return activeStudentsList;
    return activeStudentsList.filter((s: any) => 
      s.studentName.toLowerCase().includes(q) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      s.classGrade.toLowerCase().includes(q) ||
      (s.subjectsEnrolled && s.subjectsEnrolled.toLowerCase().includes(q))
    );
  }, [activeStudentsList, modalSearch]);

  const filteredBatches = useMemo(() => {
    const q = modalSearch.toLowerCase().trim();
    if (!q) return batches;
    return batches.filter((b: any) => 
      b.batchName.toLowerCase().includes(q) ||
      b.subject.toLowerCase().includes(q) ||
      b.classGrade.toLowerCase().includes(q)
    );
  }, [batches, modalSearch]);

  const presentList = useMemo(() => {
    return todayAttendance.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE');
  }, [todayAttendance]);

  const absentList = useMemo(() => {
    return todayAttendance.filter((a: any) => a.status === 'ABSENT');
  }, [todayAttendance]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader title="Dashboard" subtitle="A daily operational command center for your tuition classes." />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <StatCard label="Total Students" value={data?.totalStudents ?? 0} helper={`${data?.activeStudents ?? 0} active`} accent="primary" onClick={() => setActiveModal('students')} />
        <StatCard label="Today's Classes" value={data?.todayClasses ?? 0} helper="Scheduled batches" accent="info" onClick={() => setActiveModal('batches')} />
        <StatCard label="Present Today" value={data?.attendancePresentToday ?? 0} helper={`${data?.attendanceAbsentToday ?? 0} absent`} accent="success" onClick={() => setActiveModal('attendance')} />
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

      {/* Active Students Dialog */}
      <Dialog
        open={activeModal === 'students'}
        onClose={() => setActiveModal(null)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Active Students</Typography>
            <Typography variant="body2" color="text.secondary">
              Currently enrolled students who are set to Active status.
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by student name, class, or subjects..."
            variant="outlined"
            size="small"
            value={modalSearch}
            onChange={(e) => setModalSearch(e.target.value)}
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchOutlinedIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                )
              }
            }}
          />

          {filteredActiveStudents.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              <SchoolOutlinedIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
              <Typography sx={{ fontWeight: 600 }}>No active students found</Typography>
              <Typography variant="body2">Try refining your search or add active students in the Students page.</Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Class/Grade</TableCell>
                  <TableCell>Batch</TableCell>
                  <TableCell>Enrolled Subjects</TableCell>
                  <TableCell>Parent Contact</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActiveStudents.map((s: any) => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem', fontWeight: 600 }}>
                          {s.studentName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.studentName}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.studentId}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={s.classGrade} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {s.batch?.batchName || '—'}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.85rem' }}>{s.subjectsEnrolled || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      {s.parent ? (
                        <Box>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.parent.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.parent.mobileNumber}</Typography>
                        </Box>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setActiveModal(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Scheduled Batches Dialog */}
      <Dialog
        open={activeModal === 'batches'}
        onClose={() => setActiveModal(null)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Scheduled Batches</Typography>
            <Typography variant="body2" color="text.secondary">
              List of teaching batches, schedules, and timing details.
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by batch name, subject, or class..."
            variant="outlined"
            size="small"
            value={modalSearch}
            onChange={(e) => setModalSearch(e.target.value)}
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchOutlinedIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                )
              }
            }}
          />

          {filteredBatches.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              <ScheduleOutlinedIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
              <Typography sx={{ fontWeight: 600 }}>No batches found</Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class/Grade</TableCell>
                  <TableCell>Timing</TableCell>
                  <TableCell>Days of Week</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBatches.map((b: any) => (
                  <TableRow key={b.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{b.batchName}</TableCell>
                    <TableCell>
                      <Chip label={b.subject} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{b.classGrade}</TableCell>
                    <TableCell>
                      {b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : '—'}
                    </TableCell>
                    <TableCell>
                      {b.daysOfWeek ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {b.daysOfWeek.split(',').map((day: string) => (
                            <Chip key={day} label={day.trim().substring(0, 3)} size="small" variant="filled" sx={{ height: 20, fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setActiveModal(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Today's Attendance Dialog */}
      <Dialog
        open={activeModal === 'attendance'}
        onClose={() => setActiveModal(null)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Today's Attendance Status</Typography>
            <Typography variant="body2" color="text.secondary">
              Summary of students marked present, late, or absent today.
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {todayAttendance.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
              <Typography sx={{ fontWeight: 600, mb: 1 }}>No attendance records for today</Typography>
              <Typography variant="body2" sx={{ maxWidth: 400, mx: 'auto' }}>
                Attendance has not been recorded yet for today. You can mark attendance in the Attendance section from the sidebar menu.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Present / Late Column */}
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: alpha('#10b981', 0.15),
                  borderRadius: 2,
                  bgcolor: alpha('#10b981', 0.02),
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ bgcolor: alpha('#10b981', 0.08), px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderBottomColor: alpha('#10b981', 0.15) }}>
                  <Typography sx={{ fontWeight: 700, color: '#047857' }}>Present / Late</Typography>
                  <Chip label={`${presentList.length} marked`} size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 600 }} />
                </Box>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 350, overflowY: 'auto' }}>
                  {presentList.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No students marked present today.
                    </Typography>
                  ) : (
                    presentList.map((a: any) => (
                      <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, borderRadius: 1.5, bgcolor: '#ffffff', border: '1px solid', borderColor: alpha('#0f172a', 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <CheckCircleOutlinedIcon sx={{ color: '#10b981', fontSize: 20 }} />
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.student?.studentName}</Typography>
                            <Typography variant="caption" color="text.secondary">{a.student?.classGrade}</Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={a.status}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: a.status === 'LATE' ? '#f59e0b' : '#10b981',
                            color: '#ffffff'
                          }}
                        />
                      </Box>
                    ))
                  )}
                </Box>
              </Box>

              {/* Absent Column */}
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: alpha('#ef4444', 0.15),
                  borderRadius: 2,
                  bgcolor: alpha('#ef4444', 0.02),
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ bgcolor: alpha('#ef4444', 0.08), px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderBottomColor: alpha('#ef4444', 0.15) }}>
                  <Typography sx={{ fontWeight: 700, color: '#b91c1c' }}>Absent</Typography>
                  <Chip label={`${absentList.length} marked`} size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 600 }} />
                </Box>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 350, overflowY: 'auto' }}>
                  {absentList.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No students marked absent today.
                    </Typography>
                  ) : (
                    absentList.map((a: any) => (
                      <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, borderRadius: 1.5, bgcolor: '#ffffff', border: '1px solid', borderColor: alpha('#0f172a', 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <CancelOutlinedIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.student?.studentName}</Typography>
                            <Typography variant="caption" color="text.secondary">{a.student?.classGrade}</Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={a.status}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: '#ef4444',
                            color: '#ffffff'
                          }}
                        />
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setActiveModal(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
