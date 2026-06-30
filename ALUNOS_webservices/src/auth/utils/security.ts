import * as crypto from 'crypto'
import {createCipheriv, createDecipheriv, randomBytes, scrypt} from "crypto";
import {promisify} from "util";
import {ConfigService} from "@nestjs/config";

function hashString(input: string) {
    const sha256Hash = crypto.createHash('sha256');
    sha256Hash.update(input);
    return sha256Hash.digest('hex');
}

export async function compareHashed(plainTextInput: string, storedHash: string){
    const hashedInput = hashString(plainTextInput);
    return hashedInput === storedHash;
}

export async function encryptToken(token: string, config: ConfigService){
    const iv = randomBytes(16);
    const key = (await promisify(scrypt)(config.get('ENCRYPTION_KEY'), 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);

    return Buffer.concat([
        cipher.update(token),
        cipher.final()
    ]);
}

export async function decryptToken(encryptedToken: Buffer, config: ConfigService): Promise<string>{
    const iv = encryptedToken.slice(0, 16);
    const key = (await promisify(scrypt)(config.get('ENCRYPTION_KEY'), 'salt', 32)) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key, iv);

    return Buffer.concat([
        decipher.update(encryptedToken.slice(16)),
        decipher.final()
    ]).toString();
}