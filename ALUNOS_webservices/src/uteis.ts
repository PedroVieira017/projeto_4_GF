import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export function getUtilizadorJWT(jwt: string){
    let info;
    try {
        info = new JwtService().verify(jwt, { secret: new ConfigService().get('JWT_SECRET') })
    } catch(e){
        throw new ForbiddenException('Erro a verificar acesso ao recurso!');
    }

    if(!info.hasOwnProperty("sub")){
        throw new ForbiddenException('Utilizador em falta!');
    }
    return info.sub
}

export function getTokenPayloadJWT(jwt: string){
    let info;
    try {
        info = new JwtService().verify(jwt, { secret: new ConfigService().get('JWT_SECRET') })
    } catch(e){
        throw new ForbiddenException('Erro a verificar acesso ao recurso!');
    }

    if(!info){
        throw new ForbiddenException('Em falta!');
    }
    return info
}

export function verificaUtilizadorJWT(id_utilizador, jwt){
    let check = false;
    try {
        check = (id_utilizador == getUtilizadorJWT(jwt));
    } catch(e){
        return false;
    }
    return check;
}



/**
 * Splits an array into chunks of a specified size.
 *
 * @param {Array} array - The array to split into chunks.
 * @param {number} chunkSize - The maximum number of items in each chunk.
 * @return {Array<Array>} An array of chunks.
 */
export function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Processes an array of items in batches, executing a promise-returning function on each item concurrently.
 *
 * @param {T[]} array - The array of items to process in batches.
 * @param {number} batchSize - The number of items to process in each batch.
 * @param {(item: T) => Promise<R>} callback - A function that processes each item asynchronously, returning a Promise.
 * @returns {Promise<R[]>} A promise that resolves to an array of results after all batches have been processed.
 *
 * @template T - The type of the input items.
 * @template R - The type of the results returned by the `promise` function.
 *
*/
export async function runPromisesInBatches<T, R>(
    array: T[],
    batchSize: number,
    callback: (item: T) => Promise<R>
): Promise<R[]> {
    if(array.length <= batchSize){
       return await Promise.all(array.map(callback))
    }

    const results: R[] = [];

    for (const batch of chunkArray(array, batchSize)) {
        results.push(...await Promise.all(batch.map(callback)));
    }

    return results;
}
