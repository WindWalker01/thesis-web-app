"use server";

import { ethers } from "ethers";

import type {
    BlockchainTransactionItem,
    BlockchainTxMethod,
    BlockchainTxSource,
    BlockchainTxStatus,
    GetBlockchainTransactionsInput,
    GetBlockchainTransactionsResult,
} from "@/features/txs/types";

const RPC_URL =
    process.env.AMOY_RPC_URL ?? "https://rpc-amoy.polygon.technology/";

const CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_ARTWORK_REGISTRY_CONTRACT_ADDRESS ??
    process.env.ARTWORK_REGISTRY_CONTRACT_ADDRESS ??
    "0xd4e0a7C7c4D846856B2eb97A4A5fc56b01611B4e";

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY ?? "";
const POLYGONSCAN_API_URL = "https://api.etherscan.io/v2/api";
const POLYGON_AMOY_CHAIN_ID = "80002";
const EXPLORER_BASE_URL = "https://amoy.polygonscan.com";
const CHAIN_LABEL = "Polygon Amoy";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 20;

const INITIAL_BLOCK_BATCH_SIZE = 200;
const MIN_BLOCK_BATCH_SIZE = 25;
const MAX_BATCHES = 1200;

const ABI = [
    "function registerWorkForUser(bytes32 authorIdHash, bytes32 fileHash, bytes32 pHash, bytes32 evidenceHash) external returns (uint256 workId)",
    "function revokeWork(uint256 workId, bytes32 revokeReasonHash) external",
    "event WorkRegistered(uint256 indexed workId, bytes32 indexed authorIdHash, address indexed attester, bytes32 fileHash, bytes32 pHash, bytes32 evidenceHash)",
    "event WorkRevoked(uint256 indexed workId, address indexed attester, bytes32 revokeReasonHash, uint64 revokedAt)",
] as const;

const iface = new ethers.Interface(ABI);

const WORK_REGISTERED_TOPIC = ethers.id(
    "WorkRegistered(uint256,bytes32,address,bytes32,bytes32,bytes32)",
);

const WORK_REVOKED_TOPIC = ethers.id(
    "WorkRevoked(uint256,address,bytes32,uint64)",
);

const REGISTER_SELECTOR = iface.getFunction("registerWorkForUser")?.selector ?? "";
const REVOKE_SELECTOR = iface.getFunction("revokeWork")?.selector ?? "";

type RpcLogRow = {
    txHash: string;
    blockNumber: number;
    logIndex: number;
    method: BlockchainTxMethod;
    methodLabel: string;
    workId: string | null;
};

type ExplorerTxRow = {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    txreceipt_status?: string;
    isError?: string;
    gasUsed?: string;
    input?: string;
    functionName?: string;
    methodId?: string;
};

function clampPageSize(pageSize?: number) {
    if (!pageSize || Number.isNaN(pageSize)) return DEFAULT_PAGE_SIZE;
    return Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
}

function buildExplorerTxUrl(txHash: string) {
    return `${EXPLORER_BASE_URL}/tx/${txHash}`;
}

function getMethodMetaFromLogTopic(topic0: string): {
    method: BlockchainTxMethod;
    methodLabel: string;
} {
    if (topic0 === WORK_REGISTERED_TOPIC) {
        return { method: "register", methodLabel: "Register" };
    }

    if (topic0 === WORK_REVOKED_TOPIC) {
        return { method: "revoke", methodLabel: "Revoke" };
    }

    return { method: "unknown", methodLabel: "Unknown" };
}

function getMethodMetaFromInput(
    input?: string,
    functionName?: string,
    methodId?: string,
): {
    method: BlockchainTxMethod;
    methodLabel: string;
} {
    const normalizedName = functionName?.toLowerCase() ?? "";
    const selector = (methodId || input?.slice(0, 10) || "").toLowerCase();

    if (
        normalizedName.includes("registerworkforuser") ||
        selector === REGISTER_SELECTOR.toLowerCase()
    ) {
        return { method: "register", methodLabel: "Register" };
    }

    if (
        normalizedName.includes("revokework") ||
        selector === REVOKE_SELECTOR.toLowerCase()
    ) {
        return { method: "revoke", methodLabel: "Revoke" };
    }

    return { method: "unknown", methodLabel: "Unknown" };
}

