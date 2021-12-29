import { ethers, network } from "hardhat";
import { BigNumberish, Contract, ContractFactory, utils, Signer, BigNumber } from "ethers";
import {MockProvider} from '@ethereum-waffle/provider';
import {
  toWei,
  truncate,
  tFormatEth,
  call,
  put,
  genOptionTimeFromUnix,
  fromWei,
  getDiffSeconds,
  convertRounded,
  percentDiffArr,
  percentDiff
} from '../utils';
import { deployMockContract, MockContract} from '@ethereum-waffle/mock-contract';
import moment from "moment";
//@ts-ignore
import bs from "black-scholes";
import { expect } from "chai";
import Otoken from "../artifacts/contracts/packages/opyn/core/Otoken.sol/Otoken.json";
import LiquidityPoolSol from "../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json";
import AggregatorV3Interface from "../artifacts/contracts/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json";
import { AggregatorV3Interface as IAggregatorV3 } from "../types/AggregatorV3Interface";
import { ERC20 } from "../types/ERC20";
import { ERC20Interface } from "../types/ERC20Interface";
import { OpynOptionRegistry } from "../types/OpynOptionRegistry";
import { Exchange } from "../types/Exchange";
import { Otoken as IOToken } from "../types/Otoken";
import { UniswapV2Factory } from "../types/UniswapV2Factory";
import { UniswapV2Router02 } from "../types/UniswapV2Router02";
import { PriceFeed } from "../types/PriceFeed";
import { LiquidityPools } from "../types/LiquidityPools";
import { LiquidityPool } from "../types/LiquidityPool";
import { Volatility } from "../types/Volatility";
import { WETH } from "../types/WETH";
import { Protocol } from "../types/Protocol";
import { convertDoubleToDec } from "../utils/math"
import {
  CHAINLINK_WETH_PRICER,
  CHAINID,
  ETH_PRICE_ORACLE,
  USDC_PRICE_ORACLE,
  GAMMA_CONTROLLER,
  MARGIN_POOL,
  OTOKEN_FACTORY,
  USDC_ADDRESS,
  USDC_OWNER_ADDRESS,
  WETH_ADDRESS,
} from "./constants";
import { send } from "process";
const IMPLIED_VOL = '60';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
// Aug 13th 2021 8am
// TODO: figure out better way to do this
let expiration = 1628841600;

// edit depending on the chain id to be tested on
const chainId = 1;
const oTokenDecimalShift18 = 10000000000;
const strike = toWei('3500').div(oTokenDecimalShift18);

let usd: ERC20;
let wethERC20: ERC20Interface;
let currentTime: moment.Moment;
let optionRegistry: OpynOptionRegistry;
let optionToken: IOToken;
let putOption: IOToken;
let erc20PutOption: IOToken;
let erc20CallOption: IOToken;
let optionProtocol: Protocol;
let erc20CallExpiration: moment.Moment;
let putOptionExpiration: moment.Moment;
let erc20PutOptionExpiration: moment.Moment;
let erc20Token: ERC20;
let signers: Signer[];
let volatility: Volatility;
let senderAddress: string;
let receiverAddress: string;

