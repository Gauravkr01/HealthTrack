import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
const Sidebar = () => {
    const { aToken } = useContext(AdminContext)
    return (
        <div className='min-h-screen bg-white border-r shadow-md '>
            {
                aToken && <ul className=' text-green-800  '>
                    <NavLink className={({ isActive }) => `flex items-center gap-1 py-3.5 px-3 md:px-9 md:min-w-72 ${isActive ? 'bg-[#F2F3FF]  border-r-4 border-green-600' : ''} `} to={'/admin-Dashboard'}>
                        <img src={assets.home_icon} alt="" />
                        <p>Dashboard</p>
                    </NavLink>

                    <NavLink className={({ isActive }) => `flex items-center gap-1 py-3.5 px-3 md:px-9 md:min-w-72 ${isActive ? 'bg-[#F2F3FF]  border-r-4  border-green-600' : ''} `} to={'/all-appointments'}>
                        <img src={assets.appointment_icon} alt="" />
                        <p>Appointments</p>
                    </NavLink>
                    
                    <NavLink className={({ isActive }) => `flex items-center gap-1 py-3.5 px-3 md:px-9 md:min-w-72 ${isActive ? 'bg-[#F2F3FF]  border-r-4  border-green-600' : ''} `} to={'/add-doctor'}>
                        <img src={assets.add_icon} alt="" />
                        <p>AddDoctor</p>
                    </NavLink>
                    
                    <NavLink className={({ isActive }) => `flex items-center gap-1 py-3.5 px-3 md:px-9 md:min-w-72 ${isActive ? 'bg-[#F2F3FF]  border-r-4  border-green-600' : ''} `} to={'/doctor-list'}>
                        <img src={assets.people_icon} alt="" />
                        <p>Doctor List</p>
                    </NavLink>
                </ul>

            }

        </div >

    )
}

export default Sidebar;

