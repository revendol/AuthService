import {Schema, model, Types} from "mongoose";
export interface ISecurity {
  _id?: string;
  user_id?: Types.ObjectId;
  user_email: string;
  access_token: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}
const validateEmail = (email: string) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}
// Create a Schema corresponding to the document interface.
const securitySchema = new Schema<ISecurity>({
  user_id: {type: Schema.Types.ObjectId, trim: true},
  user_email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validateEmail, "Please provide a valid email address"],
  },
  access_token: {type: String, trim: true, required: true},
  refresh_token: {type: String, trim: true, required: true},
  refresh_token_expires_at: {type: String, trim: true, required: true}
}, {timestamps: true});

// Create a Model.
export default model<ISecurity>('Security', securitySchema);


