import { redirect } from 'next/navigation';

export default function StudentDashboardRedirect() {
  redirect('/skills/student/dashboard');
}