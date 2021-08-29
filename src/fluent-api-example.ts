import Arweave from "arweave";
import { SmartWeaveNodeFactory } from "redstone-smartweave";

async function fluentApiExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  // you can quickly perform operations (read state, view state, write interaction) using fluent API
  const state = await SmartWeaveNodeFactory.memCached(arweave)
    .contract("OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU")
    .readState();

  console.log(state);
}

fluentApiExample().catch((e) => {
  console.log(e);
});
