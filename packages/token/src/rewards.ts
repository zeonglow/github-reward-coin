import { ethers, Wallet } from "ethers";
import ERC20_ABI from "./erc20abi.json" with { type: "json" };
import * as dotenv from "dotenv";
dotenv.config();

export interface IRewarderOptions {
  rpcUrl: string;
  masterAddress: string;
  walletKey: string;
  tokenContractAddress: string;
}

class Rewarder {
  constructor(options?: IRewarderOptions) {
    const {
      rpcUrl = process.env.SEPOLIA_RPC_URL ?? "",
      walletKey = process.env.PRIVATE_KEY ?? "",
      masterAddress = process.env.KUDOS_MASTER_WALLET ?? "",
      tokenContractAddress = process.env.KUDOS_TOKEN_CONTRACT_ADDRESS ?? "",
    } = options ?? {};
    console.log("options", JSON.stringify(options));
    this.rpcUrl = rpcUrl;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(walletKey, this.provider);
    this.masterAddress = masterAddress;
    this.tokenContractAddress = tokenContractAddress;
  }

  private readonly rpcUrl: string;
  private signer: ethers.JsonRpcSigner | undefined;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private masterAddress: string;
  private readonly tokenContractAddress: string;

  async getCurrentBlock() {
    return await this.provider.getBlockNumber();
  }

  async getMasterAccountBalance(): Promise<bigint> {
    return await this.provider.getBalance(this.masterAddress);
  }

  async sendReward(to: string, amount: bigint, confirm: boolean = true) {
    const tokenContract = new ethers.Contract(
      this.tokenContractAddress,
      ERC20_ABI,
      this.wallet,
    );

    const transaction = await tokenContract.transfer(to, amount);
    console.log("transaction sent: ", transaction.hash);

    const receipt = confirm ? await transaction.wait() : undefined;
    confirm
      ? console.log("confirmed in blockNo", receipt.blockNumber)
      : console.log("confirmation skipped");

    return {
      transaction,
      receipt,
    };
  }
}

const rewarder = new Rewarder();

export async function giveReward(args: { to: string; amount: bigint }) {
  const { to, amount } = args;
  return await rewarder.sendReward(to, amount, false);
}
