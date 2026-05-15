import { TextInput, PasswordInput, Button, PinInput } from '@mantine/core';
import { IconHeartbeat, IconArrowLeft, IconMailFast, IconShieldCheck, IconLockOpen } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { useNavigate } from "react-router-dom";
import { errorNotification, successNotification } from '../utility/Notification';
import { useState } from 'react';
import { verifyEmail, verifyOtp, changePassword } from '../service/ForgotPasswordService';

type Step = 'email' | 'otp' | 'password';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [loading, setLoading] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState('');
    const [otp, setOtp] = useState('');

    //Email form
    const emailForm = useForm({
        initialValues: { email: '' },
        validate: {
            email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email address'),
        },
    });

    //New password form
    const passwordForm = useForm({
        initialValues: { password: '', confirmPassword: '' },
        validate: {
            password: (v) => (v.length >= 6 ? null : 'Password must be at least 6 characters'),
            confirmPassword: (v, values) =>
                v === values.password ? null : 'Passwords do not match',
        },
    });

    //Handlers
    const handleVerifyEmail = (values: typeof emailForm.values) => {
        setLoading(true);
        verifyEmail(values.email)
            .then(() => {
                setVerifiedEmail(values.email);
                successNotification('OTP sent to your email!');
                setStep('otp');
            })
            .catch((err) => errorNotification(err?.response?.data?.errorMessage || 'Email not found'))
            .finally(() => setLoading(false));
    };

    const handleVerifyOtp = () => {
        if (otp.length !== 6) {
            errorNotification('Please enter the 6-digit OTP');
            return;
        }
        setLoading(true);
        verifyOtp(Number(otp), verifiedEmail)
            .then(() => {
                successNotification('OTP verified! Set your new password.');
                setStep('password');
            })
            .catch((err) => errorNotification(err?.response?.data?.errorMessage || 'Invalid or expired OTP'))
            .finally(() => setLoading(false));
    };

    const handleChangePassword = (values: typeof passwordForm.values) => {
        setLoading(true);
        changePassword(verifiedEmail, values.password, values.confirmPassword)
            .then(() => {
                successNotification('Password changed successfully!');
                navigate('/login');
            })
            .catch((err) => errorNotification(err?.response?.data?.errorMessage || 'Failed to change password'))
            .finally(() => setLoading(false));
    };

    //Step meta
    const steps: Record<Step, { icon: React.ReactNode; title: string; subtitle: string }> = {
        email: {
            icon: <IconMailFast size={22} stroke={1.8} />,
            title: 'Forgot Password',
            subtitle: "Enter your registered email to receive an OTP",
        },
        otp: {
            icon: <IconShieldCheck size={22} stroke={1.8} />,
            title: 'Verify OTP',
            subtitle: `We sent a 6-digit code to ${verifiedEmail}`,
        },
        password: {
            icon: <IconLockOpen size={22} stroke={1.8} />,
            title: 'New Password',
            subtitle: 'Set a strong new password for your account',
        },
    };

    const stepOrder: Step[] = ['email', 'otp', 'password'];
    const currentStepIndex = stepOrder.indexOf(step);

    const inputClass =
        'transition duration-300 [&_input]:placeholder-neutral-100 [&_.mantine-Input-input]:!border-white focus-within:[&_.mantine-Input-input]:!border-primary-400 [&_.mantine-Input-input]:!border [&_input]:!pl-2 [&_svg]:text-white [&_input]:text-white';

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">

            {/* Background */}
            <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=90"
                alt="bg"
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ filter: 'brightness(0.55)' }}
            />
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(10,15,30,0.85) 0%, rgba(190,24,93,0.15) 100%)' }}
            />

            {/* Back button */}
            <button
                onClick={() => (step === 'email' ? navigate('/login') : setStep(stepOrder[currentStepIndex - 1]))}
                className="absolute top-5 left-5 z-10 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors duration-200 group"
            >
                <IconArrowLeft size={18} stroke={2} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span className="text-sm font-medium">{step === 'email' ? 'Back to Login' : 'Back'}</span>
            </button>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo */}
                <div className="py-3 text-primary-500 flex gap-1 items-center">
                    <IconHeartbeat size={45} stroke={3} />
                    <span className="font-heading font-semibold text-5xl">PulseCare</span>
                </div>

                {/* Card */}
                <div className="w-[450px] backdrop-blur-md p-10 py-8 rounded-lg flex flex-col gap-5">

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mb-1">
                        {stepOrder.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${i < currentStepIndex
                                            ? 'bg-primary-400 text-white'
                                            : i === currentStepIndex
                                                ? 'bg-white text-gray-900'
                                                : 'bg-white/20 text-white/50'
                                        }`}
                                >
                                    {i < currentStepIndex ? '✓' : i + 1}
                                </div>
                                {i < stepOrder.length - 1 && (
                                    <div className={`w-10 h-0.5 rounded transition-all duration-300 ${i < currentStepIndex ? 'bg-primary-400' : 'bg-white/20'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Title */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-white/60 flex items-center gap-1.5">
                            {steps[step].icon}
                        </div>
                        <div className="self-center font-medium font-heading text-white text-xl">
                            {steps[step].title}
                        </div>
                        <div className="text-white/50 text-xs text-center">{steps[step].subtitle}</div>
                    </div>

                    {/* ── Step 1: Email ── */}
                    {step === 'email' && (
                        <form
                            onSubmit={emailForm.onSubmit(handleVerifyEmail)}
                            className="flex flex-col gap-5"
                        >
                            <TextInput
                                {...emailForm.getInputProps('email')}
                                className={inputClass}
                                variant="unstyled"
                                size="md"
                                placeholder="Registered Email"
                            />
                            <Button loading={loading} radius="md" size="md" type="submit" color="#24AE9E">
                                Send OTP
                            </Button>
                        </form>
                    )}

                    {/* ── Step 2: OTP ── */}
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
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.4)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '1.25rem',
                                    },
                                }}
                            />
                            <Button
                                loading={loading}
                                radius="md"
                                size="md"
                                fullWidth
                                color="#24AE9E"
                                onClick={handleVerifyOtp}
                            >
                                Verify OTP
                            </Button>
                            <button
                                type="button"
                                className="text-white/50 text-xs hover:text-white/80 transition-colors"
                                onClick={() => {
                                    setLoading(true);
                                    verifyEmail(verifiedEmail)
                                        .then(() => successNotification('OTP resent!'))
                                        .catch(() => errorNotification('Failed to resend OTP'))
                                        .finally(() => setLoading(false));
                                }}
                            >
                                Didn't receive the code? <span className="text-primary-400 underline">Resend OTP</span>
                            </button>
                        </div>
                    )}

                    {/*New Password*/}
                    {step === 'password' && (
                        <form
                            onSubmit={passwordForm.onSubmit(handleChangePassword)}
                            className={`flex flex-col gap-5 ${inputClass}`}
                        >
                            <PasswordInput
                                {...passwordForm.getInputProps('password')}
                                variant="unstyled"
                                size="md"
                                placeholder="New Password"
                            />
                            <PasswordInput
                                {...passwordForm.getInputProps('confirmPassword')}
                                variant="unstyled"
                                size="md"
                                placeholder="Confirm New Password"
                            />
                            <Button loading={loading} radius="md" size="md" type="submit" color="#24AE9E">
                                Change Password
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;