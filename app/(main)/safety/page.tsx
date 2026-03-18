"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, AlertTriangle, Lock, Phone, CheckCircle, Info, EyeOff } from "lucide-react";

function SafetyCard({ icon: Icon, title, description, color = "text-white" }: { icon: any, title: string, description: string, color?: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4 items-start hover:bg-white/10 transition-colors cursor-pointer">
      <div className={`p-2 rounded-full bg-white/5 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-bold text-sm mb-1">{title}</h3>
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function SafetyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#080808] pb-24 text-white lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center gap-4 border-b border-white/5 bg-[#080808]/80 px-4 py-4 backdrop-blur-md lg:px-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-serif text-xl font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500 fill-blue-500/20" />
          Safety Center
        </h1>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-600/10 rounded-3xl p-6 border border-blue-500/20 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="font-serif font-bold text-2xl mb-2">Your Safety First</h2>
          <p className="text-sm text-white/60">We're committed to keeping Ignite a safe and inclusive community for everyone.</p>
        </div>

        {/* Tools Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-white/60" />
            Safety Tools
          </h2>
          <div className="grid gap-3">
            <SafetyCard 
              icon={EyeOff} 
              title="Unmatch & Block" 
              description="Instantly remove someone from your matches and prevent them from contacting you." 
            />
            <SafetyCard 
              icon={AlertTriangle} 
              title="Report Behavior" 
              description="Anonymously report users who violate our community guidelines."
              color="text-amber-500"
            />
            <SafetyCard 
              icon={Info} 
              title="Incognito Mode" 
              description="Only be seen by people you've already liked (Premium feature)." 
            />
          </div>
        </div>

        {/* Guides Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-white/60" />
            Safety Guides
          </h2>
          <div className="grid gap-3">
            <SafetyCard 
              icon={Shield} 
              title="Dating Safely" 
              description="Top tips for staying safe while meeting new people online and offline." 
            />
            <SafetyCard 
              icon={CheckCircle} 
              title="Consent 101" 
              description="Understanding boundaries and clear communication." 
            />
          </div>
        </div>

        {/* Emergency Section */}
        <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-bold uppercase tracking-wider">Emergency Resources</span>
          </div>
          <p className="text-xs text-white/60">
            If you are in immediate danger or need urgent assistance, please contact local authorities.
          </p>
          <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Phone className="w-4 h-4" />
            Call Emergency Services
          </button>
        </div>
        
        <div className="h-8" />
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-2 font-medium text-white">Stay in control</h3>
            <p className="text-sm text-white/60">Desktop mode keeps reporting and blocking actions visible while you browse profiles and chats.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
