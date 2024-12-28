import axios from "axios";
import { ethers } from "hardhat";
import oracleContractABI from "../abi/Oracle.abi.json";

const MAX_RETRIES = 5;
const SLEEP_TIME = 2000;
const BATCH_SIZE = 3;

type RequestQueueItem = {
  callerAddress: string;
  id: number;
};

async function requestRandomNumber(): Promise<number> {
  const res = await axios({
    url: "https://www.random.org/integers/",
    params: {
      num: 1,
      min: 1,
      max: 1000,
      col: 1,
      base: 10,
      format: "plain",
      rnd: "new",
    },
    method: "get",
  });

  return parseInt(res.data, 10);
}

async function main() {
  const [dataProvider] = await ethers.getSigners();

  const oracleContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const oracleContract = new ethers.Contract(
    oracleContractAddress,
    oracleContractABI,
    dataProvider
  );

  await oracleContract.addProvider(dataProvider.address);

  let requestsQueue: RequestQueueItem[] = [];

  oracleContract.on(
    "MilestoneVerificationRequested",
    async (callerAddress: string, id: number) => {
      requestsQueue.push({ callerAddress, id });
    }
  );

  const intervalId = setInterval(async () => {
    let processedRequests = 0;

    while (requestsQueue.length > 0 && processedRequests < BATCH_SIZE) {
      const request = requestsQueue.shift();
      if (!request) continue;

      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          const randomNumber = await requestRandomNumber();

          // even random number means the milestone is verified, this is dummy logic
          await oracleContract.submitVerification(
            request.id,
            randomNumber % 2 === 0
          );
          break;
        } catch (error) {
          retries++;
          console.error("Error submitting verification:", error);
        }
      }

      processedRequests++;
    }
  }, SLEEP_TIME);

  const onExit = async () => {
    console.log("Exiting...");
    clearInterval(intervalId);
    try {
      await oracleContract.removeProvider(dataProvider.address);
      console.log("Provider removed successfully.");
    } catch (error) {
      console.error("Error removing provider:", error);
    }
  };

  process.on("SIGTERM", async () => {
    await onExit();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    await onExit();
    process.exit(0);
  });

  console.log("Provider started successfully. 🚀");
}

main().catch((error) => {
  console.error("Error in main function:", error);
});
