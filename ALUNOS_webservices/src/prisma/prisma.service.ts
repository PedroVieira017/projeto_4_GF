import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config"

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor(config: ConfigService) {
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL'),
                },
            }
        });
    }

    async onModuleInit(){
        console.log('PrismaService.onModuleInit: connecting...');
        await this.$connect();
        console.log('PrismaService.onModuleInit: connected');
    }

    async onModuleDestroy(){
        await this.$disconnect();
    }
}
