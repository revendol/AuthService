import fileRepo from '@repos/file-repo';
import {IFile} from '@models/file-model';
import {FileNotFoundError} from '@shared/errors';


// **** Functions **** //

/**
 * Get all files.
 */
function getAll(): Promise<IFile[]> {
  return fileRepo.getAll();
}

/**
 * Add one file.
 */
function addOne(file: IFile): Promise<void> {
  return fileRepo.add(file);
}

/**
 * Delete a file by their private key.
 */
async function _delete(privateKey: string): Promise<void> {
  const persists = await fileRepo.existByPrivateKey(privateKey);
  if (!persists) {
    throw new FileNotFoundError();
  }
  return fileRepo.delete(privateKey);
}


// **** Export default **** //

export default {
  getAll,
  addOne,
  delete: _delete,
} as const;
