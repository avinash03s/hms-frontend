import { TextInput, PasswordInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from '../service/UserService';
import { errorNotification, successNotification } from '../utility/Notification';
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value: string) => (!value ? "Name is required" : null),
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value: string) =>
        !value
          ? "Password is required"
          : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(value)
          ? null
          : "8-15 chars, upper, lower, number & special character",
      confirmPassword: (value: string, values: any) =>
        value === values.password ? null : "Passwords don't match",
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    setLoading(true);
    registerUser(values)
      .then(() => {
        successNotification("Registered Successfully");
        navigate('/login');
      })
      .catch(() => errorNotification("Something went wrong. Please try again."))
      .finally(() => setLoading(false));
  };

  const inputStyles = {
    input: {
      border: '1.5px solid #e5e7eb',
      background: '#f9fafb',
      fontSize: 14,
    },
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 sm:p-10">

            <div className="h-1 w-16 bg-[#1a6fa8] rounded-full mb-7" />

            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create account</h1>
            <p className="text-gray-400 text-sm mb-8">Join PulseCare — your health partner</p>

            <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col gap-5">

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Full Name
                </label>
                <TextInput
                  {...form.getInputProps('name')}
                  placeholder="Your full name"
                  radius="md"
                  size="md"
                  styles={inputStyles}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Email
                </label>
                <TextInput
                  {...form.getInputProps('email')}
                  placeholder="you@example.com"
                  radius="md"
                  size="md"
                  styles={inputStyles}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Password
                </label>
                <PasswordInput
                  {...form.getInputProps('password')}
                  placeholder="Create a strong password"
                  radius="md"
                  size="md"
                  styles={inputStyles}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Confirm Password
                </label>
                <PasswordInput
                  {...form.getInputProps('confirmPassword')}
                  placeholder="Repeat your password"
                  radius="md"
                  size="md"
                  styles={inputStyles}
                />
              </div>

              <Button
                loading={loading}
                fullWidth
                radius="md"
                size="md"
                type="submit"
                color="#1a6fa8"
                className="mt-1"
              >
                Create Account
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-[#1a6fa8] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 PulseCare. Your health, our priority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;