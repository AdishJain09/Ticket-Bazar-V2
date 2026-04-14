import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Ticket, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setIsSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl mb-6 shadow-lg shadow-indigo-500/5">
          <Ticket className="h-10 w-10 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 font-display italic">Reset Password</h1>
        <p className="text-slate-400 mt-2 font-medium">
          {isSent 
            ? "We've sent a recovery link to your email." 
            : "Enter your email to receive a password recovery link."}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8"
      >
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-5"
            >
              <div>
                <label htmlFor="email" className="label text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? <span className="spinner" /> : 'Send Reset Link'}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
              <p className="text-slate-300 mb-8 px-4">
                Please check <span className="text-white font-bold">{email}</span> for instructions to reset your password.
              </p>
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {!isSent && (
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Remembered your password?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
