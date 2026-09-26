import { ethers } from "ethers";

import type {
  GetBlockchainTransactionsInput,
  GetBlockchainTransactionsResult,
  BlockchainTransactionItem,
} from "@/features/txs/types";

const RPC_URL =
  process.env.NEXT_PUBLIC_AMOY_RPC_URL ??
  "https://rpc-amoy.polygon.technology/";
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ARTWORK_REGISTRY_CONTRACT_ADDRESS ??
  "0xfECCacAfd806C5D34355ABB10606F784B946D5c0";

const ABI = [
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

export async function getBlockchainTransactionsClient(
  input: GetBlockchainTransactionsInput = {},
): Promise<GetBlockchainTransactionsResult> {
  try {
    const page = Number(input.page ?? 1);
    const pageSize = Number(input.pageSize ?? 10);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const latest = await provider.getBlockNumber();

    // Simple paging: query a sliding window of ~2000 blocks per page.
    const windowSize = 2000;
    const toBlock = Math.max(0, latest - (page - 1) * windowSize);
    const fromBlock = Math.max(0, toBlock - windowSize + 1);

    const filter = {
      address: CONTRACT_ADDRESS,
      fromBlock,
      toBlock,
      topics: [[WORK_REGISTERED_TOPIC, WORK_REVOKED_TOPIC]],
    } as const;

    const logs = await provider.getLogs(filter as any);

    const items: BlockchainTransactionItem[] = [];

    const uniqueBlocks = Array.from(new Set(logs.map((l) => l.blockNumber)));
    const blockTimestamps = new Map<number, number>();
    await Promise.all(
      uniqueBlocks.map(async (bn) => {
        try {
          const block = await provider.getBlock(bn);
          blockTimestamps.set(bn, block?.timestamp ?? 0);
        } catch {
          blockTimestamps.set(bn, 0);
        }
      }),
    );

    for (const log of logs) {
      let method: BlockchainTransactionItem["method"] = "unknown";
      let methodLabel = "Unknown";
      let workId: string | null = null;

      try {
        const parsed = iface.parseLog({ data: log.data, topics: log.topics });
        if (parsed && parsed.name === "WorkRegistered") {
          method = "register";
          methodLabel = "Register";
          workId = parsed.args?.[0]?.toString?.() ?? null;
        } else if (parsed && parsed.name === "WorkRevoked") {
          method = "revoke";
          methodLabel = "Revoke";
          workId = parsed.args?.[0]?.toString?.() ?? null;
        }
      } catch {
        // ignore parse errors
      }

      const timestamp = blockTimestamps.get(log.blockNumber) ?? 0;
      const timestampIso =
        timestamp > 0 ? new Date(timestamp * 1000).toISOString() : null;

      items.push({
        txHash: log.transactionHash,
        method,
        methodLabel,
        blockNumber: log.blockNumber,
        timestamp: timestampIso,
        from: log.address ?? "",
        to: CONTRACT_ADDRESS,
        status: "pending",
        gasUsed: null,
        explorerUrl: `https://amoy.polygonscan.com/tx/${log.transactionHash}`,
        workId,
        source: "rpc",
      });
    }

    items.sort((a, b) => {
      const aBlock = a.blockNumber ?? 0;
      const bBlock = b.blockNumber ?? 0;
      if (aBlock !== bBlock) return bBlock - aBlock;
      return a.txHash.localeCompare(b.txHash);
    });

    return {
      success: true,
      items,
      page,
      pageSize,
      hasNextPage: (logs.length ?? 0) >= pageSize,
      contractAddress: CONTRACT_ADDRESS,
      chainLabel: "Polygon Amoy",
      sourceUsed: "rpc",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to fetch blockchain transactions",
    };
  }
}
