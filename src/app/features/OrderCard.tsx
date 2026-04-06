import { Card } from "@/components/ui/card";
import type { OrderListData } from "@/core/interfaces/orderListData";
import { Package, MapPin, Clock, CreditCard, DollarSign, ChevronDown, ChevronUp, MoreVertical, Edit2, CheckCircle2, XCircle, Truck, Utensils, QrCode, Banknote } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { cn } from "@/core/lib/utils";
import { useUpdateOrderMutation } from "@/core/hooks/useUpdateOrderMutation";
import { EditOrderModal } from "./EditOrderModal";
import { EditPaymentModal } from "./EditPaymentModal";
import { notify } from "@/core/notification/notificationHandler";
import type { UpdateOrderRequest } from "@/core/interfaces/updateOrderRequest";

type Props = {
  order: OrderListData;
  defaultOpen?: boolean;
};

type OrderStatus = NonNullable<UpdateOrderRequest["status"]>;

const statusConfig = {
  CREATED: { bg: "bg-blue-100", text: "text-blue-800", label: "Criado", icon: Clock },
  CONFIRMED: { bg: "bg-purple-100", text: "text-purple-800", label: "Confirmado", icon: CheckCircle2 },
  PREPARING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Em preparo", icon: Utensils },
  OUT_FOR_DELIVERY: { bg: "bg-orange-100", text: "text-orange-800", label: "Em trânsito", icon: Truck },
  DELIVERED: { bg: "bg-green-100", text: "text-green-800", label: "Entregue", icon: CheckCircle2 },
  COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Concluído", icon: CheckCircle2 },
  CANCELED: { bg: "bg-red-100", text: "text-red-800", label: "Cancelado", icon: XCircle },
};

const fallbackStatus = { bg: "bg-gray-100", text: "text-gray-800", label: "Desconhecido", icon: Clock };

const paymentStatusConfig = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendente" },
  APPROVED: { bg: "bg-green-100", text: "text-green-800", label: "Aprovado" },
  FAILED: { bg: "bg-red-100", text: "text-red-800", label: "Falhou" },
  CANCELED: { bg: "bg-gray-100", text: "text-gray-800", label: "Cancelado" },
  REFUNDED: { bg: "bg-blue-100", text: "text-blue-800", label: "Reembolsado" },
  PARTIALLY_PAID: { bg: "bg-orange-100", text: "text-orange-800", label: "Parcialmente pago" },
};

const fallbackPaymentStatus = { bg: "bg-gray-100", text: "text-gray-800", label: "Desconhecido" };

function PaymentMethodIcons({ methods }: { methods: OrderListData["methods"] }) {
  if (!methods?.length) return null;

  const unique = Array.from(new Set(methods));
  const iconClass = "w-3.5 h-3.5 text-slate-400";

  return (
    <div className="flex items-center gap-1.5">
      {unique.map((m) => {
        if (m === "PIX") {
          return (
            <span key={m} title="PIX">
              <QrCode className={iconClass} />
            </span>
          );
        }
        if (m === "CASH") {
          return (
            <span key={m} title="Dinheiro">
              <Banknote className={iconClass} />
            </span>
          );
        }
        if (m === "DEBIT_CARD") {
          return (
            <span key={m} title="Cartão de Débito">
              <CreditCard className={iconClass} />
            </span>
          );
        }
        if (m === "CREDIT_CARD") {
          return (
            <span key={m} title="Cartão de Crédito">
              <CreditCard className={iconClass} />
            </span>
          );
        }
        return (
          <span key={m} title={m}>
            <CreditCard className={iconClass} />
          </span>
        );
      })}
    </div>
  );
}

function getTimeInfo(date: Date, status: string) {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const isCompleted = status === "COMPLETED" || status === "DELIVERED";
  
  let text = "";
  let color = "text-slate-500";
  let shouldBeOpen = false;

  if (diffInMinutes < 1) {
    text = "Agora mesmo";
  } else if (diffInMinutes < 60) {
    text = `${diffInMinutes} min atrás`;
  } else {
    const diffInHours = Math.floor(diffInMinutes / 60);
    text = `${diffInHours}h ${diffInMinutes % 60}min atrás`;
  }

  if (!isCompleted) {
    if (diffInMinutes >= 30) {
      color = "text-red-600 font-bold";
      shouldBeOpen = true;
    } else if (diffInMinutes >= 20) {
      color = "text-yellow-600 font-bold";
      shouldBeOpen = true;
    }
  }

  return { text, color, shouldBeOpen, diffInMinutes, isCompleted };
}

