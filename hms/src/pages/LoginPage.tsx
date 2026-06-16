import { TextInput, PasswordInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from '../service/UserService';
import { errorNotification, successNotification } from '../utility/Notification';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setJwt } from '../slices/JwtSlices';
import { setUser } from '../slices/UserSlices';
import Navbar from '../components/layout/Navbar';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (!value ? "Password is required" : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    setLoading(true);
    loginUser(values)
      .then((_data) => {
        const decoded: any = jwtDecode(_data);
        dispatch(setJwt(_data));
        dispatch(setUser(decoded));
        successNotification("Login Successfully");
        if (decoded.role === 'ADMIN') navigate('/admin/dashboard');
        else if (decoded.role === 'DOCTOR') navigate('/doctor/dashboard');
        else if (decoded.role === 'PATIENT') navigate('/patient/profile');
      })
      .catch((error) => errorNotification(error?.response?.data?.errorMessage))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

     
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 sm:p-10">


            <div className="h-1 w-16 bg-[#1a6fa8] rounded-full mb-7" />

            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm mb-8">Sign in to your PulseCare account</p>

            <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Email
                </label>
                <TextInput
                  {...form.getInputProps('email')}
                  placeholder="you@example.com"
                  radius="md"
                  size="md"
                  styles={{
                    input: {
                      border: '1.5px solid #e5e7eb',
                      background: '#f9fafb',
                      fontSize: 14,
                    },
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Password
                </label>
                <PasswordInput
                  {...form.getInputProps('password')}
                  placeholder="Enter your password"
                  radius="md"
                  size="md"
                  styles={{
                    input: {
                      border: '1.5px solid #e5e7eb',
                      background: '#f9fafb',
                      fontSize: 14,
                    },
                  }}
                />
                <div className="text-right mt-2">
                  <Link to="/forgot-password" className="text-xs text-[#1a6fa8] hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
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
                Sign In
              </Button>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#1a6fa8] font-semibold hover:underline">
                  Create account
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

export default LoginPage;