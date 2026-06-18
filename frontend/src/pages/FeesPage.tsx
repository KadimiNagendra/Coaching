import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { api, FeePayment } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';

type PaymentForm = {
  paidAmount: number;
  discountAmount: number;
  paymentDate: string;
  paymentMode: string;
  remarks: string;
};

type StudentFeeStatus = {
  student: FeePayment['student'];
  feeMonth: string;
  feeAmount: number;
  totalPaid: number;
  totalDiscount: number;
  currentDue: number;
};

type FeeListView = 'collected' | 'outstanding' | 'fullyPaid';

const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);
const money = (value?: number) => `Rs ${Number(value ?? 0).toLocaleString('en-IN')}`;

const defaultForm = (paidAmount = 0): PaymentForm => ({
  paidAmount,
  discountAmount: 0,
  paymentDate: today(),
  paymentMode: 'UPI',
  remarks: ''
});

export default function FeesPage() {
  const [feeMonth, setFeeMonth] = useState(currentMonth());
  const [selectedStatus, setSelectedStatus] = useState<StudentFeeStatus | null>(null);
  const [listView, setListView] = useState<FeeListView | null>(null);
  const [form, setForm] = useState<PaymentForm>(defaultForm());
  const queryClient = useQueryClient();
  const { data: payments = [] } = useQuery({ queryKey: ['fees'], queryFn: api.fees });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: api.students });

  const studentStatuses = useMemo(() => students
    .filter((student) => student.id && student.status !== 'INACTIVE')
    .map((student) => {
      const studentPayments = payments.filter((payment) => payment.feeMonth === feeMonth && payment.student?.id === student.id);
      const feeAmount = Number(studentPayments[0]?.feeAmount ?? student.monthlyFee ?? 0);
      const totalPaid = studentPayments.reduce((sum, payment) => sum + Number(payment.paidAmount ?? 0), 0);
      const totalDiscount = studentPayments.reduce((sum, payment) => sum + Number(payment.discountAmount ?? 0), 0);
      return {
        student,
        feeMonth,
        feeAmount,
        totalPaid,
        totalDiscount,
        currentDue: Math.max(0, feeAmount - totalPaid - totalDiscount)
      };
    })
    .sort((a, b) => a.student.studentName.localeCompare(b.student.studentName)), [feeMonth, payments, students]);

  const monthPayments = useMemo(
    () => payments.filter((payment) => payment.feeMonth === feeMonth),
    [feeMonth, payments]
  );

  const monthSummary = useMemo(() => {
    const totalExpected = studentStatuses.reduce((sum, status) => sum + status.feeAmount, 0);
    const totalCollected = studentStatuses.reduce((sum, status) => sum + status.totalPaid, 0);
    const totalDue = studentStatuses.reduce((sum, status) => sum + status.currentDue, 0);
    const paidCount = studentStatuses.filter((status) => status.currentDue === 0).length;
    return { totalExpected, totalCollected, totalDue, paidCount };
  }, [studentStatuses]);

  const listDialog = useMemo(() => {
    if (!listView) return null;
    const filters: Record<FeeListView, (status: StudentFeeStatus) => boolean> = {
      collected: (status) => status.totalPaid > 0,
      outstanding: (status) => status.currentDue > 0,
      fullyPaid: (status) => status.currentDue === 0
    };
    const titles: Record<FeeListView, string> = {
      collected: 'Students Who Paid',
      outstanding: 'Students With Outstanding Due',
      fullyPaid: 'Students Fully Paid'
    };
    return {
      title: titles[listView],
      students: studentStatuses.filter(filters[listView])
    };
  }, [listView, studentStatuses]);

  const create = useMutation({
    mutationFn: (payment: FeePayment) => api.createPayment(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedStatus(null);
      setForm(defaultForm());
    }
  });

  function openStudent(status: StudentFeeStatus) {
    setSelectedStatus(status);
    setForm(defaultForm(status.currentDue));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedStatus) return;
    create.mutate({
      student: selectedStatus.student,
      feeMonth: selectedStatus.feeMonth,
      feeAmount: selectedStatus.feeAmount,
      discountAmount: form.discountAmount,
      paidAmount: form.paidAmount,
      dueAmount: 0,
      paymentDate: form.paymentDate,
      paymentMode: form.paymentMode,
      remarks: form.remarks || `Fee payment for ${selectedStatus.feeMonth}`
    });
  }

  return (
    <>
      <PageHeader title="Fees" subtitle="Choose a month, click a student, and update that student's fee payment." />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
        <StatCard label="Expected Fees" value={money(monthSummary.totalExpected)} helper={feeMonth} accent="primary" />
        <StatCard label="Collected" value={money(monthSummary.totalCollected)} helper={`${monthPayments.length} payments`} accent="success" onClick={() => setListView('collected')} />
        <StatCard label="Outstanding Due" value={money(monthSummary.totalDue)} helper="Needs collection" accent="warning" onClick={() => setListView('outstanding')} />
        <StatCard label="Fully Paid" value={`${monthSummary.paidCount}/${studentStatuses.length}`} helper="Students cleared" accent="info" onClick={() => setListView('fullyPaid')} />
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              mb: 2,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: alpha('#0f172a', 0.08)
            }}
          >
            <Box>
              <Typography variant="h6">Student Fee List</Typography>
              <Typography variant="body2" color="text.secondary">Click a row to record or update payment</Typography>
            </Box>
            <TextField label="Fee Month" type="month" value={feeMonth} onChange={(event) => setFeeMonth(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 180 }} />
          </Stack>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Monthly Fee</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Due</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentStatuses.map((status) => (
                <TableRow key={status.student.id} hover onClick={() => openStudent(status)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{status.student.studentName}</TableCell>
                  <TableCell>{status.student.classGrade}</TableCell>
                  <TableCell>{money(status.feeAmount)}</TableCell>
                  <TableCell>{money(status.totalPaid)}</TableCell>
                  <TableCell>{money(status.totalDiscount)}</TableCell>
                  <TableCell><Chip label={money(status.currentDue)} color={status.currentDue > 0 ? 'warning' : 'success'} size="small" /></TableCell>
                  <TableCell>
                    <Chip
                      label={status.currentDue > 0 ? 'Pending' : 'Paid'}
                      color={status.currentDue > 0 ? 'default' : 'success'}
                      size="small"
                      variant={status.currentDue > 0 ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: alpha('#0f172a', 0.08) }}>
            <Typography variant="h6">Payment History</Typography>
            <Typography variant="body2" color="text.secondary">{feeMonth}</Typography>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payment ID</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Remaining After Payment</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.paymentId}</TableCell>
                  <TableCell>{payment.student?.studentName}</TableCell>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>{money(payment.paidAmount)}</TableCell>
                  <TableCell>{money(payment.discountAmount)}</TableCell>
                  <TableCell><Chip label={money(payment.dueAmount)} color={payment.dueAmount > 0 ? 'warning' : 'success'} size="small" /></TableCell>
                  <TableCell>{payment.paymentMode}</TableCell>
                  <TableCell>{payment.remarks}</TableCell>
                </TableRow>
              ))}
              {monthPayments.length === 0 && <TableRow><TableCell colSpan={8}>No payments recorded for this month yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(listDialog)} onClose={() => setListView(null)} maxWidth="md" fullWidth>
        <DialogTitle>{listDialog?.title} — {feeMonth}</DialogTitle>
        <DialogContent>
          <Table sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Monthly Fee</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Due</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listDialog?.students.map((status) => (
                <TableRow
                  key={status.student.id}
                  hover
                  onClick={() => { setListView(null); openStudent(status); }}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{status.student.studentName}</TableCell>
                  <TableCell>{status.student.classGrade}</TableCell>
                  <TableCell>{money(status.feeAmount)}</TableCell>
                  <TableCell>{money(status.totalPaid)}</TableCell>
                  <TableCell>{money(status.totalDiscount)}</TableCell>
                  <TableCell>
                    <Chip label={money(status.currentDue)} color={status.currentDue > 0 ? 'warning' : 'success'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
              {listDialog && listDialog.students.length === 0 && (
                <TableRow><TableCell colSpan={6}>No students in this list for {feeMonth}.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedStatus)} onClose={() => setSelectedStatus(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Fee - {selectedStatus?.student.studentName}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
            <Typography color="text.secondary">
              Month: {selectedStatus?.feeMonth} | Fee: {money(selectedStatus?.feeAmount)} | Current Due: {money(selectedStatus?.currentDue)}
            </Typography>
            <TextField label="Paid Amount" type="number" value={form.paidAmount} onChange={(event) => setForm({ ...form, paidAmount: Number(event.target.value) })} required autoFocus />
            <TextField label="Discount" type="number" value={form.discountAmount} onChange={(event) => setForm({ ...form, discountAmount: Number(event.target.value) })} />
            <TextField label="Payment Date" type="date" value={form.paymentDate} onChange={(event) => setForm({ ...form, paymentDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField select label="Payment Mode" value={form.paymentMode} onChange={(event) => setForm({ ...form, paymentMode: event.target.value })}>
              {['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'].map((mode) => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}
            </TextField>
            <TextField label="Remarks" value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} multiline minRows={2} />
            <Button type="submit" disabled={!selectedStatus || create.isPending} fullWidth sx={{ py: 1.25 }}>
              {create.isPending ? 'Saving...' : 'Save Fee Payment'}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
