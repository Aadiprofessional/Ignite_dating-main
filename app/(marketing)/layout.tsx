import MarketingNav from "@/components/marketing/MarketingNav";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="marketing-root min-h-screen bg-background text-offwhite">
      <MarketingNav />
      {children}
    </div>
  );
}
