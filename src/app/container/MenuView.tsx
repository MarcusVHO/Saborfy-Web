import { useState } from "react";
import { 
  useMenuData, 
  useCreateMenuMutation, 
  useCreateMenuItemMutation, 
  useDeleteMenuItemMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  useUpdateMenuItemMutation
} from "@/core/hooks/useMenuHooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, UtensilsCrossed, LayoutGrid, PackagePlus, Edit2, MoreVertical } from "lucide-react";
import { notify } from "@/core/notification/notificationHandler";
import { cn } from "@/core/lib/utils";

export function MenuView() {
  const { data: menuData, isLoading } = useMenuData();
  const { mutate: createMenu, isPending: isCreatingMenu } = useCreateMenuMutation();
  const { mutate: updateMenu } = useUpdateMenuMutation();
  const { mutate: deleteMenu } = useDeleteMenuMutation();
  const { mutate: createMenuItem, isPending: isCreatingItem } = useCreateMenuItemMutation();
  const { mutate: updateMenuItem, isPending: isUpdatingItem } = useUpdateMenuItemMutation();
  const { mutate: deleteItem } = useDeleteMenuItemMutation();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);

  // Form states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null);
  const [newItem, setNewItem] = useState({
    menuId: "",
    name: "",
    price: "",
    description: "",
  });
  const [editingItem, setEditingItem] = useState<{ menuId: number; id: number; name: string; price: string; description: string } | null>(null);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;

    createMenu({ name: newCategoryName }, {
      onSuccess: () => {
        notify({ type: "success", message: "Categoria criada com sucesso!" });
        setNewCategoryName("");
        setIsCategoryModalOpen(false);
      },
    });
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    updateMenu({ id: editingCategory.id, data: { name: editingCategory.name } }, {
      onSuccess: () => {
        notify({ type: "success", message: "Categoria atualizada!" });
        setIsEditCategoryModalOpen(false);
        setEditingCategory(null);
      },
    });
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta categoria e todos os seus itens?")) {
      deleteMenu(id, {
        onSuccess: () => {
          notify({ type: "success", message: "Categoria excluída!" });
          setSelectedCategory("all");
        },
      });
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.menuId || !newItem.name || !newItem.price) return;

    createMenuItem({
      menuId: Number(newItem.menuId),
      data: {
        name: newItem.name,
        price: Number(newItem.price),
        description: newItem.description,
      },
    }, {
      onSuccess: () => {
        notify({ type: "success", message: "Item adicionado com sucesso!" });
        setNewItem({ menuId: "", name: "", price: "", description: "" });
        setIsItemModalOpen(false);
        setSelectedCategory("all");
      },
    });
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateMenuItem({
      menuId: editingItem.menuId,
      itemId: editingItem.id,
      data: {
        name: editingItem.name,
        price: Number(editingItem.price),
        description: editingItem.description,
      },
    }, {
      onSuccess: () => {
        notify({ type: "success", message: "Item atualizado com sucesso!" });
        setIsEditItemModalOpen(false);
        setEditingItem(null);
      },
    });
  };

  const handleDeleteItem = (menuId: number, itemId: number) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteItem({ menuId, itemId }, {
        onSuccess: () => {
          notify({ type: "success", message: "Item excluído com sucesso!" });
        },
      });
    }
  };

  const filteredMenu = selectedCategory === "all" 
    ? menuData 
    : menuData?.filter(menu => menu.id === Number(selectedCategory));

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Sticky Header and Filters */}
      <div className="p-6 pb-4 space-y-6 bg-slate-50/50 border-b border-slate-200/60 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              Gerenciamento de Cardápio
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Organize seus produtos por categoria e gerencie preços
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 gap-2 h-10 px-4 font-bold shadow-sm">
                  <LayoutGrid className="w-4 h-4" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateCategory}>
                  <DialogHeader>
                    <DialogTitle>Nova Categoria</DialogTitle>
                    <DialogDescription>Crie uma nova seção para o seu cardápio (ex: Pizzas, Bebidas)</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="cat-name">Nome da Categoria</Label>
                    <Input 
                      id="cat-name" 
                      placeholder="Ex: Pizzas Artesanais" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white w-full font-bold" disabled={isCreatingMenu}>
                      {isCreatingMenu ? "Criando..." : "Criar Categoria"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Modal de Edição de Categoria */}
            <Dialog open={isEditCategoryModalOpen} onOpenChange={setIsEditCategoryModalOpen}>
              <DialogContent>
                <form onSubmit={handleUpdateCategory}>
                  <DialogHeader>
                    <DialogTitle>Editar Categoria</DialogTitle>
                    <DialogDescription>Altere o nome da categoria selecionada</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="edit-cat-name">Nome da Categoria</Label>
                    <Input 
                      id="edit-cat-name" 
                      value={editingCategory?.name || ""}
                      onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white w-full font-bold">
                      Salvar Alterações
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 h-10 px-5 font-bold shadow-md shadow-orange-200">
                  <Plus className="w-5 h-5" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleCreateItem}>
                  <DialogHeader>
                    <DialogTitle>Novo Item do Cardápio</DialogTitle>
                    <DialogDescription>Adicione um novo produto a uma categoria existente</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Categoria</Label>
                      <Select value={newItem.menuId} onValueChange={(val) => setNewItem({ ...newItem, menuId: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {menuData?.map(menu => (
                            <SelectItem key={menu.id} value={menu.id.toString()}>{menu.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="item-name">Nome do Produto</Label>
                      <Input 
                        id="item-name" 
                        placeholder="Ex: Pizza Margherita" 
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="item-price">Preço (R$)</Label>
                      <Input 
                        id="item-price" 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="item-desc">Descrição</Label>
                      <Textarea 
                        id="item-desc" 
                        placeholder="Ingredientes e detalhes do produto..." 
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white w-full font-bold" disabled={isCreatingItem}>
                      {isCreatingItem ? "Adicionando..." : "Adicionar ao Cardápio"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Modal de Edição de Item */}
            <Dialog open={isEditItemModalOpen} onOpenChange={setIsEditItemModalOpen}>
              <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleUpdateItem}>
                  <DialogHeader>
                    <DialogTitle>Editar Item</DialogTitle>
                    <DialogDescription>Atualize as informações do produto</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-item-name">Nome do Produto</Label>
                      <Input 
                        id="edit-item-name" 
                        value={editingItem?.name || ""}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-item-price">Preço (R$)</Label>
                      <Input 
                        id="edit-item-price" 
                        type="number" 
                        step="0.01" 
                        value={editingItem?.price || ""}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, price: e.target.value } : null)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-item-desc">Descrição</Label>
                      <Textarea 
                        id="edit-item-desc" 
                        value={editingItem?.description || ""}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white w-full font-bold" disabled={isUpdatingItem}>
                      {isUpdatingItem ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categorias Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button 
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-full px-6 font-bold transition-all",
              selectedCategory === "all" ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-50 hover:text-orange-600"
            )}
          >
            Todas
          </Button>
          {menuData?.map(menu => (
            <ContextMenu key={menu.id}>
              <ContextMenuTrigger asChild>
                <Button 
                  variant={selectedCategory === menu.id.toString() ? "default" : "outline"}
                  onClick={() => setSelectedCategory(menu.id.toString())}
                  className={cn(
                    "rounded-full px-6 font-bold transition-all group relative",
                    selectedCategory === menu.id.toString() ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  {menu.name}
                  <MoreVertical className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => {
                  setEditingCategory({ id: menu.id, name: menu.name });
                  setIsEditCategoryModalOpen(true);
                }}>
                  <Edit2 className="w-4 h-4 mr-2" /> Editar Nome
                </ContextMenuItem>
                <ContextMenuItem 
                  variant="destructive"
                  onClick={() => handleDeleteCategory(menu.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir Categoria
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>

      {/* Menu List - Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-12 pb-10 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold">Carregando cardápio...</p>
          </div>
        ) : filteredMenu && filteredMenu.length > 0 ? (
          filteredMenu.map((menu) => (
            <div key={menu.id} className="space-y-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{menu.name}</h3>
                <Badge variant="outline" className="bg-white text-slate-400 font-bold border-slate-200">
                  {menu.items.length} itens
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menu.items.map((item) => (
                  <Card key={item.id} title={item.name} className="group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border-slate-200 overflow-hidden flex flex-col h-full bg-white">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1" title={item.name}>{item.name}</h4>
                        <span className="text-lg font-black text-orange-600 tabular-nums">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1 line-clamp-3 mb-6">
                        {item.description || "Sem descrição disponível."}
                      </p>
                      <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <Button 
                          variant="outline" 
                          className="flex-1 font-bold text-slate-600 hover:bg-slate-50 gap-2 h-9 border-slate-200"
                          onClick={() => {
                            setEditingItem({ 
                              menuId: menu.id, 
                              id: item.id, 
                              name: item.name, 
                              price: item.price.toString(), 
                              description: item.description 
                            });
                            setIsEditItemModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1 font-bold gap-2 h-9"
                          onClick={() => handleDeleteItem(menu.id, item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add Item Card Placeholder */}
                <button 
                  onClick={() => {
                    setNewItem({ ...newItem, menuId: menu.id.toString() });
                    setIsItemModalOpen(true);
                  }}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/30 transition-all group min-h-[180px]"
                >
                  <PackagePlus className="w-8 h-8 text-slate-300 group-hover:text-orange-400 transition-colors mb-2" />
                  <span className="text-sm font-bold text-slate-400 group-hover:text-orange-500">Adicionar Item</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <UtensilsCrossed className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Seu cardápio está vazio</h3>
            <p className="text-slate-400 mb-6">Comece criando sua primeira categoria de produtos.</p>
            <Button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
              Criar Primeira Categoria
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
