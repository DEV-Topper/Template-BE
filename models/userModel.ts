import { Schema, model } from "mongoose";
import { iUser } from "../interface/interfaces";
import { Types } from "mongoose";
import { roles } from "../utils/enums";

const userModel = new Schema<iUser>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    maritalStatus: { type: String },
    address: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    avatar: {
      type: String,
      default:
        "https://www.londondentalsmiles.co.uk/wp-content/uploads/2017/06/person-dummy.jpg",
    },
    verify: { type: Boolean, default: false },
    verifyCode: { type: String },
    role: { type: String, default: roles.USER },
  },
  { timestamps: true }
);

export default model<iUser>("User", userModel);
