export function handle(state, action) {

  function getBalance(address) {
    if (!address) {
      throw new ContractError("Can not get balance for an empty address");
    } else {
      return state.balances[address] || 0;
    }
  }

  switch (action.input.function) {

    case "name":
      return { result: state.name };

    case "symbol":
      return { result: state.symbol };

    case "totalSupply":
      return { result: state.totalSupply };

    case "balanceOf":
      return { result: getBalance(action.input.data.address) };

    case "transfer":
      const fromAddress = action.caller;
      const toAddress = action.input.data.to;
      const value = action.input.data.amount;
      const senderBalance = getBalance(fromAddress);
      if (senderBalance < value) {
        throw new ContractError("Insufficient funds");
      }
      state.balances[fromAddress] = senderBalance - value;
      state.balances[toAddress] = getBalance(toAddress) + value;
      return { state };

    default:
      throw new ContractError(
        `Unsupported contract function: ${functionName}`);

  }
}
