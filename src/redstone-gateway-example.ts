import Arweave from "arweave";
import {
  LoggerFactory,
  RedstoneGatewayInteractionsLoader,
  SmartWeaveNodeFactory,
} from "redstone-smartweave";
import * as fs from "fs";
import path from "path";
import {TsLogFactory} from "redstone-smartweave/lib/cjs/logging/node/TsLogFactory";

/**
 * This example shows the process of creating a memCached
 * SmartWeave instance that uses RedStone SmartWeave Gateway for loading the interactions.
 * Read more {@link https://github.com/redstone-finance/redstone-sw-gateway}.
 *
 * It also compares different modes of loading the interactions.
 */
async function redstoneGatewayExample() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  const lootContract = "Daj-MNSnH55TDfxqC7v4eq0lKzVIwh98srUaWqyuZtY";
  const gatewayUrl = "https://gateway.redstone.finance";

  LoggerFactory.use(new TsLogFactory());
  LoggerFactory.INST.logLevel("debug");

  // default mode - loading all the interactions, confirmed, not confirmed and corrupted
  // - compatible with how the Arweave GQL works.
  const sw = SmartWeaveNodeFactory.memCachedBased(arweave)
    .setInteractionsLoader(new RedstoneGatewayInteractionsLoader(gatewayUrl))
    .build();

  const contract = sw.contract(lootContract);
  const {state, validity} = await contract.readState();

  // safe mode - loading only the confirmed interactions
  const swConfirmed = SmartWeaveNodeFactory.memCachedBased(arweave)
    .setInteractionsLoader(new RedstoneGatewayInteractionsLoader(gatewayUrl, {confirmed: true}))
    .build();

  const contractSafe = swConfirmed.contract(lootContract);
  const {state: stateSafe, validity: validitySafe} = await contractSafe.readState();

  // if you now compare the results saved in the files below - you will notice, that the computed state differ
  // - that's because the loot contract has 25 corrupted interactions, that are normally returned
  // by the Arweave Gateway GQL endpoint.
  // read more https://github.com/redstone-finance/redstone-sw-gateway
  fs.writeFileSync(
    path.join(__dirname, "result", `${lootContract}_state.json`),
    JSON.stringify(state)
  );
  fs.writeFileSync(
    path.join(__dirname, "result", `${lootContract}_state_safe.json`),
    JSON.stringify(stateSafe)
  );

}

redstoneGatewayExample().catch((e) => {
  console.log(e);
});
