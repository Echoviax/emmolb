'use client'
import Loading from "@/components/Loading";
import { useAccount } from "@/hooks/Account";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Metadata } from 'next';

export default function AuthPage() {
    const { user, loading } = useAccount();
    const [createAccount, setCreateAccount] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        link.crossOrigin = 'anonymous';
        link.referrerPolicy = 'no-referrer';
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    useEffect(() => {
        if (loading) return;
        if (user) router.push('/account')
    }, [user, loading])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch(createAccount ? '/nextapi/db/account/create-account' : '/nextapi/db/account/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });
            const result = await res.json();
            if (!res.ok) setError(result.error || 'Unknown Error. Please try again...');
            else {
                setSuccess(createAccount ? 'Account created successfully. Redirecting...' : 'Logged in successfully. Redirecting...')
                window.location.reload();
            }
        } catch {
            setError('Network Error');
        }
    }

    if (loading) return (<Loading />)

    return (
        <main className="mt-16">
            <div className="min-h-screen bg-theme-background text-theme-text font-sans flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-theme-primary rounded-xl shadow-xl p-6">
                    <h1 className="text-2xl font-bold mb-1">
                        Login / Create Account
                    </h1>
                    <p className="text-sm text-theme-text opacity-70 mb-6">
                        Log in or create a new account to link to MMOLB and save settings across devices!
                    </p>
                    <p className="text-sm text-theme-text opacity-90">
                        MMOLB credentials are different and will not work
                    </p>
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input placeholder="Username" className="w-full p-2 rounded bg-theme-background focus:outline-none focus:ring-2 focus:ring-blue-600" required type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <div className="relative">
                            <input placeholder="Password" className="w-full p-2 pr-10 rounded bg-theme-background focus:outline-none focus:ring-2 focus:ring-blue-600" required type={showPassword ? 'text' : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                            <i onClick={() => setShowPassword((prev) => !prev)} className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'} absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text opacity-70 cursor-pointer`} />
                        </div>
                        <button type="submit" className="w-full py-2 rounded font-semibold transition bg-theme-secondary hover:opacity-80">
                            {createAccount ? 'Sign Up' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-4 min-h-[1.5rem] text-center text-sm">
                        {error && <span className="text-red-500">{error}</span>}
                        {success && <span className="text-green-500">{success}</span>}
                    </div>
                    
                    <div className="mt-6 space-y-2 text-sm text-center">
                        <button className="text-secondary opacity-80 hover:underline block w-full" onClick={() => setCreateAccount((prev) => !prev)}>
                            {createAccount ? 'Have an account? Sign in' : 'Need an account? Sign Up'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}