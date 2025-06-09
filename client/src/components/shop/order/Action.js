import { createOrder } from "./FetchApi";

export const fetchData = async (cartListProduct, dispatch) => {
  dispatch({ type: "loading", payload: true });
  try {
    let responseData = await cartListProduct();
    if (responseData && responseData.Products) {
      setTimeout(function () {
        dispatch({ type: "cartProduct", payload: responseData.Products });
        dispatch({ type: "loading", payload: false });
      }, 1000);
    }
  } catch (error) {
    console.log(error);
    dispatch({ type: "loading", payload: false });
  }
};

export const fetchbrainTree = async (getBrainTreeToken, setState) => {
  try {
    let responseData = await getBrainTreeToken();
    if (responseData && responseData.clientToken) {
      setState({
        clientToken: responseData.clientToken,
        success: responseData.success,
        braintreeError: false
      });
    } else if (responseData && responseData.error) {
      console.log("Braintree error:", responseData.error);
      setState(prev => ({ ...prev, braintreeError: true }));
    }
  } catch (error) {
    console.log("Braintree initialization error:", error);
    setState(prev => ({ ...prev, braintreeError: true }));
    throw error; // Re-throw to be caught by the component
  }
};

export const pay = async (
  data,
  dispatch,
  state,
  setState,
  getPaymentProcess,
  totalCost,
  history
) => {
  if (state.braintreeError) {
    setState({ ...state, error: "Payment processing is currently unavailable" });
    return;
  }

  if (!state.address) {
    setState({ ...state, error: "Please provide your address" });
  } else if (!state.phone) {
    setState({ ...state, error: "Please provide your phone number" });
  } else {
    let nonce;
    try {
      nonce = await state.instance.requestPaymentMethod();
      dispatch({ type: "loading", payload: true });
      
      let paymentData = {
        amountTotal: totalCost(),
        paymentMethod: nonce,
      };
      
      const res = await getPaymentProcess(paymentData);
      if (res) {
        let orderData = {
          allProduct: JSON.parse(localStorage.getItem("cart")),
          user: JSON.parse(localStorage.getItem("jwt")).user._id,
          amount: res.transaction.amount,
          transactionId: res.transaction.id,
          address: state.address,
          phone: state.phone,
        };
        
        try {
          let responseData = await createOrder(orderData);
          if (responseData.success) {
            localStorage.setItem("cart", JSON.stringify([]));
            dispatch({ type: "cartProduct", payload: null });
            dispatch({ type: "cartTotalCost", payload: null });
            dispatch({ type: "orderSuccess", payload: true });
            setState({ clientToken: "", instance: {} });
            dispatch({ type: "loading", payload: false });
            return history.push("/");
          } else if (responseData.error) {
            console.log(responseData.error);
            setState({ ...state, error: responseData.error });
          }
        } catch (error) {
          console.log("Order creation error:", error);
          setState({ ...state, error: "Failed to create order" });
        }
      }
    } catch (error) {
      console.log("Payment error:", error);
      setState({ ...state, error: error.message || "Payment failed" });
    } finally {
      dispatch({ type: "loading", payload: false });
    }
  }
};
