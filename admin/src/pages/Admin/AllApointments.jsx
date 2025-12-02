import React from 'react'
import { useEffect } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from "../../assets/assets.js";



const AllApointments = () => { 

  const { aToken, appointments, getAllAppointments, cancelAppointments } = useContext(AdminContext);

  const {calculateAge} = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken]) 


  const formateDate = (dateStr) => {
    if (!dateStr) return "";
    
    const [day, month, year] = dateStr.split("_")

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]; 

    return `${day} ${months[month -1]} ${year}`

  }

  return (
    <div className='w-full max-w-6xl m-5'>
      
      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
        <div className=' hidden-sm grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b' > 
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date and Time</p>
          <p> Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div> 

        {
          appointments.map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] item-center  text-black-500 py-3 px-6 border-b hover:bg-green-400' key={index}>
              <p>{index + 1}</p>
              
              {/* image tage for patients */}
              
              <div className='flex items-center gap-2 '> 
                <img className='w-8 rounded-full' src={item.userData.image} alt="" />
                <p>{item.userData.name}</p> 
              </div>

              <p>{calculateAge(item.userData.dob)}</p>

              <p>{formateDate(item.slotDate)} <> </>{item.slotTime}</p>
              

              <div className='flex items-center gap-2 '>
                <img className='w-8 rounded-full' src={item.docData.image} alt="" />
                <p>{item.docData.name}</p> 
              </div>

              <p>${item.docData.fees}</p> 

              {
                item.cancelled ? <p className='text-red-500 '>Cancelled</p> :
                  <img onClick={() => cancelAppointments(item._id)}  className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
              }

          
              

            </div>

              ))
          }

      </div>


    </div>
  )
}

export default AllApointments
