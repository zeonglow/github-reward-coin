import { network } from "hardhat";
import initialValue from "./CodeKudos.args.js";

const { ethers } = await network.connect();

async function main() {
  const initial = initialValue[0];
  const TokenFactory = await ethers.getContractFactory("CodeKudosCoin");
  const token = await TokenFactory.deploy(initial);
  await token.waitForDeployment();

  console.log("CodeKudos Coin : deployed to:", await token.getAddress());
}

await main();
