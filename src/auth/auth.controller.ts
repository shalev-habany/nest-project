import { Body, Controller, ParseIntPipe, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signUp')
    signUp(@Body() dto: AuthDto) {
        console.log({
            dto,
        });
        return this.authService.signUp(dto);
    }

    @Post('signIn')
    signIn(@Body() dto: AuthDto) {
        return this.authService.signIn(dto);
    }
}