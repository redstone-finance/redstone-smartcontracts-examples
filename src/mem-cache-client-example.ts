import Arweave from "arweave";
import { SmartWeaveNodeFactory } from "redstone-smartweave";

async function memCacheClientExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to a given contract
  const providersRegistryContract = smartweave.contract(
    "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU"
  );

  // Reading contract's state using new client in the loop
  // each consecutive state read should take significantly less time then the first one - as it will
  // all the modules will read values from cache
  for (let i = 0; i < 5; i++) {
    console.time(`Contract call ${i + 1}`);
    const { state, validity } = await providersRegistryContract.readState();
    console.timeEnd(`Contract call ${i + 1}`);
  }
}

memCacheClientExample().catch((e) => {
  console.log(e);
});
