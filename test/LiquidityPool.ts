import hre, { ethers, network } from "hardhat"
import { BigNumberish, Contract, ContractFactory, utils, Signer, BigNumber } from "ethers"
import { MockProvider } from "@ethereum-waffle/provider"
import {
	toWei,
	truncate,
	tFormatEth,
	call,
	put,
	genOptionTimeFromUnix,
	fromWei,
	fromUSDC,
	getDiffSeconds,
	convertRounded,
	percentDiffArr,
	percentDiff,
	toUSDC,
	fmtExpiration,
	fromOpyn,
	toOpyn,
	tFormatUSDC
} from "../utils/conversion-helper"
import { deployMockContract, MockContract } from "@ethereum-waffle/mock-contract"
import moment from "moment"
import AggregatorV3Interface from "../artifacts/contracts/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json"
import { AggregatorV3Interface as IAggregatorV3 } from "../types/AggregatorV3Interface"
//@ts-ignore
import bs from "black-scholes"
import { expect } from "chai"
import Otoken from "../artifacts/contracts/packages/opyn/core/Otoken.sol/Otoken.json"
import LiquidityPoolSol from "../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json"
import { ERC20 } from "../types/ERC20"
import { ERC20Interface } from "../types/ERC20Interface"
import { MintableERC20 } from "../types/MintableERC20"
import { OpynOptionRegistry } from "../types/OpynOptionRegistry"
import { Otoken as IOToken } from "../types/Otoken"
import { PriceFeed } from "../types/PriceFeed"
import { LiquidityPools } from "../types/LiquidityPools"
import { LiquidityPool } from "../types/LiquidityPool"
import { Volatility } from "../types/Volatility"
import { WETH } from "../types/WETH"
import { Protocol } from "../types/Protocol"
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
	ORACLE_LOCKING_PERIOD
} from "./constants"
import { setupOracle, setOpynOracleExpiryPrice } from "./helpers"
import { send } from "process"
import { convertDoubleToDec } from "../utils/math"
import { OptionRegistry } from "../types/OptionRegistry"

const IMPLIED_VOL = "60"
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

/* --- variables to change --- */

// Date for option to expire on format yyyy-mm-dd
// Will automatically convert to 08:00 UTC timestamp
const expiryDate: string = "2022-03-12"
// decimal representation of a percentage
const rfr: string = "0.03"
// edit depending on the chain id to be tested on
const chainId = 1
const oTokenDecimalShift18 = 10000000000
// amount of dollars OTM written options will be (both puts and calls)
// use negative numbers for ITM options
const strike = "20"

// balances to deposit into the LP
const liquidityPoolUsdcDeposit = "10000"
const liquidityPoolWethDeposit = "1"

// balance to withdraw after deposit
const liquidityPoolWethWidthdraw = "0.1"

/* --- end variables to change --- */

const expiration = moment.utc(expiryDate).add(8, "h").valueOf() / 1000

let usd: MintableERC20
let wethERC20: ERC20Interface
let weth: WETH
let currentTime: moment.Moment
let optionRegistry: OpynOptionRegistry
let optionToken: IOToken
let putOption: IOToken
let erc20PutOption: IOToken
let erc20CallOption: IOToken
let optionProtocol: Protocol
let erc20CallExpiration: moment.Moment
let putOptionExpiration: moment.Moment
let erc20PutOptionExpiration: moment.Moment
let erc20Token: ERC20
let signers: Signer[]
let volatility: Volatility
let senderAddress: string
let receiverAddress: string
let liquidityPools: LiquidityPools
let liquidityPool: LiquidityPool
let ethLiquidityPool: LiquidityPool

let priceFeed: PriceFeed
let ethUSDAggregator: MockContract
let rate: string

const CALL_FLAVOR = BigNumber.from(call)
const PUT_FLAVOR = BigNumber.from(put)

