import React, { useState } from "react";
import { Link } from "react-router";
import { RiHome9Fill } from "react-icons/ri";
import { Card, CardContent } from "@/components/ui/card";
export function ProductHeader({
  setSearchProducts,
}: {
  setSearchProducts: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <>
      <Card className="flex text-black-200  rounded-md mx-5 mt-2  bg-zuccini-400   sticky top-1">
        <CardContent>
          <div className=" flex justify-between  items-center w-full   ">
            <Link to="/dashboard">
              <h1 className="text-xl   pl-3 pr-3 ">myPos</h1>
            </Link>
            <input
              onChange={(e) => {
                setSearchProducts(e.target.value);
              }}
              className="flex-1 border  h-10 pl-2 rounded-md  "
              type="text"
              placeholder="Search Product..."
            />
            <Link to="/dashboard">
              <button className="text-4xl   pl-3 pr-3 cursor-pointer  ">
                <RiHome9Fill />
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
