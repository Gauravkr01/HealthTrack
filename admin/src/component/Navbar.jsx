import React, { useContext } from 'react'
import {assets} from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import {useNavigate} from 'react-router-dom'

const Navbar = () => {

    const { aToken , setAToken } = useContext(AdminContext);
     const navigate = useNavigate();

    const logout = () => {
        navigate('/')
        aToken && setAToken('')
        aToken && localStorage.removeItem('aToken')

        
    }
    
    return (
        
        <div className=' h-20 flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white shadow-md'>
            <div className='flex items-center gap-3 text-lg'>
                <img className='w-36 sm:40 cursor-pointer' src={assets.admin_logo1} alt="" />
                <p className='border px-2.5 py-0.5 border-green-400 rounded-full'>{aToken ? 'Admin' : 'Doctor'}</p>
            </div>
            <button onClick={logout} className='bg-green-500 text-white rounded-md p-2'>Logout </button>
        </div>
    )
}

export default Navbar;