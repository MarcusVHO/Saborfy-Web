import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useMenuData } from "@/core/hooks/useMenuHooks";
import { useOrderItemsMutation } from "@/core/hooks/useOrderItemsMutation";
import { useUpdateOrderMutation } from "@/core/hooks/useUpdateOrderMutation";
import { useOrderDetails } from "@/core/hooks/useOrderDetails";
import { useCustomerData } from "@/core/hooks/useCustomerData";
import { notify } from "@/core/notification/notificationHandler";
import { cn } from "@/core/lib/utils";
import { MapPin, Plus, Trash2, Package, Check } from "lucide-react";

import type { OrderListData } from "@/core/interfaces/orderListData";
import type { CustomerAddress, CustomerListData } from "@/core/interfaces/customerListData";
import type { MenuItem } from "@/core/interfaces/menuListData";

interface EditOrderModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    order: OrderListData | null;
}

type OrderDetailsItem = {
    id: number;
    productName: string;
    quantity: number;
    unitPrice?: number;
    subTotal?: number;
};

export function EditOrderModal({ isOpen, onOpenChange, order: initialOrder }: EditOrderModalProps) {
    const { data: menuCategories } = useMenuData();
    const { addItems, removeItem } = useOrderItemsMutation();
    const { mutate: updateOrder, isPending: isUpdatingOrder } = useUpdateOrderMutation();
    const { data: orderDetails, isLoading: isLoadingDetails } = useOrderDetails(isOpen ? initialOrder?.id || null : null);

    // Usamos o orderDetails se disponível, caso contrário o initialOrder
    const order = orderDetails || initialOrder;

    // Buscar dados do cliente para obter todos os endereços
    const { data: customers } = useCustomerData(order?.customer.customerName);
    const fullCustomer = customers?.find((c: CustomerListData) => c.id === order?.customer.customerId);

    const [observationDraft, setObservationDraft] = useState<string | null>(null);
    const [selectedAddressIdDraft, setSelectedAddressIdDraft] = useState<number | null>(null);
    const [selectedMenuTab, setSelectedMenuTab] = useState("all");
    const [newItems, setNewItems] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);

    const derivedAddressId = useMemo(() => {
        if (!order?.address || !fullCustomer) return null;
        const currentAddr = fullCustomer.addresses.find(a =>
            a.address === order.address.street && a.number === order.address.number
        );
        return currentAddr?.id ?? null;
    }, [fullCustomer, order]);

    const selectedAddressId = selectedAddressIdDraft ?? derivedAddressId;
    const observationValue = observationDraft ?? (order?.observation ?? "");

    const handleUpdateObservation = () => {
        if (!order) return;
        updateOrder({
            orderId: order.id,
            observation: observationValue || null
        }, {
            onSuccess: () => {
                notify({ type: "success", message: "Observação atualizada!" });
                setObservationDraft(null);
            }
        });
    };

    const handleUpdateAddress = (addressId: number) => {
        if (!order) return;
        setSelectedAddressIdDraft(addressId);
        updateOrder({
            orderId: order.id,
            addressId: addressId
        }, {
            onSuccess: () => {
                notify({ type: "success", message: "Endereço de entrega atualizado!" });
            }
        });
    };

    const handleAddItems = () => {
        if (!order || newItems.length === 0) return;

        addItems.mutate({
            orderId: order.id,
            items: newItems.map(item => ({ id: item.id, quantity: item.quantity }))
        }, {
            onSuccess: () => {
                notify({ type: "success", message: "Itens adicionados!" });
                setNewItems([]);
            }
        });
    };

    const handleDeleteItem = (itemId: number) => {
        if (!order) return;
        if (confirm("Deseja realmente remover este item do pedido?")) {
            removeItem.mutate({
                orderId: order.id,
                itemId
            }, {
                onSuccess: () => {
                    notify({ type: "success", message: "Item removido!" });
                }
            });
        }
    };

    const addNewItem = (item: MenuItem) => {
        const existing = newItems.find(i => i.id === item.id);
        if (existing) {
            setNewItems(newItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setNewItems([...newItems, { id: item.id, name: item.name, price: item.price, quantity: 1 }]);
        }
    };

    const updateNewItemQuantity = (id: number, delta: number) => {
        setNewItems(newItems.map(i => {
            if (i.id === id) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const removeNewItem = (id: number) => {
        setNewItems(newItems.filter(i => i.id !== id));
    };

    if (!order) return null;

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            setObservationDraft(null);
            setSelectedAddressIdDraft(null);
            setNewItems([]);
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl border-none">
                <DialogHeader className="p-6 pb-4 bg-white border-b shrink-0">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Editar Pedido #{order.orderNumber}</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">Gerencie os itens e as observações do pedido.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar p-6 space-y-8">
                    {isLoadingDetails && !order ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Observação */}
                            <div className="space-y-4">
                                <Label className="font-bold text-lg text-slate-800">Observação</Label>
                                <div className="flex gap-3">
                                    <Textarea 
                                        value={observationValue}
                                        onChange={(e) => setObservationDraft(e.target.value)}
                                        placeholder="Adicione observações ao pedido..."
                                        className="resize-none h-24 bg-white border-slate-200 focus:border-orange-300 transition-all rounded-xl flex-1"
                                    />
                                    <Button 
                                        onClick={handleUpdateObservation}
                                        disabled={isUpdatingOrder}
                                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-24 px-6 rounded-xl"
                                    >
                                        {isUpdatingOrder ? "SALVANDO..." : "SALVAR OBS"}
                                    </Button>
                                </div>
                            </div>

                            <Separator className="bg-slate-200/60" />

                            {/* Endereço de Entrega */}
                            <div className="space-y-4">
                                <Label className="font-bold text-lg text-slate-800">Endereço de Entrega</Label>
                                <div className="grid grid-cols-1 gap-3">
                                    {fullCustomer?.addresses.map((address: CustomerAddress) => (
                                        <div 
                                            key={address.id}
                                            onClick={() => handleUpdateAddress(address.id)}
                                            className={cn(
                                                "flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all",
                                                selectedAddressId === address.id 
                                                    ? "border-orange-600 bg-orange-50/50 shadow-sm ring-1 ring-orange-600/20" 
                                                    : "border-slate-200 bg-white hover:border-orange-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <MapPin className={cn("w-5 h-5 mt-0.5", selectedAddressId === address.id ? "text-orange-600" : "text-slate-400")} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900">{address.address}, {address.number}</p>
                                                {address.complement && <p className="text-xs text-slate-500">{address.complement}</p>}
                                            </div>
                                            {selectedAddressId === address.id && <Check className="w-5 h-5 text-orange-600 mt-1" />}
                                        </div>
                                    ))}
                                    {!fullCustomer && (
                                        <div className="flex items-center justify-center p-8 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-500 font-medium italic">Carregando endereços do cliente...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-slate-200/60" />

                            {/* Itens Atuais */}
                            <div className="space-y-4">
                                <Label className="font-bold text-lg text-slate-800">Itens Atuais</Label>
                                <div className="grid gap-2">
                                    {(order.items as OrderDetailsItem[]).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
                                                    <Package className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.productName}</p>
                                                    <div className="flex gap-2 items-center">
                                                        <p className="text-xs font-black text-slate-400">Qtd: {item.quantity}</p>
                                                        {typeof item.unitPrice === "number" && (
                                                            <p className="text-[10px] text-slate-400">• {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.unitPrice)} cada</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {typeof item.subTotal === "number" && (
                                                    <span className="text-sm font-black text-slate-700">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.subTotal)}</span>
                                                )}
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-slate-200/60" />

                            {/* Adicionar Novos Itens */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-lg text-slate-800">Adicionar Novos Itens</Label>
                                    {newItems.length > 0 && (
                                        <Button 
                                            onClick={handleAddItems}
                                            disabled={addItems.isPending}
                                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 rounded-xl"
                                        >
                                            {addItems.isPending ? "ADICIONANDO..." : "CONFIRMAR NOVOS ITENS"}
                                        </Button>
                                    )}
                                </div>

                                {/* Lista de Novos Itens (Rascunho) */}
                                {newItems.length > 0 && (
                                    <div className="space-y-2 mb-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                        {newItems.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                                <span className="text-sm font-bold text-slate-900">{item.name}</span>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/50 overflow-hidden">
                                                        <button onClick={() => updateNewItemQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white">-</button>
                                                        <span className="w-7 text-center text-xs font-black">{item.quantity}</span>
                                                        <button onClick={() => updateNewItemQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white">+</button>
                                                    </div>
                                                    <button onClick={() => removeNewItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Grid de Seleção Estilo Cardápio */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                    <div className="bg-slate-50/80 p-2 border-b flex gap-2 overflow-x-auto scrollbar-hide">
                                        <Button 
                                            type="button"
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setSelectedMenuTab("all")}
                                            className={cn("h-8 rounded-full px-4 text-xs font-bold transition-all", selectedMenuTab === "all" ? "bg-white text-orange-600 shadow-sm border border-orange-100" : "text-slate-500 hover:text-slate-700")}
                                        >
                                            Todos
                                        </Button>
                                        {menuCategories?.map(cat => (
                                            <Button 
                                                key={cat.id}
                                                type="button"
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setSelectedMenuTab(cat.id.toString())}
                                                className={cn("h-8 rounded-full px-4 text-xs font-bold transition-all whitespace-nowrap", selectedMenuTab === cat.id.toString() ? "bg-white text-orange-600 shadow-sm border border-orange-100" : "text-slate-500 hover:text-slate-700")}
                                            >
                                                {cat.name}
                                            </Button>
                                        ))}
                                    </div>
                                    
                                    <div className="h-[300px] overflow-y-auto custom-scrollbar p-4 bg-white">
                                        <div className="space-y-6">
                                            {menuCategories?.filter(cat => selectedMenuTab === "all" || cat.id.toString() === selectedMenuTab).map(category => (
                                                <div key={category.id} className="space-y-3">
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                        <div className="h-px flex-1 bg-slate-100"></div>
                                                        {category.name}
                                                        <div className="h-px flex-1 bg-slate-100"></div>
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {category.items.map(item => (
                                                            <div 
                                                                key={item.id}
                                                                onClick={() => addNewItem(item)}
                                                                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-orange-300 hover:bg-orange-50/30 cursor-pointer transition-all group bg-white shadow-sm hover:shadow-md"
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-orange-700 transition-colors" title={item.name}>{item.name}</p>
                                                                    <p className="text-[10px] font-black text-orange-600">
                                                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                                                                    </p>
                                                                </div>
                                                                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                                                                    <div className="bg-orange-600 text-white rounded-full p-1.5 shadow-md">
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="p-6 bg-white border-t flex items-center justify-end gap-4 shrink-0">
                    <Button 
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="font-bold px-8 h-12 rounded-xl"
                    >
                        FECHAR
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
