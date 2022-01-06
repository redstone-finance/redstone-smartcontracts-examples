/* eslint-disable */
import Arweave from 'arweave';
import {BenchmarkStats, LoggerFactory,} from "redstone-smartweave";

import {generateCallsTable, generateStatsTable, printTestInfo, readState} from "./utils";

LoggerFactory.INST.logLevel("fatal");

/**
 * This benchmark evaluates 100 first interactions of a fairly simple
 * t9T7DIOGxx4VWXoCEeYYarFYeERTpWIC1V3y-BPZgKE contract.
 *
 * It is using Arweave for loading interactions and contracts data.
 */
async function main() {
  const arweave = Arweave.init({
    host: 'arweave.net', // Hostname or IP address for a Arweave host
    port: 443, // Port
    protocol: 'https', // Network protocol http or https
    timeout: 60000, // Network request timeouts in milliseconds
    logging: false // Enable network request logging
  });

  const contractTxId = 't9T7DIOGxx4VWXoCEeYYarFYeERTpWIC1V3y-BPZgKE';

  const networkinfo = await arweave.network.getInfo();
  const height = networkinfo.height;

  printTestInfo(contractTxId, height);
  const table = generateCallsTable();
  const results: BenchmarkStats[] = [];

  for (let i = 1; i <= 10; i++) {
    const result = await readState(contractTxId, null, arweave, true, true);
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
