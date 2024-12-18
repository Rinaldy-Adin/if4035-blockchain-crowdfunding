const fs = require("fs");
const path = require("path");

const artifactsPath = "./artifacts/contracts";
const outputPath = "../frontend/src/abi";

fs.mkdirSync(outputPath, {recursive: true});

const contracts = [
    "Project.sol/Project.json",
    "ProjectFactory.sol/ProjectFactory.json",
];

contracts.forEach((contract) => {
    const artifact = JSON.parse(fs.readFileSync(path.join(artifactsPath, contract), "utf-8"));
    const abi = artifact.abi;

    const fileName = path.basename(contract, ".json") + ".abi.json";
    fs.writeFileSync(path.join(outputPath, fileName), JSON.stringify(abi, null, 2));

    console.log(`✅ ABI exported: ${fileName}`);
});
