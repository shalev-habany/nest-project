import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private prismaService: PrismaService,
    ) { }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest<Request>();
        const token: string = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: this.configService.get('JWT_SECRET')
                }
            );
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: payload.sub
                }
            });
            delete user.passwordHash;
            request['user'] = user
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(req: Request): string {
        const [type, token] = req.headers.authorization?.split(' ');
        return type === 'Bearer' ? token : undefined
    }
}
