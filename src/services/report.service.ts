import { ICreateReportJobPayload, IReportFilterPayload } from '@/types/report';
import { BaseHttpService } from './base.service';

export class ReportService extends BaseHttpService {
  constructor() {
    super();
  }

  async getReportStats() {
    const response = await this.httpClient.get('/reports/stats');
    return response.data;
  }

  // ── Raw-data report jobs (report scheduler) ──

  async getReportModules() {
    const response = await this.httpClient.get('/reports/modules');
    return response.data;
  }

  async createReportJob(payload: ICreateReportJobPayload) {
    const response = await this.httpClient.post('/reports/jobs', payload);
    return response.data;
  }

  async getReportJobs(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get('/reports/jobs', {
      params: queryParams,
    });
    return response.data;
  }

  async downloadReportJob(id: number) {
    const response = await this.httpClient.get(`/reports/jobs/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  }

  async deleteReportJob(id: number) {
    const response = await this.httpClient.delete(`/reports/jobs/${id}`);
    return response.data;
  }

  async getReportPreview(payload: IReportFilterPayload) {
    const response = await this.httpClient.post('/reports/preview', payload);
    return response.data;
  }

  async exportReport(payload: IReportFilterPayload) {
    const response = await this.httpClient.post('/reports/export', payload, {
      responseType: 'blob',
    });
    return response;
  }
}
