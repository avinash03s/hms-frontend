import { TextInput, PasswordInput, Button, PinInput } from '@mantine/core';
import { IconMailFast, IconShieldCheck, IconLockOpen, IconArrowLeft } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { useNavigate } from "react-router-dom";
import { errorNotification, successNotification } from '../utility/Notification';
import { useState } from 'react';
import { verifyEmail, verifyOtp, changePassword } from '../service/ForgotPasswordService';
import Navbar from '../components/layout/Navbar';

type Step = 'email' | 'otp' | 'password';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [otp, setOtp] = useState('');

  const emailForm = useForm({
    initialValues: { email: '' },
    validate: { email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email address') },
  });

  const passwordForm = useForm({
    initialValues: { password: '', confirmPassword: '' },
    validate: {
      password: (v) => (v.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (v, values) => v === values.password ? null : 'Passwords do not match',
    },
  });

  const handleVerifyEmail = (values: typeof emailForm.values) => {
    setLoading(true);
    verifyEmail(values.email)
      .then(() => { setVerifiedEmail(values.email); successNotification('OTP sent to your email!'); setStep('otp'); })
      .catch((err) => errorNotification(err?.response?.data?.errorMessage || 'Email not found'))
      .finally(() => setLoading(false));
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) { errorNotification('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    verifyOtp(Number(otp), verifiedEmail)
      .then(() => { successNotification('OTP verified! Set your new password.'); setStep('password'); })
      .catch((err) => errorNotification(err?.response?.data?.errorMessage || 'Invalid or expired OTP'))
      .finally(() => setLoading(false));
  };

  const handleChangePassword = (values: typeof passwordForm.values) => {
    setLoading(true);
    changePassword(verifiedEmail, values.password, values.confirmPassword)
      .then(() => { successNotification('Password changed successfully!'); navigate('/login'); })
      .catch((err) => errorNotification(err?.response?.data?.errorMessage || 'Failed to change password'))
      .finally(() => setLoading(false));
  };

  const stepOrder: Step[] = ['email', 'otp', 'password'];
  const currentStepIndex = stepOrder.indexOf(step);

  const stepMeta: Record<Step, { icon: React.ReactNode; title: string; subtitle: string }> = {
    email: { icon: <IconMailFast size={22} stroke={1.8} />, title: 'Forgot Password', subtitle: 'Enter your registered email to receive an OTP' },
    otp: { icon: <IconShieldCheck size={22} stroke={1.8} />, title: 'Verify OTP', subtitle: `We sent a 6-digit code to ${verifiedEmail}` },
    password: { icon: <IconLockOpen size={22} stroke={1.8} />, title: 'New Password', subtitle: 'Set a strong new password for your account' },
  };

  const inputStyles = { input: { border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14 } };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 sm:p-10">

            {/* Top accent bar */}
            <div className="h-1 w-16 bg-[#1a6fa8] rounded-full mb-7" />

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-7">
              {stepOrder.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                    i < currentStepIndex
                      ? 'bg-[#1a6fa8] border-[#1a6fa8] text-white'
                      : i === currentStepIndex
                      ? 'bg-white border-[#1a6fa8] text-[#1a6fa8]'
                      : 'bg-white border-gray-200 text-gray-300'
                  }`}>
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  {i < stepOrder.length - 1 && (
                    <div className={`w-10 h-0.5 rounded transition-all duration-300 ${i < currentStepIndex ? 'bg-[#1a6fa8]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#1a6fa8]">{stepMeta[step].icon}</span>
              <h1 className="text-2xl font-extrabold text-gray-900">{stepMeta[step].title}</h1>
            </div>
            <p className="text-gray-400 text-sm mb-8">{stepMeta[step].subtitle}</p>

            {/* Step: Email */}
            {step === 'email' && (
              <form onSubmit={emailForm.onSubmit(handleVerifyEmail)} className="flex flex-col gap-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
                  <TextInput {...emailForm.getInputProps('email')} placeholder="you@example.com" radius="md" size="md" styles={inputStyles} />
                </div>
                <Button fullWidth loading={loading} radius="md" size="md" type="submit" color="#1a6fa8">Send OTP</Button>
                <button type="button" onClick={() => navigate('/login')} className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-[#1a6fa8] transition-colors">
                  <IconArrowLeft size={14} /> Back to Login
                </button>
              </form>
            )}

            {/* Step: OTP */}
            {step === 'otp' && (
              <div className="flex flex-col gap-5 items-center">
                <PinInput
                  length={6}
                  type="number"
                  value={otp}
                  onChange={setOtp}
                  size="md"
                  gap="sm"
                  styles={{
                    input: {
                      border: '1.5px solid #e5e7eb',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      fontSize: '1.25rem',
                      color: '#111827',
                    },
                  }}
                />
                <Button loading={loading} radius="md" size="md" fullWidth color="#1a6fa8" onClick={handleVerifyOtp}>
                  Verify OTP
                </Button>
                <button
                  type="button"
                  className="text-gray-400 text-xs hover:text-[#1a6fa8] transition-colors"
                  onClick={() => {
                    setLoading(true);
                    verifyEmail(verifiedEmail)
                      .then(() => successNotification('OTP resent!'))
                      .catch(() => errorNotification('Failed to resend OTP'))
                      .finally(() => setLoading(false));
                  }}
                >
                  Didn't receive the code?{' '}
                  <span className="text-[#1a6fa8] underline font-semibold">Resend OTP</span>
                </button>
                <button type="button" onClick={() => setStep('email')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1a6fa8] transition-colors">
                  <IconArrowLeft size={14} /> Back
                </button>
              </div>
            )}

            {/* Step: New Password */}
            {step === 'password' && (
              <form onSubmit={passwordForm.onSubmit(handleChangePassword)} className="flex flex-col gap-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">New Password</label>
                  <PasswordInput {...passwordForm.getInputProps('password')} placeholder="Enter new password" radius="md" size="md" styles={inputStyles} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Confirm Password</label>
                  <PasswordInput {...passwordForm.getInputProps('confirmPassword')} placeholder="Repeat new password" radius="md" size="md" styles={inputStyles} />
                </div>
                <Button fullWidth loading={loading} radius="md" size="md" type="submit" color="#1a6fa8">Change Password</Button>
                <button type="button" onClick={() => setStep('otp')} className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-[#1a6fa8] transition-colors">
                  <IconArrowLeft size={14} /> Back
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">© 2026 PulseCare. Your health, our priority.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;