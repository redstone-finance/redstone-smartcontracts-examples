import Arweave from "arweave";
import { SmartWeaveNodeFactory } from "redstone-smartweave";

/**
 * This example shows the process of creating a debugging SmartWeave client.
 * It uses memCached client as a base and overwrite StateEvaluator
 */
async function debuggingClientExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  const providersRegistryContractTxId =
    "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU";

  const newSource = `function handle(state, action) {
   console.log("\\n ===== Hello World from the new source:", SmartWeave.transaction.id);
   return {state}
  }`;

  const smartweave = SmartWeaveNodeFactory.memCachedBased(arweave)
    .overwriteSource({
      [providersRegistryContractTxId]: newSource,
    });

  // 'connecting' to a given contract, using its txId
  const { state, validity } = await smartweave
    .contract(providersRegistryContractTxId)
    .readState();

  console.log("Result", {
    state,
    validity,
  });
}

debuggingClientExample().catch((e) => {
  console.error(e);
});
