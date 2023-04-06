import Security, {ISecurity} from "@models/Security";

/**
 * Add one row.
 */
async function add(security: ISecurity): Promise<boolean> {
  let outcome: boolean = false;
  await new Security(security).save() ? outcome = true : null;
  return outcome;
}

/**
 * See if a row with the given email exists.
 */
async function existByEmail(email: string): Promise<boolean> {
  const security:ISecurity|null = await Security.findOne({user_email:email});
  if(!security) return false;
  return true;
}


/**
 * Find a row with the given email exists.
 */
async function getByEmail(email: string): Promise<ISecurity|null> {
  return (await Security.findOne({user_email:email}).exec());
}

/**
 * Find a row with the given email exists.
 */
async function updateByEmail(email: string,security:any): Promise<ISecurity|null> {
  return (await Security.findOneAndUpdate(
    { user_email: email },
    { $set: security },
    { new: true }).exec());
}
/**
 * Delete a row with the given email exists.
 */
async function _delete(email: string): Promise<void> {
  (await Security.findOneAndDelete(
    { user_email: email }).exec());
}

// **** Export default **** //

export default {
  add,
  existByEmail,
  getByEmail,
  updateByEmail,
  delete: _delete,
} as const;
