import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { api, Batch } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const emptyForm = (): Batch => ({ batchName: '', subject: '', classGrade: '', daysOfWeek: '' });
const fields: Array<[keyof Batch, string]> = [
  ['batchName', 'Batch Name'],
  ['subject', 'Subject'],
  ['classGrade', 'Class'],
  ['daysOfWeek', 'Days'],
  ['startTime', 'Start Time'],
  ['endTime', 'End Time']
];

export default function BatchesPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Batch>(emptyForm());
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['batches'], queryFn: api.batches });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['batches'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['students'] });
  };
  const create = useMutation({ mutationFn: (payload: Batch) => api.createBatch(payload), onSuccess: () => { invalidate(); closeDialog(); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Batch }) => api.updateBatch(id, payload), onSuccess: () => { invalidate(); closeDialog(); } });
  const remove = useMutation({ mutationFn: (id: number) => api.deleteBatch(id), onSuccess: invalidate });

  function closeDialog() {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(item: Batch) {
    setEditingId(item.id ?? null);
    setForm({
      batchName: item.batchName,
      subject: item.subject,
      classGrade: item.classGrade,
      daysOfWeek: item.daysOfWeek ?? '',
      startTime: item.startTime ?? '',
      endTime: item.endTime ?? '',
      maximumStudents: item.maximumStudents
    });
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (editingId) update.mutate({ id: editingId, payload: form });
    else create.mutate(form);
  }

  function handleDelete(item: Batch) {
    if (!item.id || !window.confirm(`Delete batch "${item.batchName}"?`)) return;
    remove.mutate(item.id);
  }

  return (
    <>
      <PageHeader title="Batches" subtitle="Create and review timetable batches." actionLabel="Add Batch" onAction={openCreate} />
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Batch Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.batchName}</TableCell>
                  <TableCell>{item.subject}</TableCell>
                  <TableCell>{item.classGrade}</TableCell>
                  <TableCell>{item.daysOfWeek}</TableCell>
                  <TableCell>{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : '—'}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                      <IconButton size="small" aria-label="Edit batch" onClick={() => openEdit(item)}><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" aria-label="Delete batch" onClick={() => handleDelete(item)}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Batch' : 'Add Batch'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
            {fields.map(([key, label]) => (
              <TextField
                key={key}
                label={label}
                fullWidth
                type={key === 'startTime' || key === 'endTime' ? 'time' : 'text'}
                value={String(form[key] ?? '')}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                slotProps={key === 'startTime' || key === 'endTime' ? { inputLabel: { shrink: true } } : undefined}
              />
            ))}
            <TextField
              label="Maximum Students"
              type="number"
              fullWidth
              value={form.maximumStudents ?? ''}
              onChange={(e) => setForm({ ...form, maximumStudents: e.target.value ? Number(e.target.value) : undefined })}
            />
            <Button type="submit" disabled={create.isPending || update.isPending}>{editingId ? 'Update Batch' : 'Save Batch'}</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
