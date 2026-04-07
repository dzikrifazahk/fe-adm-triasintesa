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

  async changePasswordAuthenticated(
    currentPassword: string,
    newPassword: string,
  ) {
    const response = await this.httpClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });

    return response.data;
  }

  async forgotPasswordUnauthenticated(email: string) {
    const response = await this.httpClient.post(
      "/system/users/reset-password",
      {
        emailOrUsername: email,
      },
      {
        headers: {
          "x-public-key": `${process.env.NEXT_PUBLIC_ACCESS_CODE}`,
        },
      },
    );

    return response.data;
  }

  async logout() {
    const response = await this.httpClient.post("/logout");
    return response.data;
  }
}
