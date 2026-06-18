import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { api, Expense } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = (): Expense => ({
  expenseCategory: 'MISCELLANEOUS',
  amount: 0,
  vendorName: '',
  paymentMethod: 'UPI',
  expenseDate: today(),
  description: ''
});

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Expense>(emptyForm());
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['expenses'], queryFn: api.expenses });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
  const create = useMutation({ mutationFn: api.createExpense, onSuccess: () => { invalidate(); closeDialog(); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Expense }) => api.updateExpense(id, payload), onSuccess: () => { invalidate(); closeDialog(); } });
  const remove = useMutation({ mutationFn: (id: number) => api.deleteExpense(id), onSuccess: invalidate });

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

  function openEdit(expense: Expense) {
    setEditingId(expense.id ?? null);
    setForm({
      expenseId: expense.expenseId,
      expenseCategory: expense.expenseCategory,
      amount: expense.amount,
      vendorName: expense.vendorName ?? '',
      paymentMethod: expense.paymentMethod ?? 'UPI',
      expenseDate: expense.expenseDate ?? today(),
      description: expense.description ?? ''
    });
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (editingId) update.mutate({ id: editingId, payload: form });
    else create.mutate(form);
  }

  function handleDelete(expense: Expense) {
    const label = expense.vendorName || expense.expenseId || 'this expense';
    if (!expense.id || !window.confirm(`Delete expense for "${label}"?`)) return;
    remove.mutate(expense.id);
  }

  return (
    <>
      <PageHeader title="Expenses" subtitle="Track rent, utilities, materials, transport, marketing, and miscellaneous costs." actionLabel="Add Expense" onAction={openCreate} />
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.expenseId}</TableCell>
                  <TableCell>{expense.expenseDate}</TableCell>
                  <TableCell>{expense.expenseCategory}</TableCell>
                  <TableCell>₹{expense.amount}</TableCell>
                  <TableCell>{expense.vendorName}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                      <IconButton size="small" aria-label="Edit expense" onClick={() => openEdit(expense)}><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" aria-label="Delete expense" onClick={() => handleDelete(expense)}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
            <TextField label="Category" value={form.expenseCategory} onChange={(e) => setForm({ ...form, expenseCategory: e.target.value })} />
            <TextField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            <TextField label="Vendor" value={form.vendorName ?? ''} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} />
            <TextField label="Payment Method" value={form.paymentMethod ?? ''} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} />
            <TextField label="Date" type="date" value={form.expenseDate ?? ''} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline minRows={2} />
            <Button type="submit" disabled={create.isPending || update.isPending}>{editingId ? 'Update Expense' : 'Save Expense'}</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
