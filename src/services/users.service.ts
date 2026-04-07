import { IAddUser, IChangePassword } from "@/types/user";
import { BaseHttpService } from "./base.service";

export class UsersService extends BaseHttpService {
  constructor() {
    super();
  }

  async me() {
    const response = await this.httpClient.get("/user/me");
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.httpClient.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async getUsers(queryParams = {}) {
    const response = await this.httpClient.get("/system/users", {
      params: queryParams,
    });
    return response.data;
  }

  async resendPassword(id: string) {
    const response = await this.httpClient.post(
      `/system/users/${id}/resend-password`,
    );

    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.httpClient.delete(`/system/users/${id}`);
    return response.data;
  }

  async uploadUserAvatar(userId: string, formData: FormData) {

    const response = await this.httpClient.patch(
      `/system/users/${userId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  }

  async getUser(id: string) {
    const response = await this.httpClient.get(`/system/users/${id}`);
    return response.data;
  }

  async createUser(payload: IAddUser) {
    const response = await this.httpClient.post("/system/users", payload);
    return response.data;
  }

  async updateUser(id: string, payload: IAddUser) {
    const response = await this.httpClient.patch(`/system/users/${id}`, payload);
    return response.data;
  }

  async unActiveUser(id: string) {
    const response = await this.httpClient.put(
      `/user/update-status-tidak-aktif/${id}`,
    );
    return response.data;
  }

  async activateUser(id: string) {
    const response = await this.httpClient.put(
      `/user/update-status-aktif/${id}`,
    );
    return response.data;
  }

  async updatePassword(payload: IChangePassword) {
    const response = await this.httpClient.put(
      `/user/update-password`,
      payload,
    );
    return response.data;
  }

  async resetPassword(id: string, password: string) {
    const response = await this.httpClient.put(`/user/reset-password/${id}`, {
      password,
    });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.httpClient.put(`/updatepassword-emailtoken`, {
      email,
    });
    return response.data;
  }

  async validateTokenChangePassword(token: string) {
    const response = await this.httpClient.get(`/cektoken?token=${token}`);
    return response.data;
  }

  async submitForgotPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ) {
    const response = await this.httpClient.put(`/verify-token`, {
      token: token,
      password_new: password,
      password_new_confirmation: confirmPassword,
    });
    return response.data;
  }
}
