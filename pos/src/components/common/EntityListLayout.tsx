import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ChevronDown, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function EntityListLayout({ title, description, action, children }) {
  return (
    <div className="p-5 space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction>{action}</CardAction>
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
      {children}
    </div>
  );
}
