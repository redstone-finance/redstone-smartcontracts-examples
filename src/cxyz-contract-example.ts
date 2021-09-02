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
    host: "dh48zl0solow5.cloudfront.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  const cxyzContractTxId = "mzvUgNc8YFk0w5K5H7c8pyT-FC5Y_ba0r7_8766Kx74";

  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to a given contract
  const cxyzContract = smartweave.contract(cxyzContractTxId);

  const { state, validity } = await cxyzContract.readState();

  fs.writeFileSync(
    path.join(__dirname, "result", `${cxyzContractTxId}_state.json`),
    JSON.stringify(state)
  );
  fs.writeFileSync(
    path.join(__dirname, "result", `${cxyzContractTxId}_validity.json`),
    JSON.stringify(validity)
  );
}

memCacheClientExample().catch((e) => {
  console.log(e);
});
