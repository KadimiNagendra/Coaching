import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { api, IncomeEntry } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export default function IncomePage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<IncomeEntry>({ source: 'Tuition Fees', amount: 0, description: '' });
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['income'], queryFn: api.income });
  const create = useMutation({ mutationFn: api.createIncome, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['income'] }); setOpen(false); } });
  function submit(event: FormEvent) { event.preventDefault(); create.mutate(form); }
  return <><PageHeader title="Income" subtitle="Track tuition fees, admission fees, crash courses, and other income." actionLabel="Add Income" onAction={() => setOpen(true)} /><Card><CardContent><Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>Date</TableCell><TableCell>Source</TableCell><TableCell>Amount</TableCell><TableCell>Description</TableCell></TableRow></TableHead><TableBody>{data.map((entry) => <TableRow key={entry.id}><TableCell>{entry.incomeId}</TableCell><TableCell>{entry.incomeDate}</TableCell><TableCell>{entry.source}</TableCell><TableCell>?{entry.amount}</TableCell><TableCell>{entry.description}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card><Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Add Income</DialogTitle><DialogContent><Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}><TextField label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /><TextField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /><TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><Button type="submit">Save Income</Button></Stack></DialogContent></Dialog></>;
}
