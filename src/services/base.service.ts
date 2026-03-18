
import { IUser } from "@/types/user";
import axios, { AxiosError, AxiosInstance, ResponseType } from "axios";
import { deleteCookie, getCookie } from "cookies-next";
import Swal from "sweetalert2";

export function getUser(): IUser {
  const cookie = getCookie("userData");
  const user = cookie && JSON.parse(`${cookie}`);
  return user;
}

export abstract class BaseHttpService {
  readonly httpClient: AxiosInstance;
  // readonly http2: AxiosInstance;
  readonly baseURL = process.env.NEXT_PUBLIC_BASE_URL as string;
  
  constructor() {
    const secretToken = getCookie("accessToken") as string;
    this.httpClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${secretToken}`,
      },
    });
    // this.http2 = axios.create({
    //   baseURL: this.baseUrl2,
    //   // responseType: "blob" as ResponseType,
    //   headers: {
    //     Authorization: `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
    //   },
    // });

    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          try {
            await this.httpClient.post("/logout");
          } catch (logoutError) {
            console.error("Logout error:", logoutError);
          }

          deleteCookie("accessToken");
          deleteCookie("userData");

          if (typeof window !== "undefined") {
            Swal.fire({
              icon: "warning",
              title: "Session Expired",
              text: "Please login again for continue",
              position: "center",
              showConfirmButton: false,
              timer: 2500,
            });
            window.location.href = "/signin";
          }
        }
        return Promise.reject(error);
      }
    );
  }
}