function normalizeStatusFromReceiptStatus(
    receiptStatus?: string | number | null,
    isError?: string | null,
): BlockchainTxStatus {
    if (receiptStatus === "1" || receiptStatus === 1) return "success";
    if (receiptStatus === "0" || receiptStatus === 0) return "failed";
    if (isError === "1") return "failed";
    if (isError === "0") return "success";
    return "pending";
}

function isBlockRangeLimitError(error: unknown) {
    if (!(error instanceof Error)) return false;

    const message = error.message.toLowerCase();

    return (
        message.includes("block range exceeds configured limit") ||
        message.includes("exceeds configured limit") ||
        message.includes("eth_getlogs")
    );
}

function parseWorkIdFromParsedLog(log: ethers.Log): string | null {
    try {
        const parsed = iface.parseLog({
            data: log.data,
            topics: log.topics,
        });

        if (!parsed) return null;

        const value = parsed.args?.[0];

        if (typeof value === "bigint") return value.toString();
        if (value != null) return String(value);

        return null;
    } catch {
        return null;
    }
}

async function fetchTransactionsViaRpcLogs(
    page: number,
    pageSize: number,
): Promise<{
    items: BlockchainTransactionItem[];
    hasNextPage: boolean;
}> {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const latestBlock = await provider.getBlockNumber();
    const neededCount = page * pageSize + 1;

    const rows: RpcLogRow[] = [];

    let toBlock = latestBlock;
    let blockBatchSize = INITIAL_BLOCK_BATCH_SIZE;
    let batches = 0;

    while (toBlock >= 0 && rows.length < neededCount && batches < MAX_BATCHES) {
        const fromBlock = Math.max(toBlock - blockBatchSize + 1, 0);

        try {
            const logs = await provider.getLogs({
                address: CONTRACT_ADDRESS,
                fromBlock,
                toBlock,
                topics: [[WORK_REGISTERED_TOPIC, WORK_REVOKED_TOPIC]],
            });

            for (const log of logs) {
                const topic0 = log.topics[0] ?? "";
                const methodMeta = getMethodMetaFromLogTopic(topic0);

                rows.push({
                    txHash: log.transactionHash,
                    blockNumber: log.blockNumber,
                    logIndex: log.index,
                    method: methodMeta.method,
                    methodLabel: methodMeta.methodLabel,
                    workId: parseWorkIdFromParsedLog(log),
                });
            }

            toBlock = fromBlock - 1;
            batches += 1;
        } catch (error) {
            if (isBlockRangeLimitError(error) && blockBatchSize > MIN_BLOCK_BATCH_SIZE) {
                blockBatchSize = Math.max(
                    Math.floor(blockBatchSize / 2),
                    MIN_BLOCK_BATCH_SIZE,
                );
                continue;
            }

            throw error;
        }
    }

    rows.sort((a, b) => {
        if (b.blockNumber !== a.blockNumber) return b.blockNumber - a.blockNumber;
        return b.logIndex - a.logIndex;
    });

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const pageRows = rows.slice(start, end);
    const hasNextPage = rows.length > end;

    const items = await Promise.all(
        pageRows.map(async (row): Promise<BlockchainTransactionItem> => {
            const [receipt, tx, block] = await Promise.all([
                provider.getTransactionReceipt(row.txHash),
                provider.getTransaction(row.txHash),
                provider.getBlock(row.blockNumber),
            ]);

            return {
                txHash: row.txHash,
                method: row.method,
                methodLabel: row.methodLabel,
                blockNumber: row.blockNumber,
                timestamp: block
                    ? new Date(Number(block.timestamp) * 1000).toISOString()
                    : null,
                from: tx?.from ?? receipt?.from ?? "",
                to: tx?.to ?? receipt?.to ?? CONTRACT_ADDRESS,
                status: normalizeStatusFromReceiptStatus(receipt?.status ?? null, null),
                gasUsed: receipt?.gasUsed?.toString() ?? null,
                explorerUrl: buildExplorerTxUrl(row.txHash),
                workId: row.workId,
                source: "rpc",
            };
        }),
    );

    return {
        items,
        hasNextPage,
    };
}

