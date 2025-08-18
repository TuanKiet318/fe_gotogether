import axios from "./axios.admin.customize";

const RegisterUser = async (user) => {
  const API = `/users/register`;
  return await axios.post(API, user);
};

const RegisterSeller = async (user) => {
  const API = `/users/register/supplier`;
  return await axios.post(API, user);
};
const GetUserByRole = async (role) => {
  const API = `/users/by-role/${role}`;
  return await axios.get(API);
};
export { RegisterUser, RegisterSeller, GetUserByRole };
