import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import fs from "fs";

async function viewStateExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  // note: any jwk should work in this case
  const jwk = readJSON("../redstone-node/.secrets/redstone-dev-jwk.json");

  LoggerFactory.INST.logLevel("trace", "HandlerBasedContract");
  LoggerFactory.INST.logLevel("trace", "HandlerExecutorFactory");

  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.
  const smartweave = SmartWeaveNodeFactory.memCached(arweave);

  // connecting to a given contract
  const providersRegistryContract = smartweave
    .contract("OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU")
    // connecting wallet to a contract.
    // Depending on the contract's code, this may be required before
    // calling viewState ("interactRead")
    .connect(jwk);

  // since we're using "TYPE"Script here, you can opt in to use strongly typed Input and View.
  const { result } = await providersRegistryContract.viewState<
    ProvidersRegistryInput,
    ProviderResult
  >({
    function: "providerData",
    data: {
      providerId: "33F0QHcb22W7LwWR1iRC8Az1ntZG09XQ03YWuw2ABqA",
      eagerManifestLoad: false,
    },
  });

  // now you can use result in a type safe way, with suggestions from your favourite IDE, etc.
  console.log(result.provider.profile.name);
  console.log(result.provider.manifests[0]);
}

viewStateExample().catch((e) => {
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

// in a real world usage - the types below should be simply imported from the given smart contract library

interface ProvidersRegistryInput {
  function: string;
  data: ProvidersDataInput;
}

interface ProviderResult {
  provider: ProviderData;
}

interface ProvidersDataInput {
  providerId: string;
  // this flag says whether we should also try to get a transaction with "active" manifest's content
  eagerManifestLoad?: boolean;
}

interface ProviderData {
  /**
   * wallet addresses of users allowed to change this provider's data
   */
  adminsPool?: string[];

  isMultiNode: boolean;

  /**
   * data that identifies this provider
   */
  profile: ProviderProfile;

  /**
   * height of the block when this provider has been registered
   */
  registerHeight?: number;

  // note: this is filled dynamically with data from token.contract state.
  stakedTokens?: number;

  /**
   * Redstone node manifests deployed for this provider
   * New manifests are added at the end of this array
   */
  manifests?: ManifestData[];
}

interface ProviderProfile {
  id: string;
  name: string;
  description: string;
  url: string;
  imgUrl?: string;
}

type ManifestStatus = "historical" | "active" | "locked";

interface ManifestData {
  uploadBlockHeight?: number;
  changeMessage: string;
  lockedHours?: number;

  // manifest is stored in "data" field of a separate transaction,
  // as contract's input is stored in transaction tags - which are limited to 2048 bytes
  manifestTxId: string;

  // this field is evaluated when accessing provider data
  status?: ManifestStatus;

  // this is the content of the active. It is filled only by the "providerData" and "activeManifest" functions,
  // when "eagerManifestLoad" flag is set in the input by the caller.
  activeManifestContent?: any;
}
