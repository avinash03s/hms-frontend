import { Outlet } from "react-router-dom"
import Header from "../components/header/Header"
import Sidebar from "../components/admin/sidebar/Sidebar"


const AdminDashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full flex flex-col">
        <Header />
        <Outlet />
      </div>
    </div>
  )
}
export default AdminDashboard