describe("Options protocol", function() {
  it("Deploys the Option Registry", async () => {
    signers = await ethers.getSigners();
    senderAddress = await signers[0].getAddress();
    receiverAddress = await signers[1].getAddress();

    // deploy libraries
    const constantsFactory = await ethers.getContractFactory("Constants");
    const interactionsFactory = await ethers.getContractFactory("OpynInteractions");
    const constants = await constantsFactory.deploy();
    const interactions = await interactionsFactory.deploy();

    // deploy options registry
    const optionRegistryFactory = await ethers.getContractFactory(
      "OpynOptionRegistry",
      {
        libraries: {
          Constants: constants.address,
          OpynInteractions: interactions.address 
        }
      }
    );

    // get and transfer weth
    weth = (await ethers.getContractAt("contracts/interfaces/WETH.sol:WETH", WETH_ADDRESS[chainId])) as WETH;
    usd = (await ethers.getContractAt("ERC20", USDC_ADDRESS[chainId])) as ERC20;
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDC_OWNER_ADDRESS[chainId]],
    });
    
    const signer = await ethers.getSigner(USDC_OWNER_ADDRESS[chainId]);
    await usd.connect(signer).transfer(senderAddress, toWei('1000').div(oTokenDecimalShift18))
    await weth.deposit({value: utils.parseEther("99")})

    const _optionRegistry = await optionRegistryFactory.deploy(
      USDC_ADDRESS[chainId], 
      OTOKEN_FACTORY[chainId],
      GAMMA_CONTROLLER[chainId],
      MARGIN_POOL[chainId],
      senderAddress ) as OpynOptionRegistry;
    optionRegistry = _optionRegistry
    expect(optionRegistry).to.have.property('deployTransaction');
  });
  it("Creates an option token series", async () => {
    const [sender] = signers;
   
    const issue = await optionRegistry.issue(WETH_ADDRESS[chainId], WETH_ADDRESS[chainId], expiration, call, strike);
    await expect(issue)
      .to.emit(optionRegistry, 'OptionTokenCreated');
      const receipt = await issue.wait(1);
      const events = receipt.events;
      const removeEvent = events?.find(x => x.event == 'OptionTokenCreated');
      const seriesAddress = removeEvent?.args?.token;
    // save the option token address
    optionToken = new Contract(seriesAddress, Otoken.abi, sender) as IOToken;
  });

  it('opens option token with ETH', async () => {
    const value = toWei('2');
    wethERC20 = (await ethers.getContractAt("ERC20Interface", WETH_ADDRESS[chainId])) as ERC20Interface;
    await wethERC20.approve(optionRegistry.address, value);
    await optionRegistry.open(
      optionToken.address,
      value,
    );
    const balance = await optionToken.balanceOf(senderAddress);
    expect(balance).to.equal(value.div(oTokenDecimalShift18));
  });

  it('writer transfers part of balance to new account', async () => {
    const sender1Address = receiverAddress;
    const transferAmount = toWei('1').div(oTokenDecimalShift18);
    await optionToken.transfer(sender1Address, transferAmount);
    const balance = await optionToken.balanceOf(sender1Address);
    expect(balance).to.equal(transferAmount);
  });

  it('receiver attempts to close and transaction should revert', async () => {
    const [sender, receiver] = signers;
    const optionRegistryReceiver = optionRegistry.connect(receiver);
    await expect(
      optionRegistryReceiver.close(optionToken.address, toWei('1').div(oTokenDecimalShift18))
    ).to.be.revertedWith('!liquidityPool');
  });

  it('liquidityPool close and transaction succeeds', async () => {
    const [sender, receiver] = signers;
    const value = toWei('1').div(oTokenDecimalShift18);
    const optionRegistrySender = optionRegistry.connect(sender);
    await optionToken.approve(optionRegistry.address, value)
    const wethBalanceBefore = await wethERC20.balanceOf(senderAddress);
    await optionRegistrySender.close(optionToken.address, value)
    const balance = await optionToken.balanceOf(senderAddress);
    expect(balance).to.equal(0);
    const wethBalance = await wethERC20.balanceOf(senderAddress);
    expect(wethBalance.sub(wethBalanceBefore)).to.equal(toWei('1'))
  });

  it('should not allow anyone outside liquidityPool to open', async () => {
    const value = toWei('2');
    const [sender, receiver] = signers;
    await wethERC20.connect(receiver).approve(optionRegistry.address, value);
    await expect(
      optionRegistry.connect(receiver).open(
        optionToken.address,
        value)
    ).to.be.revertedWith('!liquidityPool');
  });

  it('receiver transfers to liquidityPool and closes option token', async () => {
    const value = toWei('1').div(oTokenDecimalShift18);
    const [sender, receiver] = signers;
    await optionToken.connect(receiver).transfer(senderAddress, value)
    await optionToken.approve(optionRegistry.address, value) 
    const wethBalanceBefore = await wethERC20.balanceOf(receiverAddress);
    await optionRegistry.close(optionToken.address, value);
    const balance = await optionToken.balanceOf(receiverAddress);
    expect(balance).to.equal('0');
    const senderBalance = await optionToken.balanceOf(receiverAddress);
    expect(senderBalance).to.equal('0');
    await wethERC20.transfer(receiverAddress, toWei('1'));
    const wethBalance = await wethERC20.balanceOf(receiverAddress);
    expect(wethBalance.sub(wethBalanceBefore)).to.equal(toWei('1'))
    
  });

  // it('writer redeems and receives monies owed from exercises', async () => {
  //   const balanceUSD = await usd.balanceOf(senderAddress);
  //   expect(balanceUSD).to.equal('0');
  //   const now = moment();
  //   const future = moment(now).add(13, 'M');
  //   const time = Number(getDiffSeconds(now, future));
  //   await ethers.provider.send("evm_increaseTime", [time]);
  //   await optionRegistry.redeem(optionToken.address);
  //   const newBalanceUSD = await usd.balanceOf(senderAddress);
  //   expect(newBalanceUSD).to.equal(toWei('300'));
  // });

  it('creates an ERC20 call option token series', async () => {
    const [sender] = signers;
    const future = 1640678400;
    const issueCall = await optionRegistry.issue(WETH_ADDRESS[chainId], WETH_ADDRESS[chainId], future, call, strike);
    await expect(issueCall)
      .to.emit(optionRegistry, 'OptionTokenCreated');
      const receipt = await issueCall.wait(1);
      const events = receipt.events;
      const removeEvent = events?.find(x => x.event == 'OptionTokenCreated');
      const seriesAddress = removeEvent?.args?.token;
    // save the option token address
    erc20CallOption = new Contract(seriesAddress, Otoken.abi, sender) as IOToken;
  });

  it('opens an ERC20 call option', async () => {
    await wethERC20.approve(optionRegistry.address, toWei('2'));
    await optionRegistry.open(erc20CallOption.address, toWei('2'));
    const balance = await erc20CallOption.balanceOf(senderAddress);
    expect(balance).to.be.equal(toWei('2').div(oTokenDecimalShift18));
  });

  it('writer transfers part of erc20 call balance to new account', async () => {
    const [sender, receiver] = signers;
    const value = toWei('1').div(oTokenDecimalShift18);
    await erc20CallOption.transfer(receiverAddress, value);
    const balance = await erc20CallOption.balanceOf(receiverAddress);
    expect(balance).to.be.equal(value);
  });

  it('new account exercises erc20 call option', async () => {
    const [sender, receiver] = signers;
    const usdReceiver = usd.connect(receiver);
    await usdReceiver.mint(receiverAddress, toWei('1000'));
    const optionRegistryReceiver = optionRegistry.connect(receiver);
    const usdBalance = await usd.balanceOf(receiverAddress);
    const series = await optionRegistry.seriesInfo(erc20CallOption.address);
    const { strike } = series
    const balance = await erc20CallOption.balanceOf(receiverAddress);
    const exerciseAmount = balance.div(toWei('1')).mul(strike);
    await usdReceiver.approve(erc20CallOption.address, exerciseAmount);
    await optionRegistryReceiver.exercise(erc20CallOption.address, balance);
    const newBalance = await erc20CallOption.balanceOf(receiverAddress);
    const newUsdBalance = await usd.balanceOf(receiverAddress);
    const newBalanceToken = await erc20Token.balanceOf(receiverAddress);
    expect(newBalance).to.equal('0');
    expect(usdBalance.sub(exerciseAmount)).to.equal(newUsdBalance);
    expect(newBalanceToken).to.equal(toWei('1'));
  });

  it('writer closes not transfered balance on ERC20 call option', async () => {
    const [sender] = signers;
    const value = toWei('1').div(oTokenDecimalShift18);
    await erc20CallOption.approve(optionRegistry.address, value) 
    await optionRegistry.close(erc20CallOption.address, value);
    const balance = await optionToken.balanceOf(senderAddress);
    expect(balance).to.equal('0');
  });

  it('writer redeems and receives monies owed from ERC20 call exercises', async () => {
    const [sender] = signers;
    const future = moment(erc20CallExpiration).add(1, 'M');
    const time = getDiffSeconds(moment(), future);
    await ethers.provider.send("evm_increaseTime", [time]);
    currentTime = future;
    let optionTokenEvent = new Promise((resolve, reject) => {
      optionRegistry.on('SeriesRedeemed', (series, underlyingAmount, strikeAmount, event) => {
        event.removeListener();

        resolve({
          series,
          underlyingAmount,
          strikeAmount
        });
      });

      setTimeout(() => {
        reject(new Error('timeout'));
      }, 60000)
    });
    await optionRegistry.redeem(erc20CallOption.address);
    const newBalance = await usd.balanceOf(senderAddress);
    let event: any = await optionTokenEvent;
    const { underlyingAmount, strikeAmount } = event;
    expect(underlyingAmount).to.eq('0');
    expect(strikeAmount).to.eq(toWei('300'));
    expect(newBalance).to.eq(toWei('600'));
  });

  it('creates a put option token series', async () => {
    const [sender] = signers;
    const future = 1643356800;
    const issuePut = await optionRegistry.issue(WETH_ADDRESS[chainId], USDC_ADDRESS[chainId], future, put, strike);
    await expect(
      issuePut
    ).to.emit(optionRegistry, 'OptionTokenCreated');
    let receipt = await (await issuePut).wait(1);
    let events = receipt.events
    //@ts-ignore
    const removeEvent = events?.find(x => x.event == 'OptionTokenCreated');
    const address = removeEvent?.args?.token;
    putOption = new Contract(address, Otoken.abi, sender) as IOToken;
  });

  it('opens put option token position with ETH', async () => {
    const [sender] = signers;
    const amount = strike.mul(2);
    await usd.approve(optionRegistry.address, toWei(amount.toString()));
    await optionRegistry.open(putOption.address, toWei('2'));
    const balance = await putOption.balanceOf(senderAddress);
    expect(balance).to.be.equal(toWei('2').div(oTokenDecimalShift18));
  });

  it('writer transfers part of put balance to new account', async () => {
    const [sender, receiver] = signers;
    await putOption.transfer(receiverAddress, toWei('1').div(oTokenDecimalShift18));
    const balance = await putOption.balanceOf(receiverAddress);
    expect(balance).to.eq(toWei('1').div(oTokenDecimalShift18));
  });

  it('new account exercises put option', async () => {
    const [sender, receiver] = signers;
    const optionRegistryReceiver = optionRegistry.connect(receiver);
    await usd.mint(receiverAddress, toWei('1000'));
    const originalBalanceUSD = await usd.balanceOf(receiverAddress);
    const series = await optionRegistry.seriesInfo(putOption.address);
    const { strike } = series;
    const balance = await putOption.balanceOf(receiverAddress);
    const ethBalance = await receiver.getBalance();
    const exerciseAmount = balance.div(toWei('1')).mul(strike);
    await optionRegistryReceiver.exercise(putOption.address, balance, {
      value: toWei('1')
    });
    const newBalance = await putOption.balanceOf(receiverAddress);
    const newBalanceUSD = await usd.balanceOf(receiverAddress);
    const newBalanceEth = await receiver.getBalance();
    const expectedUSDBalance = originalBalanceUSD.add(exerciseAmount);
    expect(newBalance).to.eq('0');
    expect(newBalanceUSD).to.eq(expectedUSDBalance);
    const diff = ethBalance.sub(newBalanceEth);
    expect(diff).to.gte(toWei('1')).lt(diff.add(toWei('1')));
  });

  it('writer closes not transfered balance on put option token', async () => {
    const value = toWei('1').div(oTokenDecimalShift18);
    await putOption.approve(optionRegistry.address, value) 
    await optionRegistry.close(putOption.address, value);
    const balance = await putOption.balanceOf(senderAddress);
    expect(balance).to.eq('0');
  });
});