describe('Liquidity Pools', async () => {
  before(async function () {
    await hre.network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            chainId: 1,
            jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY}`,
            blockNumber: 12821000,
          },
        },
      ],
    })
  })
  //   after(async function () {
  //     await network.provider.request({
  //       method: 'hardhat_reset',
  //       params: [],
  //     })
  //   })
  it('Deploys the Option Registry', async () => {
    signers = await ethers.getSigners()
    senderAddress = await signers[0].getAddress()
    receiverAddress = await signers[1].getAddress()
    // deploy libraries
    const constantsFactory = await ethers.getContractFactory('Constants')
    const interactionsFactory = await ethers.getContractFactory('OpynInteractions')
    const constants = await constantsFactory.deploy()
    const interactions = await interactionsFactory.deploy()
    // deploy options registry
    const optionRegistryFactory = await ethers.getContractFactory('OpynOptionRegistry', {
      libraries: {
        OpynInteractions: interactions.address,
      },
    })
    // get and transfer weth
    weth = (await ethers.getContractAt(
      'contracts/interfaces/WETH.sol:WETH',
      WETH_ADDRESS[chainId],
    )) as WETH
    usd = (await ethers.getContractAt('ERC20', USDC_ADDRESS[chainId])) as MintableERC20
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [USDC_OWNER_ADDRESS[chainId]],
    })
    const signer = await ethers.getSigner(USDC_OWNER_ADDRESS[chainId])
    await usd.connect(signer).transfer(senderAddress, toWei('1000').div(oTokenDecimalShift18))
    await weth.deposit({ value: utils.parseEther('99') })
    const _optionRegistry = (await optionRegistryFactory.deploy(
      USDC_ADDRESS[chainId],
      OTOKEN_FACTORY[chainId],
      GAMMA_CONTROLLER[chainId],
      MARGIN_POOL[chainId],
      senderAddress,
    )) as OpynOptionRegistry
    optionRegistry = _optionRegistry
    expect(optionRegistry).to.have.property('deployTransaction')
  })
  it('Should deploy price feed', async () => {

    ethUSDAggregator = await deployMockContract(signers[0], AggregatorV3Interface.abi)

    const priceFeedFactory = await ethers.getContractFactory('PriceFeed')
    const _priceFeed = (await priceFeedFactory.deploy()) as PriceFeed
    priceFeed = _priceFeed
    await priceFeed.addPriceFeed(ZERO_ADDRESS, usd.address, ethUSDAggregator.address)
    await priceFeed.addPriceFeed(weth.address, usd.address, ethUSDAggregator.address)
    const feedAddress = await priceFeed.priceFeeds(ZERO_ADDRESS, usd.address)
    expect(feedAddress).to.eq(ethUSDAggregator.address)
    rate = '56770839675'
    await ethUSDAggregator.mock.latestRoundData.returns(
      '55340232221128660932',
      rate,
      '1607534965',
      '1607535064',
      '55340232221128660932',
    )
    await ethUSDAggregator.mock.decimals.returns('8')
  })

  it('Should deploy liquidity pools', async () => {
    const normDistFactory = await ethers.getContractFactory('NormalDist', {
      libraries: {},
    })
    const normDist = await normDistFactory.deploy()
    const blackScholesFactory = await ethers.getContractFactory('BlackScholes', {
      libraries: {
        NormalDist: normDist.address,
      },
    })
    const blackScholesDeploy = await blackScholesFactory.deploy()
    const constFactory = await ethers.getContractFactory(
      'contracts/libraries/Constants.sol:Constants',
    )
    const constants = await constFactory.deploy()
    const optComputeFactory = await ethers.getContractFactory(
      'contracts/libraries/OptionsCompute.sol:OptionsCompute',
      {
        libraries: {},
      },
    )
    await optComputeFactory.deploy()
    const volFactory = await ethers.getContractFactory('Volatility', {
      libraries: {},
    })
    volatility = (await volFactory.deploy()) as Volatility
    const liquidityPoolsFactory = await ethers.getContractFactory('LiquidityPools', {
      libraries: {
        Constants: constants.address,
        BlackScholes: blackScholesDeploy.address,
      },
    })
    const _liquidityPools: LiquidityPools = (await liquidityPoolsFactory.deploy()) as LiquidityPools
    liquidityPools = _liquidityPools
  })

  it('Should deploy option protocol and link to liquidity pools', async () => {
    const protocolFactory = await ethers.getContractFactory('Protocol')
    optionProtocol = (await protocolFactory.deploy(
      optionRegistry.address,
      liquidityPools.address,
      priceFeed.address,
    )) as Protocol
    await liquidityPools.setup(optionProtocol.address)
    const lpProtocol = await liquidityPools.protocol()
    expect(optionProtocol.address).to.eq(lpProtocol)
  })

  it('Creates a liquidity pool with USDC (erc20) as strikeAsset', async () => {
    type int7 = [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
    ]
    type number7 = [number, number, number, number, number, number, number]
    const coefInts: number7 = [
      1.42180236,
      0,
      -0.08626792,
      0.07873822,
      0.00650549,
      0.02160918,
      -0.1393287,
    ]
    //@ts-ignore
    const coefs: int7 = coefInts.map((x) => toWei(x.toString()))
    const lp = await liquidityPools.createLiquidityPool(
      usd.address,
      weth.address,
      usd.address,
      toWei(rfr),
      coefs,
      coefs,
      'ETH/USDC',
      'EDP',
    )
    const lpReceipt = await lp.wait(1)
    const events = lpReceipt.events
    const createEvent = events?.find((x) => x.event == 'LiquidityPoolCreated')
    const strikeAsset = createEvent?.args?.strikeAsset
    const lpAddress = createEvent?.args?.lp
    expect(createEvent?.event).to.eq('LiquidityPoolCreated')
    expect(strikeAsset).to.eq(usd.address)
    liquidityPool = new Contract(lpAddress, LiquidityPoolSol.abi, signers[0]) as LiquidityPool
    optionRegistry.setLiquidityPool(liquidityPool.address)
  })

  it('Deposit to the liquidityPool', async () => {
    const USDC_WHALE = '0x55fe002aeff02f77364de339a1292923a15844b8'
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [USDC_WHALE],
    })
    const usdcWhale = await ethers.getSigner(USDC_WHALE)
    const usdWhaleConnect = await usd.connect(usdcWhale)
    await weth.deposit({ value: toWei(liquidityPoolWethDeposit) })
    await usdWhaleConnect.transfer(senderAddress, toUSDC('1000000'))
    await usdWhaleConnect.transfer(receiverAddress, toUSDC('1000000'))
    const balance = await usd.balanceOf(senderAddress)
    await usd.approve(liquidityPool.address, toUSDC(liquidityPoolUsdcDeposit))
    const deposit = await liquidityPool.deposit(
      toUSDC(liquidityPoolUsdcDeposit),
      senderAddress
    )
    const liquidityPoolBalance = await liquidityPool.balanceOf(senderAddress)
    const receipt = await deposit.wait(1)
    const event = receipt?.events?.find((x) => x.event == 'Deposit')
    const newBalance = await usd.balanceOf(senderAddress)
    expect(event?.event).to.eq('Deposit')
    expect(balance.sub(newBalance)).to.eq(toUSDC(liquidityPoolUsdcDeposit))
    expect(liquidityPoolBalance.toString()).to.eq(toWei(liquidityPoolUsdcDeposit));

  })
  it('Returns a quote for a ETH/USD put with utilization', async () => {
    const totalLiqidity = await liquidityPool.totalSupply()
    const amount = toWei('5')
    const blockNum = await ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNum)
    const { timestamp } = block
    const timeToExpiration = genOptionTimeFromUnix(Number(timestamp), expiration)
    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
    const strikePrice = priceQuote.sub(toWei(strike))
    const priceNorm = fromWei(priceQuote)
    const utilization = Number(fromWei(amount)) / Number(fromWei(totalLiqidity))
    const utilizationPrice = Number(priceNorm) * utilization
    const optionSeries = {
      expiration: fmtExpiration(expiration),
      flavor: PUT_FLAVOR,
      strike: strikePrice,
      strikeAsset: usd.address,
      underlying: weth.address,
    }
    const iv = await liquidityPool.getImpliedVolatility(
      optionSeries.flavor,
      priceQuote,
      optionSeries.strike,
      optionSeries.expiration,
    )
    const localBS = bs.blackScholes(
      priceNorm,
      fromWei(strikePrice),
      timeToExpiration,
      fromWei(iv),
      parseFloat(rfr),
      'put',
    )
    const finalQuote = utilizationPrice > localBS ? utilizationPrice : localBS
    const quote = await liquidityPool.quotePriceWithUtilization(
      {
        expiration: fmtExpiration(expiration),
        flavor: PUT_FLAVOR,
        strike: BigNumber.from(strikePrice),
        strikeAsset: usd.address,
        underlying: weth.address,
      },
      amount,
    )
    const truncQuote = truncate(finalQuote)
    const chainQuote = tFormatEth(quote.toString())
    const diff = percentDiff(truncQuote, chainQuote)
    expect(diff).to.be.lt(0.01)
  })
  it('LP Writes a ETH/USD put for premium', async () => {
    const [sender] = signers
    const amount = toWei('1')
    const blockNum = await ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNum)
    const { timestamp } = block
    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
    const strikePrice = priceQuote.sub(toWei(strike))
    const proposedSeries = {
      expiration: fmtExpiration(expiration),
      flavor: PUT_FLAVOR,
      strike: BigNumber.from(strikePrice),
      strikeAsset: usd.address,
      underlying: weth.address,
    }
    const poolBalanceBefore = await usd.balanceOf(liquidityPool.address);
    const quote = await liquidityPool.quotePriceWithUtilization(proposedSeries, amount)
    await usd.approve(liquidityPool.address, quote)
    const balance = await usd.balanceOf(senderAddress)
    const write = await liquidityPool.issueAndWriteOption(proposedSeries, amount)
    const poolBalanceAfter = await usd.balanceOf(liquidityPool.address);
    const receipt = await write.wait(1)
    const events = receipt.events
    const writeEvent = events?.find((x) => x.event == 'WriteOption')
    const seriesAddress = writeEvent?.args?.series
    const putOptionToken = new Contract(seriesAddress, Otoken.abi, sender) as IOToken
    const putBalance = await putOptionToken.balanceOf(senderAddress)
    const registryUsdBalance = await liquidityPool.collateralAllocated();
    const balanceNew = await usd.balanceOf(senderAddress)
    const opynAmount = toOpyn(fromWei(amount))
    expect(putBalance).to.eq(opynAmount)
    // ensure funds are being transfered
    expect(tFormatUSDC(balance.sub(balanceNew))).to.eq(tFormatEth(quote))
  })
  it('can compute portfolio delta', async function () {
    const res = await liquidityPool.getPortfolioDelta()
  })

  it('Creates a liquidity pool with ETH as collateralAsset', async () => {
    type int7 = [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
    ]
    type number7 = [number, number, number, number, number, number, number]
    const coefInts: number7 = [
      1.42180236,
      0,
      -0.08626792,
      0.07873822,
      0.00650549,
      0.02160918,
      -0.1393287,
    ]
    //@ts-ignore
    const coefs: int7 = coefInts.map((x) => toWei(x.toString()))
    const lp = await liquidityPools.createLiquidityPool(
      usd.address,
      weth.address,
      weth.address,
      toWei(rfr),
      coefs,
      coefs,
      'weth/usd',
      'wdp',
    )
    const receipt = await lp.wait(1)
    const events = receipt.events
    const createEvent = events?.find((x) => x.event == 'LiquidityPoolCreated')
    const strikeAsset = createEvent?.args?.strikeAsset
    const lpAddress = createEvent?.args?.lp

    expect(createEvent?.event).to.eq('LiquidityPoolCreated')
    
    ethLiquidityPool = new Contract(lpAddress, LiquidityPoolSol.abi, signers[0]) as LiquidityPool
    const collateralAsset = await ethLiquidityPool.collateralAsset();
    expect(collateralAsset).to.eq(weth.address)
  })

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
    const blockNum = await ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNum)
    const { timestamp } = block

    const timeToExpiration = genOptionTimeFromUnix(Number(timestamp), expiration)
    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
    // const strikePrice = priceQuote.add(toWei(strike))
    // const optionSeries = {
    //   expiration: fmtExpiration(expiration.unix()),
    //   flavor: CALL_FLAVOR,
    //   strike: strikePrice,
    //   strikeAsset: usd.address,
    //   underlying: weth.address,
    // }
    // const iv = await liquidityPool.getImpliedVolatility(
    //   optionSeries.flavor,
    //   priceQuote,
    //   optionSeries.strike,
    //   optionSeries.expiration,
    // )
    // const localBS = bs.blackScholes(
    //   fromWei(priceQuote),
    //   fromWei(strikePrice),
    //   timeToExpiration,
    //   fromWei(iv),
    //   parseFloat(rfr),
    //   'call',
    // )
    // await priceFeed.addPriceFeed(ETH_ADDRESS, usd.address, ethUSDAggregator.address)
    // const quote = await liquidityPool.quotePrice(optionSeries)
    // expect(Math.round(truncate(localBS))).to.eq(Math.round(tFormatEth(quote.toString())))
  })

  it('Returns a quote for ETH/USD call with utilization', async () => {
    const totalLiqidity = await liquidityPool.totalSupply()
    const amount = toWei('5')
    const blockNum = await ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNum)
    const { timestamp } = block
    const timeToExpiration = genOptionTimeFromUnix(Number(timestamp), expiration)
    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
    const strikePrice = priceQuote.add(toWei(strike))
    const priceNorm = fromWei(priceQuote)
    const volatility = Number(IMPLIED_VOL) / 100
    const utilization = Number(fromWei(amount)) / Number(fromWei(totalLiqidity))
    const utilizationPrice = Number(priceNorm) * utilization
    const optionSeries = {
      expiration: fmtExpiration(expiration),
      flavor: CALL_FLAVOR,
      strike: strikePrice,
      strikeAsset: usd.address,
      underlying: weth.address,
    }
    const iv = await liquidityPool.getImpliedVolatility(
      optionSeries.flavor,
      priceQuote,
      optionSeries.strike,
      optionSeries.expiration,
    )
    const localBS = bs.blackScholes(
      priceNorm,
      fromWei(strikePrice),
      timeToExpiration,
      fromWei(iv),
      parseFloat(rfr),
      'call',
    )
    const finalQuote = utilizationPrice > localBS ? utilizationPrice : localBS
    const quote = await liquidityPool.quotePriceWithUtilization(
      {
        expiration: fmtExpiration(expiration),
        flavor: BigNumber.from(call),
        strike: BigNumber.from(strikePrice),
        strikeAsset: usd.address,
        underlying: weth.address,
      },
      amount,
    )
    const truncFinalQuote = Math.round(truncate(finalQuote))
    const formatEthQuote = Math.round(tFormatEth(quote.toString()))
    expect(truncFinalQuote).to.be.eq(formatEthQuote)
  })

  let lpCallOption: IOToken
  it('LP Writes a WETH/USD call collateralized by WETH for premium', async () => {
    // registry requires liquidity pool to be owner
    optionRegistry.setLiquidityPool(ethLiquidityPool.address)
    const [sender] = signers
    const amount = toWei('1')
    const blockNum = await ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNum)
    const { timestamp } = block

    // opyn contracts require expiration to be at 8:00 UTC

    const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
    const strikePrice = priceQuote.add(toWei(strike))
    //await usd.mint(senderAddress, toWei('6000'))
    await usd.approve(ethLiquidityPool.address, toUSDC('6000'))
    await weth.deposit({ value: amount.mul('5') })
    await weth.approve(ethLiquidityPool.address, amount.mul('5'))
    await ethLiquidityPool.deposit(amount.mul('4'), senderAddress)
    const lpUSDBalanceBefore = await usd.balanceOf(ethLiquidityPool.address)
    const proposedSeries = {
      expiration: fmtExpiration(expiration),
      flavor: BigNumber.from(call),
      strike: BigNumber.from(strikePrice),
      strikeAsset: usd.address,
      underlying: weth.address,
    }
    const quote = await ethLiquidityPool.quotePriceWithUtilization(proposedSeries, amount)
    await usd.approve(ethLiquidityPool.address, quote.toString())
    const write = await ethLiquidityPool.issueAndWriteOption(
      proposedSeries,
      amount
    )
    const receipt = await write.wait(1)
    const events = receipt.events
    const writeEvent = events?.find((x) => x.event == 'WriteOption')
    const seriesAddress = writeEvent?.args?.series
    const callOptionToken = new Contract(seriesAddress, Otoken.abi, sender) as IOToken
    lpCallOption = callOptionToken
    const buyerOptionBalance = await callOptionToken.balanceOf(senderAddress)
    //@ts-ignore
    const totalInterest = await callOptionToken.totalSupply()
    const writersBalance = await optionRegistry.writers(seriesAddress, ethLiquidityPool.address)
    const lpUSDBalance = await usd.balanceOf(ethLiquidityPool.address)
    const senderEthBalance = await sender.getBalance()
    const balanceDiff = lpUSDBalanceBefore.sub(lpUSDBalance)
    expect(writersBalance).to.eq(amount)
    expect(fromOpyn(buyerOptionBalance)).to.eq(fromWei(amount))
    expect(fromOpyn(totalInterest)).to.eq(fromWei(amount))
  })

  it('Can compute IV from volatility skew coefs', async () => {
    const coefs: BigNumberish[] = [
      1.42180236,
      0,
      -0.08626792,
      0.07873822,
      0.00650549,
      0.02160918,
      -0.1393287,
    ].map((x) => toWei(x.toString()))
    const points = [-0.36556715, 0.59115575].map((x) => toWei(x.toString()))
    const expected_iv = 1.4473946
    //@ts-ignore
    const res = await volatility.computeIVFromSkewInts(coefs, points)
    expect(tFormatEth(res)).to.eq(truncate(expected_iv))
  })

  // it('Can set the calls volatility skew', async () => {
  //   const coefInts: number[] = [
  //     1.42180236,
  //     0,
  //     -0.08626792,
  //     0.07873822,
  //     0.00650549,
  //     0.02160918,
  //     -0.1393287,
  //   ]
  //   const coefs: BigNumberish[] = coefInts.map((x) => toWei(x.toString()))
  //   //@ts-ignore
  //   const res = await liquidityPool.setVolatilitySkew(
  //     coefs,
  //     BigNumber.from(call),
  //   )
  //   const vs = await liquidityPool.getVolatilitySkew(BigNumber.from(call))
  //   const converted = vs.map((n: BigNumber) => fromWei(n))
  //   const diff = percentDiffArr(converted, coefInts)
  //   // allow for small float inprecision
  //   expect(diff).to.eq(0)
  // })

  it('can set the puts volatility skew', async () => {})

  it('LP can buy back option to reduce open interest', async () => {})

  it('Adds additional liquidity from new account', async () => {
    const [sender, receiver] = signers
    const sendAmount = toUSDC('10000')
    const usdReceiver = usd.connect(receiver)
    await usdReceiver.approve(liquidityPool.address, sendAmount)
    const lpReceiver = liquidityPool.connect(receiver)
    const totalSupply = await liquidityPool.totalSupply()
    await lpReceiver.deposit(sendAmount, receiverAddress)
    const newTotalSupply = await liquidityPool.totalSupply()
    const lpBalance = await lpReceiver.balanceOf(receiverAddress)
    const difference = newTotalSupply.sub(lpBalance)
    expect(difference).to.eq((await lpReceiver.balanceOf(senderAddress)))
    expect(newTotalSupply).to.eq(totalSupply.add(lpBalance))
  })

  it('LP can redeem shares', async () => {
    const shares = await liquidityPool.balanceOf(senderAddress)
    const totalShares = await liquidityPool.totalSupply()
    //@ts-ignore
    const ratio = 1 / fromWei(totalShares)
    const usdBalance = await usd.balanceOf(liquidityPool.address)
    const withdraw = await liquidityPool.withdraw(shares, senderAddress)
    const receipt = await withdraw.wait(1)
    const events = receipt.events
    const removeEvent = events?.find((x) => x.event == 'Withdraw')
    const strikeAmount = removeEvent?.args?.strikeAmount
    const usdBalanceAfter = await usd.balanceOf(liquidityPool.address)
    //@ts-ignore
    const diff = fromWei(usdBalance) * ratio
    expect(diff).to.be.lt(1)
    expect(strikeAmount).to.be.eq(usdBalance.sub(usdBalanceAfter))
  })

  it('LP can not redeems shares when in excess of liquidity', async () => {
    const [sender, receiver] = signers
    
    const shares = await liquidityPool.balanceOf(receiverAddress)
    const liquidityPoolReceiver = liquidityPool.connect(receiver)
    const withdraw = liquidityPoolReceiver.withdraw(shares, receiverAddress)
    await expect(withdraw).to.be.revertedWith('Insufficient funds for a full withdrawal')
  })
})
