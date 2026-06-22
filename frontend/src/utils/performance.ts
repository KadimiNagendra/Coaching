import { AttendanceRecord, ExamResult, Student } from '../api/client';

export type PerformanceLabel = 'Excellent' | 'Good' | 'Average' | 'Needs Attention' | 'No data';
export type PerformanceAccent = 'success' | 'primary' | 'warning' | 'error' | 'default';

export type StudentPerformance = {
  student: Student;
  examAverage: number | null;
  attendanceRate: number | null;
  overallScore: number | null;
  label: PerformanceLabel;
  accent: PerformanceAccent;
  examCount: number;
  presentCount: number;
  totalAttendance: number;
  latestResult?: ExamResult;
};

function performanceLabel(score: number | null): { label: PerformanceLabel; accent: PerformanceAccent } {
  if (score == null) return { label: 'No data', accent: 'default' };
  if (score >= 85) return { label: 'Excellent', accent: 'success' };
  if (score >= 70) return { label: 'Good', accent: 'primary' };
  if (score >= 55) return { label: 'Average', accent: 'warning' };
  return { label: 'Needs Attention', accent: 'error' };
}

export function buildStudentPerformance(
  students: Student[],
  results: ExamResult[],
  attendance: AttendanceRecord[]
): StudentPerformance[] {
  return students.map((student) => {
    const studentResults = results.filter((result) => result.student?.id === student.id);
    const studentAttendance = attendance.filter((record) => record.student?.id === student.id);

    const examAverage = studentResults.length
      ? studentResults.reduce((sum, result) => sum + Number(result.percentage ?? 0), 0) / studentResults.length
      : null;

    const presentCount = studentAttendance.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length;
    const totalAttendance = studentAttendance.length;
    const attendanceRate = totalAttendance ? (presentCount / totalAttendance) * 100 : null;

    let overallScore: number | null = null;
    if (examAverage != null && attendanceRate != null) overallScore = examAverage * 0.7 + attendanceRate * 0.3;
    else if (examAverage != null) overallScore = examAverage;
    else if (attendanceRate != null) overallScore = attendanceRate;

    const latestResult = [...studentResults].sort((a, b) => {
      const dateA = a.exam?.examDate ?? '';
      const dateB = b.exam?.examDate ?? '';
      return dateB.localeCompare(dateA);
    })[0];

    const { label, accent } = performanceLabel(overallScore);

    return {
      student,
      examAverage,
      attendanceRate,
      overallScore,
      label,
      accent,
      examCount: studentResults.length,
      presentCount,
      totalAttendance,
      latestResult
    };
  });
}

export const formatPercent = (value: number | null) => (value == null ? '—' : `${value.toFixed(1)}%`);
