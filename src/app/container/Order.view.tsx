import { useOrderKanban } from "@/core/hooks/useOrderKanbanData";
import { OrderCard } from "../features/OrderCard";
import type { KanbanRequest } from "@/core/interfaces/kanbanRequest";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Search, User, MapPin, Package, Trash2, Check } from "lucide-react";
import { useUpdateOrderMutation } from "@/core/hooks/useUpdateOrderMutation";
import { useCreateOrderMutation } from "@/core/hooks/useCreateOrderMutation";
import { useCustomerData } from "@/core/hooks/useCustomerData";
import { useMenuData } from "@/core/hooks/useMenuHooks";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { notify } from "@/core/notification/notificationHandler";
import { cn } from "@/core/lib/utils";
import type { CustomerAddress, CustomerListData } from "@/core/interfaces/customerListData";
import type { MenuItem } from "@/core/interfaces/menuListData";
import type { OrderListData } from "@/core/interfaces/orderListData";

type OrderStatus = "CREATED" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELED" | "COMPLETED";

interface KanbanColumn {
    title: string;
    status: OrderStatus;
    items: OrderListData[];
}

export function OrderView() {
    const { mutate: updateOrder } = useUpdateOrderMutation();
    const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrderMutation();

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d;
    });

    // Modal State
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState("");
    const { data: customers } = useCustomerData(customerSearch);
    const { data: menuCategories } = useMenuData();

    const [selectedCustomer, setSelectedCustomer] = useState<CustomerListData | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);
    const [orderItems, setOrderItems] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);
    const [observation, setObservation] = useState("");
    const [selectedMenuTab, setSelectedMenuTab] = useState("all");

    const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);

    const request: KanbanRequest = useMemo(() => ({
        startDate,
        endDate
    }), [startDate, endDate]);

    const { data } = useOrderKanban(request);

    const columns = useMemo((): KanbanColumn[] => {
        const sortOrders = (items: OrderListData[]) => {
            return [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        };

        return [
            { title: "Criado", status: "CREATED", items: sortOrders(data?.created || []) },
            { title: "Confirmado", status: "CONFIRMED", items: sortOrders(data?.confirmed || []) },
            { title: "Em preparo", status: "PREPARING", items: sortOrders(data?.preparing || []) },
            { title: "Em entrega", status: "OUT_FOR_DELIVERY", items: sortOrders(data?.outForDelivery || []) },
            { title: "Concluído", status: "COMPLETED", items: sortOrders(data?.completed || []) },
            { title: "Cancelado", status: "CANCELED", items: sortOrders(data?.canceled || []) },
        ];
    }, [data]);

    const handleCreateOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer || !selectedAddress || orderItems.length === 0) {
            notify({ type: "error", message: "Preencha todos os campos obrigatórios!" });
            return;
        }

        createOrder({
            customerId: selectedCustomer.id,
            addressId: selectedAddress.id,
            observation: observation || null,
            items: orderItems.map(item => ({ id: item.id, quantity: item.quantity }))
        }, {
            onSuccess: () => {
                notify({ type: "success", message: "Pedido criado com sucesso!" });
                setIsNewOrderModalOpen(false);
                resetForm();
            }
        });
    };

    const resetForm = () => {
        setSelectedCustomer(null);
        setSelectedAddress(null);
        setOrderItems([]);
        setObservation("");
        setCustomerSearch("");
    };

    const addItem = (item: MenuItem) => {
        const existing = orderItems.find(i => i.id === item.id);
        if (existing) {
            setOrderItems(orderItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setOrderItems([...orderItems, { id: item.id, name: item.name, price: item.price, quantity: 1 }]);
        }
    };

    const removeItem = (id: number) => {
        setOrderItems(orderItems.filter(i => i.id !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setOrderItems(orderItems.map(i => {
            if (i.id === id) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const totalOrder = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        const newDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        setStartDate(newDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        const newDate = new Date(year, month - 1, day, 23, 59, 59, 999);
        setEndDate(newDate);
    };

    const formatDateForInput = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const handleDragStart = (e: React.DragEvent, orderId: number) => {
        e.dataTransfer.setData("orderId", orderId.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, newStatus: OrderStatus) => {
        e.preventDefault();
        const orderId = Number(e.dataTransfer.getData("orderId"));
        
        updateOrder({
            orderId,
            status: newStatus
        });
    };

    return (
        <div className="p-6 w-full h-full overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Pedidos</h2>
                    <p className="text-slate-500">Gerencie os pedidos dos seus clientes em tempo real.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-bold shadow-md shadow-orange-100">
                                <Plus className="w-5 h-5" />
                                Novo Pedido
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[750px] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl border-none">
                            <DialogHeader className="p-6 pb-4 bg-white border-b shrink-0">
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Criar Novo Pedido</DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium">Selecione o cliente, endereço e os itens do cardápio.</DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
                                <form id="create-order-form" onSubmit={handleCreateOrder} className="p-6 space-y-8 pb-10">
                                    {/* Cliente e Endereço */}
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label className="font-bold text-slate-700">Cliente</Label>
                                            <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between h-12 border-slate-200 bg-white hover:bg-slate-50 shadow-sm">
                                                        {selectedCustomer ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-orange-100 p-1.5 rounded-full">
                                                                    <User className="w-4 h-4 text-orange-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">Pesquisar cliente...</span>
                                                        )}
                                                        <Search className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0 w-[550px]" align="start">
                                                    <Command shouldFilter={false}>
                                                        <CommandInput 
                                                            placeholder="Digite o nome do cliente..." 
                                                            value={customerSearch}
                                                            onValueChange={setCustomerSearch}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                                            <CommandGroup>
                                                                {customers?.map((customer) => (
                                                                    <CommandItem
                                                                        key={customer.id}
                                                                        onSelect={() => {
                                                                            setSelectedCustomer(customer);
                                                                            setSelectedAddress(null);
                                                                            setIsCustomerPopoverOpen(false);
                                                                        }}
                                                                        className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-slate-50"
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-slate-900">{customer.name}</span>
                                                                            <span className="text-xs text-slate-500">
                                                                                {customer.phones?.[0]?.number || "Sem telefone"}
                                                                            </span>
                                                                        </div>
                                                                        {selectedCustomer?.id === customer.id && <Check className="w-4 h-4 text-orange-600" />}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {selectedCustomer && (
                                            <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <Label className="font-bold text-slate-700">Endereço de Entrega</Label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {selectedCustomer.addresses?.map((address) => (
                                                        <div 
                                                            key={address.id}
                                                            onClick={() => setSelectedAddress(address)}
                                                            className={cn(
                                                                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                                                selectedAddress?.id === address.id 
                                                                    ? "border-orange-600 bg-orange-50/50 shadow-sm ring-1 ring-orange-600/20" 
                                                                    : "border-slate-100 hover:border-orange-200 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <MapPin className={cn("w-4 h-4 mt-0.5", selectedAddress?.id === address.id ? "text-orange-600" : "text-slate-400")} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-slate-900 truncate">{address.address}, {address.number}</p>
                                                                {address.complement && <p className="text-xs text-slate-500 truncate">{address.complement}</p>}
                                                            </div>
                                                            {selectedAddress?.id === address.id && <Check className="w-4 h-4 text-orange-600 mt-1" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="bg-slate-200/60" />

                                    {/* Itens do Pedido */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold text-base text-slate-900">Itens do Pedido</Label>
                                            <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                {orderItems.length} selecionados
                                            </span>
                                        </div>

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
                                                                        onClick={() => addItem(item)}
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

                                        {/* Lista de Itens Adicionados */}
                                        {orderItems.length > 0 && (
                                            <div className="space-y-3 mt-6">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    Resumo do Pedido
                                                    <div className="h-px flex-1 bg-slate-200/60"></div>
                                                </Label>
                                                <div className="space-y-2">
                                                    {orderItems.map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-orange-50 border border-orange-100 rounded-xl p-2 shadow-inner">
                                                                    <Package className="w-4 h-4 text-orange-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                                    <p className="text-xs font-black text-orange-600/70 tabular-nums">
                                                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden p-0.5">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => updateQuantity(item.id, -1)}
                                                                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:text-orange-600 rounded-lg transition-all"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="w-8 text-center text-xs font-black tabular-nums text-slate-700">{item.quantity}</span>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => updateQuantity(item.id, 1)}
                                                                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:text-orange-600 rounded-lg transition-all"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <Button 
                                                                    type="button"
                                                                    variant="ghost" 
                                                                    size="icon-sm"
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="bg-slate-200/60" />

                                    {/* Observação */}
                                    <div className="grid gap-2">
                                        <Label className="font-bold text-slate-700">Observação</Label>
                                        <Textarea 
                                            placeholder="Ex: Tirar cebola, campainha estragada..." 
                                            value={observation}
                                            onChange={(e) => setObservation(e.target.value)}
                                            className="resize-none h-24 bg-white border-slate-200 focus:border-orange-300 transition-all rounded-xl"
                                        />
                                    </div>
                                </form>
                            </div>

                            <DialogFooter className="p-6 bg-white border-t flex flex-row items-center justify-between gap-4 shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total do Pedido</p>
                                    <p className="text-2xl font-black text-orange-600 tabular-nums">
                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalOrder)}
                                    </p>
                                </div>
                                <Button 
                                    form="create-order-form"
                                    type="submit"
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-black px-10 h-14 rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                    disabled={isCreatingOrder || !selectedCustomer || !selectedAddress || orderItems.length === 0}
                                >
                                    {isCreatingOrder ? "CRIANDO..." : "FINALIZAR PEDIDO"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm h-11">
                        <div className="flex items-center gap-2 px-2 text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Período</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="date" 
                                className="w-36 h-8 text-xs border-none shadow-none focus-visible:ring-0" 
                                value={formatDateForInput(startDate)}
                                onChange={handleStartDateChange}
                            />
                            <span className="text-slate-400 text-xs">até</span>
                            <Input 
                                type="date" 
                                className="w-36 h-8 text-xs border-none shadow-none focus-visible:ring-0" 
                                value={formatDateForInput(endDate)}
                                onChange={handleEndDateChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-4 min-w-max h-[calc(100vh-220px)] pb-4">
                {columns.map((column) => (
                    <div 
                        key={column.title} 
                        className="flex flex-col w-80 bg-slate-50/50 rounded-xl border border-slate-200 shadow-sm transition-colors duration-200"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.status)}
                    >
                        <div className="p-4 border-b border-slate-200 bg-white rounded-t-xl flex items-center justify-between sticky top-0 z-10">
                            <h3 className="font-bold text-slate-700">{column.title}</h3>
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200">
                                {column.items.length}
                            </span>
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                            {column.items.length > 0 ? (
                                column.items.map((order, index) => (
                                    <div 
                                        key={order.id} 
                                        className="shrink-0 cursor-grab active:cursor-grabbing"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, order.id)}
                                    >
                                        <OrderCard order={order} defaultOpen={index < 2} />
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                                    <p className="text-sm font-medium">Nenhum pedido</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
