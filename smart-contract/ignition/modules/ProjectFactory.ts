import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const ProjectFactoryModule = buildModule("ProjectFactoryModule", (m) => {
  const projectFactory = m.contract("ProjectFactory", []);

  return {projectFactory};
});

export default ProjectFactoryModule;
