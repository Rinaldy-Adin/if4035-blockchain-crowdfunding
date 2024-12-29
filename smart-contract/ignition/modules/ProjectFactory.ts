import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProjectFactoryModule = buildModule("ProjectFactoryModule", (m) => {
  const args = process.argv.slice(2);
  const oracleAddressIndex = args.indexOf("--oracleAddress");

  if (oracleAddressIndex === -1) {
    throw new Error("Missing required arguments: --oracleAddress");
  }

  const oracleAddress = args[oracleAddressIndex + 1];
  console.log(`Deploying with oracle address: ${oracleAddress}`);

  const projectFactory = m.contract("ProjectFactory", [oracleAddress]);

  return { projectFactory };
});

export default ProjectFactoryModule;
