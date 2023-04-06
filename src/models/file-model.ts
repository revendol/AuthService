// **** Types **** //
export interface IFile {
  names: string[];
  privateKey: string;
  publicKey: string;
  lastAccessed?: string;
}

// **** Functions **** //

/**
 * Get a new File object.
 */
function _new(
  names: string[],
  privateKey: string,
  publicKey: string,
  lastAccessed?: string
): IFile {
  return {
    names,
    privateKey,
    publicKey,
    lastAccessed
  };
}

/**
 * Copy a File object.
 */
function copy(file: IFile): IFile {
  return {
    names: file.names,
    privateKey: file.privateKey,
    publicKey: file.publicKey,
    lastAccessed: file.lastAccessed
  };
}

/**
 * See if an object is an instance of File.
 */
function instanceOf(arg: object): boolean {
  return (
    typeof arg === 'object' &&
    'names' in arg &&
    'privateKey' in arg &&
    'publicKey' in arg &&
    'lastAccessed' in arg
  );
}


// **** Export default **** //

export default {
  new: _new,
  copy,
  instanceOf,
} as const;
