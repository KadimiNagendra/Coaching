import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Chip, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { api, AttendanceRecord, Student } from '../api/client';
import { PageHeader } from '../components/PageHeader';

type AttendanceStatus = AttendanceRecord['status'];
type AttendanceRow = { status: AttendanceStatus; remarks: string };

export default function AttendancePage() {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [rowOverrides, setRowOverrides] = useState<Record<string, AttendanceRow>>({});
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['attendance', attendanceDate], queryFn: () => api.attendance(attendanceDate, attendanceDate) });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: api.students });
  const roster = useMemo(() => students.filter((student) => student.id && student.status !== 'INACTIVE'), [students]);
  const recordsForDate = useMemo(() => data.filter((record) => record.attendanceDate === attendanceDate), [attendanceDate, data]);

  const saveAll = useMutation({
    mutationFn: async () => {
      await Promise.all(roster.map((student) => {
        if (!student.id) return Promise.resolve();
        const row = getRow(student);
        return api.markAttendance({ student, attendanceDate, status: row.status, remarks: row.remarks });
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', attendanceDate] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  function rowKey(studentId: number) {
    return `${attendanceDate}:${studentId}`;
  }

  function getRow(student: Student): AttendanceRow {
    if (!student.id) return { status: 'PRESENT', remarks: '' };
    const override = rowOverrides[rowKey(student.id)];
    if (override) return override;
    const existing = recordsForDate.find((record) => record.student?.id === student.id);
    return { status: existing?.status ?? 'PRESENT', remarks: existing?.remarks ?? '' };
  }

  function updateRow(studentId: number, patch: Partial<AttendanceRow>) {
    setRowOverrides((current) => ({ ...current, [rowKey(studentId)]: { ...(current[rowKey(studentId)] ?? { status: 'PRESENT', remarks: '' }), ...patch } }));
  }

  function markAll(status: AttendanceStatus) {
    setRowOverrides((current) => {
      const next = { ...current };
      roster.forEach((student) => {
        if (!student.id) return;
        next[rowKey(student.id)] = { ...getRow(student), status };
      });
      return next;
    });
  }

  return (
    <>
      <PageHeader title="Attendance" subtitle="Choose a calendar date to view and update that date's attendance records." />
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
            <TextField label="Attendance Date" type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => markAll('PRESENT')}>Mark All Present</Button>
              <Button variant="outlined" color="warning" onClick={() => markAll('LATE')}>Mark All Late</Button>
              <Button onClick={() => saveAll.mutate()} disabled={saveAll.isPending}>{saveAll.isPending ? 'Saving...' : 'Save Attendance'}</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Daily Student List</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roster.map((student) => {
                if (!student.id) return null;
                const row = getRow(student);
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.classGrade}</TableCell>
                    <TableCell>{student.batch?.batchName ?? '-'}</TableCell>
                    <TableCell>
                      <TextField select size="small" value={row.status} onChange={(event) => updateRow(student.id!, { status: event.target.value as AttendanceStatus })}>
                        {['PRESENT', 'ABSENT', 'LATE'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                      </TextField>
                    </TableCell>
                    <TableCell><TextField size="small" fullWidth value={row.remarks} onChange={(event) => updateRow(student.id!, { remarks: event.target.value })} placeholder="Optional note" /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Saved Records for {attendanceDate}</Typography>
          <Table>
            <TableHead>
              <TableRow><TableCell>Student</TableCell><TableCell>Status</TableCell><TableCell>Remarks</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {recordsForDate.map((record) => <TableRow key={record.id}><TableCell>{record.student?.studentName}</TableCell><TableCell><Chip label={record.status} color={record.status === 'ABSENT' ? 'error' : record.status === 'LATE' ? 'warning' : 'success'} size="small" /></TableCell><TableCell>{record.remarks}</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