let priceFeed: PriceFeed;
let ethUSDAggregator: MockContract;
let weth: WETH;
describe("Price Feed", async () => {
  it('Should deploy price feed', async () => {
    const Weth = await ethers.getContractFactory("contracts/tokens/WETH.sol:WETH");
    const wethContract = await Weth.deploy() as WETH;
    weth = wethContract;
    ethUSDAggregator = await deployMockContract(signers[0], AggregatorV3Interface.abi);


    const priceFeedFactory = await ethers.getContractFactory("PriceFeed");
    const _priceFeed = await priceFeedFactory.deploy() as PriceFeed;
    priceFeed = _priceFeed;
    await priceFeed.addPriceFeed(ZERO_ADDRESS, usd.address, ethUSDAggregator.address);
    await priceFeed.addPriceFeed(weth.address, usd.address, ethUSDAggregator.address);
    const feedAddress = await priceFeed.priceFeeds(ZERO_ADDRESS, usd.address);
    expect(feedAddress).to.eq(ethUSDAggregator.address);
  });

  let rate: string;
  it('Should return a price quote', async () => {
    // 567.70 - Chainlink uses 8 decimal places for this pair
    rate = '56770839675';
    await ethUSDAggregator.mock.latestRoundData.returns(
      '55340232221128660932',
      rate,
      '1607534965',
      '1607535064',
      '55340232221128660932'
    );
    const quote = await priceFeed.getRate(ZERO_ADDRESS, usd.address);
    expect(quote).to.eq(rate);
  });

  it('Should return a normalized price quote', async () => {
    await ethUSDAggregator.mock.decimals.returns('8');
    const quote = await priceFeed.getNormalizedRate(ZERO_ADDRESS, usd.address);
    // get decimal to 18 places
    const expected = BigNumber.from(rate).mul(BigNumber.from(10**10));
    expect(quote).to.eq(expected);
  })
});

