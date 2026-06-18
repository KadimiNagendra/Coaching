import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { api, Exam } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export default function ExamsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Exam>({ examName: '', subject: '', classGrade: '', examDate: '' });
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['exams'], queryFn: api.exams });
  const create = useMutation({ mutationFn: (payload: Exam) => api.createExam(payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exams'] }); setOpen(false); } });
  function submit(event: FormEvent) { event.preventDefault(); create.mutate(form); }
  return <><PageHeader title="Exams" subtitle="Schedule tests and prepare progress tracking." actionLabel="Add Exam" onAction={() => setOpen(true)} /><Card><CardContent><Table><TableHead><TableRow><TableCell>Exam Name</TableCell><TableCell>Subject</TableCell><TableCell>Class</TableCell><TableCell>Date</TableCell></TableRow></TableHead><TableBody>{data.map((item) => <TableRow key={item.id}><TableCell>{item.examName}</TableCell><TableCell>{item.subject}</TableCell><TableCell>{item.classGrade}</TableCell><TableCell>{item.examDate}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card><Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Add Exam</DialogTitle><DialogContent><Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>{[['examName', 'Exam Name'], ['subject', 'Subject'], ['classGrade', 'Class'], ['examDate', 'Date']].map(([key, label]) => <TextField key={key} label={label} fullWidth value={String(form[key as keyof Exam] ?? '')} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}<Button type="submit">Save</Button></Stack></DialogContent></Dialog></>;
}
