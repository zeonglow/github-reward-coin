import { ethers, HDNodeWallet, Wallet } from "ethers";
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
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(walletKey, this.provider);
    this.masterAddress = masterAddress;
    this.tokenContractAddress = tokenContractAddress;
  }

  private readonly provider: ethers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  private readonly masterAddress: string;
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

    const receipt = confirm ? await transaction.wait() : undefined;

    return {
      transaction,
      receipt,
    };
  }
  async createWallet() {
    const mnemonic = Wallet.createRandom().mnemonic;
    if (!mnemonic) {
      throw new Error("Mnemonic creation failed");
    }
    const wallet = HDNodeWallet.fromMnemonic(mnemonic).connect(this.provider);

    return {
      mnemonic,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      address: wallet.address,
    };
  }
}

const rewarder = new Rewarder();

export async function giveReward(args: { to: string; amount: bigint }) {
  const { to, amount } = args;
  return await rewarder.sendReward(to, amount, false);
}

export async function createWallet() {
  return await rewarder.createWallet();
}
