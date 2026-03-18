import { getCookie } from "cookies-next";
import { BaseHttpService } from "./base.service";

export class AuthService extends BaseHttpService {
  constructor() {
    super();
  }

  async login(emailOrUsername: string, password: string) {
    const response = await this.httpClient.post("/auth/login", {
      emailOrUsername: emailOrUsername,
      password: password,
    });

    return response.data;
  }

  async logout() {
    const response = await this.httpClient.post("/logout");
    return response.data;
  }
}
