import { OrderStatus } from "@prisma/client";

export const OrderListStatus = [
    OrderStatus.PENDING,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED
]