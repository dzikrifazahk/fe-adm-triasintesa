import { BaseHttpService } from "./base.service";

export class NotificationService extends BaseHttpService {
  constructor() {
    super();
  }

  async getNotifications(queryParams?: {}) {
    const response = await this.httpClient.get("/notification/index", {
      params: queryParams,
    });
    return response.data;
  }

  async getNotification(id: string) {
    const response = await this.httpClient.get(`/notification/show/${id}`);
    return response.data;
  }

  async bulkDeleteNotification(startDate: string, endDate: string) {
    const response = await this.httpClient.delete(
      `/notification/destroy-bulk?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  }
}
