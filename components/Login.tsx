
import React, { useState } from 'react';
import { FitMatchData } from '../useFitMatchData';
import { ICONS, APP_NAME, APP_TAGLINE } from '../constants';

interface LoginProps {
    data: FitMatchData;
    setAuthPage: (page: 'login' | 'signup') => void;
}

export const Login: React.FC<LoginProps> = ({ data, setAuthPage }) => {
    const [email, setEmail] = useState('user@fitmatch.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = data.login(email, password);
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
                    <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Test Credentials:</h3>
                    <p><b>User (Chennai):</b> user@fitmatch.com / password123</p>
                    <p><b>Admin:</b> admin@fitmatch.com / admin123</p>
                </div>
            </div>
        </div>
    );
};
