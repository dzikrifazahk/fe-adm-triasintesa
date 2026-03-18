export type CommonColumn = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
};

export type CommonRelationResponse = {
  id: string;
  name: string;
}

export type CommonFileResponse = {
  name: string;
  link: string;
}
export interface ICommonResponse<T> {
  data: T;
  links?: ILinks;
  meta?: IMeta;
}

export interface ILinks {
  first: string;
  last: string;
  prev: string;
  next: string;
}

export interface IMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: ILinkMeta;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface ILinkMeta { 
    url: string;
    label: string;
    active: boolean
}

export interface IAxiosError {
  status: number;
  response?: {
    data: {
      message: string;
    };
  };
}

export interface ILoginAxiosError {
  status: number;
  response?: {
    data: {
      message: {
        email: string;
        password: string;
      };
    };
  };
}

export type IComboboxWithoutIC<T> = {
  value: string;
  label: string;
  // icon: LucideIcon;
};