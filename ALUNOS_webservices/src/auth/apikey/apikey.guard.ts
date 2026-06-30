import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 
 * Se necessário criar endpoints que usem API KEY em vez da autenticação JWT, usar o guard, ou no ficheiro, ou na rota individual (desde que o fichieiro não use o guard normal)
 * 
 * 
    @UseGuards(ApiKeyGuard)
    @SetMetadata('apiKeyNames', ['key-exemplo'])
 * 
    O SetMetadata deve ter o nome da chave que se pretende validar, e bater certo com o definido na função canActivate abaixo
 */


@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const apiKeyNames = this.reflector.get<string[]>('apiKeyNames', context.getHandler()) || [];

        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['api-key'];
        if (!apiKey) {
            throw new UnauthorizedException('API key is missing.');
        }

        let keyFond = false;

        apiKeyNames.forEach(function(key_name, idx) {
            switch(key_name){
                case "key-exemplo":
                    keyFond = (apiKey === process.env.API_KEY_EXEMPLO)
                    return;
            }
        })

        if(!keyFond) throw new UnauthorizedException('Invalid API key.');
        return true;
    }
}