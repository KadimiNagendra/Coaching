import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Tabs, Tab } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { api, FeePayment, Expense, IncomeEntry } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { FinancialPieChart } from '../components/FinancialPieChart';
import { chartColors } from '../theme/theme';

// Shared Helpers
const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);
const money = (value?: number) => `Rs ${Number(value ?? 0).toLocaleString('en-IN')}`;
const parseAmountInput = (value: string) => (value === '' ? 0 : Number(value));
const amountInputValue = (value: number) => (value === 0 ? '' : value);
const currentMonthLabel = () => new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

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

const defaultFeeForm = (paidAmount = 0): PaymentForm => ({
  paidAmount,
  discountAmount: 0,
  paymentDate: today(),
  paymentMode: 'UPI',
  remarks: ''
});

const emptyExpenseForm = (): Expense => ({
  expenseCategory: 'MISCELLANEOUS',
  amount: 0,
  vendorName: '',
  paymentMethod: 'UPI',
  expenseDate: today(),
  description: ''
});

const emptyIncomeForm = (): IncomeEntry => ({
  source: 'Tuition Fees',
  amount: 0,
  incomeDate: today(),
  description: ''
});

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'fees' | 'expenses' | 'income'>('overview');
  const queryClient = useQueryClient();

  // ==========================================
  // GENERAL OVERVIEW DATA
  // ==========================================
  const { data: dashboard } = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });

  const financialPie = useMemo(() => {
    const income = Number(dashboard?.monthlyIncome ?? 0);
    const expenses = Number(dashboard?.monthlyExpenses ?? 0);
    const profit = Number(dashboard?.netProfit ?? 0);
    return [
      { name: 'Income', value: income, color: chartColors.income },
      { name: 'Expenses', value: expenses, color: chartColors.expenses },
      { name: 'Profit', value: Math.max(profit, 0), color: chartColors.profit }
    ].filter((item) => item.value > 0);
  }, [dashboard]);

  const financialSummary = useMemo(() => ({
    income: Number(dashboard?.monthlyIncome ?? 0),
    expenses: Number(dashboard?.monthlyExpenses ?? 0),
    profit: Number(dashboard?.netProfit ?? 0)
  }), [dashboard]);

  // ==========================================
  // FEES TAB STATE & LOGIC
  // ==========================================
  const [feeMonth, setFeeMonth] = useState(currentMonth());
  const [selectedStatus, setSelectedStatus] = useState<StudentFeeStatus | null>(null);
  const [listView, setListView] = useState<FeeListView | null>(null);
  const [feeForm, setFeeForm] = useState<PaymentForm>(defaultFeeForm());

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

  const createFeePayment = useMutation({
    mutationFn: (payment: FeePayment) => api.createPayment(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedStatus(null);
      setFeeForm(defaultFeeForm());
    }
  });

  function openStudent(status: StudentFeeStatus) {
    setSelectedStatus(status);
    setFeeForm(defaultFeeForm(status.currentDue));
  }

  function submitFeePayment(event: FormEvent) {
    event.preventDefault();
    if (!selectedStatus) return;
    createFeePayment.mutate({
      student: selectedStatus.student,
      feeMonth: selectedStatus.feeMonth,
      feeAmount: selectedStatus.feeAmount,
      discountAmount: feeForm.discountAmount,
      paidAmount: feeForm.paidAmount,
      dueAmount: 0,
      paymentDate: feeForm.paymentDate,
      paymentMode: feeForm.paymentMode,
      remarks: feeForm.remarks || `Fee payment for ${selectedStatus.feeMonth}`
    });
  }

  // ==========================================
  // EXPENSES TAB STATE & LOGIC
  // ==========================================
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [expenseForm, setExpenseForm] = useState<Expense>(emptyExpenseForm());

  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: api.expenses });

  const invalidateExpenses = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createExpense = useMutation({ mutationFn: api.createExpense, onSuccess: () => { invalidateExpenses(); closeExpenseDialog(); } });
  const updateExpense = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Expense }) => api.updateExpense(id, payload), onSuccess: () => { invalidateExpenses(); closeExpenseDialog(); } });
  const removeExpense = useMutation({ mutationFn: (id: number) => api.deleteExpense(id), onSuccess: invalidateExpenses });

  function closeExpenseDialog() {
    setExpenseOpen(false);
    setEditingExpenseId(null);
    setExpenseForm(emptyExpenseForm());
  }

  function openCreateExpense() {
    setEditingExpenseId(null);
    setExpenseForm(emptyExpenseForm());
    setExpenseOpen(true);
  }

  function openEditExpense(expense: Expense) {
    setEditingExpenseId(expense.id ?? null);
    setExpenseForm({
      expenseId: expense.expenseId,
      expenseCategory: expense.expenseCategory,
      amount: expense.amount,
      vendorName: expense.vendorName ?? '',
      paymentMethod: expense.paymentMethod ?? 'UPI',
      expenseDate: expense.expenseDate ?? today(),
      description: expense.description ?? ''
    });
    setExpenseOpen(true);
  }

  function submitExpense(event: FormEvent) {
    event.preventDefault();
    if (editingExpenseId) updateExpense.mutate({ id: editingExpenseId, payload: expenseForm });
    else createExpense.mutate(expenseForm);
  }

  function handleDeleteExpense(expense: Expense) {
    const label = expense.vendorName || expense.expenseId || 'this expense';
    if (!expense.id || !window.confirm(`Delete expense for "${label}"?`)) return;
    removeExpense.mutate(expense.id);
  }

  // ==========================================
  // INCOME TAB STATE & LOGIC
  // ==========================================
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<number | null>(null);
  const [incomeForm, setIncomeForm] = useState<IncomeEntry>(emptyIncomeForm());

  const { data: incomeList = [] } = useQuery({ queryKey: ['income'], queryFn: api.income });

  const invalidateIncome = () => {
    queryClient.invalidateQueries({ queryKey: ['income'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createIncome = useMutation({ mutationFn: api.createIncome, onSuccess: () => { invalidateIncome(); closeIncomeDialog(); } });
  const updateIncome = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: IncomeEntry }) => api.updateIncome(id, payload), onSuccess: () => { invalidateIncome(); closeIncomeDialog(); } });
  const removeIncome = useMutation({ mutationFn: (id: number) => api.deleteIncome(id), onSuccess: invalidateIncome });

  function closeIncomeDialog() {
    setIncomeOpen(false);
    setEditingIncomeId(null);
    setIncomeForm(emptyIncomeForm());
  }

  function openCreateIncome() {
    setEditingIncomeId(null);
    setIncomeForm(emptyIncomeForm());
    setIncomeOpen(true);
  }

  function openEditIncome(entry: IncomeEntry) {
    setEditingIncomeId(entry.id ?? null);
    setIncomeForm({
      incomeId: entry.incomeId,
      source: entry.source,
      amount: entry.amount,
      incomeDate: entry.incomeDate ?? today(),
      description: entry.description ?? ''
    });
    setIncomeOpen(true);
  }

  function submitIncome(event: FormEvent) {
    event.preventDefault();
    if (editingIncomeId) updateIncome.mutate({ id: editingIncomeId, payload: incomeForm });
    else createIncome.mutate(incomeForm);
  }

  function handleDeleteIncome(entry: IncomeEntry) {
    const label = entry.source || entry.incomeId || 'this income entry';
    if (!entry.id || !window.confirm(`Delete income entry "${label}"?`)) return;
    removeIncome.mutate(entry.id);
  }

  // ==========================================
  // PAGE HEADER ACTION BINDINGS
  // ==========================================
  const actionLabel = activeTab === 'expenses' ? 'Add Expense' : activeTab === 'income' ? 'Add Income' : undefined;
  const onAction = activeTab === 'expenses' ? openCreateExpense : activeTab === 'income' ? openCreateIncome : undefined;
  const tabSubtitles = {
    overview: "High-level summary of your center's monthly income, expenses, and profits.",
    fees: "Choose a month, click a student, and update that student's fee payment.",
    expenses: "Track rent, utilities, materials, transport, marketing, and miscellaneous costs.",
    income: "Track tuition fees, admission fees, crash courses, and other income."
  };

  return (
    <>
      <PageHeader
        title="Finance"
        subtitle={tabSubtitles[activeTab]}
        actionLabel={actionLabel}
        onAction={onAction}
      />

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value: typeof activeTab) => setActiveTab(value)}
          sx={{ px: 2, borderBottom: 1, borderColor: alpha('#0f172a', 0.08) }}
        >
          <Tab label="Overview" value="overview" />
          <Tab label="Fees" value="fees" />
          <Tab label="Expenses" value="expenses" />
          <Tab label="Income" value="income" />
        </Tabs>

        <CardContent sx={{ pt: 3 }}>
          {activeTab === 'overview' && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                <StatCard label="Monthly Income" value={money(dashboard?.monthlyIncome)} helper="Fees plus other income" accent="success" />
                <StatCard label="Net Profit" value={money(dashboard?.netProfit)} helper={`${money(dashboard?.monthlyExpenses)} expenses`} accent="secondary" />
                <StatCard label="Pending Fees" value={money(dashboard?.pendingFees)} helper="Needs follow-up" accent="warning" />
              </Box>
              <Card sx={{ maxWidth: 600, mx: 'auto', border: '1px solid', borderColor: 'divider', backgroundImage: 'none', boxShadow: 'none' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Income, Expenses and Profit Breakdown</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {currentMonthLabel()} · Net profit {money(dashboard?.netProfit)}
                  </Typography>
                  {financialPie.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 10, textAlign: 'center' }}>
                      No income or expense data for this month yet.
                    </Typography>
                  ) : (
                    <Box sx={{ py: 1 }}>
                      <FinancialPieChart data={financialPie} />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">Income: {money(financialSummary.income)}</Typography>
                        <Typography variant="body2" color="text.secondary">Expenses: {money(financialSummary.expenses)}</Typography>
                        <Typography variant="body2" color="text.secondary">Profit: {money(financialSummary.profit)}</Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {activeTab === 'fees' && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                <StatCard label="Expected Fees" value={money(monthSummary.totalExpected)} helper={feeMonth} accent="primary" />
                <StatCard label="Collected" value={money(monthSummary.totalCollected)} helper={`${monthPayments.length} payments`} accent="success" onClick={() => setListView('collected')} />
                <StatCard label="Outstanding Due" value={money(monthSummary.totalDue)} helper="Needs collection" accent="warning" onClick={() => setListView('outstanding')} />
                <StatCard label="Fully Paid" value={`${monthSummary.paidCount}/${studentStatuses.length}`} helper="Students cleared" accent="info" onClick={() => setListView('fullyPaid')} />
              </Box>

              <Card sx={{ mb: 3, backgroundImage: 'none', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
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

              <Card sx={{ backgroundImage: 'none', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
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
            </>
          )}

          {activeTab === 'expenses' && (
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
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.expenseId}</TableCell>
                    <TableCell>{expense.expenseDate}</TableCell>
                    <TableCell>{expense.expenseCategory}</TableCell>
                    <TableCell>₹{expense.amount}</TableCell>
                    <TableCell>{expense.vendorName}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                        <IconButton size="small" aria-label="Edit expense" onClick={() => openEditExpense(expense)}><EditOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" aria-label="Delete expense" onClick={() => handleDeleteExpense(expense)}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && <TableRow><TableCell colSpan={6}>No expenses recorded yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {activeTab === 'income' && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incomeList.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.incomeId}</TableCell>
                    <TableCell>{entry.incomeDate}</TableCell>
                    <TableCell>{entry.source}</TableCell>
                    <TableCell>₹{entry.amount}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                        <IconButton size="small" aria-label="Edit income" onClick={() => openEditIncome(entry)}><EditOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" aria-label="Delete income" onClick={() => handleDeleteIncome(entry)}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {incomeList.length === 0 && <TableRow><TableCell colSpan={6}>No income entries recorded yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ==========================================
          DIALOGS
          ========================================== */}
      {/* Fees List Modal */}
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

      {/* Record Fee Payment Modal */}
      <Dialog open={Boolean(selectedStatus)} onClose={() => setSelectedStatus(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Fee - {selectedStatus?.student.studentName}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submitFeePayment}>
            <Typography color="text.secondary">
              Month: {selectedStatus?.feeMonth} | Fee: {money(selectedStatus?.feeAmount)} | Current Due: {money(selectedStatus?.currentDue)}
            </Typography>
            <TextField label="Paid Amount" type="number" value={amountInputValue(feeForm.paidAmount)} onChange={(event) => setFeeForm({ ...feeForm, paidAmount: parseAmountInput(event.target.value) })} required autoFocus slotProps={{ htmlInput: { min: 0 } }} />
            <TextField label="Discount" type="number" value={amountInputValue(feeForm.discountAmount)} onChange={(event) => setFeeForm({ ...feeForm, discountAmount: parseAmountInput(event.target.value) })} slotProps={{ htmlInput: { min: 0 } }} />
            <TextField label="Payment Date" type="date" value={feeForm.paymentDate} onChange={(event) => setFeeForm({ ...feeForm, paymentDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField select label="Payment Mode" value={feeForm.paymentMode} onChange={(event) => setFeeForm({ ...feeForm, paymentMode: event.target.value })}>
              {['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'].map((mode) => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}
            </TextField>
            <TextField label="Remarks" value={feeForm.remarks} onChange={(event) => setFeeForm({ ...feeForm, remarks: event.target.value })} multiline minRows={2} />
            <Button type="submit" disabled={!selectedStatus || createFeePayment.isPending} fullWidth sx={{ py: 1.25 }}>
              {createFeePayment.isPending ? 'Saving...' : 'Save Fee Payment'}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Expense Modal */}
      <Dialog open={expenseOpen} onClose={closeExpenseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submitExpense}>
            <TextField label="Category" value={expenseForm.expenseCategory} onChange={(e) => setExpenseForm({ ...expenseForm, expenseCategory: e.target.value })} />
            <TextField label="Amount" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} />
            <TextField label="Vendor" value={expenseForm.vendorName ?? ''} onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })} />
            <TextField label="Payment Method" value={expenseForm.paymentMethod ?? ''} onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })} />
            <TextField label="Date" type="date" value={expenseForm.expenseDate ?? ''} onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Description" value={expenseForm.description ?? ''} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} multiline minRows={2} />
            <Button type="submit" disabled={createExpense.isPending || updateExpense.isPending}>{editingExpenseId ? 'Update Expense' : 'Save Expense'}</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Income Modal */}
      <Dialog open={incomeOpen} onClose={closeIncomeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIncomeId ? 'Edit Income' : 'Add Income'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submitIncome}>
            <TextField label="Source" value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })} />
            <TextField label="Amount" type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })} />
            <TextField label="Date" type="date" value={incomeForm.incomeDate ?? ''} onChange={(e) => setIncomeForm({ ...incomeForm, incomeDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Description" value={incomeForm.description ?? ''} onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })} multiline minRows={2} />
            <Button type="submit" disabled={createIncome.isPending || updateIncome.isPending}>{editingIncomeId ? 'Update Income' : 'Save Income'}</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
