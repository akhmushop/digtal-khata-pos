import type { ReactNode } from "react";
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
import { Search } from "lucide-react";

export interface ContactMetric {
  label: string;
  value: string;
  description: string;
}

interface ContactListLayoutProps {
  title: string;
  description: string;
  action: ReactNode;
  metrics: ContactMetric[];
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  resultCount: number | string;
  filter?: ReactNode;
  children: ReactNode;
}

export function ContactListLayout({
  title,
  description,
  action,
  metrics,
  search,
  onSearchChange,
  searchPlaceholder,
  resultCount,
  filter,
  children,
}: ContactListLayoutProps) {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <CardAction className="col-auto row-auto justify-self-start sm:justify-self-end">
            {action}
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border bg-muted/20 p-4"
            >
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <InputGroup className="max-w-lg">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
              <InputGroupAddon align="inline-end">
                {resultCount}{" "}
                {typeof resultCount === "number" && resultCount === 1
                  ? "result"
                  : "results"}
              </InputGroupAddon>
            </InputGroup>
            {filter}
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
