import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import fs from "fs";
import { readJSON } from './_utils';


/**
 * This example shows how to perform a writeInteraction
 * ("interactWrite" from the V1 SDK) call to a contract.
 */
async function writeExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 60000,
    logging: false,
  });

  // note: any jwk with sam ARs should work in this case
  const jwk = readJSON("../redstone-node/.secrets/redstone-jwk.json");

  LoggerFactory.INST.logLevel("trace", "HandlerBasedContract");
  LoggerFactory.INST.logLevel("trace", "HandlerExecutorFactory");

  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to a given contract
  const token = smartweave
    .contract("OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU")
    // connecting wallet to a contract. It is required before performing any "writeInteraction"
    // calling "writeInteraction" without connecting to a wallet first will cause a runtime error.
    .connect(jwk)
    .setEvaluationOptions({
      // with this flag set to true, the write will wait for the transaction to be confirmed
      waitForConfirmation: true,
    });

  const result = await token.writeInteraction<any>({
    function: "transfer",
    data: {
      target: "fake",
      qty: 15100900,
    },
  });

  // or you can use fluent API, and:
  /*
  const result = await smartweave
    .contract("OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU")
    .connect(jwk)
    .setEvaluationOptions({
      waitForConfirmation: true,
    })
    .writeInteraction({
      function: "transfer",
      data: {
        target: "fake",
        qty: 15100900,
      },
    });
   */
  console.log("New interaction id:", result);
}

writeExample().catch((e) => {
  console.log(e);
});
