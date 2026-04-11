"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getBlockchainTransactions } from "../server/get-blockchain-transaction";
import type {
    BlockchainMethodFilter,
    BlockchainStatusFilter,
    BlockchainTransactionItem,
    BlockchainTxSource,
} from "@/features/txs/types";

type UseBlockchainTransactionsResult = {
    items: BlockchainTransactionItem[];
    filteredItems: BlockchainTransactionItem[];
    page: number;
    pageSize: number;
    hasNextPage: boolean;
    isLoading: boolean;
    isFetching: boolean;
    errorMessage: string;
    contractAddress: string;
    chainLabel: string;
    sourceUsed: BlockchainTxSource | null;
    search: string;
    methodFilter: BlockchainMethodFilter;
    statusFilter: BlockchainStatusFilter;
    setSearch: (value: string) => void;
    setMethodFilter: (value: BlockchainMethodFilter) => void;
    setStatusFilter: (value: BlockchainStatusFilter) => void;
    clearFilters: () => void;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    refresh: () => void;
};

const PAGE_SIZE = 10;

export function useBlockchainTransactions(): UseBlockchainTransactionsResult {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] =
        useState<BlockchainMethodFilter>("all");
    const [statusFilter, setStatusFilter] =
        useState<BlockchainStatusFilter>("all");

    const query = useQuery({
        queryKey: ["blockchain-transactions", page, PAGE_SIZE],
        queryFn: async () => {
            const response = await getBlockchainTransactions({
                page,
                pageSize: PAGE_SIZE,
            });

            if (!response.success) {
                throw new Error(response.message);
            }

            return response;
        },
        staleTime: 30_000,
        gcTime: 1000 * 60 * 10,
        placeholderData: (previousData) => previousData,
        meta: {
            persist: true,
        },
    });

    const data = query.data;

    const items = data?.items ?? [];

    const filteredItems = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return items.filter((item) => {
            const matchesSearch =
                normalizedSearch === "" ||
                item.txHash.toLowerCase().includes(normalizedSearch) ||
                item.from.toLowerCase().includes(normalizedSearch) ||
                item.to.toLowerCase().includes(normalizedSearch) ||
                item.workId?.toLowerCase().includes(normalizedSearch);

            const matchesMethod =
                methodFilter === "all" || item.method === methodFilter;

            const matchesStatus =
                statusFilter === "all" || item.status === statusFilter;

            return matchesSearch && matchesMethod && matchesStatus;
        });
    }, [items, search, methodFilter, statusFilter]);

    return {
        items,
        filteredItems,
        page,
        pageSize: PAGE_SIZE,
        hasNextPage: data?.hasNextPage ?? false,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        errorMessage: query.error instanceof Error ? query.error.message : "",
        contractAddress: data?.contractAddress ?? "",
        chainLabel: data?.chainLabel ?? "",
        sourceUsed: data?.sourceUsed ?? null,
        search,
        methodFilter,
        statusFilter,
        setSearch,
        setMethodFilter,
        setStatusFilter,
        clearFilters: () => {
            setSearch("");
            setMethodFilter("all");
            setStatusFilter("all");
        },
        goToNextPage: () => {
            if (!data?.hasNextPage || query.isFetching) return;
            setPage((currentPage) => currentPage + 1);
        },
        goToPreviousPage: () => {
            if (page <= 1 || query.isFetching) return;
            setPage((currentPage) => currentPage - 1);
        },
        refresh: () => {
            void query.refetch();
        },
    };
}