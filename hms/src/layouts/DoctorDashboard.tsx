import { Outlet } from "react-router-dom"
import Header from "../components/header/Header"
import Sidebar from "../components/Doctor/sidebar/Sidebar"
import { useMediaQuery } from "@mantine/hooks";


const DoctorDashboard = () => {
  const matches = useMediaQuery('(max-width:768px)');
  return (
    <div className="flex">
      {!matches&&<Sidebar />}
      <div className="w-full flex flex-col">
        <Header />
        <Outlet />
      </div>
    </div>
  )
}
export default DoctorDashboard