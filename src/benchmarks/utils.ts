import os from "os";
import {
  BenchmarkStats, MemCache,
  RedstoneGatewayContractDefinitionLoader,
  RedstoneGatewayInteractionsLoader, SmartWeaveNodeFactory,
  SmartWeaveWebFactory
} from "redstone-smartweave";
import Arweave from "arweave";
import {max, mean, median, min, standardDeviation} from "simple-statistics";

const Table = require('cli-table');
const colors = require('colors');

export function printTestInfo(contractTxId: string, blockHeight: number) {
  console.log("Test info  ".bgRed);
  console.log("===============");
  console.log("  ", "OS       ".bgGrey, os.type() + " " + os.release() + " " + os.arch());
  console.log("  ", "Node.JS  ".bgGrey, process.versions.node);
  console.log("  ", "V8       ".bgGrey, process.versions.v8);
  let cpus = os.cpus().map(function (cpu) {
    return cpu.model;
  }).reduce(function (o, model) {
    if (!o[model]) o[model] = 0;
    o[model]++;
    return o;
  }, {});

  cpus = Object.keys(cpus).map(function (key) {
    return key + " \u00d7 " + cpus[key];
  }).join("\n");
  console.log("  ", "CPU      ".bgGrey, cpus);
  console.log("  ", "Memory   ".bgGrey, (os.totalmem() / 1024 / 1024 / 1024).toFixed(0), "GB");
  console.log("===============");
  console.log("  ", "Contract ".bgGrey, contractTxId);
  console.log("  ", "Height   ".bgGrey, blockHeight);
}

export function generateCallsTable(): Table {
  return new Table({
    head: ['# Test:'.green, 'Gateway communication:'.green, 'State evaluation:'.green, 'Total:'.green]
    , colWidths: [10, 30, 20, 20]
  });
}

export async function readState(
  contractTxId: string,
  blockHeight: number = null,
  arweave: Arweave,
  interactionsFromArweave = false,
  fileCache = false
): Promise<BenchmarkStats> {

  let builder;
  if (fileCache) {
    builder = SmartWeaveNodeFactory
      .fileCachedBased(arweave, './cache');
  } else {
    builder = SmartWeaveWebFactory
      .memCachedBased(arweave);
  }

  if (!interactionsFromArweave) {
    builder.setDefinitionLoader(
      new RedstoneGatewayContractDefinitionLoader("https://gateway.redstone.finance", arweave, new MemCache()));
    builder.setInteractionsLoader(
      new RedstoneGatewayInteractionsLoader("https://gateway.redstone.finance", {confirmed: true}));
  }

  const smartweave = builder.build();

  const contract = smartweave.contract(contractTxId).setEvaluationOptions(
    {
      useFastCopy: true
    }
  );
  if (blockHeight === null) {
    await contract.readState();
  } else {
    await contract.readState(blockHeight);
  }


  return contract.lastReadStateStats();
}

export function addRow(table: Table, result: BenchmarkStats, index) {
  table.push(
    [`${index}`.magenta, result.gatewayCommunication + "ms", result.stateEvaluation + "ms", result.total + "ms"]
  );
}

export function generateStatsTable(results: BenchmarkStats[]): Table {
  const tableStats = new Table({
    head: ['Statistics:'.green, 'Gateway communication:'.green, 'State evaluation:'.green, 'Total:'.green]
    , colWidths: [20, 30, 20, 20]
  });
  tableStats.push(
    [
      "Mean".cyan, mean(results.map(r => r.gatewayCommunication)).toFixed(2) + "ms",
      mean(results.map(r => r.stateEvaluation)).toFixed(2) + "ms",
      mean(results.map(r => r.total)).toFixed(2) + "ms"
    ],
    [
      "Median".cyan,
      median(results.map(r => r.gatewayCommunication)).toFixed(2) + "ms",
      median(results.map(r => r.stateEvaluation)).toFixed(2) + "ms",
      median(results.map(r => r.total)).toFixed(2) + "ms"
    ],
    [
      "Min".cyan,
      min(results.map(r => r.gatewayCommunication)).toFixed(2) + "ms",
      min(results.map(r => r.stateEvaluation)).toFixed(2) + "ms",
      min(results.map(r => r.total)).toFixed(2) + "ms"
    ],
    [
      "Max".cyan,
      max(results.map(r => r.gatewayCommunication)).toFixed(2) + "ms",
      max(results.map(r => r.stateEvaluation)).toFixed(2) + "ms",
      max(results.map(r => r.total)).toFixed(2) + "ms"
    ],
    [
      "Std. Dev.".cyan,
      standardDeviation(results.map(r => r.gatewayCommunication)).toFixed(2) + "ms",
      standardDeviation(results.map(r => r.stateEvaluation)).toFixed(2) + "ms",
      standardDeviation(results.map(r => r.total)).toFixed(2) + "ms"
    ],
  );

  return tableStats;
}
