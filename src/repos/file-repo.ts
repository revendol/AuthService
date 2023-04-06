import {IFile} from "@models/file-model";
import orm from './mock-orm';


// **** Functions **** //

/**
 * Get File by public key.
 */
async function getByPublicKey(publicKey: string): Promise<IFile | null> {
  const db = await orm.openDb();
  for (const file of db.files) {
    if (file.publicKey === publicKey) {
      return file;
    }
  }
  return null;
}

/**
 * Get File by private key.
 */
async function getByPrivateKey(privateKey: string): Promise<IFile | null> {
  const db = await orm.openDb();
  for (const file of db.files) {
    if (file.privateKey === privateKey) {
      return file;
    }
  }
  return null;
}

/**
 * See if a file with the given public key exists.
 */
async function existByPublicKey(publicKey: string): Promise<boolean> {
  const db = await orm.openDb();
  for (const user of db.files) {
    if (user.publicKey === publicKey) {
      return true;
    }
  }
  return false;
}

/**
 * See if a file with the given private key exists.
 */
async function existByPrivateKey(privateKey: string): Promise<boolean> {
  const db = await orm.openDb();
  for (const user of db.files) {
    if (user.privateKey === privateKey) {
      return true;
    }
  }
  return false;
}

/**
 * Get all files.
 */
async function getAll(): Promise<IFile[]> {
  const db = await orm.openDb();
  return db.files;
}

/**
 * Add one file.
 */
async function add(file: IFile): Promise<void> {
  const db = await orm.openDb();
  db.files.push(file);
  return orm.saveDb(db);
}
/**
 * Update a file.
 */
async function update(file: IFile): Promise<void> {
  const db = await orm.openDb();
  for (let i = 0; i < db.files.length; i++) {
    if (db.files[i].privateKey === file.privateKey) {
      file.lastAccessed = new Date().toDateString();
      db.files[i] = file;
      return orm.saveDb(db);
    }
  }
}


/**
 * Delete one user.
 */
async function _delete(privateKey: string): Promise<void> {
  const db = await orm.openDb();
  for (let i = 0; i < db.files.length; i++) {
    if (db.files[i].privateKey === privateKey) {
      db.files.splice(i, 1);
      return orm.saveDb(db);
    }
  }
}


// **** Export default **** //

export default {
  getByPrivateKey,
  getByPublicKey,
  existByPublicKey,
  existByPrivateKey,
  getAll,
  add,
  update,
  delete: _delete,
} as const;
