export async function handle(state, action) {

  const COLORS = ["green", "red", "yellow", "blue", "black", "brown", "pink"];
  const MATERIALS = ["golden", "wooden", "silvern", "fiery", "diamond", "platinum", "palladium"];
  const ITEMS = ["sword", "shield", "robe", "stone", "crown", "katana", "gragon", "ring"];

  function bigIntFromBytes(byteArr) {
    const hexString = byteArr.toString("hex");
    return BigInt("0x" + hexString) % BigInt(Number.MAX_SAFE_INTEGER);
  }

  // This function calculates a pseudo-random int value,
  // which is less then the `max` argument.
  // Note! This method should not be used more than once
  // in a single contract interaction
  async function getRandomIntNumber(max) {
    const pseudoRandomData = SmartWeave.utils.stringToBuffer(
      SmartWeave.block.height
      + SmartWeave.block.timestamp
      + SmartWeave.transaction.id
      + action.caller
    );
    const hashBytes = await SmartWeave.crypto.hash(pseudoRandomData);
    const randomBigInt = bigIntFromBytes(hashBytes);
    return Number(randomBigInt % BigInt(max));
  }

  switch (action.input.function) {

    case "name":
      return { result: state.name };

    case "symbol":
      return { result: state.symbol };

    case "allAssets":
      return { result: Object.keys(state.assets) };

    case "getOwner":
      const asset = action.input.data.asset;
      if (state.assets[asset]) {
        return { result: state.assets[asset] };
      } else {
        return { result: `The asset "${asset}" doesn't exist yet` };
      }

    case "generate":
      const allAssetsCount = COLORS.length * MATERIALS.length * ITEMS.length;
      const assetIndex = await getRandomIntNumber(allAssetsCount);
      const colorIndex = assetIndex % COLORS.length;
      const materialIndex = Math.floor(assetIndex / COLORS.length) % MATERIALS.length;
      const itemIndex = Math.floor(assetIndex / (COLORS.length * MATERIALS.length)) % ITEMS.length;
      const asset = COLORS[colorIndex] + " " + MATERIALS[materialIndex] + " " + ITEMS[itemIndex];
      if (!state.assets[asset]) {
        // If the asset wasn't generated yet, create it and give it to caller
        state.assets[asset] = action.caller;
      }
      return { state };

    case "transfer":
      const toAddress = action.input.data.to;
      const asset = action.input.data.asset;
      if (state.assets[asset] !== action.caller) {
        throw new ContractError("Can not transfer asset that doesn't belong to you");
      }
      state.assets[asset] = toAddress;
      return { state };
    
    default:
      throw new ContractError(
        `Unsupported contract function: ${functionName}`);

  }
}
