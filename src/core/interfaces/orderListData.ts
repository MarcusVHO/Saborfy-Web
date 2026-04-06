export interface OrderListData {
    id: number;
    orderNumber: string;
    status: "CREATED" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELED" | "COMPLETED";
    paymentStatus: "PENDING" | "APPROVED" | "FAILED"| "CANCELED" | "REFUNDED" | "PARTIALLY_PAID";
    observation: string;
    customer: {customerId:number, customerName:string};
    address: {street:string, number:number, complement:string};
    items: {id: number, productName:string, quantity:number}[];
    payments?: { id: number; amount: number; method: "PIX" | "CASH" | "DEBIT_CARD" | "CREDIT_CARD"; status: "PENDING" | "APPROVED" | "FAILED" | "CANCELED" | "REFUNDED" | "PARTIALLY_PAID"; paidAt: string | null; createAt: string }[];
    methods: ("PIX" | "CASH" | "DEBIT_CARD" | "CREDIT_CARD")[];
    total_amount: number; 
    createdAt: Date;
}
