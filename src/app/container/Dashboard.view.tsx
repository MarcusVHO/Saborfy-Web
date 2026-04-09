import { useMemo, useState } from "react";
import { Wallet, TrendingUp, Clock, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/core/lib/utils";
import { usePaymentDashboard } from "@/core/hooks/usePaymentDashboard";
import type { PaymentDashboardData, PaymentDashboardLast7Point, PaymentDashboardRecentItem } from "@/core/interfaces/paymentDashboardData";

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

function normalizeLast7(last7: PaymentDashboardLast7Point[], endDate: Date) {
  const map = new Map(last7.map(([day, count]) => [day, count]));
  const days: { day: string; count: number }[] = [];

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const key = formatLocalDateKey(d);
    days.push({ day: key, count: map.get(key) ?? 0 });
  }

  return days;
}

function BarChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="w-full h-44 flex items-end gap-2">
      {data.map((d) => {
        const h = Math.round((d.count / max) * 100);
        const weekday = new Date(`${d.day}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short" });
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-lg bg-orange-600/90 hover:bg-orange-600 transition-colors"
              style={{ height: `${Math.max(6, h)}%` }}
              title={`${d.day}: ${d.count}`}
            />
            <span className="text-[10px] font-bold text-slate-500 tabular-nums">
              {weekday.replace(".", "").toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function methodLabel(method: PaymentDashboardRecentItem["method"]) {
  if (method === "PIX") return "PIX";
  if (method === "CASH") return "Dinheiro";
  if (method === "DEBIT_CARD") return "Débito";
  if (method === "CREDIT_CARD") return "Crédito";
  return method;
}

function statusLabel(status: PaymentDashboardRecentItem["status"]) {
  if (status === "PENDING") return "Pendente";
  if (status === "APPROVED") return "Aprovado";
  if (status === "CANCELED") return "Cancelado";
  if (status === "REFUNDED") return "Reembolsado";
  if (status === "FAILED") return "Falhou";
  if (status === "PARTIALLY_PAID") return "Parcial";
  return status;
}

function statusPillClass(status: PaymentDashboardRecentItem["status"]) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "PENDING") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (status === "CANCELED") return "bg-slate-50 text-slate-700 border-slate-200";
  if (status === "REFUNDED") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "FAILED") return "bg-red-50 text-red-700 border-red-200";
  if (status === "PARTIALLY_PAID") return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export function DashboardView() {
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

  const dashboardQuery = usePaymentDashboard({ startDate, endDate });
  const data = dashboardQuery.data as PaymentDashboardData | undefined;

  const chartData = useMemo(() => normalizeLast7(data?.last7 || [], endDate), [data?.last7, endDate]);
  const todaySalesCount = chartData[chartData.length - 1]?.count ?? 0;

  return (
    <div className="p-6 w-full h-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-orange-600" />
            Dashboard
          </h2>
          <p className="text-slate-500">Acompanhe pagamentos, receitas e volume.</p>
        </div>

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
              onChange={(e) => setStartDate(parseDateInputToLocalDayStart(e.target.value))}
            />
            <span className="text-slate-400 text-xs">até</span>
            <Input
              type="date"
              className="w-36 h-8 text-xs border-none shadow-none focus-visible:ring-0"
              value={formatDateForInput(endDate)}
              onChange={(e) => setEndDate(parseDateInputToLocalDayEnd(e.target.value))}
            />
          </div>
        </div>
      </div>

      {dashboardQuery.isLoading ? (
        <div className="h-full flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            Carregando dashboard...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          <Card className="p-5 border-slate-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receita</p>
                <p className="text-2xl font-black text-emerald-600 tabular-nums">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data?.revenue || 0)}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <Separator className="my-4 bg-slate-200/60" />

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendas Hoje</p>
                  <p className="text-lg font-black text-slate-900 tabular-nums">{todaySalesCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Média</p>
                  <p className="text-lg font-black text-slate-900 tabular-nums">
                    {new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(data?.avg || 0)}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">pagamentos por dia (últimos 30 dias)</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-slate-200 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimos 7 dias</p>
                <p className="text-lg font-black text-slate-900">Volume de pagamentos</p>
              </div>
            </div>
            <div className="mt-6">
              <BarChart data={chartData} />
            </div>
          </Card>

          <Card className="p-5 border-slate-200 shadow-sm lg:col-span-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <p className="text-lg font-black text-slate-900">Recentes</p>
              </div>
              <p className="text-xs text-slate-500 font-medium">{data?.recent?.length || 0} registros</p>
            </div>

            <div className="mt-4 overflow-y-auto custom-scrollbar max-h-[300px] pr-2">
              <div className="grid gap-2">
                {(data?.recent || []).map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 tabular-nums">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.amount)}
                        <span className="ml-2 text-xs font-bold text-slate-500">{methodLabel(p.method)}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">{new Date(p.createdAt).toLocaleString("pt-BR")}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                        statusPillClass(p.status)
                      )}
                    >
                      {statusLabel(p.status)}
                    </span>
                  </div>
                ))}

                {(data?.recent?.length || 0) === 0 && (
                  <div className="h-32 flex items-center justify-center text-slate-400">Nenhum pagamento no período.</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

