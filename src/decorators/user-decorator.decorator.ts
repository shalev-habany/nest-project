import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const User = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx
        .switchToHttp()
        .getRequest<Request>()
        if (data) {
            return request.user[data];
        }
        return request.user;
    }
)