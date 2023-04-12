import axios from "axios";
import { GhUserInfo } from "./types/github";
import qs from "qs";
import { isString } from "lodash";

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

export const loginProcedure = async (): Promise<GhUserInfo | undefined> => {
  let access_token = localStorage.getItem("access_token");

  async function tryGetUser() {
    const { data } = await getUserInfo();
    if (data?.id && data?.avatar_url) {
      localStorage.setItem("access_token", access_token!);
      var newurl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
      window.history.pushState({ path: newurl }, "", newurl);

      return data;
    }
    throw new Error();
  }

  // use the bearer from localstorage first
  if (access_token) {
    updateGithubBearer(access_token);

    try {
      const output = await tryGetUser();
      return output;
    } catch (error) {}
  }

  // then try generate from query code
  const { code } = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });

  if (!isString(code)) {
    return undefined;
  }
  const tokenResp = await getAuthToken({
    code,
  });
  access_token = tokenResp.data?.access_token;
  if (access_token) {
    updateGithubBearer(access_token);

    try {
      const output = await tryGetUser();
      return output;
    } catch (error) {}
  }

  unsetGithubBearer();

  return undefined;
};

const updateGithubBearer = (token: string) => {
  githubService.defaults.headers["Authorization"] = `Bearer ${token}`;
  githubService.defaults.headers["Accept"] = "json";
  githubService.defaults.headers["X-GitHub-Api-Version"] = "2022-11-28";
};

const unsetGithubBearer = () => {
  delete githubService.defaults.headers["Authorization"];
  delete githubService.defaults.headers["Accept"];
  delete githubService.defaults.headers["X-GitHub-Api-Version"];
};

const getUserInfo = () => githubService.get<GhUserInfo>("/user");
