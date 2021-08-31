import Arweave from "arweave";
import { SmartWeaveNodeFactory } from "redstone-smartweave";
import * as fs from "fs";
import path from "path";

/**
 * This example shows the process of creating a memCached
 * SmartWeave instance - and using it to read contract's state.
 */
async function memCacheClientExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  const koiiContractTxId = "LppT1p3wri4FCKzW5buohsjWxpJHC58_rgIO-rYTMB8";

  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to a given contract
  const koiiContract = smartweave.contract(koiiContractTxId);

  const { state, validity } = await koiiContract.readState();

  fs.writeFileSync(
    path.join(__dirname, "result", `${koiiContractTxId}_state.json`),
    JSON.stringify(state)
  );
  fs.writeFileSync(
    path.join(__dirname, "result", `${koiiContractTxId}_validity.json`),
    JSON.stringify(validity)
  );
}

memCacheClientExample().catch((e) => {
  console.log(e);
});
