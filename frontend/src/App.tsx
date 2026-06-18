import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken, getUser, homePath } from './api/client';
import { Protected } from './components/Protected';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import BatchesPage from './pages/BatchesPage';
import FeesPage from './pages/FeesPage';
import AttendancePage from './pages/AttendancePage';
import ExamsPage from './pages/ExamsPage';
import ResultsPage from './pages/ResultsPage';
import HomeworkPage from './pages/HomeworkPage';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import PortalPage from './pages/PortalPage';

function RootRedirect() {
  const user = getUser();
  if (!getToken() || !user) return <Navigate to="/login" replace />;
  return <Navigate to={homePath(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="/portal" element={<Protected allow={['PARENT', 'STUDENT']}><PortalPage /></Protected>} />
      <Route path="/results" element={<Protected allow={['TEACHER', 'PARENT', 'STUDENT']}><ResultsPage /></Protected>} />
      <Route path="/dashboard" element={<Protected allow={['TEACHER']}><DashboardPage /></Protected>} />
      <Route path="/students" element={<Protected allow={['TEACHER']}><StudentsPage /></Protected>} />
      <Route path="/batches" element={<Protected allow={['TEACHER']}><BatchesPage /></Protected>} />
      <Route path="/fees" element={<Protected allow={['TEACHER']}><FeesPage /></Protected>} />
      <Route path="/attendance" element={<Protected allow={['TEACHER']}><AttendancePage /></Protected>} />
      <Route path="/exams" element={<Protected allow={['TEACHER']}><ExamsPage /></Protected>} />
      <Route path="/homework" element={<Protected allow={['TEACHER']}><HomeworkPage /></Protected>} />
      <Route path="/expenses" element={<Protected allow={['TEACHER']}><ExpensesPage /></Protected>} />
      <Route path="/income" element={<Protected allow={['TEACHER']}><IncomePage /></Protected>} />
      <Route path="/reports" element={<Protected allow={['TEACHER']}><ReportsPage /></Protected>} />
      <Route path="/notifications" element={<Protected allow={['TEACHER']}><NotificationsPage /></Protected>} />
    </Routes>
  );
}
