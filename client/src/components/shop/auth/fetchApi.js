import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const isAuthenticate = () =>
  localStorage.getItem("jwt") ? JSON.parse(localStorage.getItem("jwt")) : false;

export const isAdmin = () => {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) return false;
  
  const user = JSON.parse(jwt).user;
  console.log("User from JWT:", user); // Debug log
  return user && (user.role === 1 || user.userRole === 1);
};

export const loginReq = async ({ email, password }) => {
  const data = { email, password };
  try {
    console.log("Attempting login with:", { email }); // Debug log
    let res = await axios.post(`${apiURL}/api/signin`, data);
    console.log("Login response:", res.data); // Debug log
    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return { error: error.response?.data?.error || "Login failed" };
  }
};

export const signupReq = async ({ name, email, password, cPassword }) => {
  const data = { name, email, password, cPassword };
  try {
    console.log("Attempting signup with:", { name, email }); // Debug log
    let res = await axios.post(`${apiURL}/api/signup`, data);
    console.log("Signup response:", res.data); // Debug log
    
    if (res.data.token) {
      localStorage.setItem("jwt", JSON.stringify({
        token: res.data.token,
        user: {
          _id: res.data.user._id,
          role: res.data.user.userRole,
          userRole: res.data.user.userRole
        }
      }));
    }
    
    return res.data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    return { error: error.response?.data?.error || "Signup failed" };
  }
};
