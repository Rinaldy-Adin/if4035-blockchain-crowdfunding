# How to run

1. Compile smart contract ABI files

```
npx hardhat compile
```

2. To create ABI files in `/frontend/abi` as it's needed by frontend

```
npm run export:abi
```

3. Run FE client with `npm run dev` in `frontend` directory

3. Run hardhat node (node is reset after every run)

```
npx hardhat node
```

4. Add wallet to metamask by importing private key into metamask

5. Deploy smart contract

```
npx hardhat ignition deploy ignition/modules/ProjectFactory.ts --network localhost
```

# Debugging

* Check terminal that has `npx hardhat node` as smart contract errors are printed there

* Reset metamask after running new node with `settings > clear activity & nonce data` if receive `Nonce too high`
  errror [https://medium.com/@thelasthash/solved-nonce-too-high-error-with-metamask-and-hardhat-adc66f092cd](https://medium.com/@thelasthash/solved-nonce-too-high-error-with-metamask-and-hardhat-adc66f092cd)

<!--# Sample Hardhat Project-->

<!--This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.-->

<!--Try running some of the following tasks:-->

<!--```shell-->
<!--npx hardhat help-->
<!--npx hardhat test-->
<!--REPORT_GAS=true npx hardhat test-->
<!--npx hardhat node-->
<!--npx hardhat ignition deploy ./ignition/modules/Lock.ts-->
<!--```-->
