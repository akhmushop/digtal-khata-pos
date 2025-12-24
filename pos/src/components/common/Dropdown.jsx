import React, { useState, useEffect, useRef } from "react";
import { RiArrowDropDownFill } from "react-icons/ri";
function DropdownModal({ options, label }) {
  const [selected, setSelected] = useState(options[0].name || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const clickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      e.preventDefault();
      setIsOpen(!isOpen);
      setIsFocused(true);
    }
  };
  return (
    <div className="relative m-5 cursor-pointer select-none" ref={dropdownRef}>
      <div
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`relative border rounded-sm h-10 w-52 hover:border-gray-700 focus:outline-none ${
          isFocused || isOpen
            ? "border-blue-500 ring-1 ring-blue-500"
            : "border-gray-400"
        }`}
      >
        <div className="flex items-center justify-between px-2 h-full">
          <span>{selected}</span>
          <div
            className={`text-2xl transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            } `}
          >
            <RiArrowDropDownFill />
          </div>
        </div>
        <span
          className={`absolute left-3 -top-3 px-1 text-sm bg-white pointer-events-none ${
            isFocused || isOpen ? "text-blue-500" : "text-gray-400"
          }`}
        >
          {label}
        </span>
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="absolute w-full right-0 bg-gray-100 rounded-md border border-gray-400 mt-1 shadow-md z-10 "
        >
          {options.map((option) => {
            return (
              <div
                role="option"
                aria-selected={selected === option.name}
                onClick={() => {
                  setSelected(option.name);
                }}
                key={option.id}
                className="p-1 pl-4 hover:bg-gray-200 cursor-pointer"
              >
                {option.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default DropdownModal;
