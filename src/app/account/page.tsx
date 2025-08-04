import AccountPage from "@/components/account/AccountPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Account',
};

export default function ServerAccountPage() {
    return (
        <AccountPage />
    );
}