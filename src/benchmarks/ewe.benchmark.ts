/* eslint-disable */
import Arweave from 'arweave';
import {BenchmarkStats, LoggerFactory,} from "redstone-smartweave";

import {generateCallsTable, generateStatsTable, printTestInfo, readState} from "./utils";

LoggerFactory.INST.logLevel("fatal");

/**
 * This benchmark evaluates 100 first interactions of a fairly simple
 * ewepANKEVffP0cm_XKjwTYhSBqaiQrJbVrCcBiWqw-s contract.
 *
 * It is using RedStone Gateway for loading interactions and contracts data.
 */
async function main() {
  const arweave = Arweave.init({
    host: 'arweave.net', // Hostname or IP address for a Arweave host
    port: 443, // Port
    protocol: 'https', // Network protocol http or https
    timeout: 60000, // Network request timeouts in milliseconds
    logging: false // Enable network request logging
  });

  const contractTxId = 'ewepANKEVffP0cm_XKjwTYhSBqaiQrJbVrCcBiWqw-s';
  const blockHeight = 808496;

  printTestInfo(contractTxId, blockHeight);
  const table = generateCallsTable();
  const results: BenchmarkStats[] = [];

  for (let i = 1; i <= 10; i++) {
    const result = await readState(contractTxId, blockHeight, arweave);
    results.push(result);

    table.push(
      [
        `${i}`.magenta, result.gatewayCommunication + "ms",
        result.stateEvaluation + "ms",
        result.total + "ms"
      ]
    );
  }
  console.log(table.toString());

  const tableStats = generateStatsTable(results);
  console.log(tableStats.toString());
}

main().catch((e) => console.error(e));
