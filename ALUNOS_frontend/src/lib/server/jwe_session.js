import { JWE_ENCDEC_KEY } from '$env/static/private';
import { EncryptJWT, jwtDecrypt, base64url } from 'jose';

// APENAS SERVER SIDE!
class JWESession {
    exptime = "2h";
    alg = "dir";
    enc = "A256CBC-HS512";
    iss = "ON_IPVC_v3";
    aud = "ON_IPVC_v3_USER";
    key = JWE_ENCDEC_KEY;

    constructor(){}

    /**
     * Função para criar uma JWT Enciptada (JWE) com os dados indicados
     * @param {import('jose').JWTPayload} data : dados a usar como payload da JWT
     * @returns jwe
     */
    async createJWE(data){
        try{
            const secret = base64url.decode(this.key)
            const jwt = await new EncryptJWT(data)
                .setProtectedHeader({ alg: this.alg, enc: this.enc })
                .setIssuedAt()
                .setIssuer(this.iss)
                .setAudience(this.aud)
                .setExpirationTime(this.exptime)
                .encrypt(secret)

            return jwt;
        } catch(e){}
        return null;
    }

    /**
     * Função para desencriptar JWT Encriptada (JWE) e obter o payload
     * @param {string} jwe
     */
    async decrypJWE(jwe){
        const secret = base64url.decode(this.key)
        try {
            const { payload, protectedHeader } = await jwtDecrypt(jwe, secret, {
                issuer: this.iss,
                audience: this.aud,
            });
            return {payload, errcode: null}
        } catch(e) {
            // @ts-ignore
            return {payload: null, errcode: e.code}
        }
    }
}

export default JWESession;