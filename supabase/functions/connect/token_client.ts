// Deno-compatible minimal token client for sending ERC-20 transfers
// Uses npm:ethers which is supported in the project's Deno setup
// Exports a simple giveReward(to, amountTokens) helper that parses token amounts
// as whole tokens (assumes 18 decimals). If you already have a different decimal
// scheme, adjust the `decimals` value below.
// NOTE: keep this lightweight to avoid pulling project-only build artifacts.
// @ts-expect-error - NPM imports in Deno not fully supported by TypeScript
import { ethers } from "npm:ethers";

const ERC20_ABI = [
  // minimal ABI: transfer
  "function transfer(address to, uint256 amount) returns (bool)",
];

const DECIMALS = 18;

export async function giveReward(to: string, amountTokens: string | number) {
  const rpc = Deno.env.get("SEPOLIA_RPC_URL") || Deno.env.get("RPC_URL");
  const privateKey = Deno.env.get("PRIVATE_KEY");
  const tokenContractAddress = Deno.env.get("KUDOS_TOKEN_CONTRACT_ADDRESS");

  if (!rpc || !privateKey || !tokenContractAddress) {
    throw new Error(
      "Missing required env vars for token transfer (SEPOLIA_RPC_URL, PRIVATE_KEY, KUDOS_TOKEN_CONTRACT_ADDRESS)",
    );
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);

  // Parse human token amount (e.g. 1 => 1 * 10^decimals)
  const amount = ethers.parseUnits(String(amountTokens), DECIMALS);

  const tx = await contract.transfer(to, amount);
  return { tx };
}
