import { Outlet } from "react-router-dom"
import Header from "../components/header/Header"
import Sidebar from "../components/Patient/sidebar/Sidebar"
import { useMediaQuery } from "@mantine/hooks";


const PatientDashboard = () => {
  const matches = useMediaQuery('(max-width:768px)');
  return (
    <div className="flex">
      {!matches&&<Sidebar />}
      <div className="w-full overflow-hidden flex flex-col">
        <Header />
        <Outlet />
      </div>
    </div>
  )
}
export default PatientDashboard