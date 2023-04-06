import {Schema, model} from "mongoose";
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  accountStatus?: string;
  password: string;
}
const validateEmail = (email: string) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

// Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  name: {type: String, trim: true, required: true},
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validateEmail, "Please provide a valid email address"],
  },
  phone: {type: String, trim: true},
  role: {
    type: String,
    trim: true,
    default: 'User',
    enum: ['Super admin', 'Admin', 'Manager', 'Content Officer', 'User']
  },
  status: {
    type: String,
    trim: true,
    default: 'Offline',
    enum: ['Offline', 'Online']
  },
  accountStatus: {
    type: String,
    trim: true,
    default: 'Active',
    enum: ['Active', 'Deactivate']
  },
  password: {type: String, trim: true, required: true}
}, {timestamps: true});

// Create a Model.
export default model<IUser>('User', userSchema);


