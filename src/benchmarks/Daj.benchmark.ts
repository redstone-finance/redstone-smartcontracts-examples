/* eslint-disable */
import Arweave from 'arweave';
import {BenchmarkStats, LoggerFactory,} from "redstone-smartweave";
import {generateCallsTable, generateStatsTable, printTestInfo, readState} from "./utils";

LoggerFactory.INST.logLevel("fatal");

/**
 * This benchmark evaluates full state of the
 * Daj-MNSnH55TDfxqC7v4eq0lKzVIwh98srUaWqyuZtY "loot"  contract.
 * It has almost 10000 interactions and is a bit more computation heavy.
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

  const contractTxId = 'Daj-MNSnH55TDfxqC7v4eq0lKzVIwh98srUaWqyuZtY';
  const blockHeight = 844916;

  printTestInfo(contractTxId, blockHeight);
  const table = generateCallsTable();
  const results: BenchmarkStats[] = [];

  for (let i = 1; i <= 5; i++) {
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
