const { deployProxy } = require('@openzeppelin/truffle-upgrades');

var WrappedPinakion = artifacts.require("./WrappedPinakion.sol");
var KlerosLiquid = artifacts.require("./KlerosLiquid.sol");
var PolicyRegistry = artifacts.require("./PolicyRegistry.sol");
var KlerosLiquidExtraViews = artifacts.require("./KlerosLiquidExtraViews.sol");
var SortitionSumTreeFactory = artifacts.require("./SortitionSumTreeFactory.sol");

const pinakionParams = {
  " matic": {
    tokenName: "Wrapped Pinakion on Polygon",
    tokenSymbol: "stPNK",
    bridgedPinakion: "0xad93E067e149f0A5ecd12D8EA83B05581dD6374C"
  },
  "mumbai": {
    tokenName: "Wrapped Pinakion on Mumbai",
    tokenSymbol: "stPNK",
    bridgedPinakion: "0x184A7Fc4fa965D18Af84C6d97dfed8C4561ff8c2"
  }
}

let KlerosLiquidParams = {
  "matic": {
    governor: null,
    pinakion: null,
    RNGenerator: "0x67e90a54AeEA85f21949c645082FE95d77BC1E70",
    minStakingTime: 3600,
    maxDrawingTime: 7200,
    hiddenVotes: false,
    minStake: web3.utils.toWei('620','ether'),
    alpha: 10000,
    feeForJuror: web3.utils.toWei('40000000000000000','wei'),
    jurorsForCourtJump: 511,
    timesPerPeriod: [280800, 583200, 583200, 388800],
    sortitionSumTreeK: 5,
  },
  "mumbai": {
    governor: null,
    pinakion: null,
    RNGenerator: "0x8f2b78169B0970F11a762e56659Db52B59CBCf1B",
    minStakingTime: 3600,
    maxDrawingTime: 7200,
    hiddenVotes: false,
    minStake: web3.utils.toWei('620','ether'),
    alpha: 10000,
    feeForJuror: web3.utils.toWei('40000000000000000','wei'),
    jurorsForCourtJump: 511,
    timesPerPeriod: [280800, 583200, 583200, 388800],
    sortitionSumTreeK: 5,
  }
}

module.exports = async function(deployer, network) {

  if (network == "development") {
    return
  }

  const PNKInstance = await deployProxy(
    WrappedPinakion,
    [
      pinakionParams[network].tokenName,
      pinakionParams[network].tokenSymbol,
      pinakionParams[network].bridgedPinakion,
    ],
    { deployer }
  );

  KlerosLiquidParams[network].governor = deployer.networks[network].from; // deployer address
  KlerosLiquidParams[network].pinakion = PNKInstance.address;
  await deployer.deploy(SortitionSumTreeFactory);
  await deployer.link(SortitionSumTreeFactory, KlerosLiquid);
  const KlerosLiquidInstance = await deployProxy(
    KlerosLiquid, 
    [
      KlerosLiquidParams[network].governor,
      KlerosLiquidParams[network].pinakion,
      KlerosLiquidParams[network].RNGenerator,
      KlerosLiquidParams[network].minStakingTime,
      KlerosLiquidParams[network].maxDrawingTime,
      KlerosLiquidParams[network].hiddenVotes,
      KlerosLiquidParams[network].minStake,
      KlerosLiquidParams[network].alpha,
      KlerosLiquidParams[network].feeForJuror,
      KlerosLiquidParams[network].jurorsForCourtJump,
      KlerosLiquidParams[network].timesPerPeriod,
      KlerosLiquidParams[network].sortitionSumTreeK,
    ], 
    { deployer, unsafeAllowLinkedLibraries: true }
  );

  await PNKInstance.changeController(KlerosLiquidInstance.address)

  const ExtraViewsInstance = await deployer.deploy(
    KlerosLiquidExtraViews,
    KlerosLiquidInstance.address
  );

  const PolicyRegistryInstance = await deployer.deploy(
    PolicyRegistry,
    deployer.networks[network].from // deployer address
  );
  await PolicyRegistryInstance.setPolicy(
    0,
    "/ipfs/Qmd1TMEbtic3TSonu5dfqa5k3aSrjxRGY8oJH3ruGgazRB" 
  )
  
  console.log('Deployed Wrapped PNK: ', PNKInstance.address);
  console.log('Deployed KlerosLiquid: ', KlerosLiquidInstance.address);
  console.log('Deployed Extra Views: ', ExtraViewsInstance.address);
  console.log('Deployed Policy Registry: ', PolicyRegistryInstance.address);
};