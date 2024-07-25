import { IsEnum, IsUUID } from "class-validator";
import { OrderListStatus } from "../enum/order.enum";
import { OrderStatus } from "@prisma/client";

export class ChangeOrderDto {
    @IsUUID(4)
    id: string;

    @IsEnum(OrderListStatus,{
        message:`List are ${OrderListStatus}`
    })
    status: OrderStatus
}