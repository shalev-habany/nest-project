import { Controller, Get, UseGuards } from '@nestjs/common';
import { user } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/decorators';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {


    @UseGuards(AuthGuard)
    @Get('me')
    getProfile(
        @User('email') email,
        @User('firstName') firstName,
        @User('lastName') lastName) {
        return {
            email,
            firstName,
            lastName,
        };
    }
}
