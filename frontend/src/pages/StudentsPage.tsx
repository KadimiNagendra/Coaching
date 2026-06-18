import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Card, CardContent, Dialog, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Chip, Typography } from '@mui/material';
import { api, Student } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Student>({ studentName: '', classGrade: '', subjectsEnrolled: '', monthlyFee: 0, parent: { name: '', mobileNumber: '' }, status: 'ACTIVE' });
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['students'], queryFn: api.students });
  const create = useMutation({ mutationFn: api.createStudent, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); setOpen(false); } });
  function submit(event: FormEvent) { event.preventDefault(); create.mutate(form); }

  return (
    <>
      <PageHeader title="Students" subtitle="Manage student profiles, parents, batches, subjects, and fee defaults." actionLabel="Add Student" onAction={() => setOpen(true)} />
      <Card><CardContent><Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Class</TableCell><TableCell>Subjects</TableCell><TableCell>Parent</TableCell><TableCell>Monthly Fee</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{data.map((student) => <TableRow key={student.id}><TableCell>{student.studentId}</TableCell><TableCell><Typography sx={{ fontWeight: 700 }}>{student.studentName}</Typography><Typography variant="caption" color="text.secondary">{student.schoolName}</Typography></TableCell><TableCell>{student.classGrade}</TableCell><TableCell>{student.subjectsEnrolled}</TableCell><TableCell>{student.parent?.name}<br />{student.parent?.mobileNumber}</TableCell><TableCell>?{student.monthlyFee}</TableCell><TableCell><Chip label={student.status} color={student.status === 'ACTIVE' ? 'success' : 'default'} size="small" /></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Add Student</DialogTitle><DialogContent><Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}><TextField label="Student Name" fullWidth required value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} /><TextField label="Class/Grade" fullWidth required value={form.classGrade} onChange={(e) => setForm({ ...form, classGrade: e.target.value })} /><TextField label="Subjects" fullWidth value={form.subjectsEnrolled} onChange={(e) => setForm({ ...form, subjectsEnrolled: e.target.value })} /><TextField label="Parent Name" fullWidth value={form.parent?.name ?? ''} onChange={(e) => setForm({ ...form, parent: { ...(form.parent ?? { mobileNumber: '' }), name: e.target.value } })} /><TextField label="Parent Mobile" fullWidth value={form.parent?.mobileNumber ?? ''} onChange={(e) => setForm({ ...form, parent: { ...(form.parent ?? { name: '' }), mobileNumber: e.target.value } })} /><TextField label="Monthly Fee" type="number" fullWidth value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })} /></Box><Button type="submit">Save Student</Button></Stack></DialogContent></Dialog>
    </>
  );
}
