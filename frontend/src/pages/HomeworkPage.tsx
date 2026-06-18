import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { api, Homework } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export default function HomeworkPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Homework>({ title: '', subject: '', description: '', dueDate: '' });
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['homework'], queryFn: api.homework });
  const create = useMutation({ mutationFn: (payload: Homework) => api.createHomework(payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['homework'] }); setOpen(false); } });
  function submit(event: FormEvent) { event.preventDefault(); create.mutate(form); }
  return <><PageHeader title="Homework" subtitle="Assign work, due dates, and feedback." actionLabel="Assign Homework" onAction={() => setOpen(true)} /><Card><CardContent><Table><TableHead><TableRow><TableCell>Title</TableCell><TableCell>Subject</TableCell><TableCell>Description</TableCell><TableCell>Due Date</TableCell></TableRow></TableHead><TableBody>{data.map((item) => <TableRow key={item.id}><TableCell>{item.title}</TableCell><TableCell>{item.subject}</TableCell><TableCell>{item.description}</TableCell><TableCell>{item.dueDate}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card><Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Assign Homework</DialogTitle><DialogContent><Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>{[['title', 'Title'], ['subject', 'Subject'], ['description', 'Description'], ['dueDate', 'Due Date']].map(([key, label]) => <TextField key={key} label={label} fullWidth value={String(form[key as keyof Homework] ?? '')} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}<Button type="submit">Save</Button></Stack></DialogContent></Dialog></>;
}
