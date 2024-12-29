import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { config } from 'dotenv';

config()

const ProjectFactoryModule = buildModule("ProjectFactoryModule", (m) => {
  const oracleAddress = process.env.ORACLE_ADDRESS;

  if (!oracleAddress) {
    throw new Error("ORACLE_ADDRESS environment variable is required");
  }

  console.log(`Deploying with oracle address: ${oracleAddress}`);

  const projectFactory = m.contract("ProjectFactory", [oracleAddress]);

  return { projectFactory };
});

export default ProjectFactoryModule;
