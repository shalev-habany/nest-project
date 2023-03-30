import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto";
import { SignInDto } from "./dto/sign-in.dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signUp')
    signUp(@Body() dto: SignUpDto) {
        console.log({
            dto,
        });
        return this.authService.signUp(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signIn')
    signIn(@Body() dto: SignInDto) {
        return this.authService.signIn(dto);
    }


}