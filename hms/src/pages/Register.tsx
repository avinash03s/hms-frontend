import { TextInput, PasswordInput, Button, SegmentedControl } from '@mantine/core';
import { IconHeartbeat, IconArrowLeft } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from '../service/UserService';
import { errorNotification, successNotification } from '../utility/Notification';
import { useState } from 'react';

const RegisterPage = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      role: "PATIENT",
      email: '',
      password: '',
      confirmPassword: ""
    },
    validate: {
      name: (value: string) => (!value ? "Name is required" : null),
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value: string) =>
        !value
          ? "Password is required"
          : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(value)
            ? null
            : "Password must be 8-15 characters...",
      confirmPassword: (value: string, values: any) =>
        (value === values.password ? null : "Passwords don't match")
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    setLoading(true);
    registerUser(values).then((data) => {
      console.log(data)
      successNotification("Registered Successfully");
      navigate('/login')
    }).catch((error) => {
      console.log(error)
      errorNotification("Error Some thing want worng");
    }).finally(() => setLoading(false))
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">

      {/* ✅ Background Image — login page jaisa */}
      <img
        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=90"
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: 'brightness(0.55)' }}
      />

      {/* ✅ Dark gradient overlay */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(10,15,30,0.85) 0%, rgba(190,24,93,0.15) 100%)' }}
      />

      {/* ✅ Back Button — top-left */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 left-5 z-10 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors duration-200 group"
      >
        <IconArrowLeft size={18} stroke={2} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* ✅ Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="py-3 text-primary-500 flex gap-1 items-center">
          <IconHeartbeat size={45} stroke={3} />
          <span className="font-heading font-semibold text-5xl">PulseCare</span>
        </div>

        <div className="w-[450px] backdrop-blur-md p-10 py-8 rounded-lg">
          <form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col gap-5 [&_input]:placeholder-neutral-100 [&_.mantine-Input-input]:!border-white focus-within:[&_.mantine-Input-input]:!border-primary-500 [&_.mantine-Input-input]:!border [&_input]:!pl-2 [&_svg]:text-white [&_input]:text-white'>
            <div className='self-center font-medium font-heading text-white text-xl'>Register</div>
            <SegmentedControl {...form.getInputProps("role")} fullWidth size="md" color='#24AE9E' bg="none" className='[&_*]:!text-white border border-white' data={[{ label: 'Patient', value: "PATIENT" }, { label: 'Doctor', value: "DOCTOR" },]} />
            {/*  { label: 'Admin', value: "ADMIN" }, */}
            <TextInput {...form.getInputProps('name')} className='transition duration-300' variant="unstyled" size="md" placeholder="Name" />
            <TextInput {...form.getInputProps('email')} className='transition duration-300' variant="unstyled" size="md" placeholder="Email" />
            <PasswordInput {...form.getInputProps('password')} className='transition duration-300' variant="unstyled" size="md" placeholder="Password" />
            <PasswordInput {...form.getInputProps('confirmPassword')} className='transition duration-300' variant="unstyled" size="md" placeholder="Confirm Password" />
            <Button loading={loading} radius="md" size="md" type='submit' color='#24AE9E'>Register</Button>
            <div className='text-neutral-100 text-sm self-center'>Have an account? <Link to="/login" className='hover:underline'>Login</Link></div>
          </form>
        </div>
      </div>

    </div>
  )
}
export default RegisterPage