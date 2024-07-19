import { Document } from "mongoose";

export interface iUser extends Document {
  firstName: string;
  lastName: string;
  middleName: string;
  maritalStatus: string;
  address: string;
  email: string;
  password: string;
  avatar: string;
  role: string;
  phone: string;
  verify: boolean;
  verifyCode: string;
}
