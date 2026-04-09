import { useMemo, useState, type ReactNode } from "react";
import { Calendar, Plus, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/core/lib/utils";
import { notify } from "@/core/notification/notificationHandler";
import { useCreateFinanceExpenseMutation, useFinanceAvg, useFinanceEntries, useFinanceExpense, useFinanceRevenue } from "@/core/hooks/useFinance";
import type { FinanceEntry, FinanceEntryType } from "@/core/interfaces/financeData";

function formatDateForInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function parseDateInputToLocalDayStart(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateInputToLocalDayEnd(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function entryTypeLabel(type: FinanceEntryType) {
  if (type === "REVENUE") return "Receita";
  if (type === "EXPENSE") return "Despesa";
  if (type === "CANCELED") return "Cancelado";
  return type;
}

function entryTypePillClass(type: FinanceEntryType) {
  if (type === "REVENUE") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (type === "EXPENSE") return "bg-red-50 text-red-700 border-red-200";
  if (type === "CANCELED") return "bg-slate-50 text-slate-700 border-slate-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function PeriodPicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (d: Date) => void;
  onEndDateChange: (d: Date) => void;
}) {
  return (
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
          onChange={(e) => onStartDateChange(parseDateInputToLocalDayStart(e.target.value))}
        />
        <span className="text-slate-400 text-xs">até</span>
        <Input
          type="date"
          className="w-36 h-8 text-xs border-none shadow-none focus-visible:ring-0"
          value={formatDateForInput(endDate)}
          onChange={(e) => onEndDateChange(parseDateInputToLocalDayEnd(e.target.value))}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  accentClass,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  accentClass: string;
}) {
  return (
    <Card className="p-5 border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className={cn("text-2xl font-black tabular-nums", accentClass)}>{value}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">{icon}</div>
      </div>
    </Card>
  );
}

function AddExpenseDialog({ onCreated }: { onCreated?: () => void }) {
  const { mutate: createExpense, isPending } = useCreateFinanceExpenseMutation();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const reset = () => {
    setName("");
    setValue("");
  };

  const submit = () => {
    const numericValue = Number(value);
    if (!name.trim() || !Number.isFinite(numericValue) || numericValue <= 0) {
      notify({ type: "error", message: "Informe um nome e um valor válido." });
      return;
    }

    createExpense(
      { name: name.trim(), value: numericValue },
      {
        onSuccess: () => {
          notify({ type: "success", message: "Despesa lançada!" });
          setOpen(false);
          reset();
          onCreated?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-bold shadow-md shadow-orange-100">
          <Plus className="w-4 h-4" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900">Lançar despesa</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Registre despesas do período (compras, taxas, etc.).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="font-bold text-slate-700">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: compras do mês" />
          </div>
          <div className="grid gap-2">
            <Label className="font-bold text-slate-700">Valor</Label>
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white font-black"
          >
            {isPending ? "SALVANDO..." : "SALVAR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EntriesList({ entries }: { entries: FinanceEntry[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, FinanceEntry[]>();
    for (const e of entries) {
      const d = new Date(e.createdAt);
      const key = formatLocalDateKey(d);
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a > b ? -1 : 1));
  }, [entries]);

  return (
    <Card className="p-5 border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-orange-600" />
          <p className="text-lg font-black text-slate-900">Movimentações</p>
        </div>
        <p className="text-xs text-slate-500 font-medium">{entries.length} registros</p>
      </div>

      <Separator className="my-4 bg-slate-200/60" />

      <div className="overflow-y-auto custom-scrollbar max-h-[420px] pr-2">
        <div className="grid gap-3">
          {grouped.map(([day, items]) => (
            <div key={day} className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{new Date(`${day}T12:00:00`).toLocaleDateString("pt-BR")}</span>
                <span>{items.length} itens</span>
              </div>
              <div className="grid gap-2">
                {items.map((e, idx) => (
                  <div
                    key={`${e.createdAt}-${e.name}-${idx}`}
                    className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{e.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{new Date(e.createdAt).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={cn("text-sm font-black tabular-nums", e.type === "EXPENSE" ? "text-red-600" : "text-emerald-600")}>
                        {formatCurrency(e.value)}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                          entryTypePillClass(e.type)
                        )}
                      >
                        {entryTypeLabel(e.type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="h-32 flex items-center justify-center text-slate-400">Nenhuma movimentação no período.</div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function FinanceView() {
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

  const params = useMemo(() => ({ startDate, endDate }), [startDate, endDate]);

  const entriesQuery = useFinanceEntries(params);
  const revenueQuery = useFinanceRevenue(params);
  const expenseQuery = useFinanceExpense(params);
  const avgQuery = useFinanceAvg(params);

  const isLoading = entriesQuery.isLoading || revenueQuery.isLoading || expenseQuery.isLoading || avgQuery.isLoading;
  const entries = entriesQuery.data ?? [];
  const revenue = revenueQuery.data ?? 0;
  const expense = expenseQuery.data ?? 0;
  const avg = avgQuery.data ?? 0;

  return (
    <div className="p-6 w-full h-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-orange-600" />
            Finanças
          </h2>
          <p className="text-slate-500">Acompanhe receitas, despesas e movimentações.</p>
        </div>

        <div className="flex items-center gap-3">
          <AddExpenseDialog onCreated={() => entriesQuery.refetch()} />
          <PeriodPicker startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
        </div>
      </div>

      {isLoading ? (
        <div className="h-full flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            Carregando finanças...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          <SummaryCard title="Receita" value={formatCurrency(revenue)} icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} accentClass="text-emerald-600" />
          <SummaryCard title="Despesa" value={formatCurrency(expense)} icon={<TrendingDown className="w-5 h-5 text-red-600" />} accentClass="text-red-600" />
          <SummaryCard title="Média" value={new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(avg)} icon={<Wallet className="w-5 h-5 text-orange-600" />} accentClass="text-slate-900" />

          <div className="lg:col-span-3 overflow-hidden">
            <EntriesList entries={entries} />
          </div>
        </div>
      )}
    </div>
  );
}
