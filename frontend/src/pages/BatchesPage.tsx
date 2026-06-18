import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { api, Batch } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export default function BatchesPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Batch>({ batchName: '', subject: '', classGrade: '', daysOfWeek: '' });
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['batches'], queryFn: api.batches });
  const create = useMutation({ mutationFn: (payload: Batch) => api.createBatch(payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['batches'] }); setOpen(false); } });
  function submit(event: FormEvent) { event.preventDefault(); create.mutate(form); }
  return <><PageHeader title="Batches" subtitle="Create and review timetable batches." actionLabel="Add Batch" onAction={() => setOpen(true)} /><Card><CardContent><Table><TableHead><TableRow><TableCell>Batch Name</TableCell><TableCell>Subject</TableCell><TableCell>Class</TableCell><TableCell>Days</TableCell></TableRow></TableHead><TableBody>{data.map((item) => <TableRow key={item.id}><TableCell>{item.batchName}</TableCell><TableCell>{item.subject}</TableCell><TableCell>{item.classGrade}</TableCell><TableCell>{item.daysOfWeek}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card><Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Add Batch</DialogTitle><DialogContent><Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>{[['batchName', 'Batch Name'], ['subject', 'Subject'], ['classGrade', 'Class'], ['daysOfWeek', 'Days']].map(([key, label]) => <TextField key={key} label={label} fullWidth value={String(form[key as keyof Batch] ?? '')} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}<Button type="submit">Save</Button></Stack></DialogContent></Dialog></>;
}
