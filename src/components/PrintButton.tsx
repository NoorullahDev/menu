'use client';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="text-[#F97316] hover:text-[#EA580C] text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 mx-auto mt-4 px-4 py-2 border border-[#FDBA74] rounded-lg hover:bg-[#FFF7ED]"
    >
      <span>🖨️</span> Print Menu
    </button>
  );
}
