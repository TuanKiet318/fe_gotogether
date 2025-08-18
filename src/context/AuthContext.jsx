import { createContext } from "react";

export const AuthContext = createContext({
  isAuthenticated: () => !!localStorage.getItem("token"),
});
