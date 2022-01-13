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

  const kyveContractTxId = "LkfzZvdl_vfjRXZOPjnov18cGnnK3aDKj0qSQCgkCX8";
  LoggerFactory.use(new TsLogFactory());
  LoggerFactory.INST.logLevel("debug");
  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to a given contract
  const kyveContract = smartweave
    .contract(kyveContractTxId)
    .setEvaluationOptions({
      fcpOptimization: true
    });

  const { state, validity } = await kyveContract.readState();

  fs.writeFileSync(
    path.join(__dirname, "result", `${kyveContractTxId}_state.json`),
    JSON.stringify(state)
  );
  fs.writeFileSync(
    path.join(__dirname, "result", `${kyveContractTxId}_validity.json`),
    JSON.stringify(validity)
  );
}

memCacheClientExample().catch((e) => {
  console.log(e);
});
