import { redirect } from 'next/navigation';

export default function ProfileEditPage() {
    redirect('/profile?tab=edit-profile');
}
