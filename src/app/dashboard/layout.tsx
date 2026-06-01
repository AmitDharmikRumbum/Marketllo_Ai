import { AppSidebar } from "@/components/app/AppSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F7F6FF] overflow-hidden">
      <AppSidebar projectName="Taskllo" projectColor="#6D28D9" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-[#EAEAF4] h-14 px-6 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-[#9898B8]">
            <span className="text-[#0F0E1A] font-semibold">Taskllo</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-lg bg-[#F7F6FF] flex items-center justify-center hover:bg-[#EDE9FE] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#6C6C8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#DC2626] rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#6D28D9] flex items-center justify-center text-white text-xs font-bold">A</div>
            <span className="text-sm font-semibold text-[#0F0E1A]">Alex</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#6C6C8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
