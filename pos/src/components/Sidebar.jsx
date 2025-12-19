import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  RiMenuFold4Line,
  RiMenuUnfold4Line,
  RiDashboardFill,
  RiProductHuntFill,
  RiArchiveDrawerFill,
  RiMoneyDollarBoxFill,
  RiUserFill,
} from "react-icons/ri";
import { MdPointOfSale, MdManageAccounts } from "react-icons/md";
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Pos");
  const navigate = useNavigate();
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const menuItems = [
    { name: "DashBoard", icon: <RiDashboardFill /> },
    { name: "Pos", icon: <MdPointOfSale />, path: "/" },
    { name: "Products", icon: <RiProductHuntFill /> },
    { name: "Sales", icon: <RiMoneyDollarBoxFill /> },
    { name: "Cash Drawer", icon: <RiArchiveDrawerFill /> },
    { name: "Customers", icon: <MdManageAccounts />, path: "/customer" },
    { name: "1DashBoard", icon: <RiDashboardFill /> },
    { name: "1Pos", icon: <MdPointOfSale /> },
    { name: "1Products", icon: <RiProductHuntFill /> },
    { name: "1Sales", icon: <RiMoneyDollarBoxFill /> },
    { name: "1Cash Drawer", icon: <RiArchiveDrawerFill /> },
    { name: "1Customers", icon: <MdManageAccounts /> },
    { name: "2Pos", icon: <MdPointOfSale /> },
    { name: "2Products", icon: <RiProductHuntFill /> },
    { name: "2Sales", icon: <RiMoneyDollarBoxFill /> },
    { name: "2Cash Drawer", icon: <RiArchiveDrawerFill /> },
    { name: "2Customers", icon: <MdManageAccounts /> },
  ];
  return (
    <div
      className={`h-screen relative  ${
        isOpen ? "w-54" : "w-16"
      } bg-gray-900 text-white transition-all duration-300 ease-in-out overflow-scroll no-scrollbar col-span-1  `}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900 ">
        <h1 className="">{isOpen && "My Pos"}</h1>
        <button
          className="text-4xl hover:cursor-pointer  "
          onClick={toggleSidebar}
        >
          {isOpen ? <RiMenuUnfold4Line /> : <RiMenuFold4Line />}
        </button>
      </div>
      <nav className=" ">
        {menuItems.map((item) => {
          const { icon: Icon, name: Name, path: Path } = item;
          return (
            <div
              key={item.name}
              onClick={() => {
                setActiveMenu(Name);
                navigate(Path);
              }}
              className={` cursor-pointer transition-colors duration-200
                ${
                  activeMenu === Name
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
            >
              <div className="flex items-center gap-4 p-3 hover:bg-gray-700 cursor-pointer">
                <span className="text-4xl"> {Icon}</span>
                <span>{isOpen && Name}</span>
              </div>
            </div>
          );
        })}
      </nav>
      <div className=" sticky bottom-0  border-t border-gray-700    bg-gray-900 w-full flex justify-between p-3 ">
        <p className="">{isOpen && "arif"}</p>
        <span className="   text-4xl  ">{!isOpen && <RiUserFill />}</span>
        <button className="text-2xl">{isOpen && <MdManageAccounts />}</button>
      </div>
    </div>
  );
}
