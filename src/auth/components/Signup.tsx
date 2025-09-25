import React, { useState } from 'react';
import { ICONS, APP_NAME, APP_TAGLINE } from '../../shared/constants';
import { useAuth } from '../contexts/AuthContext';

interface SignupProps {
    setAuthPage: (page: 'login' | 'signup') => void;
}

export const Signup: React.FC<SignupProps> = ({ setAuthPage }) => {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await signup(name, email, password);
            setSignupSuccess(true);
        } catch (err: any) {
            if (err.message && err.message.includes('User with this email already exists')) {
                setError('User with this email already exists. Please login.');
            } else {
                setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (signupSuccess) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md text-center">
                    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 border border-light-border dark:border-dark-border space-y-6">
                        <h2 className="text-2xl font-bold">Registration Successful!</h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            A confirmation link has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.
                        </p>
                        <button 
                            onClick={() => { setSignupSuccess(false); setAuthPage('login'); }} 
                            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-3 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                    <h2 className="text-2xl font-bold text-center">Create Account</h2>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3" role="alert">
                            <p>{error}</p>
                        </div>
                    )}
                     <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary"
                            required
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-3 transition-colors disabled:bg-gray-400" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                     <p className="text-center text-sm">
                        Already have an account?{' '}
                        <button type="button" onClick={() => setAuthPage('login')} className="font-semibold text-primary hover:underline" disabled={isLoading}>
                            Login
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};