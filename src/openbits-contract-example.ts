import Arweave from "arweave";
import { SmartWeaveNodeFactory } from "redstone-smartweave";
import * as fs from "fs";
import path from "path";

memCacheClientExample().catch((e) => {
  console.error(e);
});

async function memCacheClientExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  const openbitsContractTxId = "S3a-4VByScX0vtjmh5oZPs8kHTNn-8UPFVOkm2RprDc";

  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to the openbits contract
  const openbitsContract = smartweave.contract(openbitsContractTxId);

  const { state, validity } = await openbitsContract.readState();

  saveResultsToFiles(state, validity, openbitsContractTxId);
}

function saveResultsToFiles(state: unknown, validity: Record<string, boolean>, txId: string) {
  const resultFolderPath = path.join(__dirname, "result");
  if (!fs.existsSync(resultFolderPath)){
    console.log("Creating result folder");
    fs.mkdirSync(resultFolderPath);
  }

  const statePath = path.join(__dirname, "result", `${txId}_state.json`);
  console.log(`Saving state to ${statePath}`);
  saveToFile(state, statePath);

  const validityPath = path.join(__dirname, "result", `${txId}_validity.json`);
  console.log(`Saving validity to ${validityPath}`);
  saveToFile(validity, validityPath);
}

function saveToFile(data: unknown, path: string) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}
