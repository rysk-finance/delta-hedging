import hre, { ethers, network } from "hardhat"
import { BigNumberish, Contract, utils, Signer, BigNumber, providers } from "ethers"
import {
	toWei,
	truncate,
	tFormatEth,
	fromWei,
	percentDiff,
	toUSDC,
	fromOpyn,
	toOpyn,
	tFormatUSDC,
	scaleNum
} from "../utils/conversion-helper"
import moment from "moment"
//@ts-ignore
import bs from "black-scholes"
import { deployOpyn } from "../utils/opyn-deployer"
import { expect } from "chai"
import Otoken from "../artifacts/contracts/packages/opyn/core/Otoken.sol/Otoken.json"
import LiquidityPoolSol from "../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json"
import { UniswapV3HedgingReactor } from "../types/UniswapV3HedgingReactor"
import { MintableERC20 } from "../types/MintableERC20"
import { OptionRegistry } from "../types/OptionRegistry"
import { Otoken as IOToken } from "../types/Otoken"
import { PriceFeed } from "../types/PriceFeed"
import { AlphaPortfolioValuesFeed } from "../types/AlphaPortfolioValuesFeed"
import { LiquidityPool } from "../types/LiquidityPool"
import { WETH } from "../types/WETH"
import { Protocol } from "../types/Protocol"
import { Volatility } from "../types/Volatility"
import { VolatilityFeed } from "../types/VolatilityFeed"
import { NewController } from "../types/NewController"
import { AddressBook } from "../types/AddressBook"
import { Oracle } from "../types/Oracle"
import { NewMarginCalculator } from "../types/NewMarginCalculator"
import {
	setupTestOracle,
	setupOracle,
	calculateOptionQuoteLocally,
	calculateOptionDeltaLocally,
	increase,
	setOpynOracleExpiryPrice
} from "./helpers"
import {
	GAMMA_CONTROLLER,
	MARGIN_POOL,
	OTOKEN_FACTORY,
	USDC_ADDRESS,
	USDC_OWNER_ADDRESS,
	WETH_ADDRESS,
	ADDRESS_BOOK,
	UNISWAP_V3_SWAP_ROUTER,
	CONTROLLER_OWNER,
	GAMMA_ORACLE_NEW,
	CHAINLINK_WETH_PRICER
} from "./constants"
import { MockChainlinkAggregator } from "../types/MockChainlinkAggregator"
import exp from "constants"
import { deployLiquidityPool, deploySystem } from "../utils/alpha-system-deployer"
import { ERC20Interface } from "../types/ERC20Interface"
import { AlphaOptionHandler } from "../types/AlphaOptionHandler"
import { Console } from "console"
let usd: MintableERC20
let weth: WETH
let wethERC20: ERC20Interface
let optionRegistry: OptionRegistry
let optionProtocol: Protocol
let signers: Signer[]
let senderAddress: string
let receiverAddress: string
let liquidityPool: LiquidityPool
let volatility: Volatility
let volFeed: VolatilityFeed
let priceFeed: PriceFeed
let portfolioValuesFeed: AlphaPortfolioValuesFeed
let uniswapV3HedgingReactor: UniswapV3HedgingReactor
let rate: string
let controller: NewController
let addressBook: AddressBook
let newCalculator: NewMarginCalculator
let oracle: Oracle
let opynAggregator: MockChainlinkAggregator
let putOptionToken: IOToken
let putOptionToken2: IOToken
let collateralAllocatedToVault1: BigNumber
let proposedSeries: any
let handler: AlphaOptionHandler
let authority: string

const IMPLIED_VOL = "60"
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

/* --- variables to change --- */

// Date for option to expire on format yyyy-mm-dd
// Will automatically convert to 08:00 UTC timestamp
// First mined block will be timestamped 2022-02-27 19:05 UTC
const expiryDate: string = "2022-04-05"

const invalidExpiryDateLong: string = "2022-04-22"
const invalidExpiryDateShort: string = "2022-03-01"
// decimal representation of a percentage
const rfr: string = "0.03"
// edit depending on the chain id to be tested on
const chainId = 1
const oTokenDecimalShift18 = 10000000000
const collatDecimalShift = BigNumber.from(1000000000000)
// amount of dollars OTM written options will be (both puts and calls)
// use negative numbers for ITM options
const strike = "20"

// hardcoded value for strike price that is outside of accepted bounds
const invalidStrikeHigh = utils.parseEther("12500")
const invalidStrikeLow = utils.parseEther("200")

// balances to deposit into the LP
const liquidityPoolUsdcDeposit = "60000"
const liquidityPoolWethDeposit = "1"

// balance to withdraw after deposit
const liquidityPoolWethWidthdraw = "0.1"

const minCallStrikePrice = utils.parseEther("500")
const maxCallStrikePrice = utils.parseEther("10000")
const minPutStrikePrice = utils.parseEther("500")
const maxPutStrikePrice = utils.parseEther("10000")
// one week in seconds
const minExpiry = 86400 * 7
// 365 days in seconds
const maxExpiry = 86400 * 50

// time travel period between each expiry
const expiryPeriod = {
	days: 0,
	weeks: 0,
	months: 1,
	years: 0
}
const productSpotShockValue = scaleNum("0.6", 27)
// array of time to expiry
const day = 60 * 60 * 24
const timeToExpiry = [day * 7, day * 14, day * 28, day * 42, day * 56, day * 84]
// array of upper bound value correspond to time to expiry
const expiryToValue = [
	scaleNum("0.1678", 27),
	scaleNum("0.237", 27),
	scaleNum("0.3326", 27),
	scaleNum("0.4032", 27),
	scaleNum("0.4603", 27),
	scaleNum("0.5", 27)
]

/* --- end variables to change --- */

const expiration = moment.utc(expiryDate).add(8, "h").valueOf() / 1000
const expiration2 = moment.utc(expiryDate).add(1, "w").add(8, "h").valueOf() / 1000 // have another batch of options exire 1 week after the first
const invalidExpirationLong = moment.utc(invalidExpiryDateLong).add(8, "h").valueOf() / 1000
const invalidExpirationShort = moment.utc(invalidExpiryDateShort).add(8, "h").valueOf() / 1000

const CALL_FLAVOR = false
const PUT_FLAVOR = true

// test ITM option when expired but not settled
// test OTM option when expired but not settled
// test ITM option when expired and settled and not removed
// test OTM option when expired and settled and not removed
// test ITM option when expired and settled and removed
// test OTM option when expired and settled and removed

