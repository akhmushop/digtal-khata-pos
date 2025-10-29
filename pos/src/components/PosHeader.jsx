import React from "react";
import { RiHome9Fill,RiUserAddFill } from "react-icons/ri";
export function PosHeader() {
  return (
    <>
      <div className="w-full">
        <div className="grid grid-cols-6">
          <div className="grid text-black-200  bg-gray-200 h-17  col-span-4  ">
            <div className="flex justify-between  items-center ">
              <h1 className="text-xl flex  pl-3 pr-3 ">Pos</h1>
              <input
                className="border w-130 h-10 pl-2 rounded-md "
                type="text"
                placeholder="Search Product..."
              />
              <button className="text-4xl flex  pl-3 pr-3 cursor-pointer ">
                <RiHome9Fill />
              </button>
            </div>
          </div>
          <div className="flex items-center col-span-2 pl-5 pr-5   bg-gray-300 h-17 justify-between  ">
            <input className="h-10 pl-2 rounded-md border" type="date"  />
            <input className="h-10 pl-2 rounded-md border" type="text" />
            <button className="text-4xl flex  pl-3 pr-3 cursor-pointer"><RiUserAddFill /></button>
          </div>
        </div>
      </div>
    </>
  );
}
