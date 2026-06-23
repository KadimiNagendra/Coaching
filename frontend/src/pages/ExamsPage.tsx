import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem } from '@mui/material';
import { api, Exam } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { futureDateOrEmpty, isPastDate, today } from '../utils/dates';

const emptyForm = (): Exam => ({ examName: '', examType: '', subject: '', classGrade: '', examDate: '' });
const textFields: Array<[keyof Exam, string]> = [['examName', 'Exam Name'], ['subject', 'Subject'], ['classGrade', 'Class']];

export default function ExamsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Exam>(emptyForm());
  const [dateError, setDateError] = useState('');
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['exams'], queryFn: api.exams });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['exams'] });
  const create = useMutation({ mutationFn: (payload: Exam) => api.createExam(payload), onSuccess: () => { invalidate(); closeDialog(); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Exam }) => api.updateExam(id, payload), onSuccess: () => { invalidate(); closeDialog(); } });
  const remove = useMutation({ mutationFn: (id: number) => api.deleteExam(id), onSuccess: invalidate });

  function closeDialog() {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setDateError('');
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setDateError('');
    setOpen(true);
  }

  function openEdit(item: Exam) {
    setEditingId(item.id ?? null);
    setForm({ examName: item.examName, examType: item.examType ?? '', subject: item.subject, classGrade: item.classGrade, examDate: futureDateOrEmpty(item.examDate), totalMarks: item.totalMarks, remarks: item.remarks });
    setDateError('');
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.examDate) {
      setDateError('Exam date is required.');
      return;
    }
    if (isPastDate(form.examDate)) {
      setDateError('Select today or a future date.');
      return;
    }
    setDateError('');
    if (editingId) update.mutate({ id: editingId, payload: form });
    else create.mutate(form);
  }

  function handleDelete(item: Exam) {
    if (!item.id || !window.confirm(`Delete exam "${item.examName}"?`)) return;
    remove.mutate(item.id);
  }

  return (
    <>
      <PageHeader title="Exams" subtitle="Schedule tests and prepare progress tracking." actionLabel="Add Exam" onAction={openCreate} />
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Exam Name</TableCell>
                <TableCell>Exam Type</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.examName}</TableCell>
                  <TableCell>{item.examType ?? '—'}</TableCell>
                  <TableCell>{item.subject}</TableCell>
                  <TableCell>{item.classGrade}</TableCell>
                  <TableCell>{item.examDate}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                      <IconButton size="small" aria-label="Edit exam" onClick={() => openEdit(item)}><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" aria-label="Delete exam" onClick={() => handleDelete(item)}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Exam' : 'Add Exam'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
            {textFields.map(([key, label]) => (
              <TextField key={key} label={label} fullWidth value={String(form[key] ?? '')} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            ))}
            <TextField
              select
              label="Exam Type"
              fullWidth
              value={form.examType ?? ''}
              onChange={(e) => setForm({ ...form, examType: e.target.value })}
            >
              <MenuItem value="">-- Select Exam Type --</MenuItem>
              <MenuItem value="Slip Test">Slip Test</MenuItem>
              <MenuItem value="Surprise Test">Surprise Test</MenuItem>
              <MenuItem value="Quarterly Test">Quarterly Test</MenuItem>
              <MenuItem value="Unit Test">Unit Test</MenuItem>
            </TextField>
            <TextField
              label="Date"
              type="date"
              fullWidth
              required
              value={form.examDate ?? ''}
              onChange={(e) => { setForm({ ...form, examDate: e.target.value }); setDateError(''); }}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today() } }}
              error={Boolean(dateError)}
              helperText={dateError || 'Only today or future dates can be selected.'}
            />
            <Button type="submit" disabled={create.isPending || update.isPending}>{editingId ? 'Update' : 'Save'}</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
