import viteLogo from "/vite.svg";
import "./App.css";
import { useEffect } from "react";
import qs from 'qs';
import { getAuthToken } from "./axios";
import { isString } from 'lodash';


function App() {
  useEffect(() => {
    const initLogin = async () => {
      const { code } = qs.parse(window.location.search);
      if (code && isString(code)) {
        const  getAuthToken({
          code,
        })
      }
    }
  }, []);

  return (
    <div className="App">
      <div>
        <a
          href={`https://github.com/login/oauth/authorize?client_id=Iv1.432545adc4712e84&state=abcdefg&redirect_uri=${decodeURIComponent(
            "http://localhost:5173"
          )}`}
          target="_blank"
        >
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Login with GitHub</h1>
    </div>
  );
}

export default App;
