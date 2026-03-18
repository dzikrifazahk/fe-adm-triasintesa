export interface IAuth {
  id: number;
  role_id: number;
  name: string;
  email: string;
  email_verified_at: Date;
  created_at: Date;
  updated_at: Date;
  secret: string;
}
