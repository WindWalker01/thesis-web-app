"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type {
    BlockchainMethodFilter,
    BlockchainStatusFilter,
} from "@/features/txs/types";

export function TransactionsToolbar({
    search,
    methodFilter,
    statusFilter,
    onSearchChange,
    onMethodFilterChange,
    onStatusFilterChange,
    onClearFilters,
}: {
    search: string;
    methodFilter: BlockchainMethodFilter;
    statusFilter: BlockchainStatusFilter;
    onSearchChange: (value: string) => void;
    onMethodFilterChange: (value: BlockchainMethodFilter) => void;
    onStatusFilterChange: (value: BlockchainStatusFilter) => void;
    onClearFilters: () => void;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search tx hash, address, or work ID..."
                        className="h-11 pl-10"
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-center">
                    <Select
                        value={methodFilter}
                        onValueChange={(value) =>
                            onMethodFilterChange(value as BlockchainMethodFilter)
                        }
                    >
                        <SelectTrigger className="h-11 w-full min-w-[180px] rounded-xl">
                            <SelectValue placeholder="Method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All methods</SelectItem>
                            <SelectItem value="register">Register</SelectItem>
                            <SelectItem value="revoke">Revoke</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                            onStatusFilterChange(value as BlockchainStatusFilter)
                        }
                    >
                        <SelectTrigger className="h-11 w-full min-w-[180px] rounded-xl">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClearFilters}
                        className="h-full rounded-xl"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
}