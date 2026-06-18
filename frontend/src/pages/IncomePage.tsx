import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { api, IncomeEntry } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = (): IncomeEntry => ({
  source: 'Tuition Fees',
  amount: 0,
  incomeDate: today(),
  description: ''
});

export default function IncomePage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<IncomeEntry>(emptyForm());
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['income'], queryFn: api.income });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['income'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
  const create = useMutation({ mutationFn: api.createIncome, onSuccess: () => { invalidate(); closeDialog(); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: IncomeEntry }) => api.updateIncome(id, payload), onSuccess: () => { invalidate(); closeDialog(); } });
  const remove = useMutation({ mutationFn: (id: number) => api.deleteIncome(id), onSuccess: invalidate });

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

  function openEdit(entry: IncomeEntry) {
    setEditingId(entry.id ?? null);
    setForm({
      incomeId: entry.incomeId,
      source: entry.source,
      amount: entry.amount,
      incomeDate: entry.incomeDate ?? today(),
      description: entry.description ?? ''
    });
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (editingId) update.mutate({ id: editingId, payload: form });
    else create.mutate(form);
  }

  function handleDelete(entry: IncomeEntry) {
    const label = entry.source || entry.incomeId || 'this income';
    if (!entry.id || !window.confirm(`Delete income entry "${label}"?`)) return;
    remove.mutate(entry.id);
  }

  return (
    <>
      <PageHeader title="Income" subtitle="Track tuition fees, admission fees, crash courses, and other income." actionLabel="Add Income" onAction={openCreate} />
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.incomeId}</TableCell>
                  <TableCell>{entry.incomeDate}</TableCell>
                  <TableCell>{entry.source}</TableCell>
                  <TableCell>₹{entry.amount}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                      <IconButton size="small" aria-label="Edit income" onClick={() => openEdit(entry)}><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" aria-label="Delete income" onClick={() => handleDelete(entry)}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Income' : 'Add Income'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
            <TextField label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <TextField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            <TextField label="Date" type="date" value={form.incomeDate ?? ''} onChange={(e) => setForm({ ...form, incomeDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline minRows={2} />
            <Button type="submit" disabled={create.isPending || update.isPending}>{editingId ? 'Update Income' : 'Save Income'}</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
