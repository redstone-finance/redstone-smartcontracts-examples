import * as fs from 'fs';
import Arweave from 'arweave';
import {
  CacheableExecutorFactory,
  CacheableStateEvaluator,
  ContractDefinitionLoader,
  ContractInteractionsLoader,
  DebuggableExecutorFactory,
  EvalStateResult,
  EvolveCompatibleState,
  HandlerBasedSwcClient,
  HandlerExecutorFactory,
  LexicographicalInteractionsSorter,
  MemBlockHeightSwCache,
  MemCache,
} from 'smartweave/lib/v2';


// note: this ofc. should be imported from the given SWC source code.
interface ProvidersRegistryState extends EvolveCompatibleState {
  contractAdmins: string[];
}

export function timeout(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(() => resolve('timeout'), ms));
}

async function customClientExample() {

  const arweave = Arweave.init({
    host: 'arweave.net',// Hostname or IP address for a Arweave host
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
  });

  console.log('arweave created');

  // in real world usage -
  // you could modify original contract's code (eg. add some console.logs for debugging) and - for example -
  // read it here from file
  const changedSrc =
    `function handle(state, action) {
   console.log("\\n ===== Hello World from the new source:", SmartWeave.transaction.id);
   return {state}
  }`;

  // CacheableExecutorFactory is a wrapper over base ExecutorFactory that adds caching capabilities.
  const cacheableExecutorFactory = new CacheableExecutorFactory<any, any>(arweave, new HandlerExecutorFactory(arweave), new MemCache());

  // DebuggableExecutorFactory is a wrapper over base ExecutorFactory that adds a feature of substituting contract's code.
  // note: this will effectively substitute original contract's source code with code from `changedSrc` variable.
  const debuggableExecutorFactory = new DebuggableExecutorFactory(cacheableExecutorFactory, {
    "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU": changedSrc
  });

  // Configuring HandlerBaseSwcClient from scratch.
  const swcClient = new HandlerBasedSwcClient(
    arweave,
    new ContractDefinitionLoader<ProvidersRegistryState>(arweave, new MemCache()),
    new ContractInteractionsLoader(arweave),
    debuggableExecutorFactory,
    new CacheableStateEvaluator(arweave, new MemBlockHeightSwCache<EvalStateResult<ProvidersRegistryState>>()),
    new LexicographicalInteractionsSorter(arweave));

  console.log('swcClient created');

  const providersRegistryContractTxId = "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU";

  // Reading contract's state using new client.
  const { state, validity } = await swcClient.readState(providersRegistryContractTxId);

  console.log('Result', {
    state, validity,
  });
}

customClientExample().catch((e) => {
  console.log(e);
});
