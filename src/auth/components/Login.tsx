import React, { useState } from 'react';
import { ICONS, APP_NAME, APP_TAGLINE } from '../../shared/constants';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../../api/services/authService';
import { userService } from '../../api/services/userService';

interface LoginProps {
    setAuthPage: (page: 'login' | 'signup') => void;
}

export const Login: React.FC<LoginProps> = ({ setAuthPage }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [view, setView] = useState<'login' | 'reset_password'>('login');
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');
    const [isSendingLink, setIsSendingLink] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const isDeactivated = await userService.isUserDeactivatedByEmail(email);
            if (isDeactivated) {
                setError('Your account is suspended.');
                setIsLoading(false);
                return;
            }

            await login(email, password);
            // onAuthStateChange will handle successful login
        } catch (err: any) {
             if (err.message && err.message.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please try again.');
            } else {
                setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetError('');
        setResetMessage('');
        setIsSendingLink(true);
        try {
            await authService.sendPasswordResetEmail(resetEmail);
            setResetMessage('If an account exists for this email, a password reset link has been sent.');
        } catch (err: any) {
            setResetError(err.message || 'Failed to send reset link.');
        } finally {
            setIsSendingLink(false);
        }
    };

    const AuthHeader = () => (
        <div className="flex items-center justify-center mb-8">
            <div className="bg-primary p-3 mr-4 text-white">
                {ICONS.logo}
            </div>
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{APP_NAME}</h1>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{APP_TAGLINE}</p>
            </div>
        </div>
    );

    if (view === 'reset_password') {
        return (
             <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    <AuthHeader />
                    <form onSubmit={handlePasswordReset} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 border border-light-border dark:border-dark-border space-y-6">
                        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                        {resetMessage && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3" role="alert">
                                <p>{resetMessage}</p>
                            </div>
                        )}
                        {resetError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3" role="alert">
                                <p>{resetError}</p>
                            </div>
                        )}
                        {!resetMessage && (
                            <>
                                <p className="text-sm text-center text-light-text-secondary dark:text-dark-text-secondary">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        value={resetEmail}
                                        onChange={e => setResetEmail(e.target.value)}
                                        className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary"
                                        required
                                        disabled={isSendingLink}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-3 transition-colors disabled:bg-gray-400" disabled={isSendingLink}>
                                    {isSendingLink ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </>
                        )}
                        <p className="text-center text-sm">
                            Remembered your password?{' '}
                            <button type="button" onClick={() => setView('login')} className="font-semibold text-primary hover:underline" disabled={isSendingLink}>
                                Back to Login
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
                <AuthHeader />
                
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
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                         <div className="flex justify-between items-center mb-1">
                             <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Password</label>
                             <button type="button" onClick={() => setView('reset_password')} className="text-sm font-semibold text-primary hover:underline" disabled={isLoading}>
                                Forgot Password?
                            </button>
                        </div>
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
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    <p className="text-center text-sm">
                        Don't have an account?{' '}
                        <button type="button" onClick={() => setAuthPage('signup')} className="font-semibold text-primary hover:underline" disabled={isLoading}>
                            Sign up
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};