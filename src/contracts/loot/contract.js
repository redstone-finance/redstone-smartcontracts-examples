export function handle(state, action) {

  const MATERIALS = ["golden", "wooden", "silvern", "fiery", "diamond"];
  const ITEMS = ["sword", "shield", "robe", "stone", "crown", "katana", "gragon", "ring"];

  // This function removes all non-digits from string
  // Then it converts to number
  // If the result string is empty, it returns 0
  function getNumberFromString(str) {
    return str.replace(/\D/g, "") || 0;
  }

  function getRandomIntNumber(max) {
    const bigNumber = SmartWeave.block.timestamp
      + SmartWeave.block.height
      + getNumberFromString(SmartWeave.transaction.id)
      + getNumberFromString(action.caller);
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
