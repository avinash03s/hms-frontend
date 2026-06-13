// import { createSlice } from "@reduxjs/toolkit";
// import { jwtDecode } from "jwt-decode";

// const userSlice = createSlice({
//     name: 'user',
//     initialState: localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token') || '') : {},
//     reducers: {
//         setUser: (state, action) => {
//             state = action.payload;
//             return state;
//         },
//         removeUser: (state) => {
//             state = {};
//             return state;
//         }
//     }
// })

// export const { removeUser, setUser } = userSlice.actions;
// export default userSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const getInitialUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token || token.split(".").length !== 3) return {};
    return jwtDecode(token);
  } catch {
    return {};
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: getInitialUser() as any,
  reducers: {
    setUser: (_state, action) => action.payload,
    removeUser: () => ({}),
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;