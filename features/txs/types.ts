export type BlockchainTxMethod = "register" | "revoke" | "unknown";

export type BlockchainTxStatus = "success" | "failed" | "pending";

export type BlockchainTxSource = "rpc" | "explorer";

export type BlockchainTransactionItem = {
    txHash: string;
    method: BlockchainTxMethod;
    methodLabel: string;
    blockNumber: number | null;
    timestamp: string | null;
    from: string;
    to: string;
    status: BlockchainTxStatus;
    gasUsed: string | null;
    explorerUrl: string;
    workId: string | null;
    source: BlockchainTxSource;
};

export type GetBlockchainTransactionsInput = {
    page?: number;
    pageSize?: number;
};

export type GetBlockchainTransactionsSuccess = {
    success: true;
    items: BlockchainTransactionItem[];
    page: number;
    pageSize: number;
    hasNextPage: boolean;
    contractAddress: string;
    chainLabel: string;
    sourceUsed: BlockchainTxSource;
};

export type GetBlockchainTransactionsError = {
    success: false;
    message: string;
};

export type GetBlockchainTransactionsResult =
    | GetBlockchainTransactionsSuccess
    | GetBlockchainTransactionsError;