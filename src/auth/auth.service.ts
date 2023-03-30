import { Body, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SignUpDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { user } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { SignInDto } from "./dto/sign-in.dto";

@Injectable({})
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async signUp(dto: SignUpDto): Promise<user> {
        const hash = await argon.hash(dto.password);
        try {
            const user = await this.prismaService.user.create({
                data: {
                    email: dto.email,
                    passwordHash: hash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    lastUpdateTime: new Date()
                }
            });
            delete user.passwordHash;
            return user;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ForbiddenException('Credentials already taken');
            }
            throw error;
        }
    }

    async signIn(dto: SignInDto): Promise<{access_token: String}> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user) throw new ForbiddenException('email incorrect');
        const pwdCompare: boolean = await argon.verify(user.passwordHash, dto.password);
        if (!pwdCompare) throw new ForbiddenException('password incorrect');
        delete user.passwordHash;
        return await this.signToken(user.id, user.email);
    }

    private async signToken(userId: number, email: string): Promise<{access_token: String}> {
        const payload = {
            email,
            sub: userId,
        }
        const secret = this.configService.get('JWT_SECRET');
        const access_token = await this.jwtService.signAsync(payload, {
            secret,
            expiresIn: '15m',
        });
        return {
            access_token,
        }
    }
}