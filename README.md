# redstone-smartweave-examples
Example usages of the [SmartWeave V2 SDK](https://github.com/redstone-finance/redstone-smartweave).

### Installation
`yarn install`  
or  
`npm install`   


### Running benchmarks
We've created 4 different benchmarks that cover different use cases / contract types.
Run them with:
```
yarn benchmark:1
yarn benchmark:2
yarn benchmark:3
yarn benchmark:4
```

or
```
npm run benchmark:1
npm run benchmark:2
npm run benchmark:3
npm run benchmark:4
```

### Running Examples
`yarn ts-node src/<example>.ts`  
eg: `yarn ts-node src/custom-client-example.ts`

See comments inside examples for further details.

We recommend reading the `src/custom-client-example.ts` first - as it 
explains all the modules of the new SDK.

Keep in mind that for examples that are using jwk, you need to 
supply proper path to your own jwk.
