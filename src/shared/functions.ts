import logger from 'jet-logger';
import {generateKeyPair} from "crypto";
import {IKey} from "@shared/types";

// **** Functions **** //

/**
 * Print an error object if it's truthy. Useful for testing.
 */
export function pErr(err?: Error): void {
  if (!!err) {
    logger.err(err);
  }
}

/**
 * Get a random number between 1 and 1,000
 */
export function _getRandomInt(): number {
  return Math.floor(Math.random() * 1_000);
}


export const _getKeyPair = async (name: string):Promise<IKey> => {
  return new Promise((resolve, reject) => {
    generateKeyPair('rsa',
      {
        modulusLength: 512,
        publicKeyEncoding: {
          type: 'spki',
          format: 'der'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'der',
          cipher: 'aes-256-cbc',
          passphrase: name
        }
      },
      (err, publicKey, privateKey) => {
        if (err) {
          return reject(err);
        }
        //Need to replace all special character as the keys will be used in url as params
        const data:IKey = {
          publicKey: publicKey.toString('base64').replace(/[^a-zA-Z ]/g, ""),
          privateKey: privateKey.toString('base64').replace(/[^a-zA-Z ]/g, "")
        }
        resolve(data);
      });
  });
};