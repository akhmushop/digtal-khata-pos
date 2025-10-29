import React from "react";
import { Sidebar } from "../components/Sidebar";
import { PosHeader } from "../components/PosHeader";
function HomePage() {
  return (
    <div className="flex bg-gray-100  h-screen">
      <Sidebar />
      <PosHeader />
    </div>
  );
}
export default HomePage;
