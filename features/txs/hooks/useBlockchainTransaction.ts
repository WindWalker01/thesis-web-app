"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getBlockchainTransactions } from "../server/get-blockchain-transaction";
import type {
    BlockchainTransactionItem,
    BlockchainTxSource,
} from "@/features/txs/types";

type UseBlockchainTransactionsResult = {
    items: BlockchainTransactionItem[];
    page: number;
    pageSize: number;
    hasNextPage: boolean;
    isLoading: boolean;
    isFetching: boolean;
    errorMessage: string;
    contractAddress: string;
    chainLabel: string;
    sourceUsed: BlockchainTxSource | null;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    refresh: () => void;
};

const PAGE_SIZE = 10;

export function useBlockchainTransactions(): UseBlockchainTransactionsResult {
    const [page, setPage] = useState(1);

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
        gcTime: 5 * 60_000,
        placeholderData: (previousData) => previousData,
    });

    const data = query.data;

    return {
        items: data?.items ?? [],
        page,
        pageSize: PAGE_SIZE,
        hasNextPage: data?.hasNextPage ?? false,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        errorMessage: query.error instanceof Error ? query.error.message : "",
        contractAddress: data?.contractAddress ?? "",
        chainLabel: data?.chainLabel ?? "",
        sourceUsed: data?.sourceUsed ?? null,
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