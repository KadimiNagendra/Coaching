import { FormEvent, useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem, Typography } from '@mui/material';
import { api, TopicPlan, Batch } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const emptyForm = (): Partial<TopicPlan> => ({
  planDate: new Date().toISOString().slice(0, 10),
  batch: undefined,
  subject: '',
  chapter: '',
  topic: ''
});

export default function TopicsMasterPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<TopicPlan>>(emptyForm());
  const queryClient = useQueryClient();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterBatchId, setFilterBatchId] = useState<number | 'ALL'>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');

  // History Filters State
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [historyBatchId, setHistoryBatchId] = useState<number | 'ALL'>('ALL');
  const [historySubject, setHistorySubject] = useState<string>('ALL');

  // Queries
  const { data: plans = [] } = useQuery({ queryKey: ['topic-plans'], queryFn: api.topicPlans });
  const { data: batches = [] } = useQuery({ queryKey: ['batches'], queryFn: api.batches });

  // Subjects derived from batches
  const availableSubjects = useMemo(() => {
    return Array.from(new Set(batches.map(b => b.subject))).filter(Boolean);
  }, [batches]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const historyPlans = useMemo(() => {
    return plans.filter(p => {
      const isPast = p.planDate < todayStr;
      const matchStart = !historyStartDate || p.planDate >= historyStartDate;
      const matchEnd = !historyEndDate || p.planDate <= historyEndDate;
      const matchBatch = historyBatchId === 'ALL' || p.batch?.id === Number(historyBatchId);
      const matchSubject = historySubject === 'ALL' || p.subject.toLowerCase() === historySubject.toLowerCase();
      return isPast && matchStart && matchEnd && matchBatch && matchSubject;
    }).sort((a, b) => b.planDate.localeCompare(a.planDate));
  }, [plans, todayStr, historyStartDate, historyEndDate, historyBatchId, historySubject]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['topic-plans'] });
  const create = useMutation({ mutationFn: api.createTopicPlan, onSuccess: () => { invalidate(); closeDialog(); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: TopicPlan }) => api.updateTopicPlan(id, payload), onSuccess: () => { invalidate(); closeDialog(); } });
  const remove = useMutation({ mutationFn: api.deleteTopicPlan, onSuccess: () => { invalidate(); } });

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

  function openEdit(plan: TopicPlan) {
    setEditingId(plan.id ?? null);
    setForm({
      planDate: plan.planDate,
      batch: plan.batch,
      subject: plan.subject,
      chapter: plan.chapter,
      topic: plan.topic
    });
    setOpen(true);
  }

  function handleDelete(id?: number) {
    if (!id || !window.confirm('Are you sure you want to delete this topic plan?')) return;
    remove.mutate(id);
  }

  function handleBatchChange(batchId: number | '') {
    if (!batchId) {
      setForm({ ...form, batch: undefined, subject: '' });
    } else {
      const selected = batches.find(b => b.id === batchId);
      if (selected) {
        setForm({ ...form, batch: selected, subject: selected.subject });
      }
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.planDate || !form.batch || !form.subject || !form.chapter || !form.topic) {
      alert('Please fill out all required fields.');
      return;
    }
    const payload = form as TopicPlan;
    if (editingId) {
      update.mutate({ id: editingId, payload });
    } else {
      create.mutate(payload);
    }
  }

  // Filtered plans logic
  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchSearch = searchQuery.trim() === '' || 
        p.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDate = filterDate === '' || p.planDate === filterDate;
      const matchBatch = filterBatchId === 'ALL' || p.batch?.id === Number(filterBatchId);
      const matchSubject = filterSubject === 'ALL' || p.subject.toLowerCase() === filterSubject.toLowerCase();

      return matchSearch && matchDate && matchBatch && matchSubject;
    }).sort((a, b) => b.planDate.localeCompare(a.planDate)); // Sort by date descending
  }, [plans, searchQuery, filterDate, filterBatchId, filterSubject]);

  const hasActiveFilters = searchQuery !== '' || filterDate !== '' || filterBatchId !== 'ALL' || filterSubject !== 'ALL';

  function clearFilters() {
    setSearchQuery('');
    setFilterDate('');
    setFilterBatchId('ALL');
    setFilterSubject('ALL');
  }

  return (
    <>
      <PageHeader
        title="Topics Master"
        subtitle="Maintain and plan topics to be covered class-wise and date-wise."
        actionLabel="Add Topic Plan"
        onAction={openCreate}
      />

      {/* Filter controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Stack sx={{ flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }} spacing={2}>
            <TextField
              placeholder="Search topic or chapter..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />

            <TextField
              type="date"
              label="Filter by Date"
              size="small"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 150 }}
            />

            <TextField
              select
              label="Filter by Class/Batch"
              size="small"
              value={filterBatchId}
              onChange={(e) => setFilterBatchId(e.target.value as any)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="ALL">All Batches</MenuItem>
              {batches.map(b => (
                <MenuItem key={b.id} value={b.id}>{b.batchName} ({b.classGrade})</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Filter by Subject"
              size="small"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="ALL">All Subjects</MenuItem>
              {availableSubjects.map(sub => (
                <MenuItem key={sub} value={sub}>{sub}</MenuItem>
              ))}
            </TextField>

            {hasActiveFilters && (
              <IconButton color="secondary" onClick={clearFilters} title="Clear Filters">
                <ClearIcon />
              </IconButton>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Class/Batch</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Chapter</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{plan.planDate}</TableCell>
                  <TableCell>{plan.batch?.batchName ?? '—'}</TableCell>
                  <TableCell>{plan.subject}</TableCell>
                  <TableCell>{plan.chapter}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{plan.topic}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label="Edit plan" onClick={() => openEdit(plan)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="Delete plan" color="error" onClick={() => handleDelete(plan.id)}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPlans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No planned topics found. Click "Add Topic Plan" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Topics Covered History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Topics Covered History</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Historical teaching records planned in the past.
          </Typography>
          
          {/* Filter controls */}
          <Stack sx={{ flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', mb: 3 }} spacing={2}>
            <TextField
              type="date"
              label="Start Date"
              size="small"
              value={historyStartDate}
              onChange={(e) => setHistoryStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 150, width: { xs: '100%', md: 'auto' } }}
            />

            <TextField
              type="date"
              label="End Date"
              size="small"
              value={historyEndDate}
              onChange={(e) => setHistoryEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 150, width: { xs: '100%', md: 'auto' } }}
            />

            <TextField
              select
              label="Filter by Class/Batch"
              size="small"
              value={historyBatchId}
              onChange={(e) => setHistoryBatchId(e.target.value as any)}
              sx={{ minWidth: 180, width: { xs: '100%', md: 'auto' } }}
            >
              <MenuItem value="ALL">All Batches</MenuItem>
              {batches.map(b => (
                <MenuItem key={b.id} value={b.id}>{b.batchName} ({b.classGrade})</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Filter by Subject"
              size="small"
              value={historySubject}
              onChange={(e) => setHistorySubject(e.target.value)}
              sx={{ minWidth: 160, width: { xs: '100%', md: 'auto' } }}
            >
              <MenuItem value="ALL">All Subjects</MenuItem>
              {availableSubjects.map(sub => (
                <MenuItem key={sub} value={sub}>{sub}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Class/Batch</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Chapter</TableCell>
                <TableCell>Topic</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyPlans.map((plan) => (
                <TableRow key={plan.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{plan.planDate}</TableCell>
                  <TableCell>{plan.batch?.batchName ?? '—'}</TableCell>
                  <TableCell>{plan.subject}</TableCell>
                  <TableCell>{plan.chapter}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{plan.topic}</TableCell>
                </TableRow>
              ))}
              {historyPlans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No historical topic records found matching the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Edit Topic Plan' : 'Add Topic Plan'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2.5} sx={{ mt: 1.5 }} onSubmit={submit}>
            <TextField
              type="date"
              label="Date"
              required
              fullWidth
              value={form.planDate}
              onChange={(e) => setForm({ ...form, planDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              select
              label="Select Batch"
              required
              fullWidth
              value={form.batch?.id ?? ''}
              onChange={(e) => handleBatchChange(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">-- Select Batch --</MenuItem>
              {batches.map(b => (
                <MenuItem key={b.id} value={b.id}>{b.batchName} ({b.classGrade})</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Subject"
              required
              fullWidth
              value={form.subject ?? ''}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <TextField
              label="Chapter"
              required
              fullWidth
              value={form.chapter ?? ''}
              onChange={(e) => setForm({ ...form, chapter: e.target.value })}
              placeholder="e.g. Algebra"
            />
            <TextField
              label="Topic"
              required
              fullWidth
              value={form.topic ?? ''}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g. Linear Equations"
            />
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 1 }}>
              <Button variant="outlined" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={create.isPending || update.isPending}>
                {editingId ? 'Update Plan' : 'Save Plan'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
