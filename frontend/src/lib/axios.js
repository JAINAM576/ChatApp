import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: "http://192.168.1.25:5001/api",
    withCredentials: true, // send cookies
})