import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { api, Exam, ExamResult, getUser, Student } from '../api/client';
import { PageHeader } from '../components/PageHeader';

type ResultForm = { obtainedMarks: number; totalMarks: number; remarks: string };

function gradeColor(grade?: string) {
  if (!grade) return 'default';
  if (grade === 'A+' || grade === 'A') return 'success';
  if (grade === 'B') return 'primary';
  if (grade === 'C') return 'warning';
  return 'error';
}

function PortalResults() {
  const { data: results = [], isLoading } = useQuery({ queryKey: ['portal-results'], queryFn: api.portalResults });

  return (
    <>
      <PageHeader title="Results" subtitle="View exam marks and grades for your linked students." />
      <Card>
        <CardContent>
          {isLoading ? (
            <Typography color="text.secondary">Loading results...</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Exam</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Obtained</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">%</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.student?.studentName}</TableCell>
                    <TableCell>{result.exam?.examName}</TableCell>
                    <TableCell>{result.exam?.subject}</TableCell>
                    <TableCell>{result.exam?.examDate}</TableCell>
                    <TableCell align="right">{result.obtainedMarks}</TableCell>
                    <TableCell align="right">{result.totalMarks}</TableCell>
                    <TableCell align="right">{result.percentage != null ? Number(result.percentage).toFixed(1) : '—'}</TableCell>
                    <TableCell>
                      {result.grade ? <Chip label={result.grade} size="small" color={gradeColor(result.grade)} /> : '—'}
                    </TableCell>
                    <TableCell>{result.remarks || '—'}</TableCell>
                  </TableRow>
                ))}
                {results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>No exam results published yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function TeacherResults() {
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamResult | null>(null);
  const [targetStudent, setTargetStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<ResultForm>({ obtainedMarks: 0, totalMarks: 100, remarks: '' });
  const queryClient = useQueryClient();

  const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: api.exams });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: api.students });
  const selectedExam = exams.find((exam) => exam.id === selectedExamId);

  const { data: results = [] } = useQuery({
    queryKey: ['exam-results', selectedExamId],
    queryFn: () => api.examResults(selectedExamId as number),
    enabled: selectedExamId !== ''
  });

  const classStudents = useMemo(
    () => (selectedExam ? students.filter((student) => student.classGrade === selectedExam.classGrade && student.status !== 'INACTIVE') : []),
    [students, selectedExam]
  );

  const resultByStudentId = useMemo(() => {
    const map = new Map<number, ExamResult>();
    results.forEach((result) => {
      if (result.student?.id) map.set(result.student.id, result);
    });
    return map;
  }, [results]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['exam-results', selectedExamId] });

  const create = useMutation({
    mutationFn: (payload: ExamResult) => api.addExamResult(selectedExamId as number, payload),
    onSuccess: () => { invalidate(); closeDialog(); }
  });
  const update = useMutation({
    mutationFn: ({ resultId, payload }: { resultId: number; payload: Partial<ExamResult> }) =>
      api.updateExamResult(selectedExamId as number, resultId, payload),
    onSuccess: () => { invalidate(); closeDialog(); }
  });
  const remove = useMutation({
    mutationFn: (resultId: number) => api.deleteExamResult(selectedExamId as number, resultId),
    onSuccess: invalidate
  });

  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setTargetStudent(null);
    setForm({ obtainedMarks: 0, totalMarks: 100, remarks: '' });
  }

  function openCreate(student: Student) {
    setEditing(null);
    setTargetStudent(student);
    setForm({
      obtainedMarks: 0,
      totalMarks: selectedExam?.totalMarks ?? 100,
      remarks: ''
    });
    setOpen(true);
  }

  function openEdit(result: ExamResult) {
    setEditing(result);
    setTargetStudent(result.student);
    setForm({
      obtainedMarks: result.obtainedMarks ?? 0,
      totalMarks: result.totalMarks ?? 100,
      remarks: result.remarks ?? ''
    });
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!targetStudent?.id) return;
    if (editing?.id) {
      update.mutate({
        resultId: editing.id,
        payload: { obtainedMarks: form.obtainedMarks, totalMarks: form.totalMarks, remarks: form.remarks }
      });
    } else {
      create.mutate({
        student: { id: targetStudent.id } as Student,
        obtainedMarks: form.obtainedMarks,
        totalMarks: form.totalMarks,
        remarks: form.remarks
      });
    }
  }

  function handleDelete(result: ExamResult) {
    if (!result.id || !window.confirm(`Remove result for ${result.student?.studentName}?`)) return;
    remove.mutate(result.id);
  }

  return (
    <>
      <PageHeader title="Results" subtitle="Enter and update exam marks for students. Grades are calculated automatically." />
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel id="exam-select-label">Select exam</InputLabel>
            <Select
              labelId="exam-select-label"
              label="Select exam"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>Choose an exam</em>
              </MenuItem>
              {exams.map((exam: Exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.examName} · {exam.subject} · {exam.classGrade} · {exam.examDate}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedExamId !== '' && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {selectedExam?.examName} — Class {selectedExam?.classGrade}
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell align="right">Obtained</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">%</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classStudents.map((student) => {
                  const result = student.id ? resultByStudentId.get(student.id) : undefined;
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell align="right">{result ? result.obtainedMarks : '—'}</TableCell>
                      <TableCell align="right">{result ? result.totalMarks : '—'}</TableCell>
                      <TableCell align="right">
                        {result?.percentage != null ? Number(result.percentage).toFixed(1) : '—'}
                      </TableCell>
                      <TableCell>
                        {result?.grade ? <Chip label={result.grade} size="small" color={gradeColor(result.grade)} /> : '—'}
                      </TableCell>
                      <TableCell>{result?.remarks || '—'}</TableCell>
                      <TableCell align="right">
                        {result ? (
                          <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                            <IconButton size="small" aria-label="Edit result" onClick={() => openEdit(result)}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" aria-label="Delete result" onClick={() => handleDelete(result)}>
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Button size="small" variant="outlined" onClick={() => openCreate(student)}>
                            Enter marks
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {classStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>No active students found for class {selectedExam?.classGrade}.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Update result' : 'Enter result'} — {targetStudent?.studentName}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
            <TextField
              label="Obtained marks"
              type="number"
              fullWidth
              required
              slotProps={{ htmlInput: { min: 0 } }}
              value={form.obtainedMarks}
              onChange={(e) => setForm({ ...form, obtainedMarks: Number(e.target.value) })}
            />
            <TextField
              label="Total marks"
              type="number"
              fullWidth
              required
              slotProps={{ htmlInput: { min: 1 } }}
              value={form.totalMarks}
              onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
            />
            <TextField
              label="Remarks"
              fullWidth
              multiline
              minRows={2}
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {editing ? 'Update' : 'Save'}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ResultsPage() {
  const user = getUser();
  if (user?.role === 'PARENT' || user?.role === 'STUDENT') return <PortalResults />;
  return <TeacherResults />;
}
