"use client";

import { api, CoinTransaction, WalletInfo } from "@/lib/api";
import { useStore } from "@/lib/store";
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const formatAmount = (value: string, currency: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 2 }).format(
    Number(value || 0)
  );

export default function WalletTransactionsPage() {
  const { session, currentUser } = useStore();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!session?.accessToken || !currentUser?.id) return;
    setLoading(true);
    setError("");
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        api.getCoins(session.accessToken, currentUser.id),
        api.listCoinTransactions(session.accessToken, { uid: currentUser.id, limit: 50, offset: 0 }),
      ]);
      setWallet(walletResponse.data.wallet || null);
      setTransactions(transactionsResponse.data.transactions || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, currentUser?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!session?.accessToken || !currentUser?.id) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-6 text-zinc-300">
        Please login to view transactions.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Coin Transactions</h1>
          <p className="text-sm text-zinc-400">Track credits, debits, and subscription purchases.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void loadData()}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/10"
          >
            Refresh
          </button>
          <Link
            href="/wallet/buy"
            className="rounded-xl border border-crimson/40 px-4 py-2 text-sm text-crimson transition-colors hover:bg-crimson/10"
          >
            Buy More
          </Link>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-2 flex items-center gap-2 text-zinc-300">
          <Wallet className="h-4 w-4 text-crimson" />
          <span className="text-xs uppercase tracking-[0.14em] text-zinc-400">Current Wallet</span>
        </div>
        <div className="text-4xl font-bold text-white">{wallet?.coins ?? 0}</div>
      </div>

      {error ? <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">No transactions found.</div>
          ) : (
            transactions.map((transaction) => {
              const isDebit = transaction.transaction_type === "debit";
              return (
                <div key={transaction.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isDebit ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {isDebit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{transaction.transaction_name}</div>
                        <div className="text-xs uppercase tracking-[0.12em] text-zinc-500">{transaction.status}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isDebit ? "text-red-300" : "text-emerald-300"}`}>
                        {isDebit ? "-" : "+"}
                        {transaction.coins}
                      </div>
                      <div className="text-xs text-zinc-400">{formatAmount(transaction.amount, transaction.currency)}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-zinc-500">
                    {new Date(transaction.transaction_time).toLocaleString()} · {transaction.id}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
