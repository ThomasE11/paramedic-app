import { redirect } from 'next/navigation';

export default function StudentSettingsRedirect() {
  redirect('/skills/student/settings');
}