import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Typography, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, alpha, Button, IconButton } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { UpcomingExamsCard } from '../components/UpcomingExamsCard';

export default function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });
  const { data: batches = [] } = useQuery({ queryKey: ['batches'], queryFn: api.batches });
  const { data: plans = [] } = useQuery({ queryKey: ['topic-plans'], queryFn: api.topicPlans });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: api.students });
  
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { data: todayAttendance = [] } = useQuery({ 
    queryKey: ['attendance', 'today', todayStr], 
    queryFn: () => api.attendance(todayStr, todayStr) 
  });

  // Modal Detail States
  const [activeModal, setActiveModal] = useState<'students' | 'attendance' | null>(null);
  const [modalSearch, setModalSearch] = useState('');

  // Calendar & Selected Date States
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => todayStr);

  // A. Calendar Cells Generator (42 days grid)
  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    const cells = [];
    
    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayVal = daysInPrevMonth - i;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
      cells.push({ day: dayVal, dateStr, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({ day: i, dateStr, isCurrentMonth: true });
    }
    
    // Next month padding
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    let nextDay = 1;
    while (cells.length < 42) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      cells.push({ day: nextDay, dateStr, isCurrentMonth: false });
      nextDay++;
    }
    
    return cells;
  }, [currentMonth]);

  // B. Selected Date Teaching Plans
  const selectedDatePlans = useMemo(() => {
    return plans.filter(p => p.planDate === selectedDate);
  }, [plans, selectedDate]);

  function handleMonthChange(direction: number) {
    setCurrentMonth(prev => {
      const nextDate = new Date(prev);
      nextDate.setMonth(prev.getMonth() + direction);
      return nextDate;
    });
  }

  // Derived state for the active students modal
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

  const presentList = useMemo(() => {
    return todayAttendance.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE');
  }, [todayAttendance]);

  const absentList = useMemo(() => {
    return todayAttendance.filter((a: any) => a.status === 'ABSENT');
  }, [todayAttendance]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr', md: '200px 1fr' }, gap: 2, alignItems: 'stretch' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <StatCard label="Total Students" value={data?.totalStudents ?? 0} helper={`${data?.activeStudents ?? 0} active`} accent="primary" onClick={() => setActiveModal('students')} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard label="Present Today" value={data?.attendancePresentToday ?? 0} helper={`${data?.attendanceAbsentToday ?? 0} absent`} accent="success" onClick={() => setActiveModal('attendance')} />
          </Box>
        </Stack>
        <Box sx={{ minWidth: 0 }}>
          <UpcomingExamsCard exams={data?.upcomingExams} />
        </Box>
      </Box>

      {/* Interactive Calendar & Selected Date Teaching Plan split container */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3, height: { xs: 'auto', md: '320px' } }}>
        {/* Left Column: Calendar Card */}
        <Card sx={{ height: '100%', borderRadius: 3 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Upcoming Classes Calendar</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton size="small" onClick={() => handleMonthChange(-1)}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ fontWeight: 600, minWidth: 110, textAlign: 'center', fontSize: '0.85rem' }}>
                  {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </Typography>
                <IconButton size="small" onClick={() => handleMonthChange(1)}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {/* Weekdays Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5, textAlign: 'center' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Typography key={day} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', py: 0.25, fontSize: '0.75rem' }}>
                  {day}
                </Typography>
              ))}
            </Box>
            
            {/* Days Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {calendarCells.map((cell) => {
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === todayStr;
                const hasPlans = plans.some(p => p.planDate === cell.dateStr);
                
                return (
                  <Box
                    key={cell.dateStr}
                    onClick={() => {
                      setSelectedDate(cell.dateStr);
                      const clickedDate = new Date(cell.dateStr);
                      if (clickedDate.getMonth() !== currentMonth.getMonth()) {
                        setCurrentMonth(clickedDate);
                      }
                    }}
                    sx={{
                      aspectRatio: { xs: '1', md: '1.7' },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      bgcolor: isSelected 
                        ? 'primary.main' 
                        : isToday 
                          ? alpha('#818cf8', 0.15) 
                          : 'transparent',
                      color: isSelected 
                        ? '#ffffff' 
                        : cell.isCurrentMonth 
                          ? 'text.primary' 
                          : 'text.disabled',
                      border: isToday && !isSelected ? '1px solid' : 'none',
                      borderColor: 'primary.light',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.main' : alpha('#818cf8', 0.08)
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: isToday || isSelected ? 700 : 500, fontSize: '0.8rem' }}>
                      {cell.day}
                    </Typography>
                    
                    {/* Plans Indicator Dot */}
                    {hasPlans && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 3,
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: isSelected ? '#ffffff' : 'primary.main'
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
 
        {/* Right Column: Plans for Selected Date Card */}
        <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25 }}>
              Teaching Plans
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Scheduled for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
            
            <Box
              sx={{
                height: '210px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                pr: 0.5,
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '4px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.02)'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '2px'
                }
              }}
            >
              {selectedDatePlans.map((plan) => (
                <Box
                  key={plan.id}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: alpha('#818cf8', 0.15),
                    bgcolor: alpha('#818cf8', 0.02),
                    position: 'relative',
                    overflow: 'hidden',
                    pl: 2,
                    flexShrink: 0,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      bgcolor: 'primary.main'
                    }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25, fontSize: '0.8rem' }}>
                    {plan.batch?.batchName ?? '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                    Subject: <strong>{plan.subject}</strong> | Grade: <strong>{plan.batch?.classGrade ?? '—'}</strong>
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.775rem', color: 'primary.main' }}>
                    {plan.chapter}: {plan.topic}
                  </Typography>
                </Box>
              ))}
              {selectedDatePlans.length === 0 && (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 3,
                    color: 'text.secondary',
                    textAlign: 'center'
                  }}
                >
                  <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.85rem' }}>No classes scheduled</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Select another date or manage plans in Topics Master.
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

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
                  {presentList.map((a: any) => (
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
                  ))}
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
                  {absentList.map((a: any) => (
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
                  ))}
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
