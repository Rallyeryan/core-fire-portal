import { Button } from "@/components/ui/button";
import { Flame, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8340A]/5 via-transparent to-[#F5A623]/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8340A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[#E8340A]/20 rounded-full blur-2xl scale-150" />
            <div className="relative w-24 h-24 rounded-full fire-gradient flex items-center justify-center fire-glow">
              <Flame className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-black fire-gradient-text mb-4 leading-none">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
          <br />
          Let's get you back to safety.
        </p>

        {/* Accreditation bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["BAFE SP203-1", "NSI Gold", "BSI Kitemark"].map((badge) => (
            <span key={badge} className="px-2.5 py-1 text-xs bg-[#E8340A]/10 border border-[#E8340A]/20 rounded-full text-[#FF6B35]">
              {badge}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => setLocation("/")}
            className="fire-gradient fire-glow text-white font-semibold px-8"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-[#E8340A]/30 hover:bg-[#E8340A]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Brand footer */}
        <p className="mt-12 text-xs text-muted-foreground">
          Core Fire Protection Ltd — Professional Fire &amp; Security Solutions
        </p>
      </div>
    </div>
  );
}
