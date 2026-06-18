const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type User = { email: string; fullName: string; role: string };
export type DashboardSummary = {
  totalStudents: number;
  activeStudents: number;
  todayClasses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netProfit: number;
  pendingFees: number;
  attendancePresentToday: number;
  attendanceAbsentToday: number;
  upcomingExams: Array<Record<string, unknown>>;
  recentPayments: Array<Record<string, unknown>>;
};

export type Student = {
  id?: number;
  studentId?: string;
  studentName: string;
  classGrade: string;
  schoolName?: string;
  subjectsEnrolled?: string;
  monthlyFee?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  parent?: { name: string; mobileNumber: string; email?: string; address?: string };
  batch?: { id?: number; batchName?: string };
};

export type Batch = { id?: number; batchName: string; subject: string; classGrade: string; startTime?: string; endTime?: string; daysOfWeek?: string; maximumStudents?: number };
export type FeePayment = { id?: number; paymentId?: string; student: Student; feeMonth: string; feeAmount: number; discountAmount?: number; paidAmount: number; dueAmount: number; paymentDate?: string; paymentMode?: string; remarks?: string; createdAt?: string };
export type AttendanceRecord = { id?: number; student: Student; attendanceDate: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks?: string };
export type Expense = { id?: number; expenseId?: string; expenseDate?: string; expenseCategory: string; amount: number; vendorName?: string; description?: string; paymentMethod?: string; receiptImagePath?: string };
export type IncomeEntry = { id?: number; incomeId?: string; source: string; amount: number; incomeDate?: string; description?: string };
export type Exam = { id?: number; examName: string; subject: string; classGrade: string; examDate?: string; totalMarks?: number; remarks?: string };
export type Homework = { id?: number; title: string; subject: string; description?: string; assignedDate?: string; dueDate?: string; remarks?: string };
export type NotificationLog = { id?: number; type: string; channel: string; recipient?: string; subject?: string; message: string; status?: string; createdAt?: string; student?: Student };

export function getToken() {
  return localStorage.getItem('tm_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('tm_token', token);
  else localStorage.removeItem('tm_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (!response.ok) throw new Error(await response.text());
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) => request<{ token: string; user: User }>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<User>('/api/v1/auth/me'),
  dashboard: () => request<DashboardSummary>('/api/v1/dashboard/summary'),
  students: () => request<Student[]>('/api/v1/students'),
  createStudent: (student: Student) => request<Student>('/api/v1/students', { method: 'POST', body: JSON.stringify(student) }),
  batches: () => request<Batch[]>('/api/v1/batches'),
  createBatch: (batch: Batch) => request<Batch>('/api/v1/batches', { method: 'POST', body: JSON.stringify(batch) }),
  fees: () => request<FeePayment[]>('/api/v1/fees'),
  pendingFees: () => request<FeePayment[]>('/api/v1/fees/pending'),
  createPayment: (payment: FeePayment) => request<FeePayment>('/api/v1/fees/payments', { method: 'POST', body: JSON.stringify(payment) }),
  attendance: (from?: string, to?: string) => request<AttendanceRecord[]>(from && to ? `/api/v1/attendance?from=${from}&to=${to}` : '/api/v1/attendance'),
  markAttendance: (record: AttendanceRecord) => request<AttendanceRecord>('/api/v1/attendance', { method: 'POST', body: JSON.stringify(record) }),
  exams: () => request<Exam[]>('/api/v1/exams'),
  createExam: (exam: Exam) => request<Exam>('/api/v1/exams', { method: 'POST', body: JSON.stringify(exam) }),
  homework: () => request<Homework[]>('/api/v1/homework'),
  createHomework: (homework: Homework) => request<Homework>('/api/v1/homework', { method: 'POST', body: JSON.stringify(homework) }),
  expenses: () => request<Expense[]>('/api/v1/expenses'),
  createExpense: (expense: Expense) => request<Expense>('/api/v1/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  income: () => request<IncomeEntry[]>('/api/v1/income'),
  createIncome: (entry: IncomeEntry) => request<IncomeEntry>('/api/v1/income', { method: 'POST', body: JSON.stringify(entry) }),
  notifications: () => request<NotificationLog[]>('/api/v1/notifications'),
  createNotification: (notification: NotificationLog) => request<NotificationLog>('/api/v1/notifications', { method: 'POST', body: JSON.stringify(notification) })
};
