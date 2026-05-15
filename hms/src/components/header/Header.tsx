import { Button } from '@mantine/core';
import ProfileMenu from './ProfileMenu';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { removeJwt } from '../../slices/JwtSlices';
import { removeUser } from '../../slices/UserSlices';
import SideDrawer from '../sidedrawer/SideDrawer';
import { useMediaQuery } from '@mantine/hooks';


const Header = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    const handleLogout = () => {
        console.log("Logout")
        localStorage.removeItem("token");
        dispatch(removeJwt());
        dispatch(removeUser())
    }
    useEffect(() => {
        console.log(user)
    }, [])

    const matches = useMediaQuery('(max-width:768px)');
    return (
        <div className='bg-light shadow-lg w-full h-20 flex justify-between px-5 items-center'>
            {matches && <SideDrawer />}
            <div></div>
            <div className='flex gap-5 items-center'>

                {user ? (
                    <Button color='red' onClick={handleLogout}>Logout</Button>
                ) : (
                    <Link to="/login"><Button>Login</Button></Link>
                )}

                {user && <>
                    {/* <ActionIcon variant="transparent" size='md' aria-label="Settings">
                    <IconBellRinging style={{ width: '90%', height: '90%' }} stroke={2} />
                </ActionIcon> */}

                    <ProfileMenu /></>}
            </div>
        </div>
    )
}
export default Header