import Arweave from 'arweave';
import { SwClientFactory } from 'smartweave/lib/v2';

async function memCacheClient() {

  const arweave = Arweave.init({
    host: 'arweave.net',// CloudFront based Arweave cache
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
  });

  console.log('arweave created');

  // using SwClientFactory to quickly obtain fully configured, mem-cacheable SwcClient instance
  const swcClient = SwClientFactory.memCacheClient(arweave);
  console.log('swcClient created');

  const providersRegistryContractTxId = "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU";

  // Reading contract's state using new client in the loop
  // each consecutive state read should take significantly less time then the first one.
  for (let i = 0; i < 5; i++) {
    console.time(`Contract call ${i + 1}`);
    const { state, validity } = await swcClient.readState(providersRegistryContractTxId);
    console.timeEnd(`Contract call ${i + 1}`);
  }

}

memCacheClient().catch((e) => {
  console.log(e);
});
