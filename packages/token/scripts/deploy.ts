import { network } from "hardhat";
const { ethers } = await network.connect();

async function main() {
  const initial = 100_000_000n * 10n ** 18n;
  const TokenFactory = await ethers.getContractFactory("CodeKudosToken");
  const token = await TokenFactory.deploy(initial);
  await token.waitForDeployment();

  console.log("CodeKudosToken: deployed to:", await token.getAddress());
}

await main();
