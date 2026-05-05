import axios from "axios";
const baseURL = axios.create({
    baseURL:"http://localhost:3000/api"
})
export default baseURL