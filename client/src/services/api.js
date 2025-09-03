import axios from 'axios'
import { backendUrl } from '../utils/backendUrl'

const api = axios.create({
    baseURL: backendUrl , 
    withCredentials: true
})

export default api;