// import { useEffect, useState } from "react";
import { useSelector } from "react-redux"
// import {getUserProfile } from "../../../service/UserService"

const Welcome = () => {

    const user = useSelector((state: any) => state.user);
    // const [picId, setPicId] = useState<string | null>(null);

    // useEffect(() => {
    //     if (!user) return;

    //     getUserProfile(user.id).then((data) => {
    //         setPicId(data);
    //     }).catch((error) => {
    //         console.log(error);
    //     });
    // }, []);

    // const url = useProtectedImage(picId);

    return (
        <div>
            <div>
                <div>Welcome Back</div>
                <div>{user.name}</div>
                <div>Surgery, Cardiology</div>
            </div>
        </div>
    )
}

export default Welcome