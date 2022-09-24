import hre, { ethers, network } from "hardhat"
import { BigNumberish, Contract, utils, Signer, BigNumber } from "ethers"
import {
	toWei,
	truncate,
	tFormatEth,
	call,
	put,
	genOptionTimeFromUnix,
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
import { expect } from "chai"
import Otoken from "../artifacts/contracts/packages/opyn/core/Otoken.sol/Otoken.json"
import { deployRage, deployRangeOrder } from "../utils/rage-deployer"
import LiquidityPoolSol from "../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json"
import { PerpHedgingReactor } from "../types/PerpHedgingReactor"
import { OracleMock } from "../types/OracleMock"
import { ClearingHouse } from "../types/ClearingHouse"
import { MintableERC20 } from "../types/MintableERC20"
import { OptionRegistry } from "../types/OptionRegistry"
import { Otoken as IOToken } from "../types/Otoken"
import { PriceFeed } from "../types/PriceFeed"
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
import { deployOpyn } from "../utils/opyn-deployer"
import { MockPortfolioValuesFeed } from "../types/MockPortfolioValuesFeed"
import { deployLiquidityPool, deploySystem } from "../utils/generic-system-deployer"
import { OptionHandler } from "../types/OptionHandler"
let usd: MintableERC20
let weth: WETH
let optionRegistry: OptionRegistry
let optionProtocol: Protocol
let signers: Signer[]
let senderAddress: string
let receiverAddress: string
let liquidityPool: LiquidityPool
let portfolioValuesFeed: MockPortfolioValuesFeed
let volatility: Volatility
let volFeed: VolatilityFeed
let priceFeed: PriceFeed
let rate: string
let controller: NewController
let addressBook: AddressBook
let newCalculator: NewMarginCalculator
let oracle: Oracle
let opynAggregator: MockChainlinkAggregator
let putOptionToken: IOToken
let putOptionToken2: IOToken
let collateralAllocatedToVault1: BigNumber
let perpHedgingReactor: PerpHedgingReactor
let vTokenAddress: string
let vQuoteAddress: string
let rageOracle: OracleMock
let clearingHouse: ClearingHouse
let poolId: string
let settlementTokenOracle: OracleMock
let collateralId: string
let handler: OptionHandler
let authority: string

const IMPLIED_VOL = "60"
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

/* --- variables to change --- */

// Date for option to expire on format yyyy-mm-dd
// Will automatically convert to 08:00 UTC timestamp
// First mined block will be timestamped 2022-02-27 19:05 UTC
const expiryDate: string = "2022-04-05"

const invalidExpiryDateLong: string = "2024-09-03"
const invalidExpiryDateShort: string = "2022-03-01"
// decimal representation of a percentage
const rfr: string = "0"
// edit depending on the chain id to be tested on
const chainId = 1
const oTokenDecimalShift18 = 10000000000
// amount of dollars OTM written options will be (both puts and calls)
// use negative numbers for ITM options
const strike = "20"

// hardcoded value for strike price that is outside of accepted bounds
const invalidStrikeHigh = utils.parseEther("12500")
const invalidStrikeLow = utils.parseEther("200")

// balances to deposit into the LP
const liquidityPoolUsdcDeposit = "50000"
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
const maxExpiry = 86400 * 365

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
const timeToExpiry = [day * 7, day * 14, day * 28, day * 42, day * 56]
// array of upper bound value correspond to time to expiry
const expiryToValue = [
	scaleNum("0.1678", 27),
	scaleNum("0.237", 27),
	scaleNum("0.3326", 27),
	scaleNum("0.4032", 27),
	scaleNum("0.4603", 27)
]

/* --- end variables to change --- */

const expiration = moment.utc(expiryDate).add(8, "h").valueOf() / 1000
const expiration2 = moment.utc(expiryDate).add(1, "w").add(8, "h").valueOf() / 1000 // have another batch of options exire 1 week after the first
const expiration3 = moment.utc(expiryDate).add(2, "w").add(8, "h").valueOf() / 1000
const invalidExpirationLong = moment.utc(invalidExpiryDateLong).add(8, "h").valueOf() / 1000
const invalidExpirationShort = moment.utc(invalidExpiryDateShort).add(8, "h").valueOf() / 1000

const CALL_FLAVOR = false
const PUT_FLAVOR = true

describe("Liquidity Pools hedging reactor: perps", async () => {
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

		// get the oracle
		const res = await setupTestOracle(await sender.getAddress())
		oracle = res[0] as Oracle
		opynAggregator = res[1] as MockChainlinkAggregator
		let deployParams = await deploySystem(signers, oracle, opynAggregator)
		weth = deployParams.weth
		const wethERC20 = deployParams.wethERC20
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
			putVolvol: 1_500000
		}
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
			putVolvol: 1_500000
		}
		await volFeed.setSabrParameters(proposedSabrParams, expiration2)
		const volFeedSabrParams = await volFeed.sabrParams(expiration2)
		expect(proposedSabrParams.callAlpha).to.equal(volFeedSabrParams.callAlpha)
		expect(proposedSabrParams.callBeta).to.equal(volFeedSabrParams.callBeta)
		expect(proposedSabrParams.callRho).to.equal(volFeedSabrParams.callRho)
		expect(proposedSabrParams.callVolvol).to.equal(volFeedSabrParams.callVolvol)
		expect(proposedSabrParams.putAlpha).to.equal(volFeedSabrParams.putAlpha)
		expect(proposedSabrParams.putBeta).to.equal(volFeedSabrParams.putBeta)
		expect(proposedSabrParams.putRho).to.equal(volFeedSabrParams.putRho)
		expect(proposedSabrParams.putVolvol).to.equal(volFeedSabrParams.putVolvol)
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
		const balance = await usd.balanceOf(senderAddress)
		await usd.approve(liquidityPool.address, toUSDC(liquidityPoolUsdcDeposit))
		const deposit = await liquidityPool.deposit(toUSDC(liquidityPoolUsdcDeposit))
		const liquidityPoolBalance = await liquidityPool.balanceOf(senderAddress)
		const receipt = await deposit.wait(1)
		const event = receipt?.events?.find(x => x.event == "Deposit")
		const newBalance = await usd.balanceOf(senderAddress)
		expect(event?.event).to.eq("Deposit")
	})
	it("pauses trading and executes epoch", async () => {
		await liquidityPool.pauseTradingAndRequest()
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		await portfolioValuesFeed.fulfill(
			utils.formatBytes32String("2"),
			weth.address,
			usd.address,
			BigNumber.from(0),
			BigNumber.from(0),
			BigNumber.from(0),
			BigNumber.from(0),
			BigNumber.from(0),
			BigNumber.from(priceQuote)
		)
		await liquidityPool.executeEpochCalculation()
		await liquidityPool.redeem(toWei("10000000"))
	})
	it("#deploys rage", async () => {
		let rageParams = await deployRage()
		clearingHouse = rageParams.clearingHouse
		poolId = rageParams.poolId
		collateralId = rageParams.collateralId
		vQuoteAddress = rageParams.vQuoteAddress
		vTokenAddress = rageParams.vTokenAddress
		rageOracle = rageParams.rageOracle
		settlementTokenOracle = rageParams.settlementTokenOracle
	})
	it("#deploys the hedging reactor", async () => {
		const perpHedgingReactorFactory = await ethers.getContractFactory("PerpHedgingReactor", {
			signer: signers[0]
		})
		perpHedgingReactor = (await perpHedgingReactorFactory.deploy(
			clearingHouse.address,
			USDC_ADDRESS[chainId],
			WETH_ADDRESS[chainId],
			liquidityPool.address,
			poolId,
			collateralId,
			priceFeed.address,
			authority
		)) as PerpHedgingReactor

		expect(perpHedgingReactor).to.have.property("hedgeDelta")
		await usd.approve(perpHedgingReactor.address, 1)
		await perpHedgingReactor.initialiseReactor()
		const reactorAddress = perpHedgingReactor.address

		await liquidityPool.setHedgingReactorAddress(reactorAddress)

		await expect(await liquidityPool.hedgingReactors(0)).to.equal(reactorAddress)
	})
	it("#deploy range order", async () => {
		await deployRangeOrder(signers, clearingHouse, usd, collateralId, vTokenAddress, vQuoteAddress)
	})
	it("can compute portfolio delta", async function () {
		const delta = await liquidityPool.getPortfolioDelta()
		expect(delta).to.equal(0)
	})
	it("LP Writes a ETH/USD put for premium", async () => {
		const [sender] = signers
		const amount = toWei("1")
		const blockNum = await ethers.provider.getBlockNumber()
		const block = await ethers.provider.getBlock(blockNum)
		const { timestamp } = block
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const strikePrice = priceQuote.sub(toWei(strike))
		const proposedSeries = {
			expiration: expiration,
			strike: BigNumber.from(strikePrice),
			isPut: PUT_FLAVOR,
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const EthPrice = await oracle.getPrice(weth.address)
		const poolBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const quote = (
			await liquidityPool.quotePriceWithUtilizationGreeks(proposedSeries, amount, false)
		)[0]
		await usd.approve(handler.address, quote)
		const balance = await usd.balanceOf(senderAddress)
		const seriesAddress = (await handler.callStatic.issueAndWriteOption(proposedSeries, amount))
			.series
		const write = await handler.issueAndWriteOption(proposedSeries, amount)
		const localDelta = await calculateOptionDeltaLocally(
			liquidityPool,
			priceFeed,
			proposedSeries,
			toWei("1"),
			true
		)
		await portfolioValuesFeed.fulfill(
			utils.formatBytes32String("1"),
			weth.address,
			usd.address,
			localDelta,
			BigNumber.from(0),
			BigNumber.from(0),
			BigNumber.from(0),
			quote,
			priceQuote
		)
		const poolBalanceAfter = await usd.balanceOf(liquidityPool.address)
		putOptionToken = new Contract(seriesAddress, Otoken.abi, sender) as IOToken
		const putBalance = await putOptionToken.balanceOf(senderAddress)
		collateralAllocatedToVault1 = await liquidityPool.collateralAllocated()
		const balanceNew = await usd.balanceOf(senderAddress)
		const opynAmount = toOpyn(fromWei(amount))
		expect(putBalance).to.eq(opynAmount)
		// ensure funds are being transfered
		expect(tFormatUSDC(balance.sub(balanceNew)) - tFormatEth(quote)).to.be.lt(0.1)
		const poolBalanceDiff = poolBalanceBefore.sub(poolBalanceAfter)
	})
	let prevalues: any
	let quote: any
	let localDelta: any
	it("LP writes another ETH/USD put that expires later", async () => {
		const [sender] = signers
		const amount = toWei("3")
		const blockNum = await ethers.provider.getBlockNumber()
		const block = await ethers.provider.getBlock(blockNum)
		const { timestamp } = block
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const strikePrice = priceQuote.sub(toWei(strike))
		const proposedSeries = {
			expiration: expiration2,
			strike: BigNumber.from(strikePrice),
			isPut: PUT_FLAVOR,
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const poolBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const lpAllocatedBefore = await liquidityPool.collateralAllocated()
		quote = (await liquidityPool.quotePriceWithUtilizationGreeks(proposedSeries, amount, false))[0]
		await usd.approve(handler.address, quote)
		const balance = await usd.balanceOf(senderAddress)
		prevalues = await portfolioValuesFeed.getPortfolioValues(weth.address, usd.address)
		const seriesAddress = (await handler.callStatic.issueAndWriteOption(proposedSeries, amount))
			.series
		const write = await handler.issueAndWriteOption(proposedSeries, amount)
		localDelta = await calculateOptionDeltaLocally(
			liquidityPool,
			priceFeed,
			proposedSeries,
			toWei("3"),
			true
		)
		await portfolioValuesFeed.fulfill(
			utils.formatBytes32String("1"),
			weth.address,
			usd.address,
			prevalues.delta.add(localDelta),
			BigNumber.from(0),
			BigNumber.from(0),
			BigNumber.from(0),
			prevalues.callPutsValue.add(quote),
			priceQuote
		)
		const poolBalanceAfter = await usd.balanceOf(liquidityPool.address)
		putOptionToken2 = new Contract(seriesAddress, Otoken.abi, sender) as IOToken
		const putBalance = await putOptionToken2.balanceOf(senderAddress)
		const lpAllocatedAfter = await liquidityPool.collateralAllocated()
		const balanceNew = await usd.balanceOf(senderAddress)
		const opynAmount = toOpyn(fromWei(amount))
		expect(putBalance).to.eq(opynAmount)
		// ensure funds are being transfered
		expect(tFormatUSDC(balance.sub(balanceNew)) - tFormatEth(quote)).to.be.lt(0.1)
		const poolBalanceDiff = poolBalanceBefore.sub(poolBalanceAfter)
		const lpAllocatedDiff = lpAllocatedAfter.sub(lpAllocatedBefore)
		expect(tFormatUSDC(poolBalanceDiff) + tFormatEth(quote) - tFormatUSDC(lpAllocatedDiff)).to.be.lt(
			0.1
		)
	})
	it("can compute portfolio delta", async function () {
		const delta = await liquidityPool.getPortfolioDelta()
		expect(delta).to.be.gt(0)
	})

	it("reverts when non-admin calls rebalance function", async () => {
		const delta = await liquidityPool.getPortfolioDelta()
		await expect(liquidityPool.connect(signers[1]).rebalancePortfolioDelta(delta, 0)).to.be.reverted
	})
	it("hedges positive delta in perp hedging reactor", async () => {
		const delta = await liquidityPool.getPortfolioDelta()
		const reactorDelta = await perpHedgingReactor.internalDelta()
		await liquidityPool.rebalancePortfolioDelta(delta, 0, { gasLimit: 999999999999 })
		const newReactorDelta = await perpHedgingReactor.internalDelta()
		const newDelta = await liquidityPool.getPortfolioDelta()
		expect(newDelta).to.be.within(0, 1e13)
		expect(reactorDelta.sub(newReactorDelta)).to.equal(delta)
	})
	it("Adds additional liquidity from new account", async () => {
		const [sender, receiver] = signers
		const sendAmount = toUSDC("1000000")
		const usdReceiver = usd.connect(receiver)
		await usdReceiver.approve(liquidityPool.address, sendAmount)
		const lpReceiver = liquidityPool.connect(receiver)
		const totalSupply = await liquidityPool.totalSupply()
		await lpReceiver.deposit(sendAmount)
		const newTotalSupply = await liquidityPool.totalSupply()
		const lpBalance = await lpReceiver.balanceOf(receiverAddress)
		const difference = newTotalSupply.sub(lpBalance)
		expect(difference).to.eq(await lpReceiver.balanceOf(senderAddress))
		expect(newTotalSupply).to.eq(totalSupply.add(lpBalance))
	})
	it("pauses trading and executes epoch", async () => {
		await liquidityPool.pauseTradingAndRequest()
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		await portfolioValuesFeed.fulfill(
			utils.formatBytes32String("1"),
			weth.address,
			usd.address,
			prevalues.delta.add(localDelta),
			BigNumber.from(0),
			BigNumber.from(0),
			BigNumber.from(0),
			prevalues.callPutsValue.add(quote),
			priceQuote
		)
		const executeEpochTx = await liquidityPool.executeEpochCalculation()
		await executeEpochTx.wait()
	})
	it("initiates withdraw liquidity", async () => {
		await liquidityPool.initiateWithdraw(await liquidityPool.balanceOf(senderAddress))
		await liquidityPool
			.connect(signers[1])
			.initiateWithdraw(await liquidityPool.connect(signers[1]).callStatic.redeem(toWei("500000")))
	})
	it("pauses trading and executes epoch", async () => {
		const withdrawalEpochBefore = await liquidityPool.withdrawalEpoch()
		await liquidityPool.pauseTradingAndRequest()
		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		await portfolioValuesFeed.fulfill(
			utils.formatBytes32String("1"),
			weth.address,
			usd.address,
			prevalues.delta.add(localDelta),
			BigNumber.from(0),
			BigNumber.from(0),
			BigNumber.from(0),
			prevalues.callPutsValue.add(quote),
			priceQuote
		)
		const executeEpochTx = await liquidityPool.executeEpochCalculation()
		await executeEpochTx.wait()
		const withdrawalEpochAfter = await liquidityPool.withdrawalEpoch()
		expect(withdrawalEpochBefore.add(1)).to.equal(withdrawalEpochAfter)
	})
	it("LP can redeem shares", async () => {
		const totalShares = await liquidityPool.totalSupply()
		//@ts-ignore
		const ratio = 1 / fromWei(totalShares)
		const usdBalance = await usd.balanceOf(liquidityPool.address)
		const withdraw = await liquidityPool.completeWithdraw()
		const receipt = await withdraw.wait(1)
		const events = receipt.events
		const removeEvent = events?.find(x => x.event == "Withdraw")
		const strikeAmount = removeEvent?.args?.amount
		const usdBalanceAfter = await usd.balanceOf(liquidityPool.address)
		//@ts-ignore
		const diff = fromWei(usdBalance) * ratio
		expect(diff).to.be.lt(1)
		expect(strikeAmount).to.be.eq(usdBalance.sub(usdBalanceAfter))
	})
	it("settles an expired ITM vault", async () => {
		const totalCollateralAllocated = await liquidityPool.collateralAllocated()
		const oracle = await setupOracle(CHAINLINK_WETH_PRICER[chainId], senderAddress, true)
		const strikePrice = await putOptionToken.strikePrice()
		// set price to $80 ITM for put
		const settlePrice = strikePrice.sub(toWei("80").div(oTokenDecimalShift18))
		// set the option expiry price, make sure the option has now expired
		await setOpynOracleExpiryPrice(WETH_ADDRESS[chainId], oracle, expiration, settlePrice)
		// settle the vault
		const settleVault = await liquidityPool.settleVault(putOptionToken.address)
		let receipt = await settleVault.wait()
		const events = receipt.events
		const settleEvent = events?.find(x => x.event == "SettleVault")
		const collateralReturned = settleEvent?.args?.collateralReturned
		const collateralLost = settleEvent?.args?.collateralLost
		// puts expired ITM, so the amount ITM will be subtracted and used to pay out option holders
		const optionITMamount = strikePrice.sub(settlePrice)
		const amount = parseFloat(utils.formatUnits(await putOptionToken.totalSupply(), 8))
		// format from e8 oracle price to e6 USDC decimals
		expect(collateralReturned).to.equal(
			collateralAllocatedToVault1.sub(optionITMamount.div(100)).mul(amount)
		)
		expect(await liquidityPool.collateralAllocated()).to.equal(
			totalCollateralAllocated.sub(collateralReturned).sub(collateralLost)
		)
	})

	it("settles an expired OTM vault", async () => {
		const totalCollateralAllocated = await liquidityPool.collateralAllocated()
		const oracle = await setupOracle(CHAINLINK_WETH_PRICER[chainId], senderAddress, true)
		const strikePrice = await putOptionToken.strikePrice()
		// set price to $100 OTM for put
		const settlePrice = strikePrice.add(toWei("100").div(oTokenDecimalShift18))
		// set the option expiry price, make sure the option has now expired
		await setOpynOracleExpiryPrice(WETH_ADDRESS[chainId], oracle, expiration2, settlePrice)
		// settle the vault
		const settleVault = await liquidityPool.settleVault(putOptionToken2.address)
		let receipt = await settleVault.wait()
		const events = receipt.events
		const settleEvent = events?.find(x => x.event == "SettleVault")
		const collateralReturned = settleEvent?.args?.collateralReturned
		const collateralLost = settleEvent?.args?.collateralLost
		// puts expired OTM, so all collateral should be returned
		const amount = parseFloat(utils.formatUnits(await putOptionToken.totalSupply(), 8))
		expect(collateralReturned).to.equal(totalCollateralAllocated) // format from e8 oracle price to e6 USDC decimals
		expect(await liquidityPool.collateralAllocated()).to.equal(0)
		expect(collateralLost).to.equal(0)
	})
	it("Succeed: Perp hedging reactor unwind", async () => {
		await perpHedgingReactor.syncAndUpdate()

		await liquidityPool.removeHedgingReactorAddress(0, false)
		expect(await perpHedgingReactor.getDelta()).to.equal(0)
		expect(await liquidityPool.getExternalDelta()).to.equal(0)
		expect((await perpHedgingReactor.getPoolDenominatedValue()).div(1e12)).to.eq(1)
		expect(await usd.balanceOf(perpHedgingReactor.address)).to.eq(0)
		// check no hedging reactors exist
		await expect(liquidityPool.hedgingReactors(0)).to.be.reverted
	})
})
