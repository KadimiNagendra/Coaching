import { FormEvent, useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { api, Homework } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { futureDateOrEmpty, isPastDate, today } from '../utils/dates';

const emptyForm = (): Homework => ({ title: '', subject: '', description: '', dueDate: '' });
const textFields: Array<[keyof Homework, string]> = [['title', 'Title'], ['subject', 'Subject'], ['description', 'Description']];

export default function HomeworkPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Homework>(emptyForm());
  const [targetType, setTargetType] = useState<'class' | 'batch'>('class');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [dateError, setDateError] = useState('');
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['homework'], queryFn: api.homework });
  const { data: batches = [] } = useQuery({ queryKey: ['batches'], queryFn: api.batches });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: api.students });

  const classes = useMemo(() => {
    const list = [
      ...batches.map(b => b.classGrade),
      ...students.map(s => s.classGrade)
    ].filter(Boolean);
    return Array.from(new Set(list));
  }, [batches, students]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['homework'] });
  const create = useMutation({ mutationFn: (payload: Homework) => api.createHomework(payload), onSuccess: () => { invalidate(); closeDialog(); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Homework }) => api.updateHomework(id, payload), onSuccess: () => { invalidate(); closeDialog(); } });
  const remove = useMutation({ mutationFn: (id: number) => api.deleteHomework(id), onSuccess: invalidate });

  function closeDialog() {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setTargetType('class');
    setSelectedBatchId(batches.length > 0 ? (batches[0].id ?? '') : '');
    setSelectedClass('');
    setDateError('');
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setTargetType('class');
    setSelectedBatchId(batches.length > 0 ? (batches[0].id ?? '') : '');
    setSelectedClass(classes[0] ?? '');
    setDateError('');
    setOpen(true);
  }

  function openEdit(item: Homework) {
    setEditingId(item.id ?? null);
    setForm({ title: item.title, subject: item.subject, description: item.description ?? '', dueDate: futureDateOrEmpty(item.dueDate), assignedDate: item.assignedDate, remarks: item.remarks });
    if (item.batch) {
      setTargetType('batch');
      setSelectedBatchId(item.batch.id ?? '');
      setSelectedClass('');
    } else {
      setTargetType('class');
      setSelectedBatchId(batches.length > 0 ? (batches[0].id ?? '') : '');
      setSelectedClass(item.classGrade ?? '');
    }
    setDateError('');
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.dueDate) {
      setDateError('Due date is required.');
      return;
    }
    if (isPastDate(form.dueDate)) {
      setDateError('Select today or a future date.');
      return;
    }
    setDateError('');

    const payload: Homework = {
      title: form.title,
      subject: form.subject,
      description: form.description,
      dueDate: form.dueDate,
      remarks: form.remarks,
      assignedDate: form.assignedDate
    };

    if (targetType === 'class') {
      if (!selectedClass) {
        alert('Please select a Class.');
        return;
      }
      payload.classGrade = selectedClass;
      payload.batch = undefined;
    } else {
      if (!selectedBatchId) {
        alert('Please select a Batch.');
        return;
      }
      payload.batch = { id: Number(selectedBatchId), batchName: '', subject: '', classGrade: '' };
      payload.classGrade = undefined;
    }

    if (editingId) update.mutate({ id: editingId, payload });
    else create.mutate(payload);
  }

  function handleDelete(item: Homework) {
    if (!item.id || !window.confirm(`Delete homework "${item.title}"?`)) return;
    remove.mutate(item.id);
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={openCreate}>Assign Homework</Button>
      </Box>
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.subject}</TableCell>
                  <TableCell>
                    {item.batch ? (
                      <Chip label={item.batch.batchName} color="success" size="small" variant="outlined" />
                    ) : item.classGrade ? (
                      <Chip label={item.classGrade} color="primary" size="small" variant="outlined" />
                    ) : (
                      <Chip label="All Students" color="default" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.dueDate}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                      <IconButton size="small" aria-label="Edit homework" onClick={() => openEdit(item)}><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" aria-label="Delete homework" onClick={() => handleDelete(item)}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Homework' : 'Assign Homework'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
            {textFields.map(([key, label]) => (
              <TextField key={key} label={label} fullWidth value={String(form[key] ?? '')} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            ))}

            <TextField
              select
              label="Assign To"
              fullWidth
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as 'class' | 'batch')}
            >
              <MenuItem value="class">Class-wise (All batches of a Class)</MenuItem>
              <MenuItem value="batch">Batch-wise (Specific Batch)</MenuItem>
            </TextField>

            {targetType === 'class' ? (
              <TextField
                select
                label="Select Class"
                fullWidth
                required
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.length === 0 ? (
                  <MenuItem disabled value="">No classes found. Add students or batches first.</MenuItem>
                ) : (
                  classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                  ))
                )}
              </TextField>
            ) : (
              <TextField
                select
                label="Select Batch"
                fullWidth
                required
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                {batches.length === 0 ? (
                  <MenuItem disabled value="">No batches found. Add batches first.</MenuItem>
                ) : (
                  batches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.batchName} ({b.classGrade})</MenuItem>
                  ))
                )}
              </TextField>
            )}

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              required
              value={form.dueDate ?? ''}
              onChange={(e) => { setForm({ ...form, dueDate: e.target.value }); setDateError(''); }}
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
