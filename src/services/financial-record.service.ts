import { BaseHttpService } from "./base.service";

export class FinancialRecordService extends BaseHttpService {
  constructor() {
    super();
  }

  async getFinancialRecords(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/financial-records", { params: queryParams });
    return response.data;
  }

  async getFlashCash(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/cash-flow", { params: queryParams });
    return response.data;
  }

  async createFlashCash(payload: Record<string, unknown>) {
    const response = await this.httpClient.post("/cash-flow", payload);
    return response.data;
  }

  async updateFlashCash(id: number, payload: Record<string, unknown>) {
    const response = await this.httpClient.patch(`/cash-flow/${id}`, payload);
    return response.data;
  }

  async deleteFlashCash(id: number) {
    const response = await this.httpClient.delete(`/cash-flow/${id}`);
    return response.data;
  }

  async approveFlashCash(id: number) {
    const response = await this.httpClient.post(`/cash-flow/${id}/approve`);
    return response.data;
  }

  async getReimbursements(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/reimbursements", { params: queryParams });
    return response.data;
  }

  async createReimbursement(payload: Record<string, unknown>) {
    const response = await this.httpClient.post("/reimbursements", payload);
    return response.data;
  }

  async updateReimbursement(id: number, payload: Record<string, unknown>) {
    const response = await this.httpClient.patch(`/reimbursements/${id}`, payload);
    return response.data;
  }

  async deleteReimbursement(id: number) {
    const response = await this.httpClient.delete(`/reimbursements/${id}`);
    return response.data;
  }

  async approveReimbursementByStaff(id: number) {
    const response = await this.httpClient.post(`/reimbursements/${id}/approve-staff`);
    return response.data;
  }

  async approveReimbursementByDirector(id: number) {
    const response = await this.httpClient.post(`/reimbursements/${id}/approve-director`);
    return response.data;
  }

  async rejectReimbursement(id: number, reason: string) {
    const response = await this.httpClient.post(`/reimbursements/${id}/reject`, { reason });
    return response.data;
  }

  async uploadReimbursementReceipt(id: number, payload: FormData) {
    const response = await this.httpClient.post(`/reimbursements/${id}/upload-receipt`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async getInvoices(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/invoices", { params: queryParams });
    return response.data;
  }

  async createInvoice(payload: Record<string, unknown>) {
    const response = await this.httpClient.post("/invoices", payload);
    return response.data;
  }

  async updateInvoice(id: number, payload: Record<string, unknown>) {
    const response = await this.httpClient.patch(`/invoices/${id}`, payload);
    return response.data;
  }

  async deleteInvoice(id: number) {
    const response = await this.httpClient.delete(`/invoices/${id}`);
    return response.data;
  }

  async issueInvoice(id: number) {
    const response = await this.httpClient.post(`/invoices/${id}/issue`);
    return response.data;
  }

  async cancelInvoice(id: number) {
    const response = await this.httpClient.post(`/invoices/${id}/cancel`);
    return response.data;
  }

  async generateInvoicePdf(id: number) {
    const response = await this.httpClient.post(`/invoices/${id}/generate-pdf`);
    return response.data;
  }

  async getPayments(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/payments", { params: queryParams });
    return response.data;
  }

  async getPaymentsByInvoice(invoiceId: number) {
    const response = await this.httpClient.get(`/payments/invoice/${invoiceId}`);
    return response.data;
  }

  async createPayment(payload: Record<string, unknown>) {
    const response = await this.httpClient.post("/payments", payload);
    return response.data;
  }

  async updatePayment(id: number, payload: Record<string, unknown>) {
    const response = await this.httpClient.patch(`/payments/${id}`, payload);
    return response.data;
  }

  async deletePayment(id: number) {
    const response = await this.httpClient.delete(`/payments/${id}`);
    return response.data;
  }

  async uploadPaymentProof(id: number, payload: FormData) {
    const response = await this.httpClient.post(`/payments/${id}/upload-proof`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async getManPowerRecords(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/man-power-records", {
      params: queryParams,
    });
    return response.data;
  }

  async createManPowerRecord(payload: Record<string, unknown>) {
    const response = await this.httpClient.post("/man-power-records", payload);
    return response.data;
  }

  async updateManPowerRecord(id: number, payload: Record<string, unknown>) {
    const response = await this.httpClient.patch(`/man-power-records/${id}`, payload);
    return response.data;
  }

  async deleteManPowerRecord(id: number) {
    const response = await this.httpClient.delete(`/man-power-records/${id}`);
    return response.data;
  }

  async approveManPowerRecord(id: number) {
    const response = await this.httpClient.post(`/man-power-records/${id}/approve`);
    return response.data;
  }

  async rejectManPowerRecord(id: number, reason: string) {
    const response = await this.httpClient.post(`/man-power-records/${id}/reject`, { reason });
    return response.data;
  }

  async markManPowerPaid(id: number) {
    const response = await this.httpClient.post(`/man-power-records/${id}/mark-paid`);
    return response.data;
  }
}
