import Arweave from 'arweave';
import { CacheableStateEvaluator, SmartWeaveNodeFactory } from 'redstone-smartweave';
import { KyveBlockHeightCache } from '@kyve/query';

/**
 * This example shows how to use Kyve's own cache plugin
 */
async function kyveCache() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 60000,
    logging: false,
  });

  // creating SmartWeave client with Kyve cache
  const smartweave = SmartWeaveNodeFactory.memCachedBased(arweave)
    .setStateEvaluator(
      new CacheableStateEvaluator(
        arweave,
        // KYVE Pool ID
        new KyveBlockHeightCache("l2QIZHhfRUEMbaw3wZ2FQ6cPRNoWqkmnu8_sNLqu08c")
      )
    )
    .build();

  // connecting to a given contract
  const result = smartweave
    .contract("OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU")
    .readState();

  console.log("Result", result);
}

kyveCache().catch((e) => {
  console.log(e);
});
