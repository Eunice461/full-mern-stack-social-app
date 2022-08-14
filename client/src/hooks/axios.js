import axios from "axios";

const BASE_URL = "http://localhost:5000/v1/";

export default axios.create({
    baseURL: BASE_URL
});