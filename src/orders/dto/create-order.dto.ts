import { OrderStatus } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, isNumber, IsOptional, IsPositive } from "class-validator";
import { OrderListStatus } from "../enum/order.enum";

export class CreateOrderDto {
    
    @IsNumber()
    @IsPositive()
    totalAmount: number;
  
    @IsNumber()
    @IsPositive()
    totalItems: number;


    @IsEnum( OrderListStatus,{
        message:`Possible status values are ${OrderListStatus}`
    })
    @IsOptional()
    status: OrderStatus = OrderStatus.PENDING

    @IsBoolean()
    @IsOptional()
    paid:boolean = false;



}
