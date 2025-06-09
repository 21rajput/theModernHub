import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const getBrainTreeToken = async () => {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      throw new Error("User not authenticated");
    }
    
    const uId = JSON.parse(jwt).user._id;
    const res = await axios.post(`${apiURL}/api/braintree/get-token`, {
      uId: uId,
    });
    
    if (!res.data) {
      throw new Error("No response from server");
    }
    
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    
    return res.data;
  } catch (error) {
    console.error("Braintree token error:", error);
    throw error;
  }
};

export const getPaymentProcess = async (paymentData) => {
  try {
    if (!paymentData.amountTotal || !paymentData.paymentMethod) {
      throw new Error("Invalid payment data");
    }
    
    const res = await axios.post(`${apiURL}/api/braintree/payment`, paymentData);
    
    if (!res.data) {
      throw new Error("No response from server");
    }
    
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    
    return res.data;
  } catch (error) {
    console.error("Payment process error:", error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    if (!orderData.allProduct || !orderData.user || !orderData.amount) {
      throw new Error("Invalid order data");
    }
    
    const res = await axios.post(`${apiURL}/api/order/create-order`, orderData);
    
    if (!res.data) {
      throw new Error("No response from server");
    }
    
    return res.data;
  } catch (error) {
    console.error("Order creation error:", error);
    throw error;
  }
};
