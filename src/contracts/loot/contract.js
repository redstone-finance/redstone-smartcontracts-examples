export function handle(state, action) {

  const MATERIALS = ["golden", "wooden", "silvern", "fiery", "diamond"];
  const ITEMS = ["sword", "shield", "robe", "stone", "crown", "katana", "gragon", "ring"];

  function getRandomIntNumber(max) {
    // const bigNumber = SmartWeave.transaction.id + action.caller + SmartWeave.block.timestamp + SmartWeave.block.height;
    const bigNumber = SmartWeave.block.timestamp + SmartWeave.block.height;
    return Math.round(bigNumber % (max + 1));
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
      const assetIndex = getRandomIntNumber(MATERIALS.length * ITEMS.length);
      const materialIndex = assetIndex % MATERIALS.length;
      const itemIndex = Math.floor(assetIndex / MATERIALS.length);
      const asset = MATERIALS[materialIndex] + " " + ITEMS[itemIndex];
      if (!state.assets[asset]) {
        // If the asset wasn't generated yet, create it and give it to caller
        state.assets[asset] = action.caller;
      }
      return { state };

    default:
      throw new ContractError(
        `Unsupported contract function: ${functionName}`);

  }
}
