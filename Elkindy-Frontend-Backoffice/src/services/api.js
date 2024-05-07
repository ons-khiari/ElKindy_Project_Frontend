import axios from "axios";
import Cookies from 'js-cookie';

const instance = axios.create({
    baseURL: "https://elkindy-project-backend.onrender.com/api",
    headers: {
        "Content-Type": "application/json",
    },
});

instance.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        if (token) {
            config.headers["x-access-token"] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;
        console.log('originalConfig', originalConfig.url);

        if (originalConfig.url !== "https://elkindy-project-backend.onrender.com/api/auth/loginEmail" && err.response) {
            if (err.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true;

                try {
                    const rs = await instance.post("/auth/refreshtoken", {
                        refreshToken: Cookies.get("refreshToken"),
                    });

                    const { newToken } = rs.data;
                    Cookies.set("token", newToken);
                    originalConfig.headers["x-access-token"] = newToken;

                    return instance(originalConfig);
                } catch (_error) {
                    return Promise.reject(_error);
                }
            }
        }

        return Promise.reject(err);
    }
);

export default instance;