export function OrderCard({ order, defaultOpen = false }: Props) {
  const [timeInfo, setTimeInfo] = useState(() => getTimeInfo(order.createdAt, order.status));
  const [isOpen, setIsOpen] = useState(defaultOpen || timeInfo.shouldBeOpen);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const { mutate: updateStatus } = useUpdateOrderMutation();

  const status = statusConfig[order.status as keyof typeof statusConfig] || fallbackStatus;
  const paymentStatus = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig] || fallbackPaymentStatus;
  const paidAmount = useMemo(() => {
    if (order.paymentStatus === "APPROVED") {
      return order.total_amount;
    }

    const approvedFromPayments = order.payments?.reduce((acc, p) => {
      if (p.status === "APPROVED") return acc + p.amount;
      return acc;
    }, 0);

    if (typeof approvedFromPayments === "number") {
      return Math.min(approvedFromPayments, order.total_amount);
    }

    return 0;
  }, [order.paymentStatus, order.payments, order.total_amount]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newInfo = getTimeInfo(order.createdAt, order.status);
      setTimeInfo(newInfo);
      if (newInfo.shouldBeOpen && !isOpen) {
        setIsOpen(true);
      }
    }, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, [order.createdAt, order.status, isOpen]);

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    updateStatus({
      orderId: order.id,
      status: newStatus
    }, {
      onSuccess: () => {
        notify({ type: "success", message: `Pedido atualizado para ${statusConfig[newStatus as keyof typeof statusConfig]?.label || newStatus}` });
      }
    });
  };

  const menuItems = (
    <>
      <DropdownMenuLabel>Ações do Pedido</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
        <Edit2 className="mr-2 h-4 w-4" />
        Ver Detalhes
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setIsPaymentModalOpen(true)}>
        <CreditCard className="mr-2 h-4 w-4" />
        Editar Pagamentos
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Mudar Status</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => handleStatusUpdate("CONFIRMED")}>
        <CheckCircle2 className="mr-2 h-4 w-4 text-purple-600" />
        Confirmar
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleStatusUpdate("PREPARING")}>
        <Utensils className="mr-2 h-4 w-4 text-yellow-600" />
        Em Preparo
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleStatusUpdate("OUT_FOR_DELIVERY")}>
        <Truck className="mr-2 h-4 w-4 text-orange-600" />
        Saiu para Entrega
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleStatusUpdate("COMPLETED")}>
        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
        Concluir
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleStatusUpdate("CANCELED")} className="text-red-600">
        <XCircle className="mr-2 h-4 w-4" />
        Cancelar
      </DropdownMenuItem>
    </>
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className={cn(
            "hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col border-slate-200",
            !timeInfo.isCompleted && timeInfo.diffInMinutes >= 30 ? "ring-1 ring-red-100" : !timeInfo.isCompleted && timeInfo.diffInMinutes >= 20 ? "ring-1 ring-yellow-100" : ""
          )}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
              {/* Header - Sempre visível */}
              <div className={cn(
                "p-3 border-b transition-colors",
                isOpen ? "bg-slate-50/80" : "bg-white"
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{order.orderNumber}</span>
                      <div className="flex gap-1">
                        <span className={cn("px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase", status.bg, status.text)}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">{order.customer.customerName}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className={cn("w-3 h-3", timeInfo.color.split(" ")[0])} />
                      <span className={cn("text-[11px] font-medium", timeInfo.color)}>{timeInfo.text}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {menuItems}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <CollapsibleTrigger asChild>
                      <button className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </CollapsibleTrigger>
                  </div>
                </div>
              </div>

              {/* Conteúdo Expansível */}
              <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                <div className="p-3 space-y-4 text-xs bg-white">
                  {/* Endereço */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Entrega</span>
                    </div>
                    <p className="text-slate-700 font-medium pl-5 leading-relaxed">
                      {order.address.street}, {order.address.number}
                      {order.address.complement && <span className="text-slate-400"> • {order.address.complement}</span>}
                    </p>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Package className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Itens ({order.items.length})</span>
                    </div>
                    <div className="pl-5 space-y-1.5">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center gap-2 group">
                          <span className="text-slate-700 font-medium line-clamp-1" title={item.productName}>{item.productName}</span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums">
                            {item.quantity}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagamento */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Pagamento</span>
                    </div>
                    <div className="pl-5 flex items-center justify-between">
                      <PaymentMethodIcons methods={order.methods} />
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", paymentStatus.bg, paymentStatus.text)}>
                        {paymentStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Observação, se houver */}
                  {order.observation && (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-[11px] leading-relaxed italic">
                      "{order.observation}"
                    </div>
                  )}
                </div>
              </CollapsibleContent>

              {/* Footer - Sempre visível */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-emerald-600">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600 tabular-nums">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.total_amount)}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 tabular-nums">
                    Pago: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(paidAmount)}
                  </p>
                </div>
              </div>
            </Collapsible>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => setIsEditModalOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Ver Detalhes
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setIsPaymentModalOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Editar Pagamentos
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>Mudar Status</ContextMenuLabel>
          <ContextMenuItem onClick={() => handleStatusUpdate("CONFIRMED")}>
            <CheckCircle2 className="mr-2 h-4 w-4 text-purple-600" />
            Confirmar
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleStatusUpdate("PREPARING")}>
            <Utensils className="mr-2 h-4 w-4 text-yellow-600" />
            Em Preparo
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleStatusUpdate("OUT_FOR_DELIVERY")}>
            <Truck className="mr-2 h-4 w-4 text-orange-600" />
            Saiu para Entrega
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleStatusUpdate("COMPLETED")}>
            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
            Concluir
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleStatusUpdate("CANCELED")} className="text-red-600">
            <XCircle className="mr-2 h-4 w-4" />
            Cancelar
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <EditOrderModal 
        isOpen={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
        order={order} 
      />

      <EditPaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        orderId={order.id}
      />
    </>
  );
}
