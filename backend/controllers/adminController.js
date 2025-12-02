import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModels.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'

//api for adding doctor 
const addDoctor = async (req, res) => {

    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address)
            return res.json({ success: false, message: "missing detail" })

        // validating email

        if (!validator.isEmail(email))
            return res.json({ success: false, message: "Enter email Missing" })

        if (password.length < 8)
            return res.json({ success: false, message: "Enter Long password " })


        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //upload image to clodinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save();

        res.json({ success: true, message: "Doctor added" })
    }

    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// api admin Login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
     else
        res.json({ success: false, message: "Invalid credentials" })
        
        
    }


    catch (error) {

        res.json({success:false , message:error.message})
}
}


//Api to get all Doctor list for Admin Pannel

const allDoctors = async (req, res) => {
    try {
        
        const doctors = await doctorModel.find({}).select('-password');
        res.json({success:true, doctors})
    }

    catch(error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
} 


// Api to get all Appointment

const AppointmentsAdmin = async (req, res) => {
    
    try {
        const appointments = await appointmentModel.find({ })
        res.json({success:true  , appointments})
    }

    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

const appointmentCancel = async (req, res) => {
    try {
        const {  appointmentId } = req.body;

        // Find the appointment
        const appointmentData = await appointmentModel.findById(appointmentId);
      
        // Cancel the appointment
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docid, slotDate, slotTime } = appointmentData;
        if (!docid) {
            return res.json({ success: false, message: "Missing doctor ID" });
        }

        // Find the doctor
        const doctorData = await doctorModel.findById(docid);
        if (!doctorData) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        const slots_booked = { ...doctorData.slots_booked };

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(time => time !== slotTime);

            // If the array becomes empty, optionally delete the date entry:
            if (slots_booked[slotDate].length === 0) {
                delete slots_booked[slotDate];
            }
        }

        await doctorModel.findByIdAndUpdate(docid, { slots_booked });

        res.json({ success: true, message: "Appointment Cancelled" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};



export { addDoctor, loginAdmin, allDoctors, AppointmentsAdmin, appointmentCancel }