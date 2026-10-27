import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="relative">
          <SidebarTrigger className="absolute" />
          <Outlet />
        </main>
        <SidebarRail />
      </SidebarInset>
    </SidebarProvider>
  );
}
