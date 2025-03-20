export class OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export class Order {
    orderId: string;
    customerId: string;
    totalAmount: number;
    status: string;
    items: OrderItem[];
    orderDate: string;
}

export class OrderEvent {
    eventId: string;
    eventType: string;
    payload: Order;
    timestamp: string;
}