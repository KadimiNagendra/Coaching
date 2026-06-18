import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { api, Expense } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Expense>({ expenseCategory: 'MISCELLANEOUS', amount: 0, vendorName: '', paymentMethod: 'UPI' });
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['expenses'], queryFn: api.expenses });
  const create = useMutation({ mutationFn: api.createExpense, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); setOpen(false); } });
  function submit(event: FormEvent) { event.preventDefault(); create.mutate(form); }
  return <><PageHeader title="Expenses" subtitle="Track rent, utilities, materials, transport, marketing, and miscellaneous costs." actionLabel="Add Expense" onAction={() => setOpen(true)} /><Card><CardContent><Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>Date</TableCell><TableCell>Category</TableCell><TableCell>Amount</TableCell><TableCell>Vendor</TableCell></TableRow></TableHead><TableBody>{data.map((expense) => <TableRow key={expense.id}><TableCell>{expense.expenseId}</TableCell><TableCell>{expense.expenseDate}</TableCell><TableCell>{expense.expenseCategory}</TableCell><TableCell>?{expense.amount}</TableCell><TableCell>{expense.vendorName}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card><Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Add Expense</DialogTitle><DialogContent><Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}><TextField label="Category" value={form.expenseCategory} onChange={(e) => setForm({ ...form, expenseCategory: e.target.value })} /><TextField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /><TextField label="Vendor" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} /><TextField label="Payment Method" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /><Button type="submit">Save Expense</Button></Stack></DialogContent></Dialog></>;
}
