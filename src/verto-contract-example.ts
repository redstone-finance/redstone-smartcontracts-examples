import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from 'redstone-smartweave';
import * as fs from "fs";
import path from "path";
import { TsLogFactory } from 'redstone-smartweave/lib/cjs/logging/node/TsLogFactory';

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

  const vertoContractTxId = "usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A";
  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.

  LoggerFactory.use(new TsLogFactory());
  LoggerFactory.INST.logLevel('debug');
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to a given contract
  const vertoContract = smartweave.contract(vertoContractTxId)
    .setEvaluationOptions({
      ignoreExceptions: false
    });

  const { state, validity } = await vertoContract.readState();

  fs.writeFileSync(
    path.join(__dirname, "result", `${vertoContractTxId}_state.json`),
    JSON.stringify(state)
  );
  fs.writeFileSync(
    path.join(__dirname, "result", `${vertoContractTxId}_validity.json`),
    JSON.stringify(validity)
  );
}

memCacheClientExample().catch((e) => {
  console.log(e);
});
