import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, CreditCard, DollarSign, Clock, CheckCircle2, RefreshCcw, ShieldAlert, Ban, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePaymentMutation } from "@/core/hooks/usePaymentMutation";
import { useOrderDetails } from "@/core/hooks/useOrderDetails";
import { notify } from "@/core/notification/notificationHandler";
import { cn } from "@/core/lib/utils";
import type { PaymentMethod, PaymentStatus } from "@/core/services/paymentService";

interface EditPaymentModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: number | null;
}

const methodLabels: Record<PaymentMethod, string> = {
    PIX: "PIX",
    CASH: "Dinheiro",
    DEBIT_CARD: "Cartão de Débito",
    CREDIT_CARD: "Cartão de Crédito"
};

type Payment = {
    id: number;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    paidAt: string | null;
    createAt: string;
};

type OrderDetails = {
    orderNumber: string;
    total_amount: number;
    payments: Payment[];
};

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: LucideIcon }> = {
    PENDING: { label: "Pendente", color: "text-yellow-600 bg-yellow-50 border-yellow-100", icon: Clock },
    APPROVED: { label: "Aprovado", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
    FAILED: { label: "Falhou", color: "text-red-600 bg-red-50 border-red-100", icon: ShieldAlert },
    CANCELED: { label: "Cancelado", color: "text-slate-600 bg-slate-50 border-slate-100", icon: Ban },
    REFUNDED: { label: "Reembolsado", color: "text-blue-600 bg-blue-50 border-blue-100", icon: RefreshCcw },
    PARTIALLY_PAID: { label: "Parcialmente Pago", color: "text-orange-600 bg-orange-50 border-orange-100", icon: DollarSign }
};

const statusOptions: PaymentStatus[] = ["PENDING", "APPROVED", "CANCELED", "REFUNDED"];

function getAllowedNextStatuses(current: PaymentStatus): PaymentStatus[] {
    if (current === "PENDING") return ["APPROVED", "CANCELED"];
    if (current === "APPROVED") return ["REFUNDED", "CANCELED"];
    if (current === "REFUNDED") return ["CANCELED"];
    if (current === "CANCELED") return ["CANCELED"];
    return ["CANCELED"];
}

function getSelectableStatuses(current: PaymentStatus): PaymentStatus[] {
    const next = getAllowedNextStatuses(current);
    return Array.from(new Set([current, ...next]));
}

export function EditPaymentModal({ isOpen, onOpenChange, orderId }: EditPaymentModalProps) {
    const orderQuery = useOrderDetails(isOpen ? orderId : null);
    const order = orderQuery.data as OrderDetails | undefined;
    const { addPayment, removePayment, updateStatus } = usePaymentMutation();

    const [newPayment, setNewPayment] = useState<{ amount: string; method: PaymentMethod }>({
        amount: "",
        method: "PIX"
    });

    const [statusChangePending, setStatusChangePending] = useState<{ paymentId: number; status: PaymentStatus } | null>(null);

    const handleAddPayment = () => {
        if (!orderId || !newPayment.amount || Number(newPayment.amount) <= 0) return;

        addPayment.mutate({
            orderId,
            data: {
                amount: Number(newPayment.amount),
                method: newPayment.method
            }
        }, {
            onSuccess: () => {
                notify({ type: "success", message: "Pagamento adicionado!" });
                setNewPayment({ amount: "", method: "PIX" });
            }
        });
    };

    const handleDeletePayment = (paymentId: number) => {
        if (!orderId) return;
        if (confirm("Deseja realmente remover este pagamento?")) {
            removePayment.mutate({ orderId, paymentId }, {
                onSuccess: () => notify({ type: "success", message: "Pagamento removido!" })
            });
        }
    };

    const handleUpdateStatus = (paymentId: number, status: PaymentStatus) => {
        if (!orderId) return;
        setStatusChangePending({ paymentId, status });
    };

    const confirmStatusUpdate = () => {
        if (!orderId || !statusChangePending) return;
        const { paymentId, status } = statusChangePending;
        updateStatus.mutate({ orderId, paymentId, status }, {
            onSuccess: () => {
                notify({ type: "success", message: "Status do pagamento atualizado!" });
                setStatusChangePending(null);
            }
        });
    };

    const totalPaid = order?.payments?.reduce((acc, p) => p.status === "APPROVED" ? acc + p.amount : acc, 0) || 0;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl border-none">
                <DialogHeader className="p-6 pb-4 bg-white border-b shrink-0">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        Pagamentos do Pedido #{order?.orderNumber}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Gerencie as formas de pagamento e o status de cada transação.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar p-6 space-y-8">
                    {orderQuery.isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Resumo Financeiro */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total do Pedido</p>
                                    <p className="text-xl font-black text-slate-900">
                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order?.total_amount || 0)}
                                    </p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Pago</p>
                                    <p className="text-xl font-black text-emerald-700">
                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPaid)}
                                    </p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm">
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Restante</p>
                                    <p className="text-xl font-black text-orange-700">
                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((order?.total_amount || 0) - totalPaid)}
                                    </p>
                                </div>
                            </div>

                            <Separator className="bg-slate-200/60" />

                            {/* Adicionar Pagamento */}
                            <div className="space-y-4">
                                <Label className="font-bold text-slate-700 flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-orange-600" />
                                    Adicionar Pagamento
                                </Label>
                                <div className="flex gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-xs text-slate-500">Valor</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input 
                                                type="number"
                                                placeholder="0,00"
                                                value={newPayment.amount}
                                                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                                                className="pl-9 bg-slate-50/50 border-slate-200 focus:border-orange-300 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-xs text-slate-500">Método</Label>
                                        <Select 
                                            value={newPayment.method} 
                                            onValueChange={(val: PaymentMethod) => setNewPayment({ ...newPayment, method: val })}
                                        >
                                            <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 focus:border-orange-300 rounded-xl h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(methodLabels).map(([val, label]) => (
                                                    <SelectItem key={val} value={val}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button 
                                        onClick={handleAddPayment}
                                        disabled={addPayment.isPending || !newPayment.amount}
                                        className="self-end h-10 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-6"
                                    >
                                        Adicionar
                                    </Button>
                                </div>
                            </div>

                            <Separator className="bg-slate-200/60" />

                            {/* Lista de Pagamentos */}
                            <div className="space-y-4">
                                <Label className="font-bold text-slate-700 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                    Histórico de Transações
                                </Label>
                                <div className="grid gap-3">
                                    {order?.payments?.map((payment) => {
                                        const status = statusConfig[payment.status as PaymentStatus];
                                        const StatusIcon = status.icon;
                                        const selectable = getSelectableStatuses(payment.status);
                                        
                                        return (
                                            <div key={payment.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("p-2 rounded-xl border", status.color)}>
                                                        <StatusIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">
                                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payment.amount)}
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-500">{methodLabels[payment.method as PaymentMethod]}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Select 
                                                        value={payment.status} 
                                                        onValueChange={(val: PaymentStatus) => handleUpdateStatus(payment.id, val)}
                                                    >
                                                        <SelectTrigger className={cn("h-8 text-[10px] font-black uppercase tracking-wider rounded-lg border-none shadow-none", status.color)}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statusOptions
                                                                .filter((s) => selectable.includes(s))
                                                                .map((s) => (
                                                                    <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase">
                                                                        {statusConfig[s].label}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleDeletePayment(payment.id)}
                                                        className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!order?.payments || order.payments.length === 0) && (
                                        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                                            <CreditCard className="w-8 h-8 mb-2 opacity-20" />
                                            <p className="text-sm font-medium italic">Nenhum pagamento registrado</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="p-6 bg-white border-t shrink-0">
                    <Button 
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full font-bold h-12 rounded-xl"
                    >
                        FECHAR
                    </Button>
                </DialogFooter>
            </DialogContent>

            <AlertDialog open={!!statusChangePending} onOpenChange={(open) => !open && setStatusChangePending(null)}>
                <AlertDialogContent className="sm:max-w-[400px] border-none shadow-2xl">
                    <AlertDialogHeader className="items-center text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-black text-slate-900">Confirmar Alteração?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-medium">
                            Você está prestes a alterar o status deste pagamento para <span className="font-bold text-slate-900">{statusChangePending ? statusConfig[statusChangePending.status].label : ""}</span>.
                            <br /><br />
                            <span className="text-orange-600 font-bold">Esta ação é irreversível e afetará o fechamento do pedido.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                        <AlertDialogCancel className="flex-1 rounded-xl font-bold border-slate-200">CANCELAR</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmStatusUpdate}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                        >
                            CONFIRMAR
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}
