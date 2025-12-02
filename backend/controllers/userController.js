import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModels.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import appointmentModel from '../models/appointmentModel.js'
import Stripe from 'stripe'


//Api to resgisterUser

const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "enter a valid email" })

        }

        if (password.length < 8) {
            return res.json({ success: false, message: "enter a strong password" })
        }


        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })


    }



    catch (error) {

        console.log(error)
        res.json({ success: false, message: error.message })


    }
}

// API for user Login

const loginUser = async (req , res) => {
    
    try {

        const { email, password } = req.body
        const user = await userModel.findOne({ email })
        if (!user) {
           return res.json({ success: false, message: 'User does not exist' })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    }

    catch (error)
    {
        console.log(error)
        res.json({ success: false, message: error.message })
        
    }
}

//Api to get USER profile data

const getProfile = async (req, res) => {
    
    try {

        const { userId } = req.body;
        const userData = await userModel.findById(userId).select('-password')
        res.json({ success: true, userData })

    }

    catch (error)
    {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to update profile;

const updateProfile = async (req, res) => {
    try {
        // console.log("req.body:", req.body);
        // console.log("req.file:", req.file);
        
        const { userId , name, phone, address, dob, gender } = req.body;

        const imageFile =  req.file
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }
        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob , gender })
        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            const imageUrl = imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId, { image: imageUrl });
        }

        res.json({success:true , message:"Profile updated"})
        
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
    
}

//API TO BOOK APPOINTMENT

const bookAppointment  = async (req, res) => {
    
    try {
        
        const { userId, docId, slotDate, slotTime } = req.body;
        const docData = await doctorModel.findById(docId).select('-password');

        if (!docData.available)
        {
            return res.json({ success: false, message: 'Doctor are not Available' });
        }

        let slots_booked = docData.slots_booked
        // checking for slot availablity
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot not available' })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        }
        else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }
        const userData = await userModel.findById(userId).select('-password')
        delete docData.slots_booked 

        const appointmentData = {
            userId,
            docid: docId,
            userData,
            docData, 
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }
        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // /save new slot data in docData 
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        res.json({success:true , message : 'Appointment Booked'})
        

    }

    catch (error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });

    }
}

//List of APpointment User BOOked
 
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId });
        res.json({success:true , appointments})
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//LogiC to Cancel the appointment ;

const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;

        // Find the appointment
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // Check if appointment belongs to user
        if (appointmentData.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

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
  

//API to make Payemnt through Razorpay

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createStripeSession = async(req, res) => {
    
    try {

        const { appointmentId } = req.body;
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) return res.json({ success: false, message: "Appointment not found" });

        const session = await stripe.checkout.sessions.create({

            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Appointment with ${appointment.docData.name}`,
                    },
                    unit_amount: appointment.amount * 100, // in paise
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/my-appointments`,
            
            metadata: { appointmentId: appointment._id.toString() },
        })


        res.json({ success: true, url: session.url  });
        
    }
    catch (error) {
        console.log(error);
        res.json({success:false  , message:error.message})
    }
} 


// verify stripe 
const verifyStripePayment = async (req, res) => {
    
    try {
        const { sessionId } = req.body;

        // 1. Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // 2. Get appointmentId from metadata
        const appointmentId = session.metadata.appointmentId;

        // 3. Find the appointment in DB
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        // 4. Update payment field to true
        appointment.payment = true;
        await userModel.findByIdAndUpdate(appointment.userId, { $set: { hasPaid: true } });
        await appointment.save();

        res.status(200).json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Payment verification failed" });
      }
};
  


export {
    registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, 
    createStripeSession, verifyStripePayment
}