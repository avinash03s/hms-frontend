import { TextInput, PasswordInput, Button } from '@mantine/core';
import { IconHeartbeat, IconArrowLeft } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from '../service/UserService';
import { errorNotification, successNotification } from '../utility/Notification';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setJwt } from '../slices/JwtSlices';
import { setUser } from '../slices/UserSlices';

const LogiPage = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (!value ? "Password is required" : null)
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    setLoading(true);
    loginUser(values).then((_data) => {
      console.log(jwtDecode(_data))
      successNotification("Login Successfully")
      dispatch(setJwt(_data))
      dispatch(setUser(jwtDecode(_data)))
    }).catch((eroor) => {
      errorNotification(eroor?.response?.data?.errorMessage);
    }).finally(() => setLoading(false))
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">

      {/* ✅ Background Image */}
      <img
        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=90"
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: 'brightness(0.55)' }}
      />

      {/* ✅ Dark gradient overlay — public page jaisa */}
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

      {/* ✅ Content — relative z-10 taaki image ke upar rahe */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="py-3 text-primary-500 flex gap-1 items-center">
          <IconHeartbeat size={45} stroke={3} />
          <span className="font-heading font-semibold text-5xl">PulseCare</span>
        </div>

        <div className="w-[450px] backdrop-blur-md p-10 py-8 rounded-lg">
          <form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col gap-5 [&_input]:placeholder-neutral-100 [&_.mantine-Input-input]:!border-white focus-within:[&_.mantine-Input-input]:!border-pink-400 [&_.mantine-Input-input]:!border [&_input]:!pl-2 [&_svg]:text-white [&_input]:text-white'>
            <div className='self-center font-medium font-heading text-white text-xl'>Login</div>
            <TextInput {...form.getInputProps('email')} className='transition duration-300' variant="unstyled" size="md" placeholder="Email" />
            <PasswordInput {...form.getInputProps('password')} className='transition duration-300' variant="unstyled" size="md" placeholder="Password" />
            <Button loading={loading} radius="md" size="md" type='submit' color='#24AE9E'>Login</Button>
            <div className='text-neutral-100 text-sm self-center'>Don't have an account? <Link to="/register" className='hover:underline'>Create account</Link></div>
          </form>
        </div>
      </div>

    </div>
  )
}
export default LogiPage