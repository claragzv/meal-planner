import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Module({
    // Esto significa que prisma module sabe crear y gestionar prosma service, y lo pone a disposición de otros módulos que lo importen
    providers: [PrismaService],
    //  Y este que otros modulos que importen prisma module pueden usar prisma service
    exports: [PrismaService],
})
export class PrismaModule { }