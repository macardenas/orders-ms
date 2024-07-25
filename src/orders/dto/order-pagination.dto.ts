import { IsEnum, IsOptional } from "class-validator";
import { paginationDto } from "src/common";
import { OrderListStatus } from "../enum/order.enum";
import { OrderStatus } from "@prisma/client";


export class OrderPaginationDTO extends paginationDto {
    @IsOptional()
    @IsEnum(OrderListStatus,{
        message:`List value are: ${OrderListStatus}`
    })
    status: OrderStatus;
}