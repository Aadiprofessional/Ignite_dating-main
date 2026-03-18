import { TopNavbar } from "@/components/layout/TopNavbar";
import { CardStack } from "@/components/swipe/CardStack";
import { MousePointer2, Sparkles, ArrowUpCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <TopNavbar />

      <main className="relative z-0 flex flex-1 items-stretch justify-center px-4 pb-24 pt-4 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-h-[calc(100vh-170px)] items-center justify-center">
            <CardStack />
          </div>
          <aside className="hidden xl:flex xl:flex-col xl:gap-4">
            <div className="rounded-2xl border border-crimson/20 bg-crimson/10 p-5">
              <div className="mb-2 flex items-center gap-2 text-crimson">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-[0.16em]">Swipe Flow</span>
              </div>
              <p className="text-sm text-zinc-200">Desktop mode keeps the same swipe behavior while giving you more room to browse.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-2 flex items-center gap-2 text-zinc-200">
                <MousePointer2 className="h-4 w-4 text-crimson" />
                <span className="font-medium">Drag Cards</span>
              </div>
              <p className="text-sm text-zinc-400">Hold and drag horizontally to like or pass just like mobile gestures.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-2 flex items-center gap-2 text-zinc-200">
                <ArrowUpCircle className="h-4 w-4 text-crimson" />
                <span className="font-medium">Super Like</span>
              </div>
              <p className="text-sm text-zinc-400">Swipe up or use the center action button for quick super likes.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
