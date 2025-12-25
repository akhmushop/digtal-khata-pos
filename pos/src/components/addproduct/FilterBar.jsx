import React from 'react';
import { Search, ChevronDown, Info } from 'lucide-react';

const FilterBar = () => {
  return (
    <div className="w-full bg-white border-b border-gray-200 py-3.5 px-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-5 max-w-7xl mx-auto">
        
        {/* Store Filter */}
        <div className="min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
            Store
          </label>
          <div className="relative group">
            <select
              defaultValue="all"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-800 font-medium transition-all duration-200 cursor-pointer hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none"
            >
              <option value="all">All Stores</option>
              <option value="main">Main Store</option>
              <option value="warehouse">Warehouse</option>
              <option value="retail">Retail Outlet</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-gray-700" />
          </div>
        </div>

        {/* Customer/Supplier Filter */}
        <div className="min-w-[240px]">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
            Customer
          </label>
          <div className="relative group">
            <select
              defaultValue=""
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-600 transition-all duration-200 cursor-pointer hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none"
            >
              <option value="" disabled className="text-gray-400">
                Select a supplier
              </option>
              <option value="supplier1">Supplier A</option>
              <option value="supplier2">Supplier B</option>
              <option value="supplier3">Supplier C</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-gray-700" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[160px]">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
            Status
          </label>
          <div className="relative group">
            <select
              defaultValue="active"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-800 font-medium transition-all duration-200 cursor-pointer hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none"
            >
              <option value="active" className="text-green-700">Active</option>
              <option value="inactive" className="text-gray-500">Inactive</option>
              <option value="pending" className="text-amber-600">Pending</option>
              <option value="archived" className="text-gray-400">Archived</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-gray-700" />
          </div>
        </div>

        {/* Alert Quantity */}
        <div className="min-w-[180px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Alert Qty
            </label>
            <div className="relative group cursor-help">
              <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Set low stock threshold
              </div>
            </div>
          </div>
          <input
            type="number"
            placeholder="Enter quantity"
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            min="0"
          />
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[300px]">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
            Search Inventory
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by barcode, product name, or SKU..."
              className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <kbd className="px-1.5 py-0.5 text-xs border border-gray-300 rounded bg-gray-50 text-gray-500 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default FilterBar;