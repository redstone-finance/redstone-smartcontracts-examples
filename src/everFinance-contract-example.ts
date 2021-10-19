import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from 'redstone-smartweave';
import * as fs from "fs";
import path from "path";
import { TsLogFactory } from 'redstone-smartweave/lib/cjs/logging/node/TsLogFactory';
import { readContract } from 'smartweave';

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

  const contractTxId = "BXCEBKTv-Fvan0m82aEi7njdnRsFDluFkfN8vrWG5FI";
  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.

  LoggerFactory.use(new TsLogFactory());
  LoggerFactory.INST.logLevel('debug');

  // note: SDK V1 currently does not work with this contract
  //const result = await readContract(arweave, contractTxId, undefined, true);
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to a given contract
  const contract = smartweave.contract(contractTxId)
    .setEvaluationOptions({
      ignoreExceptions: false
    });

  const { state, validity } = await contract.readState();

  fs.writeFileSync(
    path.join(__dirname, "result", `${contractTxId}_state.json`),
    JSON.stringify(state)
  );
  fs.writeFileSync(
    path.join(__dirname, "result", `${contractTxId}_validity.json`),
    JSON.stringify(validity)
  );
}

memCacheClientExample().catch((e) => {
  console.log(e);
});
