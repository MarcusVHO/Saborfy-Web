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
import { Plus, Trash2, User, MapPin, Phone, Save } from "lucide-react";
import { useUpdateCustomerMutation } from "@/core/hooks/useUpdateCustomerMutation";
import { notify } from "@/core/notification/notificationHandler";
import type { CustomerListData } from "@/core/interfaces/customerListData";

interface EditCustomerModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    customer: CustomerListData | null;
}

export function EditCustomerModal({ isOpen, onOpenChange, customer }: EditCustomerModalProps) {
    const { updateName, addAddress, removeAddress, addPhone, removePhone } = useUpdateCustomerMutation();

    const [name, setName] = useState(customer?.name ?? "");
    const [newPhone, setNewPhone] = useState("");
    const [newAddress, setNewAddress] = useState({
        address: "",
        number: "",
        complement: ""
    });

    if (!customer) return null;

    const handleUpdateName = () => {
        if (!name.trim()) return;
        updateName.mutate({ id: customer.id, name }, {
            onSuccess: () => notify({ type: "success", message: "Nome do cliente atualizado!" })
        });
    };

    const handleAddPhone = () => {
        if (!newPhone.trim()) return;
        addPhone.mutate({ customerId: customer.id, number: newPhone }, {
            onSuccess: () => {
                notify({ type: "success", message: "Telefone adicionado!" });
                setNewPhone("");
            }
        });
    };

    const handleDeletePhone = (phoneId: number) => {
        if (confirm("Deseja realmente excluir este telefone?")) {
            removePhone.mutate({ customerId: customer.id, phoneId }, {
                onSuccess: () => notify({ type: "success", message: "Telefone removido!" })
            });
        }
    };

    const handleAddAddress = () => {
        if (!newAddress.address.trim() || !newAddress.number) return;
        addAddress.mutate({ 
            customerId: customer.id, 
            data: { 
                address: newAddress.address, 
                number: Number(newAddress.number), 
                complement: newAddress.complement || null 
            } 
        }, {
            onSuccess: () => {
                notify({ type: "success", message: "Endereço adicionado!" });
                setNewAddress({ address: "", number: "", complement: "" });
            }
        });
    };

    const handleDeleteAddress = (addressId: number) => {
        if (confirm("Deseja realmente excluir este endereço?")) {
            removeAddress.mutate({ customerId: customer.id, addressId }, {
                onSuccess: () => notify({ type: "success", message: "Endereço removido!" })
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl border-none">
                <DialogHeader className="p-6 pb-4 bg-white border-b shrink-0">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Editar Cliente</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">Atualize os dados cadastrais, telefones e endereços.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar p-6 space-y-8">
                    {/* Nome do Cliente */}
                    <div className="space-y-4">
                        <Label className="font-bold text-slate-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-orange-600" />
                            Nome do Cliente
                        </Label>
                        <div className="flex gap-2">
                            <Input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white border-slate-200 focus:border-orange-300 rounded-xl"
                            />
                            <Button 
                                onClick={handleUpdateName}
                                disabled={updateName.isPending}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Salvar
                            </Button>
                        </div>
                    </div>

                    <Separator className="bg-slate-200/60" />

                    {/* Telefones */}
                    <div className="space-y-4">
                        <Label className="font-bold text-slate-700 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-orange-600" />
                            Telefones
                        </Label>
                        <div className="grid gap-3">
                            {customer.phones.map((phone) => (
                                <div key={phone.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                    <span className="font-bold text-slate-700">{phone.number}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleDeletePhone(phone.id)}
                                        className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Novo telefone (ex: 11999999999)"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                className="bg-white border-slate-200 focus:border-orange-300 rounded-xl"
                            />
                            <Button 
                                onClick={handleAddPhone}
                                disabled={addPhone.isPending}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                    </div>

                    <Separator className="bg-slate-200/60" />

                    {/* Endereços */}
                    <div className="space-y-4">
                        <Label className="font-bold text-slate-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            Endereços
                        </Label>
                        <div className="grid gap-3">
                            {customer.addresses.map((address) => (
                                <div key={address.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{address.address}, {address.number}</p>
                                        {address.complement && <p className="text-xs text-slate-500 truncate">{address.complement}</p>}
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleDeleteAddress(address.id)}
                                        className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3">
                            <Input 
                                placeholder="Rua / Logradouro"
                                value={newAddress.address}
                                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                className="bg-white border-slate-200 focus:border-orange-300 rounded-xl"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input 
                                    placeholder="Número"
                                    type="number"
                                    value={newAddress.number}
                                    onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                                    className="bg-white border-slate-200 focus:border-orange-300 rounded-xl"
                                />
                                <Input 
                                    placeholder="Complemento"
                                    value={newAddress.complement}
                                    onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                                    className="bg-white border-slate-200 focus:border-orange-300 rounded-xl"
                                />
                            </div>
                            <Button 
                                onClick={handleAddAddress}
                                disabled={addAddress.isPending}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Novo Endereço
                            </Button>
                        </div>
                    </div>
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
        </Dialog>
    );
}
