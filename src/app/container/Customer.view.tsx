import { useCustomerData } from "@/core/hooks/useCustomerData";
import { useCreateCustomerMutation } from "@/core/hooks/useCreateCustomerMutation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Phone, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { notify } from "@/core/notification/notificationHandler";
import { EditCustomerModal } from "../features/EditCustomerModal";
import type { CustomerListData } from "@/core/interfaces/customerListData";

export function CustomerView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: customers, isLoading } = useCustomerData(searchTerm);
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomerMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListData | null>(null);
  
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    addresses: [{ address: "", number: 0, complement: "" }],
    phones: [{ number: "" }],
  });

  const handleEditClick = (customer: CustomerListData) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  // Encontrar a versão mais recente do cliente selecionado dentro da lista de clientes
  const currentCustomer = customers?.find(c => c.id === selectedCustomer?.id) || selectedCustomer;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) return;

    createCustomer(newCustomer, {
      onSuccess: () => {
        notify({ type: "success", message: "Cliente cadastrado com sucesso!" });
        setIsModalOpen(false);
        setNewCustomer({
          name: "",
          addresses: [{ address: "", number: 0, complement: "" }],
          phones: [{ number: "" }],
        });
        queryClient.invalidateQueries({ queryKey: ["customers-data"] });
      },
    });
  };

  const addAddress = () => {
    setNewCustomer({
      ...newCustomer,
      addresses: [...newCustomer.addresses, { address: "", number: 0, complement: "" }],
    });
  };

  const removeAddress = (index: number) => {
    const newAddresses = newCustomer.addresses.filter((_, i) => i !== index);
    setNewCustomer({ ...newCustomer, addresses: newAddresses });
  };

  const addPhone = () => {
    setNewCustomer({
      ...newCustomer,
      phones: [...newCustomer.phones, { number: "" }],
    });
  };

  const removePhone = (index: number) => {
    const newPhones = newCustomer.phones.filter((_, i) => i !== index);
    setNewCustomer({ ...newCustomer, phones: newPhones });
  };

  return (
    <div className="p-6 w-full h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-600" />
            Clientes
          </h2>
          <p className="text-slate-500">
            Visualize e gerencie as informações de todos os seus clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleCreateCustomer}>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                  <DialogDescription>
                    Preencha os dados abaixo para adicionar um novo cliente ao sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      required
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Telefones</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={addPhone}
                        className="h-7 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                    {newCustomer.phones.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Número"
                          required
                          value={phone.number}
                          onChange={(e) => {
                            const newPhones = [...newCustomer.phones];
                            newPhones[index].number = e.target.value;
                            setNewCustomer({ ...newCustomer, phones: newPhones });
                          }}
                        />
                        {newCustomer.phones.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => removePhone(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Endereços</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={addAddress}
                        className="h-7 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                    {newCustomer.addresses.map((address, index) => (
                      <div key={index} className="grid gap-2 p-3 border rounded-lg bg-slate-50/50 relative">
                        {newCustomer.addresses.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-xs"
                            className="absolute -top-2 -right-2"
                            onClick={() => removeAddress(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                        <div className="grid gap-2">
                          <Input
                            placeholder="Rua/Logradouro"
                            required
                            value={address.address}
                            onChange={(e) => {
                              const newAddresses = [...newCustomer.addresses];
                              newAddresses[index].address = e.target.value;
                              setNewCustomer({ ...newCustomer, addresses: newAddresses });
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Número"
                            type="number"
                            required
                            value={address.number || ""}
                            onChange={(e) => {
                              const newAddresses = [...newCustomer.addresses];
                              newAddresses[index].number = Number(e.target.value);
                              setNewCustomer({ ...newCustomer, addresses: newAddresses });
                            }}
                          />
                          <Input
                            placeholder="Complemento"
                            value={address.complement || ""}
                            onChange={(e) => {
                              const newAddresses = [...newCustomer.addresses];
                              newAddresses[index].complement = e.target.value;
                              setNewCustomer({ ...newCustomer, addresses: newAddresses });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white w-full"
                    disabled={isCreating}
                  >
                    {isCreating ? "Cadastrando..." : "Cadastrar Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="w-[200px] font-bold">Nome</TableHead>
              <TableHead className="font-bold">Telefones</TableHead>
              <TableHead className="font-bold">Endereços</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    Carregando clientes...
                  </div>
                </TableCell>
              </TableRow>
            ) : customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => handleEditClick(customer)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {customer.phones.map((phone) => (
                        <div key={phone.id} className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {phone.number}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {customer.addresses.map((address) => (
                        <div key={address.id} className="flex items-start gap-2 text-sm text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400 mt-1 shrink-0" />
                          <span className="line-clamp-1">
                            {address.address}, {address.number}
                            {address.complement ? ` - ${address.complement}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                  {searchTerm ? `Nenhum cliente encontrado para "${searchTerm}"` : "Nenhum cliente encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditCustomerModal 
        key={currentCustomer?.id || 0}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        customer={currentCustomer}
      />
    </div>
  );
}
