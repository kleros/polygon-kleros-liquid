const { deployProxy } = require('@openzeppelin/truffle-upgrades');

var WrappedPinakion = artifacts.require("./WrappedPinakion.sol");
var KlerosLiquid = artifacts.require("./KlerosLiquid.sol");
var PolicyRegistry = artifacts.require("./PolicyRegistry.sol");
var KlerosLiquidExtraViews = artifacts.require("./KlerosLiquidExtraViews.sol");
var SortitionSumTreeFactory = artifacts.require("./SortitionSumTreeFactory.sol");

const contracts = {
  "mumbai": {
    goerliTestToken: "0x3f152B63Ec5CA5831061B2DccFb29a874C317502",
    goerliDummyERC20: "0x655F2166b0709cd575202630952D71E2bB0d61Af",
    mumbaiTestToeknPOS: "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e",
    mumbaiDummyERC20POS: "0x4d350e8A3C0D57714d3b80c9e2030ab8f1Bb7875",
    LINK: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
  }
}

const pinakionParams = {
  "matic": {
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
    RNGenerator: "0x0000000000000000000000000000000000000000",
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
    RNGenerator: "0x0000000000000000000000000000000000000000",
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
  console.log('The RNG address of the KlerosLiquid contract has to be set after deploying the RNG contract');
};