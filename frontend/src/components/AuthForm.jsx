import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, X, Loader2 } from 'lucide-react';

export const AuthForm = ({ isOpen, onClose, onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onLogin({ email: formData.email, fullName: formData.fullName || 'User' });
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[var(--background)]/80 backdrop-blur-sm transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 rounded-3xl relative overflow-hidden"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-primary transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-2 text-[var(--text-main)]">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm">
                        {isLogin
                            ? 'Enter your credentials to access your health dashboard.'
                            : 'Join NutriGuard AI to get personalized food analysis.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-50" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                className="w-full bg-[var(--background)] border border-[var(--glass-border)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-main)] focus:border-primary/50 focus:bg-primary/5 outline-none transition-all"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-50" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            className="w-full bg-[var(--background)] border border-[var(--glass-border)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-main)] focus:border-primary/50 focus:bg-primary/5 outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-50" />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            className="w-full bg-[var(--background)] border border-[var(--glass-border)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-main)] focus:border-primary/50 focus:bg-primary/5 outline-none transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary text-sm font-semibold hover:underline"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