async function fetchTransactionsViaExplorerApi(
    page: number,
    pageSize: number,
): Promise<{
    items: BlockchainTransactionItem[];
    hasNextPage: boolean;
}> {
    if (!POLYGONSCAN_API_KEY) {
        throw new Error("Missing POLYGONSCAN_API_KEY.");
    }

    const url = new URL(POLYGONSCAN_API_URL);
    url.searchParams.set("chainid", POLYGON_AMOY_CHAIN_ID);
    url.searchParams.set("module", "account");
    url.searchParams.set("action", "txlist");
    url.searchParams.set("address", CONTRACT_ADDRESS);
    url.searchParams.set("startblock", "0");
    url.searchParams.set("endblock", "999999999");
    url.searchParams.set("page", String(page));
    url.searchParams.set("offset", String(pageSize + 1));
    url.searchParams.set("sort", "desc");
    url.searchParams.set("apikey", POLYGONSCAN_API_KEY);

    const response = await fetch(url.toString(), {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch PolygonScan transactions.");
    }

    const json = (await response.json()) as {
        status?: string;
        message?: string;
        result?: ExplorerTxRow[] | string;
    };

    if (!Array.isArray(json.result)) {
        throw new Error(
            typeof json.result === "string"
                ? json.result
                : "PolygonScan returned an invalid response.",
        );
    }

    const filtered = json.result.filter((tx) => {
        const toAddress = tx.to?.toLowerCase() ?? "";
        const methodMeta = getMethodMetaFromInput(
            tx.input,
            tx.functionName,
            tx.methodId,
        );

        return (
            toAddress === CONTRACT_ADDRESS.toLowerCase() &&
            methodMeta.method !== "unknown"
        );
    });

    const hasNextPage = filtered.length > pageSize;

    const items = filtered
        .slice(0, pageSize)
        .map((tx): BlockchainTransactionItem => {
            const methodMeta = getMethodMetaFromInput(
                tx.input,
                tx.functionName,
                tx.methodId,
            );

            return {
                txHash: tx.hash,
                method: methodMeta.method,
                methodLabel: methodMeta.methodLabel,
                blockNumber: tx.blockNumber ? Number(tx.blockNumber) : null,
                timestamp: tx.timeStamp
                    ? new Date(Number(tx.timeStamp) * 1000).toISOString()
                    : null,
                from: tx.from ?? "",
                to: tx.to ?? CONTRACT_ADDRESS,
                status: normalizeStatusFromReceiptStatus(
                    tx.txreceipt_status,
                    tx.isError,
                ),
                gasUsed: tx.gasUsed ?? null,
                explorerUrl: buildExplorerTxUrl(tx.hash),
                workId: null,
                source: "explorer",
            };
        });

    return {
        items,
        hasNextPage,
    };
}

async function resolveTransactions(
    page: number,
    pageSize: number,
): Promise<{
    items: BlockchainTransactionItem[];
    hasNextPage: boolean;
    sourceUsed: BlockchainTxSource;
}> {
    if (POLYGONSCAN_API_KEY) {
        try {
            const explorerData = await fetchTransactionsViaExplorerApi(page, pageSize);

            if (explorerData.items.length > 0) {
                return {
                    ...explorerData,
                    sourceUsed: "explorer",
                };
            }
        } catch {
            // fallback to rpc logs
        }
    }

    const rpcData = await fetchTransactionsViaRpcLogs(page, pageSize);

    return {
        ...rpcData,
        sourceUsed: "rpc",
    };
}

export async function getBlockchainTransactions(
    input: GetBlockchainTransactionsInput = {},
): Promise<GetBlockchainTransactionsResult> {
    try {
        if (!ethers.isAddress(CONTRACT_ADDRESS)) {
            return {
                success: false,
                message: "Invalid contract address configuration.",
            };
        }

        const page = Math.max(input.page ?? 1, 1);
        const pageSize = clampPageSize(input.pageSize);

        const result = await resolveTransactions(page, pageSize);

        return {
            success: true,
            items: result.items,
            page,
            pageSize,
            hasNextPage: result.hasNextPage,
            contractAddress: CONTRACT_ADDRESS,
            chainLabel: CHAIN_LABEL,
            sourceUsed: result.sourceUsed,
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to load blockchain transactions.",
        };
    }
}