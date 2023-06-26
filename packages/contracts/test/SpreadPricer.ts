import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { BigNumber, Signer, utils } from "ethers"
import hre, { ethers, network } from "hardhat"
import {
	CALL_FLAVOR,
	fromUSDC,
	fromWei,
	PUT_FLAVOR,
	toUSDC,
	toWei
} from "../utils/conversion-helper"
//@ts-ignore
import { expect } from "chai"
import {
	AlphaPortfolioValuesFeed,
	BeyondPricer,
	LiquidityPool,
	MintableERC20,
	MockChainlinkAggregator,
	OptionExchange,
	OptionRegistry,
	Oracle,
	PriceFeed,
	Protocol,
	VolatilityFeed,
	WETH
} from "../types"
import { deployLiquidityPool, deploySystem } from "../utils/generic-system-deployer"
import { deployOpyn } from "../utils/opyn-deployer"
import { CHAINLINK_WETH_PRICER } from "./constants"
import { calculateOptionQuoteLocally, compareQuotes, setupTestOracle } from "./helpers"

dayjs.extend(utc)

let usd: MintableERC20
let weth: WETH
let wethERC20: MintableERC20
let optionRegistry: OptionRegistry
let optionProtocol: Protocol
let signers: Signer[]
let senderAddress: string
let receiverAddress: string
let liquidityPool: LiquidityPool
let portfolioValuesFeed: AlphaPortfolioValuesFeed
let volFeed: VolatilityFeed
let priceFeed: PriceFeed
let oracle: Oracle
let opynAggregator: MockChainlinkAggregator
let exchange: OptionExchange
let pricer: BeyondPricer
let authority: string

/* --- variables to change --- */

// Date for option to expire on format yyyy-mm-dd
// Will automatically convert to 08:00 UTC timestamp
// First mined block will be timestamped 2022-02-27 19:05 UTC
const expiryDate: string = "2022-04-05"

// edit depending on the chain id to be tested on
const chainId = 1

// balances to deposit into the LP
const liquidityPoolUsdcDeposit = "100000"
const liquidityPoolWethDeposit = "1"

const expiration = dayjs.utc(expiryDate).add(8, "hours").unix()
const expiration2 = dayjs.utc(expiryDate).add(1, "weeks").add(8, "hours").unix() // have another batch of options exire 1 week after the first

