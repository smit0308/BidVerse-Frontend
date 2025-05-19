import axios from "axios";
import { BACKEND_URL } from "../../utils/url";

// Create a new axios instance with default config
const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    xsrfCookieName: 'token',
    xsrfHeaderName: 'X-CSRF-Token'
});

// Add a request interceptor to handle token
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor to handle errors
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("user");
        window.location.href = "/login";
    } else if (error.response?.status === 403) {
        // Handle email verification needed
        localStorage.removeItem("user");
        window.location.href = "/verify-email";
    }
    return Promise.reject(error);
});

export const AUTH_URL = `${BACKEND_URL}/users/`;

const register = async (userData) => {
    const response = await api.post("users/register", userData);
    return response.data;
};

const login = async (userData) => {
    try {
        const response = await api.post("users/login", userData);
        // Store user data including token
        localStorage.setItem("user", JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        throw error;
    }
};

const logOut = async () => {
    const response = await axios.get(AUTH_URL + "logout", { withCredentials: true });
    return response.data.message;
};

const getLoginStatus = async () => {
    const response = await api.get("users/loggedin");
    return response.data;
};

const getuserProfile = async () => {
    const response = await api.get("users/getuser");
    return response.data;
};

const updateUser = async (userData) => {
    const response = await axios.patch(AUTH_URL + "updateuser", userData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const loginUserAsSeller = async (userData) => {
    const response = await axios.post(`${AUTH_URL}/seller/`, userData, {
        withCredentials: true,
    });
    return response.data;
};

const getUserIncome = async () => {
    const response = await axios.get(AUTH_URL + "sell-amount", { withCredentials: true });
    return response.data;
};

//only access for admin user
const getIncome = async () => {
    const response = await axios.get(AUTH_URL + "estimate-income", { withCredentials: true });
    return response.data;
};

const getAllUser = async () => {
    const response = await axios.get(AUTH_URL + "users", { withCredentials: true });
    return response.data;
};

const deleteUser = async (userId) => {
    const response = await axios.delete(`${AUTH_URL}${userId}`, { withCredentials: true });
    return response.data;
};

const verifyEmail = async (token) => {
    const response = await axios.post(AUTH_URL + `verify-email/${token}`);
    return response.data;
};

const authService = {
    register,
    login, 
    logOut,
    getLoginStatus,
    getuserProfile,
    updateUser,
    loginUserAsSeller,
    getUserIncome,
    getIncome,
    getAllUser,
    verifyEmail,
    deleteUser
};

export default authService;
