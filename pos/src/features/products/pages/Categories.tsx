import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ChevronDown, Plus, Search } from "lucide-react";
import {
  CategoryTreeNode,
  CategoryTreeTable,
  demoCategories,
} from "../components/categories/CategoryTreeTable";

export function Categories() {
  const handleEdit = (category: CategoryTreeNode) => {
    console.log("Edit", category);
  };

  const handleDelete = (category: CategoryTreeNode) => {
    console.log("Delete", category);
  };

  const handleAddChild = (category: CategoryTreeNode) => {
    console.log("Add child", category);
  };

  return (
    <div className="p-5 space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage your product categories and hierarchy
          </CardDescription>
          <CardAction>
            <Button>
              <Plus />
              Add Category
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <InputGroup className="max-w-xs">
              <InputGroupInput placeholder="Search..." />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
            </InputGroup>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  Status <ChevronDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Active</DropdownMenuItem>
                  <DropdownMenuItem>Inactive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      <CategoryTreeTable
        nodes={demoCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddChild={handleAddChild}
      />
    </div>
  );
}