describe("Spread Pricer testing", async () => {
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
		let opynParams = await deployOpyn(signers)
		oracle = opynParams.oracle
		const [sender] = signers

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
			optionRegistry,
			portfolioValuesFeed,
			volFeed,
			authority
		)
		liquidityPool = lpParams.liquidityPool
		exchange = lpParams.exchange
		pricer = lpParams.pricer
		signers = await hre.ethers.getSigners()
		senderAddress = await signers[0].getAddress()
		receiverAddress = await signers[1].getAddress()
	})
	describe("Setup add-on system features", async () => {
		it("SETUP: set sabrParams", async () => {
			const proposedSabrParams = {
				callAlpha: 250000,
				callBeta: 1_000000,
				callRho: -300000,
				callVolvol: 1_500000,
				putAlpha: 250000,
				putBeta: 1_000000,
				putRho: -300000,
				putVolvol: 1_500000,
				interestRate: utils.parseEther("-0.001")
			}
			await exchange.pause()
			await volFeed.setSabrParameters(proposedSabrParams, expiration)
			const volFeedSabrParams = await volFeed.sabrParams(expiration)
			expect(proposedSabrParams.callAlpha).to.equal(volFeedSabrParams.callAlpha)
			expect(proposedSabrParams.callBeta).to.equal(volFeedSabrParams.callBeta)
			expect(proposedSabrParams.callRho).to.equal(volFeedSabrParams.callRho)
			expect(proposedSabrParams.callVolvol).to.equal(volFeedSabrParams.callVolvol)
			expect(proposedSabrParams.putAlpha).to.equal(volFeedSabrParams.putAlpha)
			expect(proposedSabrParams.putBeta).to.equal(volFeedSabrParams.putBeta)
			expect(proposedSabrParams.putRho).to.equal(volFeedSabrParams.putRho)
			expect(proposedSabrParams.putVolvol).to.equal(volFeedSabrParams.putVolvol)
			expect(proposedSabrParams.interestRate).to.equal(volFeedSabrParams.interestRate)
		})
		it("SETUP: set sabrParams", async () => {
			const proposedSabrParams = {
				callAlpha: 250000,
				callBeta: 1_000000,
				callRho: -300000,
				callVolvol: 1_500000,
				putAlpha: 250000,
				putBeta: 1_000000,
				putRho: -300000,
				putVolvol: 1_500000,
				interestRate: utils.parseEther("-0.002")
			}
			await volFeed.setSabrParameters(proposedSabrParams, expiration2)
			await exchange.unpause()
			const volFeedSabrParams = await volFeed.sabrParams(expiration2)
			expect(proposedSabrParams.callAlpha).to.equal(volFeedSabrParams.callAlpha)
			expect(proposedSabrParams.callBeta).to.equal(volFeedSabrParams.callBeta)
			expect(proposedSabrParams.callRho).to.equal(volFeedSabrParams.callRho)
			expect(proposedSabrParams.callVolvol).to.equal(volFeedSabrParams.callVolvol)
			expect(proposedSabrParams.putAlpha).to.equal(volFeedSabrParams.putAlpha)
			expect(proposedSabrParams.putBeta).to.equal(volFeedSabrParams.putBeta)
			expect(proposedSabrParams.putRho).to.equal(volFeedSabrParams.putRho)
			expect(proposedSabrParams.putVolvol).to.equal(volFeedSabrParams.putVolvol)
			expect(proposedSabrParams.interestRate).to.equal(volFeedSabrParams.interestRate)
		})
		it("sets spread values to non-zero", async () => {
			await exchange.pause()
			await pricer.setCollateralLendingRate(100000) // 10%
			expect(await pricer.collateralLendingRate()).to.eq(100000)
			await pricer.setDeltaBorrowRates({
				sellLong: 150000,
				sellShort: -100000,
				buyLong: 150000,
				buyShort: -100000
			})
			const newBorrowRates = await pricer.deltaBorrowRates()
			await exchange.unpause()
			expect(newBorrowRates.sellLong).to.eq(150000)
			expect(newBorrowRates.sellShort).to.eq(-100000)
			expect(newBorrowRates.buyLong).to.eq(150000)
			expect(newBorrowRates.buyShort).to.eq(-100000)
		})
		it("sets slippage vars to zero", async () => {
			await exchange.pause()
			await pricer.setSlippageGradient(0)
			await exchange.unpause()
			expect(await pricer.slippageGradient()).to.eq(0)
		})
		it("Deposit to the liquidityPool", async () => {
			const USDC_WHALE = "0x55fe002aeff02f77364de339a1292923a15844b8"
			await hre.network.provider.request({
				method: "hardhat_impersonateAccount",
				params: [USDC_WHALE]
			})
			const usdcWhale = await ethers.getSigner(USDC_WHALE)
			const usdWhaleConnect = await usd.connect(usdcWhale)
			await weth.deposit({ value: toWei(liquidityPoolWethDeposit) })
			await usdWhaleConnect.transfer(senderAddress, toUSDC("1000000"))
			await usdWhaleConnect.transfer(receiverAddress, toUSDC("1000000"))
			await usd.approve(liquidityPool.address, toUSDC(liquidityPoolUsdcDeposit))
			const deposit = await liquidityPool.deposit(toUSDC(liquidityPoolUsdcDeposit))
			const receipt = await deposit.wait(1)
			const event = receipt?.events?.find(x => x.event == "Deposit")
			expect(event?.event).to.eq("Deposit")
		})
		it("pauses trading and executes epoch", async () => {
			await liquidityPool.pauseTradingAndRequest()
			await portfolioValuesFeed.fulfill(weth.address, usd.address)
			await liquidityPool.executeEpochCalculation()
			await liquidityPool.redeem(toWei("10000000"))
		})
		it("SETUP: sets the exchange as a hedging reactor", async function () {
			await liquidityPool.setHedgingReactorAddress(exchange.address)
			expect(await liquidityPool.hedgingReactors(0)).to.equal(exchange.address)
		})
	})
	describe("Get quotes successfully for small and big calls", async () => {
		let proposedSeries: any
		let singleBuyQuote: BigNumber
		let singleSellQuote: BigNumber
		let spreadQuote1: number
		let spreadQuote2: number
		let spreadQuote3: number
		let spreadQuote4: number
		it("SUCCEEDS: get quote for 1 option when buying", async () => {
			const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
			proposedSeries = {
				expiration: expiration,
				strike: toWei("2500"),
				isPut: CALL_FLAVOR,
				strikeAsset: usd.address,
				underlying: weth.address,
				collateral: usd.address
			}
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			singleBuyQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			spreadQuote1 = parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1 option when selling", async () => {
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			singleSellQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			// selling calls has negative delta borrow rate on spread. spread should revert to zero
			spreadQuote2 = parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread
			expect(spreadQuote2).to.be.within(-0.001, 0.001)
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when buying", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			spreadQuote3 = parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread
			expect(singleBuyQuote.toNumber()).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when selling", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			// selling calls has negative delta borrow rate on spread. spread should revert to zero
			spreadQuote4 = parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread
			expect(spreadQuote4).to.be.within(-0.1, 0.1)
			expect(singleSellQuote).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})

		it("set spread multipliers to 2x their previous values", async () => {
			expect((await pricer.getCallSpreadCollateralMultipliers(0))[0]).to.eq(toWei("5"))
			expect((await pricer.getPutSpreadCollateralMultipliers(0))[7]).to.eq(toWei("3"))
			expect((await pricer.getCallSpreadDeltaMultipliers(2))[0]).to.eq(toWei("1.4"))
			expect((await pricer.getPutSpreadDeltaMultipliers(2))[9]).to.eq(toWei("1.4"))
			await exchange.pause()
			await pricer.setSpreadCollateralMultipliers(
				0,
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				],
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				1,
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				],
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				2,
				[
					toWei("2.8"),
					toWei("2.6"),
					toWei("2.4"),
					toWei("2.2"),
					toWei("2"),
					toWei("2"),
					toWei("2.2"),
					toWei("2.4"),
					toWei("2.6"),
					toWei("2.8")
				],
				[
					toWei("2.8"),
					toWei("2.6"),
					toWei("2.4"),
					toWei("2.2"),
					toWei("2"),
					toWei("2"),
					toWei("2.2"),
					toWei("2.4"),
					toWei("2.6"),
					toWei("2.8")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				3,
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				],
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				4,
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				],
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				0,
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				],
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				1,
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				],
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				2,
				[
					toWei("2.8"),
					toWei("2.6"),
					toWei("2.4"),
					toWei("2.2"),
					toWei("2"),
					toWei("2"),
					toWei("2.2"),
					toWei("2.4"),
					toWei("2.6"),
					toWei("2.8")
				],
				[
					toWei("2.8"),
					toWei("2.6"),
					toWei("2.4"),
					toWei("2.2"),
					toWei("2"),
					toWei("2"),
					toWei("2.2"),
					toWei("2.4"),
					toWei("2.6"),
					toWei("2.8")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				3,
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				],
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				4,
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				],
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				]
			)
			await exchange.unpause()
			expect((await pricer.getCallSpreadCollateralMultipliers(0))[0]).to.eq(toWei("10"))
			expect((await pricer.getPutSpreadCollateralMultipliers(0))[7]).to.eq(toWei("6"))
			expect((await pricer.getCallSpreadDeltaMultipliers(2))[0]).to.eq(toWei("2.8"))
			expect((await pricer.getPutSpreadDeltaMultipliers(2))[9]).to.eq(toWei("2.8"))
		})
		it("SUCCEEDS: get quote for 1 option when buying", async () => {
			const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
			proposedSeries = {
				expiration: expiration,
				strike: toWei("2500"),
				isPut: CALL_FLAVOR,
				strikeAsset: usd.address,
				underlying: weth.address,
				collateral: usd.address
			}
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			singleBuyQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread).to.be.within(
				spreadQuote1 * 1.999,
				spreadQuote1 * 2.001
			)
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1 option when selling", async () => {
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			singleSellQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			// selling calls has negative delta borrow rate on spread. spread should revert to zero
			expect(parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread).to.be.within(-0.001, 0.001)
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when buying", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread).to.be.within(
				spreadQuote3 * 1.999,
				spreadQuote3 * 2.001
			)
			expect(singleBuyQuote.toNumber()).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when selling", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread).to.be.within(-0.1, 0.1)
			expect(singleSellQuote).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})
	})
	describe("Get quotes successfully for small and big puts", async () => {
		it("set spread multipliers their original values", async () => {
			expect((await pricer.getCallSpreadCollateralMultipliers(0))[0]).to.eq(toWei("10"))
			expect((await pricer.getPutSpreadCollateralMultipliers(0))[7]).to.eq(toWei("6"))
			expect((await pricer.getCallSpreadDeltaMultipliers(2))[0]).to.eq(toWei("2.8"))
			expect((await pricer.getPutSpreadDeltaMultipliers(2))[9]).to.eq(toWei("2.8"))
			await exchange.pause()
			await pricer.setSpreadCollateralMultipliers(
				0,
				[
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("1"),
					toWei("1"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5")
				],
				[
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("1"),
					toWei("1"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				1,
				[
					toWei("3"),
					toWei("2.5"),
					toWei("2"),
					toWei("1.5"),
					toWei("1"),
					toWei("1"),
					toWei("1.5"),
					toWei("2"),
					toWei("2.5"),
					toWei("3")
				],
				[
					toWei("3"),
					toWei("2.5"),
					toWei("2"),
					toWei("1.5"),
					toWei("1"),
					toWei("1"),
					toWei("1.5"),
					toWei("2"),
					toWei("2.5"),
					toWei("3")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				2,
				[
					toWei("1.4"),
					toWei("1.3"),
					toWei("1.2"),
					toWei("1.1"),
					toWei("1"),
					toWei("1"),
					toWei("1.1"),
					toWei("1.2"),
					toWei("1.3"),
					toWei("1.4")
				],
				[
					toWei("1.4"),
					toWei("1.3"),
					toWei("1.2"),
					toWei("1.1"),
					toWei("1"),
					toWei("1"),
					toWei("1.1"),
					toWei("1.2"),
					toWei("1.3"),
					toWei("1.4")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				3,
				[
					toWei("3"),
					toWei("2.5"),
					toWei("2"),
					toWei("1.5"),
					toWei("1"),
					toWei("1"),
					toWei("1.5"),
					toWei("2"),
					toWei("2.5"),
					toWei("3")
				],
				[
					toWei("3"),
					toWei("2.5"),
					toWei("2"),
					toWei("1.5"),
					toWei("1"),
					toWei("1"),
					toWei("1.5"),
					toWei("2"),
					toWei("2.5"),
					toWei("3")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				4,
				[
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("1"),
					toWei("1"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5")
				],
				[
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("1"),
					toWei("1"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				0,
				[
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("1"),
					toWei("1"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5")
				],
				[
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("1"),
					toWei("1"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				1,
				[
					toWei("3"),
					toWei("2.5"),
					toWei("2"),
					toWei("1.5"),
					toWei("1"),
					toWei("1"),
					toWei("1.5"),
					toWei("2"),
					toWei("2.5"),
					toWei("3")
				],
				[
					toWei("3"),
					toWei("2.5"),
					toWei("2"),
					toWei("1.5"),
					toWei("1"),
					toWei("1"),
					toWei("1.5"),
					toWei("2"),
					toWei("2.5"),
					toWei("3")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				2,
				[
					toWei("1.4"),
					toWei("1.3"),
					toWei("1.2"),
					toWei("1.1"),
					toWei("1"),
					toWei("1"),
					toWei("1.1"),
					toWei("1.2"),
					toWei("1.3"),
					toWei("1.4")
				],
				[
					toWei("1.4"),
					toWei("1.3"),
					toWei("1.2"),
					toWei("1.1"),
					toWei("1"),
					toWei("1"),
					toWei("1.1"),
					toWei("1.2"),
					toWei("1.3"),
					toWei("1.4")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				3,
				[
					toWei("3"),
					toWei("2.5"),
					toWei("2"),
					toWei("1.5"),
					toWei("1"),
					toWei("1"),
					toWei("1.5"),
					toWei("2"),
					toWei("2.5"),
					toWei("3")
				],
				[
					toWei("3"),
					toWei("2.5"),
					toWei("2"),
					toWei("1.5"),
					toWei("1"),
					toWei("1"),
					toWei("1.5"),
					toWei("2"),
					toWei("2.5"),
					toWei("3")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				4,
				[
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("1"),
					toWei("1"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5")
				],
				[
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("1"),
					toWei("1"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5")
				]
			)
			await exchange.unpause()
			expect((await pricer.getCallSpreadCollateralMultipliers(0))[0]).to.eq(toWei("5"))
			expect((await pricer.getPutSpreadCollateralMultipliers(0))[7]).to.eq(toWei("3"))
			expect((await pricer.getCallSpreadDeltaMultipliers(2))[0]).to.eq(toWei("1.4"))
			expect((await pricer.getPutSpreadDeltaMultipliers(2))[9]).to.eq(toWei("1.4"))
		})
		let proposedSeries: any
		let singleBuyQuote: BigNumber
		let singleSellQuote: BigNumber
		let spreadQuote1: number
		let spreadQuote2: number
		let spreadQuote3: number
		let spreadQuote4: number
		it("SUCCEEDS: get quote for 1 option when buying", async () => {
			const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
			proposedSeries = {
				expiration: expiration,
				strike: toWei("2500"),
				isPut: PUT_FLAVOR,
				strikeAsset: usd.address,
				underlying: weth.address,
				collateral: usd.address
			}
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			singleBuyQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			// buying puts has negative delta borrow rate on spread but collateral lending is larger and positive
			spreadQuote1 = parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1 option when selling", async () => {
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			singleSellQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			spreadQuote2 = parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when buying", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			// buying puts has negative delta borrow rate on spread but collateral lending is larger and positive
			spreadQuote3 = parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread
			expect(singleBuyQuote.toNumber()).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when selling", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			spreadQuote4 = parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread
			expect(singleSellQuote).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})
		it("set spread multipliers to 2x their previous values", async () => {
			expect((await pricer.getCallSpreadCollateralMultipliers(0))[3]).to.eq(toWei("2"))
			expect((await pricer.getPutSpreadCollateralMultipliers(1))[7]).to.eq(toWei("2"))
			expect((await pricer.getCallSpreadDeltaMultipliers(2))[4]).to.eq(toWei("1"))
			expect((await pricer.getPutSpreadDeltaMultipliers(4))[0]).to.eq(toWei("5"))
			await exchange.pause()
			await pricer.setSpreadCollateralMultipliers(
				0,
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				],
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				1,
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				],
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				2,
				[
					toWei("2.8"),
					toWei("2.6"),
					toWei("2.4"),
					toWei("2.2"),
					toWei("2"),
					toWei("2"),
					toWei("2.2"),
					toWei("2.4"),
					toWei("2.6"),
					toWei("2.8")
				],
				[
					toWei("2.8"),
					toWei("2.6"),
					toWei("2.4"),
					toWei("2.2"),
					toWei("2"),
					toWei("2"),
					toWei("2.2"),
					toWei("2.4"),
					toWei("2.6"),
					toWei("2.8")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				3,
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				],
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				]
			)
			await pricer.setSpreadCollateralMultipliers(
				4,
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				],
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				0,
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				],
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				1,
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				],
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				2,
				[
					toWei("2.8"),
					toWei("2.6"),
					toWei("2.4"),
					toWei("2.2"),
					toWei("2"),
					toWei("2"),
					toWei("2.2"),
					toWei("2.4"),
					toWei("2.6"),
					toWei("2.8")
				],
				[
					toWei("2.8"),
					toWei("2.6"),
					toWei("2.4"),
					toWei("2.2"),
					toWei("2"),
					toWei("2"),
					toWei("2.2"),
					toWei("2.4"),
					toWei("2.6"),
					toWei("2.8")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				3,
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				],
				[
					toWei("6"),
					toWei("5"),
					toWei("4"),
					toWei("3"),
					toWei("2"),
					toWei("2"),
					toWei("3"),
					toWei("4"),
					toWei("5"),
					toWei("6")
				]
			)
			await pricer.setSpreadDeltaMultipliers(
				4,
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				],
				[
					toWei("10"),
					toWei("8"),
					toWei("6"),
					toWei("4"),
					toWei("2"),
					toWei("2"),
					toWei("4"),
					toWei("6"),
					toWei("8"),
					toWei("10")
				]
			)
			await exchange.unpause()
			expect((await pricer.getCallSpreadCollateralMultipliers(0))[3]).to.eq(toWei("4"))
			expect((await pricer.getPutSpreadCollateralMultipliers(1))[7]).to.eq(toWei("4"))
			expect((await pricer.getCallSpreadDeltaMultipliers(2))[4]).to.eq(toWei("2"))
			expect((await pricer.getPutSpreadDeltaMultipliers(4))[0]).to.eq(toWei("10"))
		})
		it("SUCCEEDS: get quote for 1 option when buying", async () => {
			const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
			proposedSeries = {
				expiration: expiration,
				strike: toWei("2500"),
				isPut: PUT_FLAVOR,
				strikeAsset: usd.address,
				underlying: weth.address,
				collateral: usd.address
			}
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			singleBuyQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread).to.be.within(
				spreadQuote1 * 1.999,
				spreadQuote1 * 2.001
			)
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1 option when selling", async () => {
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			singleSellQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			// spread is larger than premium w/ slippage so quote should be zero
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.eq(0)
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when buying", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(parseFloat(fromUSDC(quoteResponse[0])) - localQuoteNoSpread).to.be.within(
				spreadQuote3 * 1.999,
				spreadQuote3 * 2.001
			)
			expect(singleBuyQuote.toNumber()).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when selling", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)

			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			// spread is larger than premium w/ slippage so quote should be zero
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.eq(0)
			expect(singleSellQuote).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})
	})
	describe("Get quotes successfully for small and big puts", async () => {
		let proposedSeries: any
		let singleBuyQuote: BigNumber
		let singleSellQuote: BigNumber
		it("SUCCEEDS: get quote for 1 option when buying", async () => {
			proposedSeries = {
				expiration: expiration,
				strike: toWei("2000"),
				isPut: PUT_FLAVOR,
				strikeAsset: usd.address,
				underlying: weth.address,
				collateral: usd.address
			}
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			singleBuyQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1 option when selling", async () => {
			const amount = toWei("1")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			singleSellQuote = quoteResponse[0]
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when buying", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(singleBuyQuote).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 1000 options when selling", async () => {
			const amount = toWei("1000")
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(singleSellQuote).to.eq(quoteResponse[0].div(1000))
			expect(parseFloat(fromUSDC(quoteResponse[0]))).to.be.lt(localQuoteNoSpread)
		})
	})
	describe("Compare lots of small quotes to one big quote", async () => {
		let proposedSeries: any
		let buyQuoteLots: BigNumber
		let sellQuoteLots: BigNumber
		it("SUCCEEDS: get quote for 100 option when buying 100 times", async () => {
			proposedSeries = {
				expiration: expiration,
				strike: toWei("2600"),
				isPut: PUT_FLAVOR,
				strikeAsset: usd.address,
				underlying: weth.address,
				collateral: usd.address
			}
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				toWei("100"),
				pricer,
				false
			)
			const allAtOnceQuote = (
				await pricer.quoteOptionPrice(proposedSeries, toWei("100"), false, toWei("0"))
			)[0]
			buyQuoteLots = toWei("0")
			for (let i = 0; i < 100; i++) {
				const amount = toWei("1")
				let quoteResponse = await pricer.quoteOptionPrice(
					proposedSeries,
					amount,
					false,
					toWei("0").sub(toWei(i.toString()))
				)
				await compareQuotes(
					quoteResponse,
					liquidityPool,
					optionProtocol,
					volFeed,
					priceFeed,
					proposedSeries,
					amount,
					false,
					exchange,
					optionRegistry,
					usd,
					pricer,
					toWei("0").sub(toWei(i.toString()))
				)
				buyQuoteLots = buyQuoteLots.add(quoteResponse.totalPremium)
			}
			expect(allAtOnceQuote.sub(buyQuoteLots)).to.be.within(-100, 100)
			expect(parseFloat(fromUSDC(buyQuoteLots))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 100 options when selling 100 times", async () => {
			sellQuoteLots = toWei("0")
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				toWei("100"),
				pricer,
				true
			)
			const allAtOnceQuote = (
				await pricer.quoteOptionPrice(proposedSeries, toWei("100"), true, toWei("0"))
			)[0]
			for (let i = 0; i < 100; i++) {
				const amount = toWei("1")
				let quoteResponse = await pricer.quoteOptionPrice(
					proposedSeries,
					amount,
					true,
					toWei(i.toString())
				)
				await compareQuotes(
					quoteResponse,
					liquidityPool,
					optionProtocol,
					volFeed,
					priceFeed,
					proposedSeries,
					amount,
					true,
					exchange,
					optionRegistry,
					usd,
					pricer,
					toWei(i.toString())
				)
				sellQuoteLots = sellQuoteLots.add(quoteResponse.totalPremium)
				expect(quoteResponse[0]).to.eq(allAtOnceQuote.div(100))
			}
			expect(allAtOnceQuote.sub(sellQuoteLots)).to.be.within(-100, 100)
			expect(parseFloat(fromUSDC(sellQuoteLots))).to.be.lt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 100 options when buying 1 time", async () => {
			const amount = toWei("100")
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				false
			)
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, false, 0)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				false,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(buyQuoteLots.sub(quoteResponse[0])).to.be.within(-100, 100)
			expect(parseFloat(fromUSDC(buyQuoteLots))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 100 options when selling 1 time", async () => {
			const amount = toWei("100")
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				amount,
				pricer,
				true
			)
			let quoteResponse = await pricer.quoteOptionPrice(proposedSeries, amount, true, 0)
			await compareQuotes(
				quoteResponse,
				liquidityPool,
				optionProtocol,
				volFeed,
				priceFeed,
				proposedSeries,
				amount,
				true,
				exchange,
				optionRegistry,
				usd,
				pricer,
				toWei("0")
			)
			expect(sellQuoteLots.sub(quoteResponse[0])).to.be.within(-100, 100)
			expect(parseFloat(fromUSDC(sellQuoteLots))).to.be.lt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 100 options when buying 100 times and dhv has positive exposure", async () => {
			proposedSeries = {
				expiration: expiration,
				strike: toWei("2600"),
				isPut: PUT_FLAVOR,
				strikeAsset: usd.address,
				underlying: weth.address,
				collateral: usd.address
			}
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				toWei("100"),
				pricer,
				false
			)
			buyQuoteLots = toWei("0")
			const allAtOnceQuote = (
				await pricer.quoteOptionPrice(proposedSeries, toWei("100"), false, toWei("100"))
			)[0]

			for (let i = 0; i < 100; i++) {
				const amount = toWei("1")
				let quoteResponse = await pricer.quoteOptionPrice(
					proposedSeries,
					amount,
					false,
					toWei("100").sub(toWei(i.toString()))
				)

				await compareQuotes(
					quoteResponse,
					liquidityPool,
					optionProtocol,
					volFeed,
					priceFeed,
					proposedSeries,
					amount,
					false,
					exchange,
					optionRegistry,
					usd,
					pricer,
					toWei("100").sub(toWei(i.toString()))
				)
				expect(quoteResponse[0]).to.eq(allAtOnceQuote.div(100))
				buyQuoteLots = buyQuoteLots.add(quoteResponse.totalPremium)
			}
			expect(buyQuoteLots.sub(allAtOnceQuote)).to.be.within(-100, 100)
			expect(parseFloat(fromUSDC(buyQuoteLots))).to.be.gt(localQuoteNoSpread)
		})
		it("SUCCEEDS: get quote for 100 options when buying 100 times and dhv has half amount worth of long exposure", async () => {
			proposedSeries = {
				expiration: expiration,
				strike: toWei("2600"),
				isPut: PUT_FLAVOR,
				strikeAsset: usd.address,
				underlying: weth.address,
				collateral: usd.address
			}
			buyQuoteLots = toWei("0")
			const localQuoteNoSpread = await calculateOptionQuoteLocally(
				liquidityPool,
				volFeed,
				optionRegistry,
				usd,
				priceFeed,
				proposedSeries,
				toWei("100"),
				pricer,
				false
			)
			const allAtOnceQuoteNoLongExposure = (
				await pricer.quoteOptionPrice(proposedSeries, toWei("100"), false, toWei("0"))
			)[0]
			const allAtOnceQuoteFullLongExposure = (
				await pricer.quoteOptionPrice(proposedSeries, toWei("100"), false, toWei("100"))
			)[0]
			const allAtOnceQuoteHalfLongExposure = (
				await pricer.quoteOptionPrice(proposedSeries, toWei("100"), false, toWei("50"))
			)[0]

			for (let i = 0; i < 100; i++) {
				const amount = toWei("1")
				let quoteResponse = await pricer.quoteOptionPrice(
					proposedSeries,
					amount,
					false,
					toWei("50").sub(toWei(i.toString()))
				)

				await compareQuotes(
					quoteResponse,
					liquidityPool,
					optionProtocol,
					volFeed,
					priceFeed,
					proposedSeries,
					amount,
					false,
					exchange,
					optionRegistry,
					usd,
					pricer,
					toWei("50").sub(toWei(i.toString()))
				)
				if (i < 50) {
					expect(quoteResponse[0]).to.eq(allAtOnceQuoteFullLongExposure.div(100))
				} else {
					expect(quoteResponse[0]).to.eq(allAtOnceQuoteNoLongExposure.div(100))
				}
				buyQuoteLots = buyQuoteLots.add(quoteResponse.totalPremium)
			}
			expect(parseFloat(fromUSDC(buyQuoteLots))).to.be.gt(localQuoteNoSpread)
			expect(buyQuoteLots).to.be.gt(allAtOnceQuoteHalfLongExposure)
			expect(allAtOnceQuoteFullLongExposure).to.be.lt(allAtOnceQuoteHalfLongExposure)
			expect(allAtOnceQuoteHalfLongExposure).to.be.lt(allAtOnceQuoteNoLongExposure)
		})
	})
	describe("invalid spread params", async () => {
		it("REVERTS: set collateral spread value below 1", async () => {
			await exchange.pause()
			await expect(
				pricer.setSpreadCollateralMultipliers(
					4,
					[
						toWei("10"),
						toWei("8"),
						toWei("6"),
						toWei("4"),
						toWei("2"),
						toWei("2"),
						toWei("4"),
						toWei("6"),
						toWei("8"),
						toWei("10")
					],
					[
						toWei("10"),
						toWei("8"),
						toWei("6"),
						toWei("4"),
						toWei("0.2"),
						toWei("2"),
						toWei("4"),
						toWei("6"),
						toWei("8"),
						toWei("10")
					]
				)
			).to.be.revertedWithCustomError(pricer, "InvalidMultiplierValue")
		})
		it("REVERTS: set delta spread value below 1", async () => {
			await expect(
				pricer.setSpreadDeltaMultipliers(
					2,
					[
						toWei("10"),
						toWei("8"),
						toWei("6"),
						toWei("4"),
						toWei("2"),
						toWei("2"),
						toWei("4"),
						toWei("6"),
						toWei("8"),
						toWei("10")
					],
					[
						toWei("10"),
						toWei("8"),
						toWei("6"),
						toWei("4"),
						toWei("0.2"),
						toWei("2"),
						toWei("4"),
						toWei("6"),
						toWei("8"),
						toWei("10")
					]
				)
			).to.be.revertedWithCustomError(pricer, "InvalidMultiplierValue")
		})
		it("REVERTS: set spread collateral array length of 19 ", async () => {
			await expect(
				pricer.setSpreadCollateralMultipliers(
					2,
					[
						toWei("3.8"),
						toWei("3.6"),
						toWei("3.4"),
						toWei("3.2"),
						toWei("3.0"),
						toWei("2.8"),
						toWei("2.6"),
						toWei("2.4"),
						toWei("2.2"),
						toWei("2.0"),
						toWei("2.0"),
						toWei("2.2"),
						toWei("2.4"),
						toWei("2.6"),
						toWei("2.8"),
						toWei("3.0"),
						toWei("3.2"),
						toWei("3.4"),
						toWei("3.6"),
						toWei("3.8")
					],
					[
						toWei("3.8"),
						toWei("3.6"),
						toWei("3.4"),
						toWei("3.2"),
						toWei("3.0"),
						toWei("2.8"),
						toWei("2.6"),
						toWei("2.4"),
						toWei("2.2"),
						toWei("2.0"),
						toWei("2.0"),
						toWei("2.2"),
						toWei("2.6"),
						toWei("2.8"),
						toWei("3.0"),
						toWei("3.2"),
						toWei("3.4"),
						toWei("3.6"),
						toWei("3.8")
					]
				)
			).to.be.revertedWithCustomError(pricer, "InvalidMultipliersArrayLength")
		})
		it("REVERTS: set spread delta array length of 19 ", async () => {
			await expect(
				pricer.setSpreadDeltaMultipliers(
					2,
					[
						toWei("3.8"),
						toWei("3.6"),
						toWei("3.4"),
						toWei("3.2"),
						toWei("3.0"),
						toWei("2.8"),
						toWei("2.6"),
						toWei("2.4"),
						toWei("2.2"),
						toWei("2.0"),
						toWei("2.0"),
						toWei("2.2"),
						toWei("2.4"),
						toWei("2.6"),
						toWei("2.8"),
						toWei("3.0"),
						toWei("3.2"),
						toWei("3.4"),
						toWei("3.6"),
						toWei("3.8")
					],
					[
						toWei("3.8"),
						toWei("3.6"),
						toWei("3.4"),
						toWei("3.2"),
						toWei("3.0"),
						toWei("2.8"),
						toWei("2.6"),
						toWei("2.4"),
						toWei("2.2"),
						toWei("2.0"),
						toWei("2.0"),
						toWei("2.2"),
						toWei("2.6"),
						toWei("2.8"),
						toWei("3.0"),
						toWei("3.2"),
						toWei("3.4"),
						toWei("3.6"),
						toWei("3.8")
					]
				)
			).to.be.revertedWithCustomError(pricer, "InvalidMultipliersArrayLength")
			await exchange.unpause()
		})

		it("REVERTS: set collateral spread when exchange not paused", async () => {
			await expect(
				pricer.setSpreadCollateralMultipliers(
					4,
					[
						toWei("10"),
						toWei("8"),
						toWei("6"),
						toWei("4"),
						toWei("2"),
						toWei("2"),
						toWei("4"),
						toWei("6"),
						toWei("8"),
						toWei("10")
					],
					[
						toWei("10"),
						toWei("8"),
						toWei("6"),
						toWei("4"),
						toWei("0.2"),
						toWei("2"),
						toWei("4"),
						toWei("6"),
						toWei("8"),
						toWei("10")
					]
				)
			).to.be.revertedWithCustomError(pricer, "ExchangeNotPaused")
		})
		it("REVERTS: set delta spread value when exchange not paused", async () => {
			await expect(
				pricer.setSpreadDeltaMultipliers(
					2,
					[
						toWei("10"),
						toWei("8"),
						toWei("6"),
						toWei("4"),
						toWei("2"),
						toWei("2"),
						toWei("4"),
						toWei("6"),
						toWei("8"),
						toWei("10")
					],
					[
						toWei("10"),
						toWei("8"),
						toWei("6"),
						toWei("4"),
						toWei("0.2"),
						toWei("2"),
						toWei("4"),
						toWei("6"),
						toWei("8"),
						toWei("10")
					]
				)
			).to.be.revertedWithCustomError(pricer, "ExchangeNotPaused")
		})
		it("REVERTS: set spread collateral when exchange not paused ", async () => {
			await expect(
				pricer.setSpreadCollateralMultipliers(
					2,
					[
						toWei("3.8"),
						toWei("3.6"),
						toWei("3.4"),
						toWei("3.2"),
						toWei("3.0"),
						toWei("2.8"),
						toWei("2.6"),
						toWei("2.4"),
						toWei("2.2"),
						toWei("2.0"),
						toWei("2.0"),
						toWei("2.2"),
						toWei("2.4"),
						toWei("2.6"),
						toWei("2.8"),
						toWei("3.0"),
						toWei("3.2"),
						toWei("3.4"),
						toWei("3.6"),
						toWei("3.8")
					],
					[
						toWei("3.8"),
						toWei("3.6"),
						toWei("3.4"),
						toWei("3.2"),
						toWei("3.0"),
						toWei("2.8"),
						toWei("2.6"),
						toWei("2.4"),
						toWei("2.2"),
						toWei("2.0"),
						toWei("2.0"),
						toWei("2.2"),
						toWei("2.6"),
						toWei("2.8"),
						toWei("3.0"),
						toWei("3.2"),
						toWei("3.4"),
						toWei("3.6"),
						toWei("3.8")
					]
				)
			).to.be.revertedWithCustomError(pricer, "ExchangeNotPaused")
		})
	})
})
