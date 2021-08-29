import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import fs from "fs";

async function realLifeExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  const jwk = readJSON("../redstone-node/.secrets/redstone-dev-jwk.json");

  LoggerFactory.INST.logLevel("debug");

  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // a more real-life example - from the RedStone Node.
  // first we connect to the "contracts-registry" contract
  // to obtain the current "providers-registry" contract tx id.
  // Then we connect to the "providers-registry" contract
  // to load manifest for the given provider.

  const registryContract = smartweave
    .contract("XQkGzXG6YknJyy-YbakEZvQKAWkW2_aPRhc3ShC8lyA")
    .connect(jwk);

  const { result: registryInteraction } = await registryContract.viewState<
    any,
    any
  >({
    function: "contractsCurrentTxId",
    data: {
      contractNames: ["providers-registry"],
    },
  });

  const providersRegistryContract = smartweave
    .contract(registryInteraction["providers-registry"])
    .connect(jwk);

  const jwkAddress = await arweave.wallets.getAddress(jwk);

  const { result } = await providersRegistryContract.viewState<any, any>({
    function: "activeManifest",
    data: {
      providerId: jwkAddress,
      eagerManifestLoad: true,
    },
  });

  console.log(result);
}

realLifeExample().catch((e) => {
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
