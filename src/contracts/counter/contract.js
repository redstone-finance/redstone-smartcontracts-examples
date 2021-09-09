export function handle(state, action) {
  switch (action.input.function) {

    case "add":
      state.counter++;
      return { state };

    case "getCurrentValue":
      return { result: state.counter };

    default:
      throw new ContractError(
        `Unsupported contract function: ${functionName}`);

  }
}
