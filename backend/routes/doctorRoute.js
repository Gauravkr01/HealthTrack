import express from 'express'
// import { doctor List } from '../controllers/doctorContr
import { doctorList } from '../controllers/doctorController.js' 


const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)

export default doctorRouter