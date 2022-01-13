/* eslint-disable */
import {
  Benchmark,
  LoggerFactory, MemCache,
  RedstoneGatewayContractDefinitionLoader,
  RedstoneGatewayInteractionsLoader,
  SmartWeaveNodeFactory
} from 'redstone-smartweave';
import Arweave from 'arweave';
import { readContract } from 'smartweave';
import { TsLogFactory } from 'redstone-smartweave/lib/cjs/logging/node/TsLogFactory';

/**
 * Please note that results may vary depending on how fast/slow the arweave.net/graphql
 * responds at a given time.
 *
 * The most increase in performance is visible for contracts that heavily communicate with
 * other contracts and/or are using Foreign Call Protocol.
 *
 * If given contract does not communicate with other contracts and has lots of interactions
 * - the bottleneck is usually the loading of the interaction transactions from arweave.net/graphql.
 */
async function benchmark() {
  // Using "official" Arweave gateway.
  // You can also try our AWS Cloudfront cache (https://github.com/redstone-finance/redstone-smartweave-contracts/blob/main/docs/CACHE.md)
  // available here: https://arweave.net
  // - to further speed up 'GET' calls to Arweave.
  const arweave = Arweave.init({
    host: 'arweave.net', // Hostname or IP address for a Arweave host
    port: 443, // Port
    protocol: 'https', // Network protocol http or https
    timeout: 60000, // Network request timeouts in milliseconds
    logging: false // Enable network request logging
  });

  //LoggerFactory.use(new TsLogFactory());
  LoggerFactory.INST.logLevel("fatal");
  LoggerFactory.INST.logLevel("debug", "ArweaveGatewayInteractionsLoader");
  LoggerFactory.INST.logLevel("debug", "HandlerBasedContract");
  LoggerFactory.INST.logLevel("debug", "ContractDefinitionLoader");
  LoggerFactory.INST.logLevel("debug", "CacheableContractInteractionsLoader");
  // setting this module to debug, so that the load times from the GQL endpoint will be visible.

  const logger = LoggerFactory.INST.create('benchmark');
  LoggerFactory.INST.logLevel("info", "benchmark");

  // Contracts under test:
  // 38TR3D8BxlPTc89NOW67IkQQUPR8jDLaJNdYv-4wWfM
  // usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A
  // OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU
  // S3a-4VByScX0vtjmh5oZPs8kHTNn-8UPFVOkm2RprDc
  // mzvUgNc8YFk0w5K5H7c8pyT-FC5Y_ba0r7_8766Kx74

  // note: this contract evaluates for several hours on the original smartweave.js SDK.
  // LkfzZvdl_vfjRXZOPjnov18cGnnK3aDKj0qSQCgkCX8

  // note: this contract evaluates for several hours on the original smartweave.js SDK.
  // LppT1p3wri4FCKzW5buohsjWxpJHC58_rgIO-rYTMB8
  const contractTxId = 't9T7DIOGxx4VWXoCEeYYarFYeERTpWIC1V3y-BPZgKE';

  try {
    const benchmarksV1 = [];
    const benchmarksV2 = [];

    logger.info("Running benchmarks for contract:", contractTxId);

    for (let i = 1; i <= 1; i++) {
      logger.info(`V1.readContract #${i}`);
      const benchmarkV1 = Benchmark.measure();
      await readContract(arweave, contractTxId, 749180, true);
      benchmarksV1.push(benchmarkV1.elapsed(true));

      logger.info(`V2.readState #${i}`);
      const smartWeave = SmartWeaveNodeFactory
        .memCachedBased(arweave, 1)
        .setInteractionsLoader(
          new RedstoneGatewayInteractionsLoader("https://gateway.redstone.finance"))
        .setDefinitionLoader(
          new RedstoneGatewayContractDefinitionLoader("http://localhost:5666", arweave, new MemCache()))
        .build();
      const benchmarkV2 = Benchmark.measure();
      await smartWeave.contract(contractTxId)
        .setEvaluationOptions({
          updateCacheForEachInteraction: false
        })
        .readState(749180);
      benchmarksV2.push(benchmarkV2.elapsed(true));
    }

    logger.info('=== Results ===');
    logger.info(`first read v1: ${benchmarksV1[0]}ms`);
    logger.info(`first read v2: ${benchmarksV2[0]}ms`);
    logger.info(`consecutive reads v1: ${avg(benchmarksV1, false)}ms`);
    logger.info(`consecutive reads v2: ${avg(benchmarksV2, false)}ms`);

  } catch (e) {
    logger.error(e);
    logger.info('skipping ', contractTxId);
  }
}

function avg(times, shift = false) {
  if (shift) {
    times.shift();
  }
  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length || 0;

  return avg;
}

benchmark().catch((e) => console.error(e));
