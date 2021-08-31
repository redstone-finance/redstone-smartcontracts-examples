import Arweave from "arweave";
import { SmartWeaveNodeFactory } from "redstone-smartweave";
import { readJSON } from "./_utils";

/**
 * This example shows an example usage of the SDK's fluent API
 */
async function fluentApiExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  // readState using fluent API
  const state = await SmartWeaveNodeFactory.memCached(arweave)
    .contract("OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU")
    .readState();

  console.log(state);

  // viewState using fluent API
  // note: any jwk should work in this case
  const jwk = readJSON("../redstone-node/.secrets/redstone-dev-jwk.json");

  const { result } = await SmartWeaveNodeFactory.memCached(arweave)
    .contract("OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU")
    .connect(jwk)
    .viewState<any, any>({
      function: "providerData",
      data: {
        providerId: "33F0QHcb22W7LwWR1iRC8Az1ntZG09XQ03YWuw2ABqA",
        eagerManifestLoad: false,
      },
    });

  console.log(result);
}

fluentApiExample().catch((e) => {
  console.log(e);
});
