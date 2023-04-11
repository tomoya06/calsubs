import axios from "axios";

axios.defaults.baseURL = "http://localhost:8090";

export const getAuthToken = (params: { code: string }) =>
  axios.get("/auth", {
    params,
  });
