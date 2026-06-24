import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { api, Student } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const emptyForm = (): Student => ({
  studentName: '',
  classGrade: '',
  schoolName: '',
  subjectsEnrolled: '',
  monthlyFee: 0,
  parent: { name: '', mobileNumber: '' },
  status: 'ACTIVE'
});

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Student>(emptyForm());
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['students'], queryFn: api.students });

  const selectedStudent = data.find(s => s.id === selectedStudentId);

  function toggleCredentials(studentId: number) {
    setSelectedStudentId((prev) => (prev === studentId ? null : studentId));
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['students'] });
  const create = useMutation({ mutationFn: api.createStudent, onSuccess: () => { invalidate(); closeDialog(); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Student }) => api.updateStudent(id, payload), onSuccess: () => { invalidate(); closeDialog(); } });

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

  function openEdit(student: Student) {
    setEditingId(student.id ?? null);
    setForm({
      studentId: student.studentId,
      studentName: student.studentName,
      classGrade: student.classGrade,
      schoolName: student.schoolName ?? '',
      subjectsEnrolled: student.subjectsEnrolled ?? '',
      monthlyFee: student.monthlyFee ?? 0,
      status: student.status ?? 'ACTIVE',
      parent: {
        id: student.parent?.id,
        name: student.parent?.name ?? '',
        mobileNumber: student.parent?.mobileNumber ?? '',
        email: student.parent?.email,
        address: student.parent?.address
      },
      batch: student.batch
    });
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (editingId) update.mutate({ id: editingId, payload: form });
    else create.mutate(form);
  }

  return (
    <>
      <PageHeader title="Students" subtitle="Manage student profiles, parents, batches, subjects, and fee defaults." actionLabel="Add Student" onAction={openCreate} />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: selectedStudent ? { xs: '1fr', lg: '1fr 360px' } : '1fr', gap: 3, alignItems: 'start' }}>
        <Card sx={{ overflowX: 'auto' }}>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell>Monthly Fee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((student) => (
                  <TableRow key={student.id} selected={selectedStudentId === student.id}>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{student.studentName}</Typography>
                      <Typography variant="caption" color="text.secondary">{student.schoolName}</Typography>
                    </TableCell>
                    <TableCell>{student.classGrade}</TableCell>
                    <TableCell>{student.subjectsEnrolled}</TableCell>
                    <TableCell>{student.parent?.name}<br />{student.parent?.mobileNumber}</TableCell>
                    <TableCell>₹{student.monthlyFee}</TableCell>
                    <TableCell><Chip label={student.status} color={student.status === 'ACTIVE' ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="View credentials"
                        color={selectedStudentId === student.id ? 'primary' : 'default'}
                        onClick={() => toggleCredentials(student.id!)}
                        sx={{ mr: 1 }}
                      >
                        <VpnKeyOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" aria-label="Edit student" onClick={() => openEdit(student)}><EditOutlinedIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedStudent && (
          <Card sx={{ border: '1px solid', borderColor: 'divider', position: 'sticky', top: 24 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ mb: 2.5, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Portal Credentials
                </Typography>
                <IconButton size="small" onClick={() => setSelectedStudentId(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Student: {selectedStudent.studentName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                ID: {selectedStudent.studentId}
              </Typography>

              <Stack spacing={3.5}>
                {/* Student Credentials Box */}
                <Box sx={{ p: 2, bgcolor: alpha('#4f46e5', 0.04), borderRadius: 2, border: '1px solid', borderColor: alpha('#4f46e5', 0.12) }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VpnKeyOutlinedIcon fontSize="small" /> Student Account
                  </Typography>
                  
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Username</Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}>
                          {selectedStudent.initialStudentUsername || 'N/A'}
                        </Typography>
                        {selectedStudent.initialStudentUsername && (
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(selectedStudent.initialStudentUsername || '')}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Initial Password</Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {selectedStudent.initialStudentPassword || 'N/A'}
                        </Typography>
                        {selectedStudent.initialStudentPassword && (
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(selectedStudent.initialStudentPassword || '')}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                {/* Parent Credentials Box */}
                <Box sx={{ p: 2, bgcolor: alpha('#0d9488', 0.04), borderRadius: 2, border: '1px solid', borderColor: alpha('#0d9488', 0.12) }}>
                  <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VpnKeyOutlinedIcon fontSize="small" /> Parent Account
                  </Typography>
                  
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Username</Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}>
                          {selectedStudent.initialParentUsername || 'N/A'}
                        </Typography>
                        {selectedStudent.initialParentUsername && (
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(selectedStudent.initialParentUsername || '')}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Initial Password</Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {selectedStudent.initialParentPassword || 'N/A'}
                        </Typography>
                        {selectedStudent.initialParentPassword && (
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(selectedStudent.initialParentPassword || '')}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2.5, display: 'block', textAlign: 'center' }}>
                Note: Users can reset these credentials after they sign in.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField label="Student Name" fullWidth required value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
              <TextField label="Class/Grade" fullWidth required value={form.classGrade} onChange={(e) => setForm({ ...form, classGrade: e.target.value })} />
              <TextField label="School Name" fullWidth value={form.schoolName ?? ''} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
              <TextField label="Subjects" fullWidth value={form.subjectsEnrolled ?? ''} onChange={(e) => setForm({ ...form, subjectsEnrolled: e.target.value })} />
              <TextField label="Parent Name" fullWidth value={form.parent?.name ?? ''} onChange={(e) => setForm({ ...form, parent: { ...(form.parent ?? { mobileNumber: '' }), name: e.target.value } })} />
              <TextField label="Parent Mobile" fullWidth value={form.parent?.mobileNumber ?? ''} onChange={(e) => setForm({ ...form, parent: { ...(form.parent ?? { name: '' }), mobileNumber: e.target.value } })} />
              <TextField label="Monthly Fee" type="number" fullWidth value={(form.monthlyFee ?? 0) === 0 ? '' : form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value === '' ? 0 : Number(e.target.value) })} slotProps={{ htmlInput: { min: 0 } }} />
              <TextField select label="Status" fullWidth value={form.status ?? 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value as Student['status'] })}>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>
            </Box>
            <Button type="submit" disabled={create.isPending || update.isPending}>{editingId ? 'Update Student' : 'Save Student'}</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