describe("Liquidity Pool with alpha tests", async () => {
	before(async function () {
		await hre.network.provider.request({
			method: "hardhat_reset",
			params: [
				{
					forking: {
						chainId: 1,
						jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY}`,
						blockNumber: 14290000
					}
				}
			]
		})

		await network.provider.request({
			method: "hardhat_impersonateAccount",
			params: [CHAINLINK_WETH_PRICER[chainId]]
		})
		signers = await ethers.getSigners()
		let opynParams = await deployOpyn(signers, productSpotShockValue, timeToExpiry, expiryToValue)
		controller = opynParams.controller
		addressBook = opynParams.addressBook
		oracle = opynParams.oracle
		newCalculator = opynParams.newCalculator
		const [sender] = signers

		const signer = await ethers.getSigner(CONTROLLER_OWNER[chainId])
		await sender.sendTransaction({
			to: signer.address,
			value: ethers.utils.parseEther("10.0") // Sends exactly 10.0 ether
		})

		const forceSendContract = await ethers.getContractFactory("ForceSend")
		const forceSend = await forceSendContract.deploy() // force Send is a contract that forces the sending of Ether to WBTC minter (which is a contract with no receive() function)
		await forceSend
			.connect(signer)
			.go(CHAINLINK_WETH_PRICER[chainId], { value: utils.parseEther("0.5") })

		// get the oracle
		const res = await setupTestOracle(await sender.getAddress())
		oracle = res[0] as Oracle
		opynAggregator = res[1] as MockChainlinkAggregator
		let deployParams = await deploySystem(signers, oracle, opynAggregator)
		weth = deployParams.weth
		wethERC20 = deployParams.wethERC20
		usd = deployParams.usd
		optionRegistry = deployParams.optionRegistry
		priceFeed = deployParams.priceFeed
		volFeed = deployParams.volFeed
		portfolioValuesFeed = deployParams.portfolioValuesFeed
		optionProtocol = deployParams.optionProtocol
		authority = deployParams.authority.address
		let lpParams = await deployLiquidityPool(
			signers,
			optionProtocol,
			usd,
			wethERC20,
			rfr,
			minCallStrikePrice,
			minPutStrikePrice,
			maxCallStrikePrice,
			maxPutStrikePrice,
			minExpiry,
			maxExpiry,
			optionRegistry,
			portfolioValuesFeed,
			authority
		)
		volatility = lpParams.volatility
		liquidityPool = lpParams.liquidityPool
		handler = lpParams.handler
		signers = await hre.ethers.getSigners()
		senderAddress = await signers[0].getAddress()
		receiverAddress = await signers[1].getAddress()
		const USDC_WHALE = "0x55fe002aeff02f77364de339a1292923a15844b8"
		await hre.network.provider.request({
			method: "hardhat_impersonateAccount",
			params: [USDC_WHALE]
		})
		const usdcWhale = await ethers.getSigner(USDC_WHALE)
		const usdWhaleConnect = await usd.connect(usdcWhale)
		await usdWhaleConnect.transfer(senderAddress, toUSDC("1000000"))
		await usdWhaleConnect.transfer(receiverAddress, toUSDC("1000000"))
	})
	it("Succeeds: User 1: Deposit to the liquidityPool", async () => {
		const user = senderAddress
		const usdBalanceBefore = await usd.balanceOf(user)
		const lpBalanceBefore = await liquidityPool.balanceOf(user)
		const lpusdBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const lplpBalanceBefore = await liquidityPool.balanceOf(liquidityPool.address)
		const epochBefore = await liquidityPool.epoch()
		const depositReceiptBefore = await liquidityPool.depositReceipts(user)
		const pendingDepositBefore = await liquidityPool.pendingDeposits()
		await usd.approve(liquidityPool.address, toUSDC(liquidityPoolUsdcDeposit))
		expect(await liquidityPool.callStatic.deposit(toUSDC(liquidityPoolUsdcDeposit))).to.be.true
		const deposit = await liquidityPool.deposit(toUSDC(liquidityPoolUsdcDeposit))
		const usdBalanceAfter = await usd.balanceOf(user)
		const lpBalanceAfter = await liquidityPool.balanceOf(user)
		const lpusdBalanceAfter = await usd.balanceOf(liquidityPool.address)
		const lplpBalanceAfter = await liquidityPool.balanceOf(liquidityPool.address)
		const epochAfter = await liquidityPool.epoch()
		const depositReceiptAfter = await liquidityPool.depositReceipts(user)
		const pendingDepositAfter = await liquidityPool.pendingDeposits()
		const logs = await liquidityPool.queryFilter(liquidityPool.filters.Deposit(), 0)
		const depositEvent = logs[0].args
		expect(depositEvent.recipient).to.equal(user)
		expect(depositEvent.amount).to.equal(toUSDC(liquidityPoolUsdcDeposit))
		expect(depositEvent.epoch).to.equal(epochBefore)
		expect(usdBalanceBefore.sub(usdBalanceAfter)).to.equal(toUSDC(liquidityPoolUsdcDeposit))
		expect(lpBalanceBefore.sub(lpBalanceAfter)).to.equal(0)
		expect(lpusdBalanceAfter.sub(lpusdBalanceBefore)).to.equal(toUSDC(liquidityPoolUsdcDeposit))
		expect(lplpBalanceBefore.sub(lplpBalanceAfter)).to.equal(0)
		expect(epochAfter).to.equal(epochBefore)
		expect(pendingDepositAfter.sub(pendingDepositBefore)).to.equal(toUSDC(liquidityPoolUsdcDeposit))
		expect(depositReceiptBefore.epoch).to.equal(0)
		expect(depositReceiptAfter.epoch).to.equal(epochBefore).to.equal(epochAfter)
		expect(depositReceiptAfter.amount.sub(depositReceiptBefore.amount)).to.equal(
			toUSDC(liquidityPoolUsdcDeposit)
		)
		expect(depositReceiptAfter.unredeemedShares.sub(depositReceiptBefore.unredeemedShares)).to.equal(
			0
		)
		expect(depositReceiptAfter.unredeemedShares).to.equal(0)
	})
	it("Succeeds: pauses trading", async () => {
		await liquidityPool.pauseTradingAndRequest()
		expect(await liquidityPool.isTradingPaused()).to.be.true
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		await portfolioValuesFeed.fulfill(
			weth.address,
			usd.address,
		)
	})
	it("Succeeds: execute epoch", async () => {
		const epochBefore = await liquidityPool.epoch()
		const pendingDepositBefore = await liquidityPool.pendingDeposits()
		await liquidityPool.executeEpochCalculation()
		const lplpBalanceAfter = await liquidityPool.balanceOf(liquidityPool.address)
		expect(await liquidityPool.epochPricePerShare(epochBefore)).to.equal(toWei("1"))
		expect(await liquidityPool.pendingDeposits()).to.equal(0)
		expect(await liquidityPool.isTradingPaused()).to.be.false
		expect(await liquidityPool.epoch()).to.equal(epochBefore.add(1))
		expect(pendingDepositBefore.mul(collatDecimalShift)).to.equal(lplpBalanceAfter)
	})
	it("can compute portfolio delta", async function () {
		const delta = await liquidityPool.getPortfolioDelta()
		// no options have been written yet
		expect(delta).to.equal(0)
	})
	let optionToken: IOToken
	let customOrderPrice: number
	let customOrderId: number
	it("Creates a buy order", async () => {
		let customOrderPriceMultiplier = 0.93
		const [sender, receiver] = signers
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const collateralAllocatedBefore = await liquidityPool.collateralAllocated()
		const lpUSDBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const strikePrice = priceQuote.sub(toWei("600"))
		const amount = toWei("10")
		const orderExpiry = 10
		const proposedSeries = {
			expiration: expiration,
			strike: BigNumber.from(strikePrice),
			isPut: true,
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const localQuote = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			proposedSeries,
			amount
		)
		customOrderPrice = localQuote * customOrderPriceMultiplier
		const createOrder = await handler.createOrder(
			proposedSeries,
			amount,
			toWei(customOrderPrice.toString()).mul(toWei("1")).div(amount),
			orderExpiry,
			receiverAddress
		)

		const collateralAllocatedAfter = await liquidityPool.collateralAllocated()
		const lpUSDBalanceAfter = await usd.balanceOf(liquidityPool.address)

		const receipt = await createOrder.wait()
		const events = receipt.events
		const createOrderEvents = events?.find(x => x.event == "OrderCreated")
		customOrderId = createOrderEvents?.args?.orderId
		const order = await handler.orderStores(customOrderId)
		// check saved order details are correct
		expect(order.optionSeries.expiration).to.eq(proposedSeries.expiration)
		expect(order.optionSeries.isPut).to.eq(proposedSeries.isPut)
		expect(
			order.optionSeries.strike.sub(proposedSeries.strike.div(oTokenDecimalShift18))
		).to.be.within(-100, 0)
		expect(order.optionSeries.underlying).to.eq(proposedSeries.underlying)
		expect(order.optionSeries.strikeAsset).to.eq(proposedSeries.strikeAsset)
		expect(order.optionSeries.collateral).to.eq(proposedSeries.collateral)
		expect(order.amount).to.eq(amount)
		expect(order.price).to.eq(toWei(customOrderPrice.toString()).mul(toWei("1")).div(amount))
		expect(order.buyer).to.eq(receiverAddress)
		const seriesInfo = await optionRegistry.getSeriesInfo(order.seriesAddress)
		// check series info for OToken is correct
		expect(order.optionSeries.expiration).to.eq(seriesInfo.expiration.toString())
		expect(order.optionSeries.isPut).to.eq(seriesInfo.isPut)
		expect(order.optionSeries.strike).to.eq(seriesInfo.strike)
		expect(await handler.orderIdCounter()).to.eq(1)
		optionToken = new Contract(order.seriesAddress, Otoken.abi, receiver) as IOToken
		expect(collateralAllocatedBefore).to.eq(collateralAllocatedAfter)
		expect(lpUSDBalanceBefore).to.eq(lpUSDBalanceAfter)
	})
	let customOrderPriceCall: number
	let customOrderPricePut: number
	let customStranglePrice: number
	let strangleCallId: number
	let stranglePutId: number
	let strangleCallToken: IOToken
	let stranglePutToken: IOToken
	it("creates a custom strangle order", async () => {
		let customOrderPriceMultiplier = 0.93
		const [sender, receiver] = signers
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const orderIdBefore = await handler.orderIdCounter()
		const strikePriceCall = priceQuote.add(toWei("1400"))
		const strikePricePut = priceQuote.sub(toWei("900"))
		const lpUSDBalanceBefore = await usd.balanceOf(liquidityPool.address)

		const amount = toWei("10")
		const orderExpiry = 600 // 10 minutes
		const proposedSeriesCall = {
			expiration: expiration,
			strike: BigNumber.from(strikePriceCall),
			isPut: false,
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const proposedSeriesPut = {
			expiration: expiration,
			strike: BigNumber.from(strikePricePut),
			isPut: true,
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const localQuoteCall = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			proposedSeriesCall,
			amount
		)
		const localQuotePut = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			proposedSeriesPut,
			amount
		)
		customOrderPriceCall = localQuoteCall * customOrderPriceMultiplier
		customOrderPricePut = localQuotePut * customOrderPriceMultiplier
		customStranglePrice = customOrderPriceCall + customOrderPricePut
		const createStrangle = await handler.createStrangle(
			proposedSeriesCall,
			proposedSeriesPut,
			amount,
			amount,
			toWei(customOrderPriceCall.toString()).mul(toWei("1")).div(amount),
			toWei(customOrderPricePut.toString()).mul(toWei("1")).div(amount),
			orderExpiry,
			receiverAddress
		)

		const receipt = await createStrangle.wait()
		const events = receipt.events
		const createOrderEvents = events?.filter(x => x.event == "OrderCreated") as any
		expect(createOrderEvents?.length).to.eq(2)
		expect(parseInt(createOrderEvents[0].args?.orderId) + 1).to.eq(createOrderEvents[1].args?.orderId)
		strangleCallId = createOrderEvents[0].args?.orderId
		stranglePutId = createOrderEvents[1].args?.orderId
		const callOrder = await handler.orderStores(strangleCallId)
		const putOrder = await handler.orderStores(stranglePutId)
		strangleCallToken = new Contract(callOrder.seriesAddress, Otoken.abi, sender) as IOToken
		stranglePutToken = new Contract(putOrder.seriesAddress, Otoken.abi, sender) as IOToken
		const orderIdAfter = await handler.orderIdCounter()
		const lpUSDBalanceAfter = await usd.balanceOf(liquidityPool.address)

		// check order details are correct
		expect(callOrder.optionSeries.isPut).to.be.false
		expect(putOrder.optionSeries.isPut).to.be.true
		// check expiries are the same
		expect(callOrder.optionSeries.expiration).to.eq(proposedSeriesCall.expiration)
		expect(callOrder.optionSeries.expiration).to.eq(putOrder.optionSeries.expiration)
		expect(
			callOrder.optionSeries.strike.sub(proposedSeriesCall.strike.div(oTokenDecimalShift18))
		).to.be.within(-100, 0)
		expect(
			putOrder.optionSeries.strike.sub(proposedSeriesPut.strike.div(oTokenDecimalShift18))
		).to.be.within(-100, 0)
		expect(callOrder.optionSeries.strikeAsset).to.eq(proposedSeriesCall.strikeAsset)
		expect(putOrder.optionSeries.strikeAsset).to.eq(proposedSeriesPut.strikeAsset)
		expect(callOrder.optionSeries.collateral).to.eq(proposedSeriesCall.collateral)
		expect(putOrder.optionSeries.collateral).to.eq(proposedSeriesPut.collateral)
		expect(callOrder.amount).to.eq(amount)
		expect(putOrder.amount).to.eq(amount)
		// check order ID increases by 2
		expect(orderIdAfter).to.eq(orderIdBefore.add(2))
		// balances are unchanged
		expect(lpUSDBalanceBefore).to.eq(lpUSDBalanceAfter)
	})

	it("Cant make a buy order if not admin", async () => {
		const [sender, receiver] = signers
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const collateralAllocatedBefore = await liquidityPool.collateralAllocated()
		const lpUSDBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const strikePrice = priceQuote.sub(toWei(strike).add(100))
		const amount = toWei("1")
		const pricePer = toWei("1000")
		const orderExpiry = 10
		const proposedSeries = {
			expiration: expiration,
			strike: BigNumber.from(strikePrice),
			isPut: true,
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		await expect(
			handler
				.connect(receiver)
				.createOrder(proposedSeries, amount, pricePer, orderExpiry, receiverAddress)
		).to.be.reverted

		const collateralAllocatedAfter = await liquidityPool.collateralAllocated()
		const lpUSDBalanceAfter = await usd.balanceOf(liquidityPool.address)
		// check balances are unchanged
		expect(collateralAllocatedBefore).to.eq(collateralAllocatedAfter)
		expect(lpUSDBalanceBefore).to.eq(lpUSDBalanceAfter)
	})
	it("Create buy order reverts if price is zero", async () => {
		const [sender, receiver] = signers
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const strikePrice = priceQuote.sub(toWei(strike).add(100))
		const amount = toWei("1")
		const pricePer = 0
		const orderExpiry = 10
		const proposedSeries = {
			expiration: expiration,
			isPut: true,
			strike: BigNumber.from(strikePrice),
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		await expect(
			handler.createOrder(proposedSeries, amount, pricePer, orderExpiry, receiverAddress)
		).to.be.revertedWith("InvalidPrice()")
	})
	it("Create buy order reverts if order expiry too long", async () => {
		const [sender, receiver] = signers
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const strikePrice = priceQuote.sub(toWei(strike).add(100))
		const amount = toWei("1")
		const pricePer = toWei("1000")
		const orderExpiry = 2000 // 1800 is max
		const proposedSeries = {
			expiration: expiration,
			isPut: true,
			strike: BigNumber.from(strikePrice),
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		await expect(
			handler.createOrder(proposedSeries, amount, pricePer, orderExpiry, receiverAddress)
		).to.be.revertedWith("OrderExpiryTooLong()")
	})
	it("cant exercise order if not buyer", async () => {
		await expect(handler.executeOrder(1)).to.be.revertedWith("InvalidBuyer()")
	})
	it("Executes a buy order", async () => {
		const [sender, receiver] = signers
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const lpUSDBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const collateralAllocatedBefore = await liquidityPool.collateralAllocated()
		const buyerBalBefore = await usd.balanceOf(receiverAddress)
		const receiverBalBefore = await usd.balanceOf(receiverAddress)
		const orderDeets = await handler.orderStores(customOrderId)
		const prevalues = await portfolioValuesFeed.getPortfolioValues(weth.address, usd.address)
		const ephemeralDeltaBefore = await liquidityPool.ephemeralDelta()
		const ephemeralLiabilitiesBefore = await liquidityPool.ephemeralLiabilities()

		const expectedCollateralAllocated = await optionRegistry.getCollateral(
			{
				expiration: orderDeets.optionSeries.expiration,
				isPut: orderDeets.optionSeries.isPut,
				strike: orderDeets.optionSeries.strike, // keep e8
				strikeAsset: orderDeets.optionSeries.strikeAsset,
				underlying: orderDeets.optionSeries.underlying,
				collateral: orderDeets.optionSeries.collateral
			},
			orderDeets.amount
		)
		const localDelta = await calculateOptionDeltaLocally(
			liquidityPool,
			priceFeed,
			{
				expiration: orderDeets.optionSeries.expiration.toNumber(),
				strike: orderDeets.optionSeries.strike.mul(10 ** 10), // format to e18
				isPut: orderDeets.optionSeries.isPut,
				underlying: orderDeets.optionSeries.underlying,
				strikeAsset: orderDeets.optionSeries.strikeAsset,
				collateral: orderDeets.optionSeries.collateral
			},
			orderDeets.amount,
			true
		)
		const deltaBefore = tFormatEth(await liquidityPool.getPortfolioDelta())
		const localQuote = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			{
				expiration: orderDeets.optionSeries.expiration.toNumber(),
				strike: orderDeets.optionSeries.strike.mul(10 ** 10), // format to e18
				isPut: orderDeets.optionSeries.isPut,
				underlying: orderDeets.optionSeries.underlying,
				strikeAsset: orderDeets.optionSeries.strikeAsset,
				collateral: orderDeets.optionSeries.collateral
			},
			orderDeets.amount,
			false
		)

		await usd.connect(receiver).approve(handler.address, 100000000000)
		await optionToken.approve(handler.address, toOpyn(fromWei(orderDeets.amount)))
		await handler.connect(receiver).executeOrder(customOrderId)

		// check ephemeral values update correctly
		const ephemeralLiabilitiesDiff =
			tFormatEth(await liquidityPool.ephemeralLiabilities()) - tFormatEth(ephemeralLiabilitiesBefore)
		const ephemeralDeltaDiff =
			tFormatEth(await liquidityPool.ephemeralDelta()) - tFormatEth(ephemeralDeltaBefore)
		expect(ephemeralDeltaDiff - tFormatEth(localDelta)).to.be.within(-0.01, 0.01)
		expect(percentDiff(ephemeralLiabilitiesDiff, localQuote)).to.be.within(-0.01, 0.01)

		const deltaAfter = tFormatEth(await liquidityPool.getPortfolioDelta())
		await portfolioValuesFeed.fulfill(
			weth.address,
			usd.address,
		)

		// expect ephemeral values to be reset
		expect(await liquidityPool.ephemeralDelta()).to.eq(0)
		expect(await liquidityPool.ephemeralLiabilities()).to.eq(0)
		const receiverOTokenBalAfter = await optionToken.balanceOf(receiverAddress)
		const lpUSDBalanceAfter = await usd.balanceOf(liquidityPool.address)
		const lpOTokenBalAfter = await optionToken.balanceOf(liquidityPool.address)
		const buyerBalAfter = await usd.balanceOf(receiverAddress)
		const receiverBalAfter = await usd.balanceOf(receiverAddress)
		const collateralAllocatedAfter = await liquidityPool.collateralAllocated()
		const collateralAllocatedDiff = tFormatUSDC(
			collateralAllocatedAfter.sub(collateralAllocatedBefore)
		)
		const buyerUSDBalanceDiff = buyerBalBefore.sub(buyerBalAfter)
		const lpUSDBalanceDiff = lpUSDBalanceAfter.sub(lpUSDBalanceBefore)

		const order = await handler.orderStores(customOrderId)
		// order should be non existant
		expect(order.buyer).to.eq(ZERO_ADDRESS)
		// check buyer's OToken balanc increases by correct amount
		expect(fromOpyn(receiverOTokenBalAfter.toString())).to.eq(fromWei(orderDeets.amount.toString()))
		// liquidity pool holds no tokens
		expect(lpOTokenBalAfter).to.eq(0)
		expect(
			tFormatUSDC(buyerUSDBalanceDiff) -
				parseFloat(fromWei(orderDeets.amount)) * tFormatEth(orderDeets.price)
		).to.be.within(-0.01, 0.01)
		// check collateralAllocated is correct
		expect(collateralAllocatedDiff).to.eq(tFormatUSDC(expectedCollateralAllocated))
		// check buyer's USD balance decreases by correct amount
		expect(
			receiverBalBefore
				.sub(receiverBalAfter)
				.sub(BigNumber.from(Math.floor(customOrderPrice * 10 ** 6).toString()))
		).to.be.within(-1, 1)
		// check liquidity pool USD balance increases by agreed price minus collateral
		expect(
			tFormatUSDC(lpUSDBalanceDiff) -
				(tFormatEth(orderDeets.amount) * tFormatEth(orderDeets.price) -
					tFormatUSDC(expectedCollateralAllocated))
		).to.be.within(-0.015, 0.015)
		// check delta changes by expected amount
		expect(deltaAfter.toPrecision(3)).to.eq((deltaBefore + tFormatEth(localDelta)).toPrecision(3))
	})
	it("executes a strangle", async () => {
		const [sender, receiver] = signers
		// add more liquidity to stop buffer reached error
		await usd.approve(liquidityPool.address, toUSDC(liquidityPoolUsdcDeposit).mul(2))
		await liquidityPool.deposit(toUSDC(liquidityPoolUsdcDeposit).mul(2))
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const receiverOTokenBalBef = (await strangleCallToken.balanceOf(receiverAddress)).add(
			await stranglePutToken.balanceOf(receiverAddress)
		)
		const lpUSDBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const collateralAllocatedBefore = await liquidityPool.collateralAllocated()
		const receiverUSDBalBefore = await usd.balanceOf(receiverAddress)
		const deltaBefore = tFormatEth(await liquidityPool.getPortfolioDelta())
		const ephemeralDeltaBefore = await liquidityPool.ephemeralDelta()
		const ephemeralLiabilitiesBefore = await liquidityPool.ephemeralLiabilities()

		const orderDeets1 = await handler.orderStores(strangleCallId)
		const orderDeets2 = await handler.orderStores(stranglePutId)
		const prevalues = await portfolioValuesFeed.getPortfolioValues(weth.address, usd.address)

		const localDelta1 = await calculateOptionDeltaLocally(
			liquidityPool,
			priceFeed,
			{
				expiration: orderDeets1.optionSeries.expiration.toNumber(),
				strike: orderDeets1.optionSeries.strike.mul(10 ** 10),
				isPut: orderDeets1.optionSeries.isPut,
				underlying: orderDeets1.optionSeries.underlying,
				strikeAsset: orderDeets1.optionSeries.strikeAsset,
				collateral: orderDeets1.optionSeries.collateral
			},
			orderDeets1.amount,
			true
		)
		const localQuote1 = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			{
				expiration: orderDeets1.optionSeries.expiration.toNumber(),
				strike: orderDeets1.optionSeries.strike.mul(10 ** 10),
				isPut: orderDeets1.optionSeries.isPut,
				underlying: orderDeets1.optionSeries.underlying,
				strikeAsset: orderDeets1.optionSeries.strikeAsset,
				collateral: orderDeets1.optionSeries.collateral
			},
			orderDeets1.amount,
			false
		)
		const localDelta2 = await calculateOptionDeltaLocally(
			liquidityPool,
			priceFeed,
			{
				expiration: orderDeets2.optionSeries.expiration.toNumber(),
				strike: orderDeets2.optionSeries.strike.mul(10 ** 10),
				isPut: orderDeets2.optionSeries.isPut,
				underlying: orderDeets2.optionSeries.underlying,
				strikeAsset: orderDeets2.optionSeries.strikeAsset,
				collateral: orderDeets2.optionSeries.collateral
			},
			orderDeets2.amount,
			true
		)
		const localQuote2 = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			{
				expiration: orderDeets2.optionSeries.expiration.toNumber(),
				strike: orderDeets2.optionSeries.strike.mul(10 ** 10),
				isPut: orderDeets2.optionSeries.isPut,
				underlying: orderDeets2.optionSeries.underlying,
				strikeAsset: orderDeets2.optionSeries.strikeAsset,
				collateral: orderDeets2.optionSeries.collateral
			},
			orderDeets2.amount,
			false
		)
		const localDelta = localDelta1.add(localDelta2)
		const localQuote = localQuote1 + localQuote2
		const expectedCollateralAllocated = (
			await optionRegistry.getCollateral(
				{
					expiration: orderDeets1.optionSeries.expiration,
					isPut: orderDeets1.optionSeries.isPut,
					strike: orderDeets1.optionSeries.strike, // keep e8
					strikeAsset: orderDeets1.optionSeries.strikeAsset,
					underlying: orderDeets1.optionSeries.underlying,
					collateral: orderDeets1.optionSeries.collateral
				},
				orderDeets1.amount
			)
		).add(
			await optionRegistry.getCollateral(
				{
					expiration: orderDeets2.optionSeries.expiration,
					isPut: orderDeets2.optionSeries.isPut,
					strike: orderDeets2.optionSeries.strike, // keep e8
					strikeAsset: orderDeets2.optionSeries.strikeAsset,
					underlying: orderDeets2.optionSeries.underlying,
					collateral: orderDeets2.optionSeries.collateral
				},
				orderDeets2.amount
			)
		)

		await usd.connect(receiver).approve(liquidityPool.address, 1000000000)
		await handler.connect(receiver).executeStrangle(strangleCallId, stranglePutId)

		// check ephemeral values update correctly
		const ephemeralLiabilitiesDiff =
			tFormatEth(await liquidityPool.ephemeralLiabilities()) - tFormatEth(ephemeralLiabilitiesBefore)
		const ephemeralDeltaDiff =
			tFormatEth(await liquidityPool.ephemeralDelta()) - tFormatEth(ephemeralDeltaBefore)
		expect(ephemeralDeltaDiff - tFormatEth(localDelta)).to.be.within(-0.01, 0.01)
		expect(percentDiff(ephemeralLiabilitiesDiff, localQuote)).to.be.within(-0.01, 0.01)
		await portfolioValuesFeed.fulfill(
			weth.address,
			usd.address,
		)

		// expect ephemeral values to be reset
		expect(await liquidityPool.ephemeralDelta()).to.eq(0)
		expect(await liquidityPool.ephemeralLiabilities()).to.eq(0)
		const receiverUSDBalAfter = await usd.balanceOf(receiverAddress)
		const receiverOTokenBalAfter = (await strangleCallToken.balanceOf(receiverAddress)).add(
			await stranglePutToken.balanceOf(receiverAddress)
		)
		const collateralAllocatedAfter = await liquidityPool.collateralAllocated()
		const collateralAllocatedDiff = tFormatUSDC(
			collateralAllocatedAfter.sub(collateralAllocatedBefore)
		)
		const lpOTokenBalAfter = (await strangleCallToken.balanceOf(liquidityPool.address)).add(
			await stranglePutToken.balanceOf(liquidityPool.address)
		)
		const lpUSDBalanceAfter = await usd.balanceOf(liquidityPool.address)
		const deltaAfter = tFormatEth(await liquidityPool.getPortfolioDelta())

		const buyerUSDBalanceDiff = receiverUSDBalBefore.sub(receiverUSDBalAfter)
		const lpUSDBalanceDiff = lpUSDBalanceAfter.sub(lpUSDBalanceBefore)

		const orderCall = await handler.orderStores(strangleCallId)
		const orderPut = await handler.orderStores(stranglePutId)
		// order should be non existant
		expect(orderPut.buyer).to.eq(ZERO_ADDRESS)
		expect(orderCall.buyer).to.eq(ZERO_ADDRESS)
		// check buyer's OToken balance increases bycoreect amount
		expect(fromOpyn(receiverOTokenBalAfter.sub(receiverOTokenBalBef).toString())).to.equal(
			fromWei(orderDeets1.amount.add(orderDeets2.amount).toString())
		)

		// liquidity pool holds no tokens
		expect(lpOTokenBalAfter).to.eq(0)

		// check buyer's USDC balance decreases by expected amount
		expect(
			receiverUSDBalBefore
				.sub(receiverUSDBalAfter)
				.sub(BigNumber.from(Math.floor(customStranglePrice * 10 ** 6).toString()))
		).to.be.within(-1, 1)
		expect(
			tFormatUSDC(buyerUSDBalanceDiff) -
				(parseFloat(fromWei(orderDeets1.amount)) * tFormatEth(orderDeets1.price) +
					parseFloat(fromWei(orderDeets2.amount)) * tFormatEth(orderDeets2.price))
		).to.be.within(-0.02, 0.02)
		// check collateralAllocated is correct
		expect(collateralAllocatedDiff).to.eq(tFormatUSDC(expectedCollateralAllocated))
		// check liquidity pool USD balance increases by agreed price minus collateral
		expect(
			tFormatUSDC(lpUSDBalanceDiff) -
				(tFormatEth(orderDeets1.amount) * tFormatEth(orderDeets1.price) +
					tFormatEth(orderDeets2.amount) * tFormatEth(orderDeets2.price) -
					tFormatUSDC(expectedCollateralAllocated))
		).to.be.within(-0.02, 0.02)
		// check delta changes by expected amount
		expect(deltaAfter.toPrecision(3)).to.eq((deltaBefore + tFormatEth(localDelta)).toPrecision(3))
	})
	it("Creates a buy order", async () => {
		let customOrderPriceMultiplier = 0.93
		const [sender, receiver] = signers
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const collateralAllocatedBefore = await liquidityPool.collateralAllocated()
		const lpUSDBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const strikePrice = priceQuote.sub(toWei("590"))
		const amount = toWei("10")
		const orderExpiry = 10
		const proposedSeries = {
			expiration: expiration,
			strike: BigNumber.from(strikePrice),
			isPut: true,
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const localQuote = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			proposedSeries,
			amount
		)
		customOrderPrice = localQuote * customOrderPriceMultiplier
		const createOrder = await handler.createOrder(
			proposedSeries,
			amount,
			toWei(customOrderPrice.toString()).mul(toWei("1")).div(amount),
			orderExpiry,
			receiverAddress
		)

		const collateralAllocatedAfter = await liquidityPool.collateralAllocated()
		const lpUSDBalanceAfter = await usd.balanceOf(liquidityPool.address)

		const receipt = await createOrder.wait()
		const events = receipt.events
		const createOrderEvents = events?.find(x => x.event == "OrderCreated")
		customOrderId = createOrderEvents?.args?.orderId
		const order = await handler.orderStores(customOrderId)
		// check saved order details are correct
		expect(order.optionSeries.expiration).to.eq(proposedSeries.expiration)
		expect(order.optionSeries.isPut).to.eq(proposedSeries.isPut)
		expect(
			order.optionSeries.strike.sub(proposedSeries.strike.div(oTokenDecimalShift18))
		).to.be.within(-100, 0)
		expect(order.optionSeries.underlying).to.eq(proposedSeries.underlying)
		expect(order.optionSeries.strikeAsset).to.eq(proposedSeries.strikeAsset)
		expect(order.optionSeries.collateral).to.eq(proposedSeries.collateral)
		expect(order.amount).to.eq(amount)
		expect(order.price).to.eq(toWei(customOrderPrice.toString()).mul(toWei("1")).div(amount))
		expect(order.buyer).to.eq(receiverAddress)
		const seriesInfo = await optionRegistry.getSeriesInfo(order.seriesAddress)
		// check series info for OToken is correct
		expect(order.optionSeries.expiration).to.eq(seriesInfo.expiration.toString())
		expect(order.optionSeries.isPut).to.eq(seriesInfo.isPut)
		expect(order.optionSeries.strike).to.eq(seriesInfo.strike)
		expect(await handler.orderIdCounter()).to.eq(4)
		optionToken = new Contract(order.seriesAddress, Otoken.abi, receiver) as IOToken
		expect(collateralAllocatedBefore).to.eq(collateralAllocatedAfter)
		expect(lpUSDBalanceBefore).to.eq(lpUSDBalanceAfter)
	})
	it("Executes a buy order", async () => {
		const [sender, receiver] = signers
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const lpUSDBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const collateralAllocatedBefore = await liquidityPool.collateralAllocated()
		const buyerBalBefore = await usd.balanceOf(receiverAddress)
		const receiverBalBefore = await usd.balanceOf(receiverAddress)
		const orderDeets = await handler.orderStores(customOrderId)
		const prevalues = await portfolioValuesFeed.getPortfolioValues(weth.address, usd.address)
		const ephemeralDeltaBefore = await liquidityPool.ephemeralDelta()
		const ephemeralLiabilitiesBefore = await liquidityPool.ephemeralLiabilities()

		const expectedCollateralAllocated = await optionRegistry.getCollateral(
			{
				expiration: orderDeets.optionSeries.expiration,
				isPut: orderDeets.optionSeries.isPut,
				strike: orderDeets.optionSeries.strike, // keep e8
				strikeAsset: orderDeets.optionSeries.strikeAsset,
				underlying: orderDeets.optionSeries.underlying,
				collateral: orderDeets.optionSeries.collateral
			},
			orderDeets.amount
		)
		const localDelta = await calculateOptionDeltaLocally(
			liquidityPool,
			priceFeed,
			{
				expiration: orderDeets.optionSeries.expiration.toNumber(),
				strike: orderDeets.optionSeries.strike.mul(10 ** 10), // format to e18
				isPut: orderDeets.optionSeries.isPut,
				underlying: orderDeets.optionSeries.underlying,
				strikeAsset: orderDeets.optionSeries.strikeAsset,
				collateral: orderDeets.optionSeries.collateral
			},
			orderDeets.amount,
			true
		)
		const deltaBefore = tFormatEth(await liquidityPool.getPortfolioDelta())
		const localQuote = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			{
				expiration: orderDeets.optionSeries.expiration.toNumber(),
				strike: orderDeets.optionSeries.strike.mul(10 ** 10), // format to e18
				isPut: orderDeets.optionSeries.isPut,
				underlying: orderDeets.optionSeries.underlying,
				strikeAsset: orderDeets.optionSeries.strikeAsset,
				collateral: orderDeets.optionSeries.collateral
			},
			orderDeets.amount,
			false
		)

		await usd.connect(receiver).approve(handler.address, 100000000000)
		await optionToken.approve(handler.address, toOpyn(fromWei(orderDeets.amount)))
		await handler.connect(receiver).executeOrder(customOrderId)

		// check ephemeral values update correctly
		const ephemeralLiabilitiesDiff =
			tFormatEth(await liquidityPool.ephemeralLiabilities()) - tFormatEth(ephemeralLiabilitiesBefore)
		const ephemeralDeltaDiff =
			tFormatEth(await liquidityPool.ephemeralDelta()) - tFormatEth(ephemeralDeltaBefore)
		expect(ephemeralDeltaDiff - tFormatEth(localDelta)).to.be.within(-0.01, 0.01)
		expect(percentDiff(ephemeralLiabilitiesDiff, localQuote)).to.be.within(-0.01, 0.01)

		const deltaAfter = tFormatEth(await liquidityPool.getPortfolioDelta())
		await portfolioValuesFeed.fulfill(
			weth.address,
			usd.address,
		)

		// expect ephemeral values to be reset
		expect(await liquidityPool.ephemeralDelta()).to.eq(0)
		expect(await liquidityPool.ephemeralLiabilities()).to.eq(0)
		const receiverOTokenBalAfter = await optionToken.balanceOf(receiverAddress)
		const lpUSDBalanceAfter = await usd.balanceOf(liquidityPool.address)
		const lpOTokenBalAfter = await optionToken.balanceOf(liquidityPool.address)
		const buyerBalAfter = await usd.balanceOf(receiverAddress)
		const receiverBalAfter = await usd.balanceOf(receiverAddress)
		const collateralAllocatedAfter = await liquidityPool.collateralAllocated()
		const collateralAllocatedDiff = tFormatUSDC(
			collateralAllocatedAfter.sub(collateralAllocatedBefore)
		)
		const buyerUSDBalanceDiff = buyerBalBefore.sub(buyerBalAfter)
		const lpUSDBalanceDiff = lpUSDBalanceAfter.sub(lpUSDBalanceBefore)

		const order = await handler.orderStores(customOrderId)
		// order should be non existant
		expect(order.buyer).to.eq(ZERO_ADDRESS)
		// check buyer's OToken balanc increases by correct amount
		expect(fromOpyn(receiverOTokenBalAfter.toString())).to.eq(fromWei(orderDeets.amount.toString()))
		// liquidity pool holds no tokens
		expect(lpOTokenBalAfter).to.eq(0)
		expect(
			tFormatUSDC(buyerUSDBalanceDiff) -
				parseFloat(fromWei(orderDeets.amount)) * tFormatEth(orderDeets.price)
		).to.be.within(-0.01, 0.01)
		// check collateralAllocated is correct
		expect(collateralAllocatedDiff).to.eq(tFormatUSDC(expectedCollateralAllocated))
		// check buyer's USD balance decreases by correct amount
		expect(
			receiverBalBefore
				.sub(receiverBalAfter)
				.sub(BigNumber.from(Math.floor(customOrderPrice * 10 ** 6).toString()))
		).to.be.within(-1, 1)
		// check liquidity pool USD balance increases by agreed price minus collateral
		expect(
			tFormatUSDC(lpUSDBalanceDiff) -
				(tFormatEth(orderDeets.amount) * tFormatEth(orderDeets.price) -
					tFormatUSDC(expectedCollateralAllocated))
		).to.be.within(-0.015, 0.015)
		// check delta changes by expected amount
		expect(deltaAfter.toPrecision(3)).to.eq((deltaBefore + tFormatEth(localDelta)).toPrecision(3))
	})
	it("Cannot complete buy order after expiry", async () => {
		const [sender, receiver] = signers
		const ephemeralDeltaBefore = await liquidityPool.ephemeralDelta()
		const ephemeralLiabilitiesBefore = await liquidityPool.ephemeralLiabilities()
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const strikePrice = priceQuote.sub(toWei(strike).add(100))
		const amount = toWei("1")
		const pricePer = toWei("10")
		const orderExpiry = 1200 // order valid for 20 minutes
		const proposedSeries = {
			expiration: expiration,
			strike: BigNumber.from(strikePrice),
			isPut: true,
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const createOrdertx = await handler.createOrder(
			proposedSeries,
			amount,
			pricePer,
			orderExpiry,
			receiverAddress
		)
		const receipt = await createOrdertx.wait(1)
		const events = receipt.events
		const createOrderEvent = events?.find(x => x.event == "OrderCreated")
		const orderId = createOrderEvent?.args?.orderId
		const order = await handler.orderStores(orderId)
		const ephemeralDeltaAfter = await liquidityPool.ephemeralDelta()
		const ephemeralLiabilitiesAfter = await liquidityPool.ephemeralLiabilities()
		expect(ephemeralLiabilitiesBefore).to.eq(ephemeralLiabilitiesAfter)
		expect(ephemeralDeltaBefore).to.eq(ephemeralDeltaAfter)
		expect(order.optionSeries.expiration).to.eq(proposedSeries.expiration)
		expect(order.optionSeries.isPut).to.eq(proposedSeries.isPut)
		expect(
			order.optionSeries.strike.sub(proposedSeries.strike.div(oTokenDecimalShift18))
		).to.be.within(-100, 0)
		expect(order.optionSeries.underlying).to.eq(proposedSeries.underlying)
		expect(order.optionSeries.strikeAsset).to.eq(proposedSeries.strikeAsset)
		expect(order.optionSeries.collateral).to.eq(proposedSeries.collateral)
		expect(order.amount).to.eq(amount)
		expect(order.price).to.eq(pricePer)
		expect(order.buyer).to.eq(receiverAddress)
		const seriesInfo = await optionRegistry.getSeriesInfo(order.seriesAddress)
		expect(order.optionSeries.expiration).to.eq(seriesInfo.expiration.toString())
		expect(order.optionSeries.isPut).to.eq(seriesInfo.isPut)
		expect(order.optionSeries.strike).to.eq(seriesInfo.strike)
		expect(await handler.orderIdCounter()).to.eq(orderId)
		optionToken = new Contract(order.seriesAddress, Otoken.abi, sender) as IOToken
		increase(1201)
		const prevalues = await portfolioValuesFeed.getPortfolioValues(weth.address, usd.address)
		await portfolioValuesFeed.fulfill(
			weth.address,
			usd.address,
		)

		// expect ephemeral values to be reset
		expect(await liquidityPool.ephemeralDelta()).to.eq(0)
		expect(await liquidityPool.ephemeralLiabilities()).to.eq(0)
		await expect(handler.connect(receiver).executeOrder(orderId)).to.be.revertedWith("OrderExpired()")
	})
	it("fails to execute invalid custom orders", async () => {
		let customOrderPriceMultiplier = 0.93
		let customOrderPriceMultiplierInvalid = 0.89 // below 10% buffer
		const [sender, receiver] = signers
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const strikePriceInvalidDeltaCall = priceQuote.add(toWei("10")) // delta will be too high
		const strikePriceInvalidDeltaPut = priceQuote.sub(toWei("10")) // delta will be too high
		const strikePriceInvalidPrice = priceQuote.add(toWei("1500"))
		const amount = toWei("1")
		const orderExpiry = 600 // 10 minutes
		const proposedSeriesInvalidDeltaCall = {
			expiration: expiration,
			isPut: false,
			strike: BigNumber.from(strikePriceInvalidDeltaCall),
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const proposedSeriesInvalidDeltaPut = {
			expiration: expiration,
			isPut: true,
			strike: BigNumber.from(strikePriceInvalidDeltaPut),
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const proposedSeriesInvalidPrice = {
			expiration: expiration,
			strike: BigNumber.from(strikePriceInvalidPrice),
			isPut: false,
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const localQuoteInvalidDeltaCall = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			proposedSeriesInvalidDeltaCall,
			amount
		)
		const localQuoteInvalidDeltaPut = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			proposedSeriesInvalidDeltaPut,
			amount
		)
		const localQuoteInvalidPrice = await calculateOptionQuoteLocally(
			liquidityPool,
			optionRegistry,
			usd,
			priceFeed,
			proposedSeriesInvalidPrice,
			amount
		)
		const customOrderPriceInvalidDeltaCall = localQuoteInvalidDeltaCall * customOrderPriceMultiplier
		const customOrderPriceInvalidDeltaPut = localQuoteInvalidDeltaPut * customOrderPriceMultiplier

		const customOrderPriceInvalidPrice = localQuoteInvalidPrice * customOrderPriceMultiplierInvalid
		// create invalid delta call option order
		const createOrderInvalidDeltaCall = await handler.createOrder(
			proposedSeriesInvalidDeltaCall,
			amount,
			toWei(customOrderPriceInvalidDeltaCall.toString()),
			orderExpiry,
			receiverAddress
		)

		const receipt = await createOrderInvalidDeltaCall.wait(1)
		const events = receipt.events
		const createOrderEvent = events?.find(x => x.event == "OrderCreated")
		const invalidDeltaCallOrderId = createOrderEvent?.args?.orderId

		// create invalid delta put order
		const createOrderInvalidDeltaPut = await handler.createOrder(
			proposedSeriesInvalidDeltaPut,
			amount,
			toWei(customOrderPriceInvalidDeltaPut.toString()),
			orderExpiry,
			receiverAddress
		)

		const receipt3 = await createOrderInvalidDeltaPut.wait(1)
		const events3 = receipt3.events
		const createOrderEvent3 = events3?.find(x => x.event == "OrderCreated")
		const invalidDeltaPutOrderId = createOrderEvent3?.args?.orderId

		// create invalid price option series
		const createOrderInvalidPrice = await handler.createOrder(
			proposedSeriesInvalidPrice,
			amount,
			toWei(customOrderPriceInvalidPrice.toString()),
			orderExpiry,
			receiverAddress
		)

		const receipt2 = await createOrderInvalidPrice.wait(1)
		const events2 = receipt2.events
		const createOrderEvent2 = events2?.find(x => x.event == "OrderCreated")
		const invalidPriceOrderId = createOrderEvent2?.args?.orderId

		await expect(handler.connect(receiver).executeOrder(invalidDeltaCallOrderId)).to.be.revertedWith(
			"CustomOrderInvalidDeltaValue()"
		)
		await expect(handler.connect(receiver).executeOrder(invalidDeltaPutOrderId)).to.be.revertedWith(
			"CustomOrderInvalidDeltaValue()"
		)

		await expect(handler.connect(receiver).executeOrder(invalidPriceOrderId)).to.be.revertedWith(
			"CustomOrderInsufficientPrice()"
		)
	})
	it("Succeeds: User 2: Deposit to the liquidityPool", async () => {
		const user = receiverAddress
		const usdBalanceBefore = await usd.balanceOf(user)
		const lpBalanceBefore = await liquidityPool.balanceOf(user)
		const lpusdBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const lplpBalanceBefore = await liquidityPool.balanceOf(liquidityPool.address)
		const epochBefore = await liquidityPool.epoch()
		const depositReceiptBefore = await liquidityPool.depositReceipts(user)
		const pendingDepositBefore = await liquidityPool.pendingDeposits()
		await usd.connect(signers[1]).approve(liquidityPool.address, toUSDC(liquidityPoolUsdcDeposit))
		expect(
			await liquidityPool.connect(signers[1]).callStatic.deposit(toUSDC(liquidityPoolUsdcDeposit))
		).to.be.true
		const deposit = await liquidityPool.connect(signers[1]).deposit(toUSDC(liquidityPoolUsdcDeposit))
		const usdBalanceAfter = await usd.balanceOf(user)
		const lpBalanceAfter = await liquidityPool.balanceOf(user)
		const lpusdBalanceAfter = await usd.balanceOf(liquidityPool.address)
		const lplpBalanceAfter = await liquidityPool.balanceOf(liquidityPool.address)
		const epochAfter = await liquidityPool.epoch()
		const depositReceiptAfter = await liquidityPool.depositReceipts(user)
		const pendingDepositAfter = await liquidityPool.pendingDeposits()
		const logs = await liquidityPool.queryFilter(liquidityPool.filters.Deposit(), 0)
		const depositEvent = logs[2].args
		expect(depositEvent.recipient).to.equal(user)
		expect(depositEvent.amount).to.equal(toUSDC(liquidityPoolUsdcDeposit))
		expect(depositEvent.epoch).to.equal(epochBefore)
		expect(usdBalanceBefore.sub(usdBalanceAfter)).to.equal(toUSDC(liquidityPoolUsdcDeposit))
		expect(lpBalanceBefore.sub(lpBalanceAfter)).to.equal(0)
		expect(lpusdBalanceAfter.sub(lpusdBalanceBefore)).to.equal(toUSDC(liquidityPoolUsdcDeposit))
		expect(lplpBalanceBefore.sub(lplpBalanceAfter)).to.equal(0)
		expect(epochAfter).to.equal(epochBefore)
		expect(pendingDepositAfter.sub(pendingDepositBefore)).to.equal(toUSDC(liquidityPoolUsdcDeposit))
		expect(depositReceiptBefore.epoch).to.equal(0)
		expect(depositReceiptAfter.epoch).to.equal(epochBefore).to.equal(epochAfter)
		expect(depositReceiptAfter.amount.sub(depositReceiptBefore.amount)).to.equal(
			toUSDC(liquidityPoolUsdcDeposit)
		)
		expect(depositReceiptAfter.unredeemedShares.sub(depositReceiptBefore.unredeemedShares)).to.equal(
			0
		)
		expect(depositReceiptAfter.unredeemedShares).to.equal(0)
	})
	it("Succeeds: pauses trading", async () => {
		await liquidityPool.pauseTradingAndRequest()
		expect(await liquidityPool.isTradingPaused()).to.be.true
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const prevalues = await portfolioValuesFeed.getPortfolioValues(weth.address, usd.address)
		await portfolioValuesFeed.fulfill(
			weth.address,
			usd.address,
		)
	})
	it("Succeeds: execute epoch", async () => {
		const epochBefore = await liquidityPool.epoch()
		const pendingDepositBefore = (await liquidityPool.pendingDeposits()).mul(collatDecimalShift)
		const lplpBalanceBefore = await liquidityPool.balanceOf(liquidityPool.address)
		const totalSupplyBefore = await liquidityPool.totalSupply()
		await liquidityPool.executeEpochCalculation()
		const lplpBalanceAfter = await liquidityPool.balanceOf(liquidityPool.address)
		expect(await liquidityPool.epochPricePerShare(epochBefore)).to.equal(
			toWei("1")
				.mul((await liquidityPool.getNAV()).sub(pendingDepositBefore))
				.div(totalSupplyBefore)
		)
		expect(await liquidityPool.pendingDeposits()).to.equal(0)
		expect(await liquidityPool.isTradingPaused()).to.be.false
		expect(await liquidityPool.epoch()).to.equal(epochBefore.add(1))
		expect(
			pendingDepositBefore.mul(toWei("1")).div(await liquidityPool.epochPricePerShare(epochBefore))
		).to.equal(lplpBalanceAfter.sub(lplpBalanceBefore))
	})
	it("Succeed: User 1: redeems all shares", async () => {
		const user = senderAddress
		const usdBalanceBefore = await usd.balanceOf(user)
		const lpBalanceBefore = await liquidityPool.balanceOf(user)
		const lpusdBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const lplpBalanceBefore = await liquidityPool.balanceOf(liquidityPool.address)
		const epochBefore = await liquidityPool.epoch()
		const depositReceiptBefore = await liquidityPool.depositReceipts(user)
		const pendingDepositBefore = await liquidityPool.pendingDeposits()
		// set as big number to redeem all
		const toRedeem = await liquidityPool.callStatic.redeem(toWei("100000000000000"))
		await liquidityPool.redeem(toWei("100000000000000"))
		const usdBalanceAfter = await usd.balanceOf(user)
		const lpBalanceAfter = await liquidityPool.balanceOf(user)
		const lpusdBalanceAfter = await usd.balanceOf(liquidityPool.address)
		const lplpBalanceAfter = await liquidityPool.balanceOf(liquidityPool.address)
		const epochAfter = await liquidityPool.epoch()
		const depositReceiptAfter = await liquidityPool.depositReceipts(user)
		const pendingDepositAfter = await liquidityPool.pendingDeposits()
		const logs = await liquidityPool.queryFilter(liquidityPool.filters.Redeem(), 0)
		const redeemEvent = logs[0].args
		expect(redeemEvent.recipient).to.equal(user)
		expect(redeemEvent.amount).to.equal(toRedeem)
		expect(redeemEvent.epoch).to.equal(epochBefore.sub(1))
		expect(usdBalanceAfter).to.equal(usdBalanceBefore)
		expect(lpBalanceAfter.sub(lpBalanceBefore)).to.equal(toRedeem)
		expect(lpusdBalanceBefore).to.equal(lpusdBalanceAfter)
		expect(lplpBalanceBefore.sub(lplpBalanceAfter)).to.equal(toRedeem)
		expect(epochAfter).to.equal(epochBefore)
		expect(depositReceiptAfter.epoch).to.equal(epochBefore.sub(1)).to.equal(epochAfter.sub(1))
		expect(depositReceiptBefore.amount.sub(depositReceiptAfter.amount)).to.equal(
			depositReceiptBefore.amount
		)
		expect(depositReceiptAfter.amount).to.equal(0)
		expect(
			depositReceiptBefore.unredeemedShares.add(
				depositReceiptBefore.amount
					.mul(collatDecimalShift)
					.mul(toWei("1"))
					.div(await liquidityPool.epochPricePerShare(depositReceiptBefore.epoch))
			)
		).to.equal(toRedeem)
		expect(depositReceiptAfter.unredeemedShares).to.equal(0)
		expect(await liquidityPool.allowance(liquidityPool.address, user)).to.equal(0)
	})

	it("Succeed: User 1: Initiates Withdraw for half owned balance", async () => {
		const user = senderAddress
		const usdBalanceBefore = await usd.balanceOf(user)
		const lpBalanceBefore = await liquidityPool.balanceOf(user)
		const lpusdBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const lplpBalanceBefore = await liquidityPool.balanceOf(liquidityPool.address)
		const epochBefore = await liquidityPool.epoch()
		const withdrawalReceiptBefore = await liquidityPool.withdrawalReceipts(user)
		await liquidityPool.initiateWithdraw(lpBalanceBefore.div(2))
		const usdBalanceAfter = await usd.balanceOf(user)
		const lpBalanceAfter = await liquidityPool.balanceOf(user)
		const lpusdBalanceAfter = await usd.balanceOf(liquidityPool.address)
		const lplpBalanceAfter = await liquidityPool.balanceOf(liquidityPool.address)
		const epochAfter = await liquidityPool.epoch()
		const withdrawalReceiptAfter = await liquidityPool.withdrawalReceipts(user)
		const logs = await liquidityPool.queryFilter(liquidityPool.filters.InitiateWithdraw(), 0)
		const initWithdrawEvent = logs[0].args
		expect(initWithdrawEvent.recipient).to.equal(user)
		expect(initWithdrawEvent.amount).to.equal(lpBalanceBefore.div(2))
		expect(initWithdrawEvent.epoch).to.equal(epochBefore)
		expect(usdBalanceAfter).to.equal(usdBalanceBefore)
		expect(lpBalanceBefore.sub(lpBalanceAfter)).to.equal(lpBalanceBefore.div(2))
		expect(lpusdBalanceAfter).to.equal(lpusdBalanceBefore)
		expect(lplpBalanceAfter.sub(lplpBalanceBefore)).to.equal(lpBalanceBefore.div(2))
		expect(withdrawalReceiptAfter.epoch).to.equal(epochBefore).to.equal(epochAfter)
		expect(withdrawalReceiptBefore.epoch).to.equal(0)
		expect(withdrawalReceiptAfter.shares).to.equal(lpBalanceBefore.div(2))
		expect(withdrawalReceiptBefore.shares).to.equal(0)
	})
	it("handler-only functions in Liquidity pool revert if not called by handler", async () => {
		await expect(liquidityPool.resetEphemeralValues()).to.be.reverted
	})
})
