import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;
console.log("FetchApi - API URL:", apiURL); // Debug API URL

const BearerToken = () => {
  const token = localStorage.getItem("jwt")
    ? JSON.parse(localStorage.getItem("jwt")).token
    : false;
  console.log("Bearer Token:", token ? "Present" : "Missing"); // Debug token
  return token;
};

const Headers = () => {
  const headers = {
    headers: {
      token: `Bearer ${BearerToken()}`,
    },
  };
  console.log("Request Headers:", headers); // Debug headers
  return headers;
};

export const getAllCategory = async () => {
  try {
    console.log("Fetching categories from:", `${apiURL}/api/category/all-category`); // Debug API endpoint
    let res = await axios.get(`${apiURL}/api/category/all-category`, Headers());
    console.log("Category API Response:", res.data); // Debug response
    return res.data;
  } catch (error) {
    console.error("Category API Error:", error); // Debug error
    return null;
  }
};

export const createCategory = async ({
  cName,
  cImage,
  cDescription,
  cStatus,
}) => {
  let formData = new FormData();
  formData.append("cImage", cImage);
  formData.append("cName", cName);
  formData.append("cDescription", cDescription);
  formData.append("cStatus", cStatus);

  try {
    let res = await axios.post(
      `${apiURL}/api/category/add-category`,
      formData,
      Headers()
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const editCategory = async (cId, des, status) => {
  let data = { cId: cId, cDescription: des, cStatus: status };
  try {
    let res = await axios.post(
      `${apiURL}/api/category/edit-category`,
      data,
      Headers()
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteCategory = async (cId) => {
  try {
    let res = await axios.post(
      `${apiURL}/api/category/delete-category`,
      { cId },
      Headers()
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
