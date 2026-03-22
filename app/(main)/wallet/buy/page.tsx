"use client";

import { api, PlanOption, WalletInfo } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Crown, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const formatPrice = (price: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(price || 0));

export default function BuySubscriptionPage() {
  const { session, currentUser, refreshWallet, wallet } = useStore();
  const searchParams = useSearchParams();
  const preferredType = searchParams.get("type");
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [walletState, setWalletState] = useState<WalletInfo | null>(wallet);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyingPlanId, setBuyingPlanId] = useState("");

  const loadData = useCallback(async () => {
    if (!session?.accessToken || !currentUser?.id) return;
    setLoading(true);
    setError("");
    try {
      const [coinsResponse, plansResponse] = await Promise.all([
        api.getCoins(session.accessToken, currentUser.id),
        api.listPlans(session.accessToken),
      ]);
      setWalletState(coinsResponse.data.wallet || null);
      setPlans((plansResponse.data.plans || []).filter((plan) => plan.is_active));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, currentUser?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setWalletState(wallet);
  }, [wallet]);

  const sortedPlans = useMemo(() => {
    const order: Record<string, number> = { monthly: 1, yearly: 2, addon: 3 };
    return [...plans].sort((a, b) => (order[a.plan_type] ?? 99) - (order[b.plan_type] ?? 99));
  }, [plans]);

  const buyPlan = async (plan: PlanOption) => {
    if (!session?.accessToken || !currentUser?.id) return;
    setBuyingPlanId(plan.id);
    setError("");
    try {
      const response = await api.buySubscription(session.accessToken, {
        plan_id: plan.id,
        uid: currentUser.id,
        transaction_name: `Buy ${plan.name}`,
      });
      if (response.data.wallet) {
        setWalletState(response.data.wallet);
      }
      await refreshWallet();
      await loadData();
    } catch (buyError) {
      setError(buyError instanceof Error ? buyError.message : "Could not complete purchase.");
    } finally {
      setBuyingPlanId("");
    }
  };

  if (!session?.accessToken || !currentUser?.id) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-6 text-zinc-300">
        Please login to manage your subscription.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Buy Subscription</h1>
          <p className="text-sm text-zinc-400">Choose a plan or addon to top up coins instantly.</p>
        </div>
        <Link
          href="/wallet/transactions"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/10"
        >
          View Transactions
        </Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-2 flex items-center gap-2 text-zinc-300">
            <Wallet className="h-4 w-4 text-crimson" />
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-400">Current Coins</span>
          </div>
          <div className="text-4xl font-bold text-white">{walletState?.coins ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-2 flex items-center gap-2 text-zinc-300">
            <Crown className="h-4 w-4 text-amber-400" />
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-400">Plan Status</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {walletState?.active_subscription?.status === "active"
              ? `${walletState.active_subscription.plan_type.toUpperCase()} PRO`
              : "No Active Subscription"}
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            {walletState?.active_subscription?.cycle_end
              ? `Renews or expires on ${new Date(walletState.active_subscription.cycle_end).toLocaleDateString()}`
              : "Buy a monthly or yearly plan for PRO access."}
          </div>
        </div>
      </div>

      {error ? <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {sortedPlans.map((plan) => {
            const isAddon = plan.plan_type === "addon";
            const isRecommended = preferredType === "addon" ? isAddon : plan.plan_type === "monthly";
            const isBuying = buyingPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 ${isRecommended ? "border-crimson/60 bg-crimson/10" : "border-white/10 bg-white/5"}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
                    <p className="text-xs uppercase tracking-[0.13em] text-zinc-400">{plan.plan_type}</p>
                  </div>
                  {isRecommended ? (
                    <span className="rounded-full bg-crimson px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">Popular</span>
                  ) : null}
                </div>
                <div className="mb-1 text-2xl font-bold text-white">{formatPrice(plan.price)}</div>
                <div className="text-sm text-zinc-300">{plan.coin_amount} coins included</div>
                <div className="mb-5 text-xs text-zinc-400">{plan.months_total} month cycle</div>
                <button
                  onClick={() => void buyPlan(plan)}
                  disabled={isBuying}
                  className="flex w-full items-center justify-center rounded-xl bg-crimson px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isBuying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
