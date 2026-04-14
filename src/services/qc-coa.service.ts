import { BaseHttpService } from "./base.service";

export class QcCoaService extends BaseHttpService {
  constructor() {
    super();
  }

  async getQcInspections(queryParams?: {}) {
    const response = await this.httpClient.get("/qc-coa/qc-inspections", {
      params: queryParams,
    });
    return response.data;
  }

  async getQcInspection(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/qc-inspections/${id}`,
    );
    return response.data;
  }

  async createQcInspection(payload: any) {
    const response = await this.httpClient.post(
      "/qc-coa/qc-inspections",
      payload,
    );
    return response.data;
  }

  async updateQcInspection(id: string, payload: any) {
    const response = await this.httpClient.patch(
      `/qc-coa/qc-inspections/${id}`,
      payload,
    );
    return response.data;
  }

  async deleteQcInspection(id: string) {
    const response = await this.httpClient.delete(
      `/qc-coa/qc-inspections/${id}`,
    );
    return response.data;
  }

  async replaceQcResults(id: string, payload: any) {
    const response = await this.httpClient.put(
      `/qc-coa/qc-inspections/${id}/results`,
      payload,
    );
    return response.data;
  }

  async getQcInspectionApprovalStatus(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/qc-inspections/${id}/approval-status`,
    );
    return response.data;
  }

  async approvePjtQc(id: string, payload?: { digitalSignature?: string }) {
    const response = await this.httpClient.post(
      `/qc-coa/qc-inspections/${id}/approve-pjt-qc`,
      payload ?? {},
    );
    return response.data;
  }

  async approveStaffProduksi(id: string) {
    const response = await this.httpClient.post(
      `/qc-coa/qc-inspections/${id}/approve-staff-produksi`,
    );
    return response.data;
  }

  async approveDirektur(
    id: string,
    file: File,
    digitalSignature?: string,
  ) {
    const formData = new FormData();
    formData.append("stamp", file);
    if (digitalSignature) {
      formData.append("digitalSignature", digitalSignature);
    }
    const response = await this.httpClient.post(
      `/qc-coa/qc-inspections/${id}/approve-direktur`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  }

  async rejectQcInspection(
    id: string,
    payload: { reason: string; notes?: string },
  ) {
    const response = await this.httpClient.post(
      `/qc-coa/qc-inspections/${id}/reject`,
      payload,
    );
    return response.data;
  }

  async getQcTemplates(queryParams?: {}) {
    const response = await this.httpClient.get("/qc-coa/qc-templates", {
      params: queryParams,
    });
    return response.data;
  }

  async getQcTemplate(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/qc-templates/${id}`,
    );
    return response.data;
  }

  async createQcTemplate(payload: any) {
    const response = await this.httpClient.post(
      "/qc-coa/qc-templates",
      payload,
    );
    return response.data;
  }

  async updateQcTemplate(id: string, payload: any) {
    const response = await this.httpClient.patch(
      `/qc-coa/qc-templates/${id}`,
      payload,
    );
    return response.data;
  }

  async deleteQcTemplate(id: string) {
    const response = await this.httpClient.delete(
      `/qc-coa/qc-templates/${id}`,
    );
    return response.data;
  }

  async getQcRejectLogs(queryParams?: {}) {
    const response = await this.httpClient.get("/qc-coa/qc-reject-logs", {
      params: queryParams,
    });
    return response.data;
  }

  async getQcRejectLog(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/qc-reject-logs/${id}`,
    );
    return response.data;
  }

  async createQcRejectLog(payload: any) {
    const response = await this.httpClient.post(
      "/qc-coa/qc-reject-logs",
      payload,
    );
    return response.data;
  }

  async updateQcRejectLog(id: string, payload: any) {
    const response = await this.httpClient.patch(
      `/qc-coa/qc-reject-logs/${id}`,
      payload,
    );
    return response.data;
  }

  async deleteQcRejectLog(id: string) {
    const response = await this.httpClient.delete(
      `/qc-coa/qc-reject-logs/${id}`,
    );
    return response.data;
  }

  async getCoaCertificates(queryParams?: {}) {
    const response = await this.httpClient.get(
      "/qc-coa/coa-certificates",
      { params: queryParams },
    );
    return response.data;
  }

  async getCoaCertificate(id: string) {
    const response = await this.httpClient.get(
      `/qc-coa/coa-certificates/${id}`,
    );
    return response.data;
  }

  async approveCoaCertificate(
    id: string,
    payload?: { digitalSignature?: string },
  ) {
    const response = await this.httpClient.post(
      `/qc-coa/coa-certificates/${id}/approve`,
      payload ?? {},
    );
    return response.data;
  }

  async generateCoaPdf(id: string) {
    const response = await this.httpClient.post(
      `/qc-coa/coa-certificates/${id}/generate-pdf`,
    );
    return response.data;
  }

  getCoaPrintUrl(id: string) {
    return `${this.baseURL}/qc-coa/coa-certificates/${id}/print`;
  }
}
