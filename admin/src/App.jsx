import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './component/Navbar';
import Sidebar from './component/Sidebar';
import { Route, Routes } from 'react-router-dom';
import AllApointments from './pages/Admin/AllApointments.jsx';
import DashBoard from './pages/Admin/DashBoard.jsx';
import DoctorList from './pages/Admin/DoctorList.jsx';
import AddDoctor from './pages/admin/AddDoctor.jsx';






const App = () => {

  const { aToken } = useContext(AdminContext);


  return aToken ? (
    <div>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar /> 
        
        <Routes>
          <Route path ='/' element={<></>} />
          <Route path='/admin-Dashboard' element={ <DashBoard/>}/>
          <Route path ='/all-appointments' element={<AllApointments/>} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path ='/doctor-list' element={<DoctorList/>}/>
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App
