const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type User = { email: string; fullName: string; role: 'TEACHER' | 'PARENT' | 'STUDENT'; linkedStudentId?: number | string; linkedParentId?: number | string };
export type PortalOverview = { role: string; fullName: string; email: string; students: Student[] };
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
  parent?: { id?: number; name: string; mobileNumber: string; email?: string; address?: string };
  batch?: { id?: number; batchName?: string };
};

export type Batch = { id?: number; batchName: string; subject: string; classGrade: string; startTime?: string; endTime?: string; daysOfWeek?: string; maximumStudents?: number };
export type FeePayment = { id?: number; paymentId?: string; student: Student; feeMonth: string; feeAmount: number; discountAmount?: number; paidAmount: number; dueAmount: number; paymentDate?: string; paymentMode?: string; remarks?: string; createdAt?: string };
export type AttendanceRecord = { id?: number; student: Student; attendanceDate: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks?: string };
export type Expense = { id?: number; expenseId?: string; expenseDate?: string; expenseCategory: string; amount: number; vendorName?: string; description?: string; paymentMethod?: string; receiptImagePath?: string };
export type IncomeEntry = { id?: number; incomeId?: string; source: string; amount: number; incomeDate?: string; description?: string };
export type Exam = { id?: number; examName: string; subject: string; classGrade: string; examDate?: string; totalMarks?: number; remarks?: string };
export type ExamResult = {
  id?: number;
  exam?: Exam;
  student: Student;
  totalMarks?: number;
  obtainedMarks?: number;
  percentage?: number;
  grade?: string;
  remarks?: string;
};
export type Homework = { id?: number; title: string; subject: string; description?: string; assignedDate?: string; dueDate?: string; remarks?: string };
export type NotificationLog = { id?: number; type: string; channel: string; recipient?: string; subject?: string; message: string; status?: string; createdAt?: string; student?: Student };

export function getToken() {
  return localStorage.getItem('tm_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('tm_token', token);
  else {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
  }
}

export function getUser(): User | null {
  const raw = localStorage.getItem('tm_user');
  return raw ? JSON.parse(raw) as User : null;
}

export function setUser(user: User | null) {
  if (user) localStorage.setItem('tm_user', JSON.stringify(user));
  else localStorage.removeItem('tm_user');
}

export function homePath(role?: string) {
  return role === 'PARENT' || role === 'STUDENT' ? '/portal' : '/dashboard';
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
  portalOverview: () => request<PortalOverview>('/api/v1/portal/overview'),
  portalFees: () => request<FeePayment[]>('/api/v1/portal/fees'),
  portalAttendance: () => request<AttendanceRecord[]>('/api/v1/portal/attendance'),
  portalExams: () => request<Exam[]>('/api/v1/portal/exams'),
  portalResults: () => request<ExamResult[]>('/api/v1/portal/results'),
  portalHomework: () => request<Homework[]>('/api/v1/portal/homework'),
  portalNotifications: () => request<NotificationLog[]>('/api/v1/portal/notifications'),
  dashboard: () => request<DashboardSummary>('/api/v1/dashboard/summary'),
  students: () => request<Student[]>('/api/v1/students'),
  createStudent: (student: Student) => request<Student>('/api/v1/students', { method: 'POST', body: JSON.stringify(student) }),
  updateStudent: (id: number, student: Student) => request<Student>(`/api/v1/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }),
  batches: () => request<Batch[]>('/api/v1/batches'),
  createBatch: (batch: Batch) => request<Batch>('/api/v1/batches', { method: 'POST', body: JSON.stringify(batch) }),
  updateBatch: (id: number, batch: Batch) => request<Batch>(`/api/v1/batches/${id}`, { method: 'PUT', body: JSON.stringify(batch) }),
  deleteBatch: (id: number) => request<void>(`/api/v1/batches/${id}`, { method: 'DELETE' }),
  fees: () => request<FeePayment[]>('/api/v1/fees'),
  pendingFees: () => request<FeePayment[]>('/api/v1/fees/pending'),
  createPayment: (payment: FeePayment) => request<FeePayment>('/api/v1/fees/payments', { method: 'POST', body: JSON.stringify(payment) }),
  attendance: (from?: string, to?: string) => request<AttendanceRecord[]>(from && to ? `/api/v1/attendance?from=${from}&to=${to}` : '/api/v1/attendance'),
  markAttendance: (record: AttendanceRecord) => request<AttendanceRecord>('/api/v1/attendance', { method: 'POST', body: JSON.stringify(record) }),
  exams: () => request<Exam[]>('/api/v1/exams'),
  createExam: (exam: Exam) => request<Exam>('/api/v1/exams', { method: 'POST', body: JSON.stringify(exam) }),
  updateExam: (id: number, exam: Exam) => request<Exam>(`/api/v1/exams/${id}`, { method: 'PUT', body: JSON.stringify(exam) }),
  deleteExam: (id: number) => request<void>(`/api/v1/exams/${id}`, { method: 'DELETE' }),
  examResults: (examId: number) => request<ExamResult[]>(`/api/v1/exams/${examId}/results`),
  addExamResult: (examId: number, result: ExamResult) => request<ExamResult>(`/api/v1/exams/${examId}/results`, { method: 'POST', body: JSON.stringify(result) }),
  updateExamResult: (examId: number, resultId: number, result: Partial<ExamResult>) => request<ExamResult>(`/api/v1/exams/${examId}/results/${resultId}`, { method: 'PUT', body: JSON.stringify(result) }),
  deleteExamResult: (examId: number, resultId: number) => request<void>(`/api/v1/exams/${examId}/results/${resultId}`, { method: 'DELETE' }),
  homework: () => request<Homework[]>('/api/v1/homework'),
  createHomework: (homework: Homework) => request<Homework>('/api/v1/homework', { method: 'POST', body: JSON.stringify(homework) }),
  updateHomework: (id: number, homework: Homework) => request<Homework>(`/api/v1/homework/${id}`, { method: 'PUT', body: JSON.stringify(homework) }),
  deleteHomework: (id: number) => request<void>(`/api/v1/homework/${id}`, { method: 'DELETE' }),
  expenses: () => request<Expense[]>('/api/v1/expenses'),
  createExpense: (expense: Expense) => request<Expense>('/api/v1/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  updateExpense: (id: number, expense: Expense) => request<Expense>(`/api/v1/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expense) }),
  deleteExpense: (id: number) => request<void>(`/api/v1/expenses/${id}`, { method: 'DELETE' }),
  income: () => request<IncomeEntry[]>('/api/v1/income'),
  createIncome: (entry: IncomeEntry) => request<IncomeEntry>('/api/v1/income', { method: 'POST', body: JSON.stringify(entry) }),
  updateIncome: (id: number, entry: IncomeEntry) => request<IncomeEntry>(`/api/v1/income/${id}`, { method: 'PUT', body: JSON.stringify(entry) }),
  deleteIncome: (id: number) => request<void>(`/api/v1/income/${id}`, { method: 'DELETE' }),
  notifications: () => request<NotificationLog[]>('/api/v1/notifications'),
  createNotification: (notification: NotificationLog) => request<NotificationLog>('/api/v1/notifications', { method: 'POST', body: JSON.stringify(notification) }),
  downloadReport: async (type: string, format: 'xlsx' | 'csv') => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/reports/${type}.${format}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error(await response.text());
    return response.blob();
  }
};
