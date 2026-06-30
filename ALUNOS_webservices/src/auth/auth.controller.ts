import {Body, Controller, Get, Post, Query, Req, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LoginDto, LoginSSODto} from "./dto";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import { JwtGuard } from './guard';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiTags('Testes')
    @Post('/signIn')
    signIn(@Body() dto: LoginDto){
        return this.authService.signIn(dto);
    }

}
