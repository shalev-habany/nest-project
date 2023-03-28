import { Body, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable({})
export class AuthService {
    constructor(private prismaService: PrismaService) { }

    async signUp(dto: AuthDto) {
        const hash = await argon.hash(dto.password);
        try {
            const user = await this.prismaService.user.create({
                data: {
                    email: dto.email,
                    passwordHash: hash,
                    lastUpdateTime: new Date()
                }
                // select: {
                //     id: true,
                //     email: true,
                //     creationTime: true
                // }
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

    async signIn(dto: AuthDto) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user) throw new ForbiddenException('username incorrect');
        const pwdCompare: boolean = await argon.verify(user.passwordHash, dto.password);
        if (!pwdCompare) throw new ForbiddenException('password incorrect');
        delete user.passwordHash;
        return user;
    }
}