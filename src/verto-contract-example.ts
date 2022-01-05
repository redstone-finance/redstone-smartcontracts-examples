import Arweave from "arweave";
import {LoggerFactory, RedstoneGatewayInteractionsLoader, SmartWeaveNodeFactory} from 'redstone-smartweave';
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

  LoggerFactory.INST.logLevel('fatal');
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to a given contract
  const vertoContract = smartweave.contract(vertoContractTxId)
    .setEvaluationOptions({
      ignoreExceptions: false
    });

  const swConfirmed = SmartWeaveNodeFactory.memCachedBased(arweave)
    .setInteractionsLoader(new RedstoneGatewayInteractionsLoader("https://gateway.redstone.finance", {confirmed: true}))
    .build();

  const { state, validity } = await vertoContract.readState(845641);

  const result = await swConfirmed.contract(vertoContractTxId).readState(845641);

  fs.writeFileSync(
    path.join(__dirname, "result", `${vertoContractTxId}_state.json`),
    JSON.stringify(state)
  );
  fs.writeFileSync(
    path.join(__dirname, "result", `${vertoContractTxId}_validity.json`),
    JSON.stringify(validity)
  );
  fs.writeFileSync(
    path.join(__dirname, "result", `${vertoContractTxId}_confirmed_state.json`),
    JSON.stringify(result.state)
  );
}

memCacheClientExample().catch((e) => {
  console.log(e);
});
