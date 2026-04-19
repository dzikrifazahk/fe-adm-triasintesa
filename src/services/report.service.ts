import { IReportFilterPayload } from '@/types/report';
import { BaseHttpService } from './base.service';

export class ReportService extends BaseHttpService {
  constructor() {
    super();
  }

  async getReportStats() {
    const response = await this.httpClient.get('/reports/stats');
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
