/* eslint-disable */
import Arweave from 'arweave';
import {BenchmarkStats, LoggerFactory,} from "redstone-smartweave";
import {generateCallsTable, generateStatsTable, printTestInfo, readState} from "./utils";

LoggerFactory.INST.logLevel("fatal");

/**
 * This benchmark evaluates full state of the
 * LppT1p3wri4FCKzW5buohsjWxpJHC58_rgIO-rYTMB8 contract.
 * It has over only 400 interactions, but makes a lot of readContractState calls to other contracts
 * - on original smartweave.js SDK it evaluates for several hours.
 *
 * It is using RedStone Gateway for loading contract definition and Arweave Gateway
 * for loading contract interactions (due to issue described here:
 * https://github.com/redstone-finance/redstone-smartcontracts/pull/62#issuecomment-995249264
 * - which will be solved soon).
 */
async function main() {
  const arweave = Arweave.init({
    host: 'arweave.net', // Hostname or IP address for a Arweave host
    port: 443, // Port
    protocol: 'https', // Network protocol http or https
    timeout: 60000, // Network request timeouts in milliseconds
    logging: false // Enable network request logging
  });

  const contractTxId = 'LppT1p3wri4FCKzW5buohsjWxpJHC58_rgIO-rYTMB8';
  const blockHeight = 844916;

  printTestInfo(contractTxId, blockHeight);
  const table = generateCallsTable();
  const results: BenchmarkStats[] = [];

  for (let i = 1; i <= 3; i++) {
    const result = await readState(contractTxId, blockHeight, arweave, true);
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
