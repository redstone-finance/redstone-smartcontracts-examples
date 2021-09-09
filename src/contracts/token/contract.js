export function handle(state, action) {

  switch (action.input.function) {

    case "name":
      return state.name;

    case "symbol":
      return state.symbol;

    case "totalSupply":
      return state.totalSupply;

    case "balanceOf":
      return { result: state.balances[action.input.data.address] || 0 };

    case "transfer":
      const fromAddress = action.caller;
      const toAddress = action.input.data.to;
      const value = action.input.data.amount;
      // TODO: implement

    default:
      throw new Error(`Unsupported contract function: ${functionName}`);

  }
}
