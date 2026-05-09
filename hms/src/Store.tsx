import { configureStore } from "@reduxjs/toolkit";
import jwtReducer from "./slices/JwtSlices";
import userReducer from "./slices/UserSlices";

export default configureStore({
    reducer: {
        jwt: jwtReducer,
        user: userReducer
    }
})