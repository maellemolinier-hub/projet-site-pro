import { Sparkles } from "lucide-react";

export function HeroPreview() {
  return (
    <div className="absolute inset-0 bg-gray-50">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-white border-b border-gray-100">
        <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
        <span className="ml-3 text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
          cap-entreprendre-france.fr
        </span>
      </div>

      {/* Page mockup */}
      <div className="p-6 space-y-4">
        <div className="h-24 rounded-xl gradient-brand" />
        <div className="space-y-2">
          <div className="h-3 w-2/3 rounded-full bg-gray-200" />
          <div className="h-3 w-1/2 rounded-full bg-gray-100" />
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="h-16 rounded-lg bg-gray-100" />
          <div className="h-16 rounded-lg bg-gray-100" />
          <div className="h-16 rounded-lg bg-gray-100" />
        </div>
      </div>

      {/* Mini Capia bubble */}
      <div className="absolute bottom-5 right-5 w-11 h-11 rounded-full bg-gradient-to-br from-brand-600 to-accent-500 shadow-lg flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
