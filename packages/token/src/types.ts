import { z } from "zod";

export interface TransactionRequest {
  to: string;
  amount: bigint;
}

export const TransactionRequestSchema = z.object({
  to: z
    .string()
    .min(1, "Recipient address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  amount: z.bigint().positive("Amount must be positive"),
});
