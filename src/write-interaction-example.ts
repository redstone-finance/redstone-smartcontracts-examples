import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import fs from "fs";

async function writeExample() {
  const arweave = Arweave.init({
    host: "arweave.net", // CloudFront based Arweave cache
    port: 443, // Port
    protocol: "https", // Network protocol http or https
    timeout: 60000, // Network request timeouts in milliseconds
    logging: false, // Enable network request logging
  });

  // note: any jwk should work in this case
  const jwk = readJSON("../redstone-node/.secrets/redstone-dev-jwk.json");

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

  console.log("New interaction id:", result);
}

writeExample().catch((e) => {
  console.log(e);
});

function readJSON(path) {
  const content = fs.readFileSync(path, "utf-8");
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`File "${path}" does not contain a valid JSON`);
  }
}
