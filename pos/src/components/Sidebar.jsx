import React, { useState } from "react";
import {
  RiMenuFold4Line,
  RiMenuUnfold4Line,
  RiDashboardFill,
  RiProductHuntFill,
  RiArchiveDrawerFill,
  RiMoneyDollarBoxFill,
} from "react-icons/ri";
import { MdPointOfSale, MdManageAccounts } from "react-icons/md";
export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const menuItems = [
    { name: "DashBoard", icon: <RiDashboardFill /> },
    { name: "Pos", icon: <MdPointOfSale /> },
    { name: "Products", icon: <RiProductHuntFill /> },
    { name: "Sales", icon: <RiMoneyDollarBoxFill /> },
    { name: "Cash Drawer", icon: <RiArchiveDrawerFill /> },
    { name: "Customers", icon: <MdManageAccounts /> },    { name: "DashBoard", icon: <RiDashboardFill /> },
    { name: "Pos", icon: <MdPointOfSale /> },
    { name: "Products", icon: <RiProductHuntFill /> },
    { name: "Sales", icon: <RiMoneyDollarBoxFill /> },
    { name: "Cash Drawer", icon: <RiArchiveDrawerFill /> },
    { name: "Customers", icon: <MdManageAccounts /> },    { name: "Pos", icon: <MdPointOfSale /> },
    { name: "Products", icon: <RiProductHuntFill /> },
    { name: "Sales", icon: <RiMoneyDollarBoxFill /> },
    { name: "Cash Drawer", icon: <RiArchiveDrawerFill /> },
    { name: "Customers", icon: <MdManageAccounts /> },
  ];
  return (
    <div className=" flex bg-gray-100  h-screen">
      <div
        className={`   ${
          isOpen ? "w-44" : "w-16"
        } bg-gray-900 text-white transition-all duration-300 ease-in-out overflow-scroll no-scrollbar  `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h1 className="    ">{isOpen && "My Pos"}</h1>
          <button
            className="text-4xl hover:cursor-pointer  "
            onClick={toggleSidebar}
          >
            {isOpen ? <RiMenuUnfold4Line /> : <RiMenuFold4Line />}
          </button>
        </div>
        <nav className=" ">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const Name = item.name;
            return (
              <div key={item.name} className="">
                <div className="flex items-center gap-4 p-3 hover:bg-gray-700 cursor-pointer">
                  <span className="text-4xl"> {Icon}</span>
                  <span>{isOpen && Name}</span>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
