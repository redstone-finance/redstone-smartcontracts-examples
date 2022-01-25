import Arweave from "arweave";
import {LoggerFactory, RedstoneGatewayInteractionsLoader, sleep, SmartWeaveNodeFactory} from "redstone-smartweave";
import {readJSON} from './_utils';
import { TsLogFactory } from "redstone-smartweave/lib/cjs/logging/node/TsLogFactory";

LoggerFactory.use(new TsLogFactory());
LoggerFactory.INST.logLevel("fatal");
LoggerFactory.INST.logLevel("info", "Contract");

/**
 * This example shows how to perform a bundleInteraction.
 * This operation sends the interaction to the RedStone Sequencer.
 * RedStone Sequencer is responsible for assigning transaction order
 * and sending the transaction to Bundlr.
 * This - with combination with RedStone Gateway - gives instant transaction
 * availability and finality guaranteed by Bundlr.
 */
async function bundleExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 60000,
    logging: false,
  });

  // note: any jwk with sam ARs should work in this case
  const jwk = readJSON("../redstone-node/.secrets/redstone-jwk.json");
  const gatewayUrl = "https://gateway.redstone.finance";
  const logger = LoggerFactory.INST.create('Contract');

  // using SmartWeaveNodeFactory to quickly obtain fully configured, mem-cacheable SmartWeave instance
  // see custom-client-example.ts for a more detailed explanation of all the core modules of the SmartWeave instance.
  const smartweave = SmartWeaveNodeFactory
    .memCachedBased(arweave)
    .setInteractionsLoader(new RedstoneGatewayInteractionsLoader(gatewayUrl))
    .build();

  // connecting to a given contract
  const token = smartweave
    .contract("OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU")
    // connecting wallet to a contract. It is required before performing any "writeInteraction"
    // calling "writeInteraction" without connecting to a wallet first will cause a runtime error.
    .connect(jwk);

  const result1 = await token.readState();

  logger.info("Amount of computed interactions before 'bundleInteraction':", Object.keys(result1.validity).length);

  const result = await token.bundleInteraction<any>({
    function: "transfer",
    data: {
      target: "fake-from-bundle",
      qty: 18599333,
    },
  });

  logger.info("Result from the sequencer", result);

  // the new transaction is instantly available - ie. during the state read operation
  const result2 = await token.readState();

  logger.info("Amount of computed interactions after 'bundleInteraction':", Object.keys(result2.validity).length);
}

bundleExample().catch((e) => {
  console.log(e);
});
