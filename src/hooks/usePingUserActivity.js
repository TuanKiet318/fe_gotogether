import axios from "../service/axios.admin.customize";
import { useEffect } from "react";

const usePingUserActivity = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      axios.post("/users/ping").catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, []);
};

export default usePingUserActivity;
