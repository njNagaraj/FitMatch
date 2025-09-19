import React, { useState } from 'react';
import { ICONS, APP_NAME, APP_TAGLINE } from '../constants';
import { useAppContext } from '../contexts/AppContext';

interface LoginProps {
    setAuthPage: (page: 'login' | 'signup') => void;
}

export const Login: React.FC<LoginProps> = ({ setAuthPage }) => {
    const { login } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = login(email, password);
        if (!success) {
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-primary p-3 mr-4 text-white">
                        {ICONS.logo}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{APP_NAME}</h1>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{APP_TAGLINE}</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 border border-light-border dark:border-dark-border space-y-6">
                    <h2 className="text-2xl font-bold text-center">Login</h2>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3" role="alert">
                            <p>{error}</p>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Password</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-3 transition-colors">
                        Login
                    </button>
                    <p className="text-center text-sm">
                        Don't have an account?{' '}
                        <button type="button" onClick={() => setAuthPage('signup')} className="font-semibold text-primary hover:underline">
                            Sign up
                        </button>
                    </p>
                </form>

                <div className="mt-4 bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 border border-light-border dark:border-dark-border text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Demo User Accounts</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li><span className="font-semibold">Nagaraj (Chennai):</span> nagaraj@fitmatch.com (pw: password123)</li>
                        <li><span className="font-semibold">Priya (Chennai):</span> priya@fitmatch.com (pw: password123)</li>
                        <li><span className="font-semibold">Sam (Bangalore):</span> sam@fitmatch.com (pw: password123)</li>
                    </ul>
                    <h3 className="font-bold text-light-text dark:text-dark-text mt-3 mb-2">Admin Account</h3>
                     <ul className="list-disc list-inside">
                        <li><span className="font-semibold">Admin:</span> admin@fitmatch.com (pw: admin123)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};