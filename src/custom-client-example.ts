import Arweave from "arweave";
import {
  CacheableExecutorFactory,
  CacheableStateEvaluator,
  ContractDefinitionLoader,
  ContractInteractionsLoader,
  DebuggableExecutorFactory,
  EvalStateResult,
  EvolveCompatibleState,
  HandlerExecutorFactory,
  LexicographicalInteractionsSorter,
  LoggerFactory,
  MemBlockHeightSwCache,
  MemCache,
  SmartWeave,
} from "redstone-smartweave";

/**
 * This example shows the process of creating a fully customized
 * SmartWeave instance. It also explains the core modules of the
 * SDK.
 */
async function customClientExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  // You can change logging level, both globally for the whole new SmartWeave SDK, or individually, for given modules.
  // Currently, default log level is 'debug'.
  // tslog library is used for the node env., and simple console.log wrapper for the web env.
  LoggerFactory.INST.logLevel("info");
  LoggerFactory.INST.logLevel("silly", "DefaultStateEvaluator");
  LoggerFactory.INST.logLevel("debug", "ContractInteractionsLoader");
  LoggerFactory.INST.logLevel("debug", "Evolve");

  const providersRegistryContractTxId =
    "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU";

  // ContractInteractionsLoader module is responsible for loading contract's interactions.
  // There is also a simple wrapper around base implementation, that adds caching features - CacheableContractInteractionsLoader.
  // It's up to you to decide which one to use - or maybe create a new one, that will further optimise loading interactions
  // - by simply wrapping the base implementation.
  const contractInteractionsLoader = new ContractInteractionsLoader(arweave);

  // Since there's still no consensus (;-)) on which sorting alg. should be used in the current SDK -
  // (see https://github.com/ArweaveTeam/SmartWeave/pull/82) - you can choose on your own!
  // (there's also BlockHeightInteractionsSorter available)
  const lexicographicalInteractionsSorter =
    new LexicographicalInteractionsSorter(arweave);

  // ExecutorFactories are in general responsible for creating handlers, that actually run contract's code with given input
  // - and are used by StateEvaluators to replay contract's state.
  // CacheableExecutorFactory is a wrapper over base HandlerExecutorFactory, that adds caching capabilities.
  const cacheableExecutorFactory = new CacheableExecutorFactory(
    arweave,
    new HandlerExecutorFactory(arweave),
    new MemCache()
  );

  // DebuggableExecutorFactory is a wrapper over a base ExecutorFactory that adds a feature of substituting contract's code.
  const debuggableExecutorFactory = new DebuggableExecutorFactory(
    cacheableExecutorFactory,
    // in a real world usage -
    // you could modify original contract's code (eg. add some console.logs for debugging or quickly test a new feature)
    // and - for example - read it here from a file.
    {
      [providersRegistryContractTxId]: `function handle(state, action) {
   console.log("\\n ===== Hello World from the new source:", SmartWeave.transaction.id);
   return {state}
  }`,
    }
  );

  // ContractDefinitionLoader is responsible for...loading contracts' definitions ;-) (source code, initial state, etc.).
  // this one here is additionally using simple MemCache, to cache definitions (as loading contract's
  // data from Arweave is usually a very time-consuming operation).
  const contractDefinitionLoader = new ContractDefinitionLoader(
    arweave,
    new MemCache()
  );

  // StateEvaluators are responsible for replaying contracts' state. This one is additionally using
  // BlockHeight-dependant mem-cache. This greatly improves state evaluation for consecutive calls
  // or for contracts that perform many interactions with other contracts. Of course some 'persistent'
  // caches could be used here - like a file based or mongoDB based cache.
  // In a web env. our webapp is using localstorage-based cache.
  const cacheableStateEvaluator = new CacheableStateEvaluator(
    arweave,
    new MemBlockHeightSwCache<EvalStateResult<ProvidersRegistryState>>()
  );

  // Configuring SmartWeave from scratch using all the modules configured above.
  const smartweave = SmartWeave.builder(arweave)
    .setInteractionsLoader(contractInteractionsLoader)
    .setInteractionsSorter(lexicographicalInteractionsSorter)
    .setDefinitionLoader(contractDefinitionLoader)
    .setExecutorFactory(debuggableExecutorFactory)
    .setStateEvaluator(cacheableStateEvaluator)
    .build();

  // 'connecting' to a given contract, using its txId
  const providersRegistryContract = smartweave.contract(
    providersRegistryContractTxId
  );

  // Reading contract's state using the new client.
  const { state, validity } = await providersRegistryContract.readState();

  console.log("Result", {
    state,
    validity,
  });
}

customClientExample().catch((e) => {
  console.error(e);
});


// note: this ofc. should be imported from the given SmartContract source code.
interface ProvidersRegistryState extends EvolveCompatibleState {
  contractAdmins: string[];
}
