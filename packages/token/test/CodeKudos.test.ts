import { describe, it } from "mocha";
import { expect } from "chai";
import { network } from "hardhat";

// @ts-expect-error - NPM imports in Deno not fully supported by TypeScript
const { ethers } = await network.connect();

const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

describe("MyToken", function () {
  it("mints initial supply to deployer", async function () {
    const [deployer] = await ethers.getSigners();
    const initial = 100_000_000n * 10n ** 18n;

    const Token = await ethers.getContractFactory("CodeKudosCoin");
    const token = await Token.deploy(initial);
    await token.waitForDeployment();

    const bal = await token.balanceOf(deployer.address);
    expect(bal).to.equal(initial);
  });

  it.skip("shows balance", async function () {
    const tokenAddress = "0x8490a7b3800Cd46F3cB68E6e451FFbd8a7AdC6Ef";
    //const walletAddress = "0x93F9876882B6E90c0B679b9387C03341Dd77Cc10"; // Ingga wallet address
    const walletAddress = "0x0B96306563CABC810b038ec5bBDC7FC755ec21C4"; // Josua's address

    const provider = new ethers.JsonRpcProvider(
      "https://eth-sepolia.g.alchemy.com/v2/qwTQJlI_ikPCGi1V5xolw",
    );

    const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();
    const symbol = await contract.symbol();

    console.log(
      `    walletAddress: ${walletAddress} balance: ${ethers.formatUnits(balance, decimals)} ${symbol}`,
    );
    expect(balance).to.be.greaterThanOrEqual(0);
  });
});
