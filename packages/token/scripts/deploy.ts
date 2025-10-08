import { network } from "hardhat";
import initialValue from "./CodeKudos.args.js"

const { ethers } = await network.connect();

async function main() {
  const TokenFactory = await ethers.getContractFactory("CodeKudosToken");
  const initial = initialValue[0];
  const token = await TokenFactory.deploy(initial);
  await token.waitForDeployment();

  console.log("CodeKudosToken: deployed to:", await token.getAddress());
}

await main();
