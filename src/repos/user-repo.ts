import User, {IUser} from "@models/User";
import bcrypt from "bcryptjs";

/**
 * Add one user.
 */
async function add(user: IUser): Promise<boolean> {
  let outcome: boolean = false;
  // Password Hash
  user.password = await bcrypt.hash(user.password, 10);
  await new User(user).save() ? outcome = true : null;
  return outcome;
}

/**
 * See if a user with the given email exists.
 */
async function existByEmail(email: string): Promise<boolean> {
  const user:IUser|null = await User.findOne({email});
  if(!user) return false;
  return true;
}


/**
 * Find a user with the given email exists.
 */
async function getByEmail(email: string): Promise<IUser|null> {
  return (await User.findOne({email}));
}

/**
 * Get all files.
 */
async function getAll(): Promise<IUser[]> {
  return (await User.find());
}

/**
 * Add one user.
 */
async function updatePassword(password: string, email: string): Promise<boolean> {
  let outcome: boolean = false;
  // Password Hash
  password = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email: email },
    { $set: {password} },
    { new: true }).exec() ? outcome = true : null;
  return outcome;
}

// **** Export default **** //

export default {
  add,
  existByEmail,
  getByEmail,
  updatePassword
  // delete: _delete,
} as const;
