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
interface EntityListLayoutProps {
  title: string;
  description: string;
  action: React.ReactNode;
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  resultCount?: number;
  statusFilter?: "all" | "active" | "inactive";
  onStatusFilterChange?: (value: "all" | "active" | "inactive") => void;
}
export function EntityListLayout({
  title,
  description,
  action,
  children,
  searchValue = "",
  onSearchChange = () => undefined,
  resultCount = 0,
  statusFilter,
  onStatusFilterChange,
}: EntityListLayoutProps) {
  return (
    <div className="p-5 space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction>{action}</CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <InputGroup className="w-full sm:max-w-sm">
              <InputGroupInput
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                aria-label={`Search ${title.toLowerCase()}`}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                {resultCount} {resultCount === 1 ? "result" : "results"}
              </InputGroupAddon>
            </InputGroup>
            {statusFilter && onStatusFilterChange && (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  {statusFilter === "all"
                    ? "All statuses"
                    : statusFilter === "active"
                      ? "Active"
                      : "Inactive"}
                  <ChevronDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onStatusFilterChange("all")}>
                    All statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusFilterChange("active")}
                  >
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusFilterChange("inactive")}
                  >
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
      {children}
    </div>
  );
}
