import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {

  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setAToken, backendUrl } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })

        if (data.success) {
          console.log(data.token);
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
        }
        else {
          toast.error(data.message);
        }

      }
    

    }

    catch {
      
    }

  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] shadow-lg'>
        <p className='text-3xl m-auto font-semibold'><span className='text-green-600'> {state} </span> Login</p>
        <div className='w-full'>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-gray-500 w-full mt-1 rounded' type="email" required />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-gray-500 w-full mt-1 rounded' type="password" required />
        </div>
        <button className='bg-green-700 w-full rounded text-white p-2 mt-2'>Login</button>
        {
          state === 'Admin' ? <p className='text-green-700 cursor-pointer'>Doctor Login? <span className=' underline text-black cursor-pointer' onClick={() => setState('Doctor')}>Click Here</span></p>
            : <p className='text-green-700 cursor-pointer'>Admin Login? <span className=' underline text-black cursor-pointer' onClick={() => setState('Admin')}>Click Here</span></p>
        }
      </div>
    </form>
  )
}
export default Login;