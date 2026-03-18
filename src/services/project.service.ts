import { IDivision } from "@/types/division";
import { BaseHttpService } from "./base.service";
import { IAddProjectLocation } from "@/types/project";

export class ProjectService extends BaseHttpService {
  constructor() {
    super();
  }

  async getProjects(queryParams = {}) {
    const response = await this.httpClient.get("/project", {
      params: queryParams,
    });
    return response.data;
  }

  async getAllProjects(queryParams = {}) {
    const response = await this.httpClient.get("/project/allnames", {
      params: queryParams,
    });
    return response.data;
  }

  async deleteProject(id: string) {
    const response = await this.httpClient.delete(`/project/delete/${id}`);
    return response.data;
  }

  async getProject(id: string) {
    const response = await this.httpClient.get(`/project/${id}`);
    return response.data;
  }

  async getCountingProject(queryParams = {}) {
    const response = await this.httpClient.get(`/project/counting`, {
      params: queryParams,
    });
    return response.data;
  }

  async createProject(payload: FormData) {
    const response = await this.httpClient.post(
      "/project/create-project",
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async updateProject(id: string, payload: FormData) {
    const response = await this.httpClient.post(
      `/project/update/${id}?_method=put`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async acceptProject(id: string) {
    const response = await this.httpClient.put(`/project/accept/${id}`);
    return response.data;
  }

  async rejectProject(id: string) {
    const response = await this.httpClient.put(`/project/reject/${id}`);
    return response.data;
  }

  async closeProject(id: string) {
    const response = await this.httpClient.put(`/project/closed/${id}`);
    return response.data;
  }

  async cancelProject(id: string) {
    const response = await this.httpClient.put(`/project/cancel/${id}`);
    return response.data;
  }

  async bonusProject(id: string) {
    const response = await this.httpClient.put(`/project/bonus/${id}`);
    return response.data;
  }

  async paymentClient(id: string, payload: FormData) {
    const response = await this.httpClient.post(
      `/project/payment-termin/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async deleteTermin(id: string, body: any) {
    const response = await this.httpClient.delete(
      `/project/delete-termin/${id}`,
      {
        data: body,
      }
    );
    return response.data;
  }

  async getAssignedUsers(projectId: string) {
    const response = await this.httpClient.get(
      `/project/setuser-project-absen`,
      {
        params: {
          project_id: projectId,
        },
      }
    );
    return response.data;
  }

  async setUsersAndLocationProject(payload: FormData) {
    const response = await this.httpClient.post(
      `/project/setuser-project-absen-create`,
      payload
    );
    return response.data;
  }

  async bulkSetUsersAndLocationProject(projectId: string, payload: any) {
    const response = await this.httpClient.put(
      `/project/setuser-project-absen-bulk-update/${projectId}`,
      payload
    );
    return response.data;
  }

  async updateTermin(projectId: string, payload: FormData) {
    const response = await this.httpClient.post(
      `/project/update-termin/${projectId}?_method=put`,
      payload
    );
    return response.data;
  }

  // LOCATION
  async getProjectLocations(project_id: string) {
    const response = await this.httpClient.get("/project/assign-location", {
      params: {
        project_id: project_id,
      },
    });
    return response.data;
  }

  async addProjectLocation(payload: IAddProjectLocation) {
    const response = await this.httpClient.post(
      `/project/assign-location`,
      payload
    );

    return response.data;
  }

  async deleteProjectLocation(id: string) {
    const response = await this.httpClient.delete(
      `/project/assign-location/${id}`
    );
    return response.data;
  }

  async changeProjectLocation(id: string, payload: IAddProjectLocation) {
    const response = await this.httpClient.put(
      `/project/assign-location/${id}`,
      payload
    );
    return response.data;
  }

  async getTop5Output() {
    const response = await this.httpClient.get("/project/toplimaproject");

    return response.data;
  }
  // END LOCATION
}
