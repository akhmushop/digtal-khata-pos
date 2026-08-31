import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { CategoryRows } from "./CategoryRows";

export const demoCategories: CategoryTreeNode[] = [
  {
    id: 1,
    name: "Electronics",
    products: 150,
    status: "active",
    children: [
      {
        id: 2,
        name: "Mobile Phones",
        products: 80,
        status: "active",
        children: [
          {
            id: 3,
            name: "Smartphones",
            products: 60,
            status: "active",
            children: [
              {
                id: 4,
                name: "Android",
                products: 40,
                status: "active",
                children: [],
              },
              {
                id: 5,
                name: "iOS",
                products: 20,
                status: "active",
                children: [],
              },
            ],
          },
          {
            id: 6,
            name: "Accessories",
            products: 20,
            status: "inactive",
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 7,
    name: "Groceries & Food",
    products: 300,
    status: "active",
    children: [
      {
        id: 8,
        name: "Beverages",
        products: 120,
        status: "active",
        children: [
          {
            id: 9,
            name: "Soft Drinks",
            products: 50,
            status: "active",
            children: [],
          },
          {
            id: 10,
            name: "Juices",
            products: 70,
            status: "active",
            children: [],
          },
        ],
      },
      {
        id: 11,
        name: "Snacks",
        products: 180,
        status: "active",
        children: [
          {
            id: 12,
            name: "Chips",
            products: 90,
            status: "active",
            children: [
              {
                id: 13,
                name: "Potato Chips",
                products: 50,
                status: "active",
                children: [],
              },
              {
                id: 14,
                name: "Tortilla Chips",
                products: 40,
                status: "inactive",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 15,
    name: "Home & Kitchen",
    products: 95,
    status: "active",
    children: [
      {
        id: 16,
        name: "Cookware",
        products: 45,
        status: "active",
        children: [
          {
            id: 17,
            name: "Pots & Pans",
            products: 30,
            status: "active",
            children: [
              {
                id: 18,
                name: "Non-stick",
                products: 15,
                status: "active",
                children: [],
              },
              {
                id: 19,
                name: "Stainless Steel",
                products: 15,
                status: "active",
                children: [],
              },
            ],
          },
        ],
      },
      { id: 20, name: "Cutlery", products: 50, status: "active", children: [] },
    ],
  },
  {
    id: 21,
    name: "Clothing",
    products: 200,
    status: "active",
    children: [
      {
        id: 22,
        name: "Men's Wear",
        products: 100,
        status: "active",
        children: [
          {
            id: 23,
            name: "Shirts",
            products: 60,
            status: "active",
            children: [],
          },
          {
            id: 24,
            name: "Trousers",
            products: 40,
            status: "active",
            children: [],
          },
        ],
      },
      {
        id: 25,
        name: "Women's Wear",
        products: 100,
        status: "inactive",
        children: [],
      },
    ],
  },
  {
    id: 26,
    name: "Stationery",
    products: 50,
    status: "active",
    children: [
      {
        id: 27,
        name: "Office Supplies",
        products: 30,
        status: "active",
        children: [
          {
            id: 28,
            name: "Paper Products",
            products: 15,
            status: "active",
            children: [
              {
                id: 29,
                name: "A4 Paper",
                products: 10,
                status: "active",
                children: [],
              },
              {
                id: 30,
                name: "Notebooks",
                products: 5,
                status: "active",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];
export type CategoryTreeNode = {
  id: number;
  name: string;
  products: number;
  status: "active" | "inactive";
  children: CategoryTreeNode[];
};

type CategoryTreeTableProps = {
  nodes: CategoryTreeNode[];

  onEdit: (category: CategoryTreeNode) => void;
  onDelete: (category: CategoryTreeNode) => void;
  onAddChild: (category: CategoryTreeNode) => void;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function CategoryTreeTable({
  nodes,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryTreeTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const toggleExpanded = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };
  return (
    <div className="rounded-md border">
      <Table>
        {/* HEADER */}
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        {/* BODY */}
        <TableBody>
          {nodes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                No categories found.
              </TableCell>
            </TableRow>
          ) : (
            <CategoryRows
              nodes={nodes}
              level={0}
              expandedIds={expandedIds}
              onToggle={toggleExpanded}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          )}
        </TableBody>
      </Table>
    </div>
  );
}
