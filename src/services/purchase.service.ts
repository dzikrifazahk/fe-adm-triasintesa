import { IDivision } from "@/types/division";
import { BaseHttpService } from "./base.service";
import { IAcceptPurchase, IRejectPurchase } from "@/types/purchase";

export class PurchaseService extends BaseHttpService {
  constructor() {
    super();
  }

  async getPurchases(queryParams = {}) {
    const response = await this.httpClient.get("/purchase", {
      params: queryParams,
    });
    return response.data;
  }

  async getAllPurchases(queryParams = {}) {
    const response = await this.httpClient.get("/purchase/all", {
      params: queryParams,
    });
    return response.data;
  }

  async deletePurchase(id: string) {
    const response = await this.httpClient.delete(
      `/purchase/delete-purchase/${id}`
    );
    return response.data;
  }

  async getPurchase(id: string) {
    const response = await this.httpClient.get(`/purchase/${id}`);
    return response.data;
  }

  async createPurchase(payload: FormData) {
    const response = await this.httpClient.post(
      "/purchase/create-purchase",
      payload
    );
    return response.data;
  }

  async updatePurchase(id: string, payload: FormData) {
    const response = await this.httpClient.post(
      `/purchase/update-purchase/${id}?_method=put`,
      payload
    );
    return response.data;
  }

  async paymentPurchase(id: string, payload: FormData) {
    const response = await this.httpClient.post(
      `/purchase/payment/${id}?_method=put`,
      payload
    );
    return response.data;
  }

  async updatePaymentPurchase(id: string, payload: FormData) {
    const response = await this.httpClient.post(
      `/update-payment/${id}?_method=put`,
      payload
    );
    return response.data;
  }

  async acceptPurchase(id: string, payload: IAcceptPurchase) {
    const response = await this.httpClient.put(
      `/purchase/accept/${id}`,
      payload
    );
    return response.data;
  }

  async generatePdf(id: string) {
    const response = await this.httpClient.post(`/purchase/generate-pdf`, {
      doc_no: id,
    });
    return response.data;
  }

  async rejectPurchase(id: string, payload: IRejectPurchase) {
    const response = await this.httpClient.put(
      `/purchase/reject/${id}`,
      payload
    );
    return response.data;
  }

  async activatePurchase(id: string, payload: FormData) {
    const response = await this.httpClient.post(
      `/purchase/activate/${id}?_method=put`,
      payload
    );
    return response.data;
  }

  async deleteEvidencePurchase(id: number) {
    const response = await this.httpClient.delete(
      `/purchase/delete-document/${id}`
    );
    return response.data;
  }

  async undoPurchase(id: string) {
    const response = await this.httpClient.put(`/purchase/undo/${id}`);
    return response.data;
  }

  async paymentRequest(id: string) {
    const response = await this.httpClient.put(`/purchase/request/${id}`);
    return response.data;
  }

  async getCountingPurchase(queryParams = {}) {
    const response = await this.httpClient.get(`/purchase/counting-purchase`, {
      params: queryParams,
    });
    return response.data;
  }
}