let liquidityPools: LiquidityPools;
let liquidityPool: LiquidityPool;
let ethLiquidityPool: LiquidityPool;
const CALL_FLAVOR = BigNumber.from(call);
const PUT_FLAVOR = BigNumber.from(put);
describe("Liquidity Pools", async () => {
  it('Should deploy liquidity pools', async () => {
    const abdkMathFactory = await ethers.getContractFactory("ABDKMathQuad");
    const abdkMathDeploy = await abdkMathFactory.deploy();
    const normDistFactory = await ethers.getContractFactory("NormalDist", {
      libraries: {
        ABDKMathQuad: abdkMathDeploy.address
      }
    });
    const normDist = await normDistFactory.deploy();
    const blackScholesFactory = await ethers.getContractFactory("BlackScholes", {
      libraries: {
        ABDKMathQuad: abdkMathDeploy.address,
        NormalDist: normDist.address
      }
    });
    const blackScholesDeploy = await blackScholesFactory.deploy();
    const constFactory = await ethers.getContractFactory("contracts/libraries/Constants.sol:Constants");
    const constants = await constFactory.deploy();
    const optComputeFactory = await ethers.getContractFactory(
      "contracts/libraries/OptionsCompute.sol:OptionsCompute",
      {
        libraries: {}
      }
    );
    await optComputeFactory.deploy();
    const volFactory = await ethers.getContractFactory(
      "Volatility",
      {
        libraries: {}
      }
    )
    volatility = await volFactory.deploy() as Volatility;
    const liquidityPoolsFactory = await ethers.getContractFactory(
      "LiquidityPools",
      {
        libraries: {
          Constants: constants.address,
          ABDKMathQuad: abdkMathDeploy.address,
          BlackScholes: blackScholesDeploy.address
        }
      }
    );
    const _liquidityPools: LiquidityPools = await liquidityPoolsFactory.deploy() as LiquidityPools;
    liquidityPools = _liquidityPools;
  });

  it('Should deploy option protocol and link to liquidity pools', async () => {
    const protocolFactory = await ethers.getContractFactory(
      "Protocol"
    );
    optionProtocol = await protocolFactory.deploy(
      optionRegistry.address,
      liquidityPools.address,
      priceFeed.address
    ) as Protocol;
    await liquidityPools.setup(optionProtocol.address);
    const lpProtocol = await liquidityPools.protocol();
    expect(optionProtocol.address).to.eq(lpProtocol);
  });

  it('Creates a liquidity pool with DAI (erc20) as strikeAsset', async () => {
    type int7 = [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish];
    type number7 = [number, number, number, number, number, number, number];
    const coefInts: number7 = [1.42180236, 0, -0.08626792, 0.07873822, 0.00650549, 0.02160918, -0.1393287];
    //@ts-ignore
    const coefs: int7 = coefInts.map(x => toWei(x.toString()));
    const lp = await liquidityPools.createLiquidityPool(
      usd.address,
      weth.address,
      '3',
      coefs,
      coefs,
      'ETH/DAI',
      'EDP'
    );
    const lpReceipt = await lp.wait(1);
    const events = lpReceipt.events;
    const createEvent = events?.find(x => x.event == 'LiquidityPoolCreated');
    const strikeAsset = createEvent?.args?.strikeAsset
    const lpAddress = createEvent?.args?.lp;
    expect(createEvent?.event).to.eq('LiquidityPoolCreated');
    expect(strikeAsset).to.eq(usd.address);
    liquidityPool = new Contract(lpAddress, LiquidityPoolSol.abi, signers[0]) as LiquidityPool;
  });

  it('Adds liquidity to the liquidityPool', async () => {
    const price = await priceFeed.getNormalizedRate(weth.address, usd.address);
    await weth.deposit({ value: toWei('1') });
    const balance = await usd.balanceOf(senderAddress);
    const wethBalance = await weth.balanceOf(senderAddress);
    await usd.approve(liquidityPool.address, toWei('600'));
    await weth.approve(liquidityPool.address, toWei('1'));
    const addLiquidity = await liquidityPool.addLiquidity(toWei('600'), toWei('1'), 0, 0);
    const liquidityPoolBalance = await liquidityPool.balanceOf(senderAddress);
    const receipt = await addLiquidity.wait(1);
    const event = receipt?.events?.find(x => x.event == 'LiquidityDeposited');
    const newBalance = await usd.balanceOf(senderAddress);
    const newWethBalance = await weth.balanceOf(senderAddress);
    expect(event?.event).to.eq('LiquidityDeposited');
    expect(wethBalance.sub(newWethBalance)).to.eq(toWei('1'));
    expect(balance.sub(newBalance)).to.eq(toWei('600'));
    expect(liquidityPoolBalance).to.eq(toWei('600'));
  });

  it('Removes from liquidityPool with no options written', async () => {
    const liquidityPoolBalance = await liquidityPool.balanceOf(senderAddress);
    await liquidityPool.removeLiquidity(toWei('60'), '0', '0');
    const newLiquidityPoolBalance = await liquidityPool.balanceOf(senderAddress);
    expect(liquidityPoolBalance.sub(newLiquidityPoolBalance)).to.eq(toWei('60'));
  });

  it('Adds additional liquidity from new account', async () => {
    const [sender, receiver] = signers
    const price = await priceFeed.getNormalizedRate(weth.address, usd.address);
    const balance = await usd.balanceOf(receiverAddress);
    const wethBalance = await weth.balanceOf(receiverAddress);
    const sendAmount = toWei('1');
    const usdReceiver = usd.connect(receiver);
    await usdReceiver.approve(liquidityPool.address, toWei('1000'));
    const wethReceiver = weth.connect(receiver);
    await wethReceiver.deposit({ value: toWei('1') });
    const lpReceiver = liquidityPool.connect(receiver);
    await wethReceiver.approve(liquidityPool.address, sendAmount);
    const totalSupply = await liquidityPool.totalSupply();
    await lpReceiver.addLiquidity(toWei('1000'), toWei('1'), 0, 0);
    const newTotalSupply = await liquidityPool.totalSupply();
    const lpBalance = await lpReceiver.balanceOf(receiverAddress);
    const difference = newTotalSupply.sub(lpBalance)
    const supplyRatio = convertRounded(newTotalSupply) / convertRounded((totalSupply));
    expect(Math.floor(supplyRatio)).to.eq(2);
    expect(difference).to.eq(lpBalance.sub(toWei('60')));
  });

  it('Creates a liquidity pool with ETH as strikeAsset', async () => {
    type int7 = [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish];
    type number7 = [number, number, number, number, number, number, number];
    const coefInts: number7 = [1.42180236, 0, -0.08626792, 0.07873822, 0.00650549, 0.02160918, -0.1393287];
    //@ts-ignore
    const coefs: int7 = coefInts.map(x => toWei(x.toString()));
    const lp = await liquidityPools.createLiquidityPool(
      weth.address,
      usd.address,
      '3',
      coefs,
      coefs,
      'weth/usd',
      'wdp'
    );
    const receipt = await lp.wait(1);
    const events = receipt.events;
    const createEvent = events?.find(x => x.event == 'LiquidityPoolCreated');
    const strikeAsset = createEvent?.args?.strikeAsset
    const lpAddress = createEvent?.args?.lp;
    expect(createEvent?.event).to.eq('LiquidityPoolCreated');
    expect(strikeAsset).to.eq(weth.address);
    ethLiquidityPool = new Contract(lpAddress, LiquidityPoolSol.abi, signers[0]) as LiquidityPool;
  });

  //TODO change to weth deposit contract
  // it('Adds liquidity to the ETH liquidityPool', async () => {
  //     const amount = toWei('10');
  //     await weth.deposit({ value: amount});
  //     await weth.approve(ethLiquidityPool.address, amount);
  //     const addLiquidity = await ethLiquidityPool.addLiquidity(amount);
  //     const liquidityPoolBalance = await ethLiquidityPool.balanceOf(senderAddress);
  //     const addLiquidityReceipt = await addLiquidity.wait(1);
  //     const addLiquidityEvents = addLiquidityReceipt.events;
  //     const addLiquidityEvent = addLiquidityEvents?.find(x => x.event == 'LiquidityAdded');
  //     expect(liquidityPoolBalance).to.eq(amount);
  //     expect(addLiquidityEvent?.event).to.eq('LiquidityAdded');
  // });

  it('Returns a quote for a single ETH/USD call option', async () => {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const { timestamp } = block;
    const expiration = moment(Number(timestamp) * 1000).add('5', 'M');
    const timeToExpiration = genOptionTimeFromUnix(Number(timestamp), expiration.unix());
    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address);
    const strikePrice = priceQuote.add(toWei('20'));
    const optionSeries = {
      expiration: BigNumber.from(expiration.unix()),
      flavor: CALL_FLAVOR,
      strike: strikePrice,
      strikeAsset: usd.address,
      underlying: weth.address
    }
    const iv = await liquidityPool.getImpliedVolatility(optionSeries.flavor, priceQuote, optionSeries.strike, optionSeries.expiration);
    const localBS = bs.blackScholes(
      fromWei(priceQuote),
      fromWei(priceQuote.add(toWei('20'))),
      timeToExpiration,
      fromWei(iv),
      .03,
      "call"
    );
    await priceFeed.addPriceFeed(ETH_ADDRESS, usd.address, ethUSDAggregator.address);
    const quote = await liquidityPool.quotePrice(optionSeries);
    expect(Math.round(truncate(localBS))).to.eq(Math.round(tFormatEth(quote.toString())));
    });

  it('Returns a quote for ETH/USD call with utilization', async () => {
    const totalLiqidity = await liquidityPool.totalSupply();
    const amount = toWei('5');
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const { timestamp } = block;
    const expiration = moment(Number(timestamp) * 1000).add('5', 'M');
    const timeToExpiration = genOptionTimeFromUnix(Number(timestamp), expiration.unix());
    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address);
    const strikePrice = priceQuote.add(toWei('20'));
    const priceNorm = fromWei(priceQuote);
    const volatility = Number(IMPLIED_VOL) / 100;
    const utilization = Number(fromWei(amount)) / Number(fromWei(totalLiqidity));
    const utilizationPrice = Number(priceNorm) * utilization;
    const optionSeries = {
      expiration: BigNumber.from(expiration.unix()),
      flavor: CALL_FLAVOR,
      strike: strikePrice,
      strikeAsset: usd.address,
      underlying: weth.address
    }
    const iv = await liquidityPool.getImpliedVolatility(optionSeries.flavor, priceQuote, optionSeries.strike, optionSeries.expiration);
    const localBS = bs.blackScholes(
      priceNorm,
      fromWei(strikePrice),
      timeToExpiration,
      fromWei(iv),
      .03,
      "call"
    );
    const finalQuote = utilizationPrice > localBS ? utilizationPrice : localBS;
    const quote = await liquidityPool.quotePriceWithUtilization({
      expiration: BigNumber.from(expiration.unix()),
      flavor: BigNumber.from(call),
      strike: BigNumber.from(strikePrice),
      strikeAsset: usd.address,
      underlying: weth.address
    }, amount);
    const truncFinalQuote = Math.round(truncate(finalQuote));
    const formatEthQuote = Math.round(tFormatEth(quote.toString()));
    expect(truncFinalQuote).to.be.eq(formatEthQuote);
    });

  it('Returns a quote for a ETH/USD put with utilization', async () => {

    const totalLiqidity = await liquidityPool.totalSupply();
    const amount = toWei('5');
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const { timestamp } = block;
    const expiration = moment(Number(timestamp) * 1000).add('5', 'M');
    const timeToExpiration = genOptionTimeFromUnix(Number(timestamp), expiration.unix());
    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address);
    const strikePrice = priceQuote.sub(toWei('20'));
    const priceNorm = fromWei(priceQuote);
    const utilization = Number(fromWei(amount)) / Number(fromWei(totalLiqidity));
    const utilizationPrice = Number(priceNorm) * utilization;
    const optionSeries = {
      expiration: BigNumber.from(expiration.unix()),
      flavor: PUT_FLAVOR,
      strike: strikePrice,
      strikeAsset: usd.address,
      underlying: weth.address
    }
    const iv = await liquidityPool.getImpliedVolatility(optionSeries.flavor, priceQuote, optionSeries.strike, optionSeries.expiration);
    const localBS = bs.blackScholes(
      priceNorm,
      fromWei(strikePrice),
      timeToExpiration,
      fromWei(iv),
      .03,
      "put"
      );
      const finalQuote = utilizationPrice > localBS ? utilizationPrice : localBS;
      const quote = await liquidityPool.quotePriceWithUtilization({
        expiration: BigNumber.from(expiration.unix()),
        flavor: PUT_FLAVOR,
        strike: BigNumber.from(strikePrice),
        strikeAsset: usd.address,
        underlying: weth.address
      }, amount);
    const truncQuote = truncate(finalQuote);
    const chainQuote = tFormatEth(quote.toString());
    const diff = percentDiff(truncQuote, chainQuote);
    expect(diff).to.be.lt(0.01)
    });

  let lpCallOption: IOToken;
  it('LP Writes a ETH/USD call for premium', async () => {
    const [sender] = signers;
    const amount = toWei('1');
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const { timestamp } = block;
    const expiration = moment(Number(timestamp) * 1000).add('5', 'M');
    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address);
    const strikePrice = priceQuote.add(toWei('20'));
    await usd.mint(senderAddress, toWei('6000'));
    await usd.approve(liquidityPool.address, toWei('6000'));
    await weth.deposit({ value: amount.mul('5') });
    await weth.approve(liquidityPool.address, amount.mul('5'));
    await liquidityPool.addLiquidity(toWei('6000'), amount.mul('4'), 0, 0);
    const lpUSDBalanceBefore = await usd.balanceOf(liquidityPool.address);
    const proposedSeries = {
      expiration: BigNumber.from(expiration.unix()),
      flavor: BigNumber.from(call),
      strike: BigNumber.from(strikePrice),
      strikeAsset: usd.address,
      underlying: weth.address
    };
    const quote = await liquidityPool.quotePriceWithUtilization(proposedSeries, amount);
    await usd.approve(liquidityPool.address, quote.toString());
    const write = await liquidityPool.issueAndWriteOption(
      proposedSeries,
      amount,
      weth.address
    );
    const receipt = await write.wait(1);
    const events = receipt.events;
    const writeEvent = events?.find(x => x.event == 'WriteOption');
    const seriesAddress = writeEvent?.args?.series;
    const callOptionToken = new Contract(seriesAddress, Otoken.abi, sender) as IOToken;
    lpCallOption = callOptionToken;
    const buyerOptionBalance = await callOptionToken.balanceOf(senderAddress);
    const openInterest = await optionRegistry.totalInterest(seriesAddress);
    const writersBalance = await optionRegistry.writers(seriesAddress, liquidityPool.address);
    const lpUSDBalance = await usd.balanceOf(liquidityPool.address);
    const senderEthBalance = await sender.getBalance();
    const balanceDiff = lpUSDBalanceBefore.sub(lpUSDBalance);
    expect(writersBalance).to.eq(amount);
    expect(buyerOptionBalance).to.eq(amount);
    expect(openInterest).to.eq(amount);
  });

  it('LP Writes a ETH/USD put for premium', async () => {
    const [sender] = signers;
    const amount = toWei('1');
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const { timestamp } = block;
    const expiration = moment(Number(timestamp) * 1000).add('5', 'M');
    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address);
    const strikePrice = priceQuote.sub(toWei('20'));
    const proposedSeries = {
      expiration: BigNumber.from(expiration.unix()),
      flavor: PUT_FLAVOR,
      strike: BigNumber.from(strikePrice),
      strikeAsset: usd.address,
      underlying: weth.address
    };
    const quote = await liquidityPool.quotePriceWithUtilization(proposedSeries, amount);
    await usd.approve(liquidityPool.address, quote);
    const balance = await usd.balanceOf(senderAddress);
    const write = await liquidityPool.issueAndWriteOption(
      proposedSeries,
      amount,
      weth.address
    );
    const receipt = await write.wait(1);
    const events = receipt.events;
    const writeEvent = events?.find(x => x.event == 'WriteOption');
    const seriesAddress = writeEvent?.args?.series;
    const putOptionToken = new Contract(seriesAddress, Otoken.abi, sender) as IOToken;
    const putBalance = await putOptionToken.balanceOf(senderAddress);
    const balanceNew = await usd.balanceOf(senderAddress);
    expect(putBalance).to.eq(amount);
    // ensure funds are being transfered
    expect(tFormatEth(balance.sub(balanceNew))).to.eq(tFormatEth(quote));
  });

  it('Exercises call option issued by LP', async () => {
    // exercise half
    const seriesInfo = await optionRegistry.seriesInfo(lpCallOption.address);
    const strike = seriesInfo.strike;
    const exerciseAmount = toWei('0.5');
    const amount = strike.mul(exerciseAmount).div(toWei('1'));
    const balance = await usd.balanceOf(senderAddress);
    const lpBalance = await usd.balanceOf(liquidityPool.address);
    await optionRegistry.exercise(lpCallOption.address, exerciseAmount);
    const balanceAfter = await usd.balanceOf(senderAddress);
    const lpBalanceAfter = await usd.balanceOf(liquidityPool.address);
    expect(balance.sub(balanceAfter)).to.eq(amount);
  });

  it('Can compute IV from volatility skew coefs', async () => {
    const coefs: BigNumberish[] = [1.42180236, 0, -0.08626792, 0.07873822, 0.00650549, 0.02160918, -0.1393287].map(x => toWei(x.toString()))
    const points = [-0.36556715,  0.59115575].map(x => toWei(x.toString()))
    const expected_iv = 1.4473946;
    //@ts-ignore
    const res = await volatility.computeIVFromSkewInts(coefs, points);
    expect(tFormatEth(res)).to.eq(truncate(expected_iv));
  });

  it('Can set the calls volatility skew', async () => {
    const coefInts: number[] = [1.42180236, 0, -0.08626792, 0.07873822, 0.00650549, 0.02160918, -0.1393287]
    const coefs: BigNumberish[] = coefInts.map(x => toWei(x.toString()))
    //@ts-ignore
    const res = await liquidityPool.setVolatilitySkew(coefs, BigNumber.from(call))
    const vs = await liquidityPool.getVolatilitySkew(BigNumber.from(call))
    const converted = vs.map((n: BigNumber) => fromWei(n))
    const diff = percentDiffArr(converted, coefInts)
    // allow for small float inprecision
    expect(diff).to.eq(0);
  });

  it('can set the puts volatility skew', async () => {});

  it('can compute portfolio delta', async function() {
    const res = await liquidityPool.getPortfolioDelta();
  });

  it('LP can buy back option to reduce open interest', async () => {});

  it('LP can redeem shares', async () => {
    const shares = await liquidityPool.balanceOf(senderAddress);
    const totalShares = await liquidityPool.totalSupply();
    //@ts-ignore
    const ratio = 1 / fromWei(totalShares);
    const usdBalance = await usd.balanceOf(liquidityPool.address);
    const withdraw = await liquidityPool.removeLiquidity(shares, 0, 0);
    const receipt = await withdraw.wait(1);
    const events = receipt.events;
    const removeEvent = events?.find(x => x.event == 'LiquidityRemoved');
    const strikeAmount = removeEvent?.args?.strikeAmount;
    const usdBalanceAfter = await usd.balanceOf(liquidityPool.address);
    //@ts-ignore
    const diff = fromWei(usdBalance) * ratio;
    expect(diff).to.be.lt(1);
    expect(strikeAmount).to.be.eq(usdBalance.sub(usdBalanceAfter));
  });

  it('LP can not redeems shares when in excess of liquidity', async () => {
    const shares = await liquidityPool.balanceOf(receiverAddress);
    const liquidityPoolReceiver = liquidityPool.connect(receiverAddress);
    const withdraw = await liquidityPoolReceiver.removeLiquidity(shares, 0, 0);
    await expect(withdraw).to.be.revertedWith("StrikeAmountExceedsLiquidity");
  });
});
