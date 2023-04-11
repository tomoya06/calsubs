import axios from "axios";
import { GhUserInfo } from "./types/github";

// ======== myservice api

const appService = axios.create({
  baseURL: "http://localhost:8090",
});
export const getAuthToken = (params: { code: string }) =>
  appService.get<{ access_token: string }>("/auth", {
    params,
  });

// ======== github api

const githubService = axios.create({
  baseURL: "https://api.github.com",
});

export const updateGithubBearer = (token: string) => {
  githubService.defaults.headers["Authorization"] = `Bearer ${token}`;
  githubService.defaults.headers["Accept"] = "json";
  githubService.defaults.headers["X-GitHub-Api-Version"] = "2022-11-28";
};

export const getUserInfo = () => githubService.get<GhUserInfo>("/user");
