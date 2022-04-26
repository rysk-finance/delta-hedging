import hre, { ethers, network } from "hardhat"
import { BigNumberish, Contract, utils, Signer, BigNumber } from "ethers"
import {
	toWei,
	call,
	put,
	fromWei,
	convertRounded,
	toUSDC,
	fromOpyn,
	scaleNum
} from "../utils/conversion-helper"
import {deploySystem} from "../utils/generic-system-deployer"
import moment from "moment"
//@ts-ignore
import { expect } from "chai"
import Otoken from "../artifacts/contracts/packages/opyn/core/Otoken.sol/Otoken.json"
import LiquidityPoolSol from "../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json"
import { ERC20Interface } from "../types/ERC20Interface"
import { MintableERC20 } from "../types/MintableERC20"
import { OptionRegistry } from "../types/OptionRegistry"
import { MockPortfolioValuesFeed } from "../types/MockPortfolioValuesFeed"
import { Otoken as IOToken } from "../types/Otoken"
import { PriceFeed } from "../types/PriceFeed"
import { LiquidityPool } from "../types/LiquidityPool"
import { WETH } from "../types/WETH"
import { Protocol } from "../types/Protocol"
import { Volatility } from "../types/Volatility"
import { NewController } from "../types/NewController"
import { AddressBook } from "../types/AddressBook"
import { Oracle } from "../types/Oracle"
import { NewMarginCalculator } from "../types/NewMarginCalculator"
import { setupTestOracle, calculateOptionDeltaLocally, calculateOptionQuoteLocally } from "./helpers"
import {
	ADDRESS_BOOK,
	GAMMA_CONTROLLER,
	MARGIN_POOL,
	OTOKEN_FACTORY,
	USDC_ADDRESS,
	WETH_ADDRESS,
	CONTROLLER_OWNER,
	GAMMA_ORACLE_NEW,
	USDC_OWNER_ADDRESS
} from "./constants"
import { MockChainlinkAggregator } from "../types/MockChainlinkAggregator"
import { deployOpyn } from "../utils/opyn-deployer"
import { VolatilityFeed } from "../types/VolatilityFeed"

let usd: MintableERC20
let wethERC20: ERC20Interface
let weth: WETH
let optionRegistry: OptionRegistry
let optionProtocol: Protocol
let signers: Signer[]
let senderAddress: string
let liquidityProviderAddress: string
let attackerAddress: string
let liquidityPool: LiquidityPool
let priceFeed: PriceFeed
let volatility: Volatility
let volFeed: VolatilityFeed
let controller: NewController
let addressBook: AddressBook
let newCalculator: NewMarginCalculator
let oracle: Oracle
let opynAggregator: MockChainlinkAggregator
let portfolioValuesFeed: MockPortfolioValuesFeed
let Option: IOToken

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

/* --- variables to change --- */

// Date for option to expire on format yyyy-mm-dd
// Will automatically convert to 08:00 UTC timestamp
// First mined block will be timestamped 2022-02-27 19:05 UTC
const expiryDate: string = "2022-04-05"
// decimal representation of a percentage
const rfr: string = "0.03"
// edit depending on the chain id to be tested on
const chainId = 1
const oTokenDecimalShift18 = 10000000000
// amount of dollars OTM written options will be (both puts and calls)
// use negative numbers for ITM options
const strike = "-5000"

// balances to deposit into the LP
const liquidityPoolUsdcDeposit = "1000000"

// attacker deposit LP70839675
const attackerUsdcDeposit = "1000"

// balance to withdraw after deposit
const liquidityPoolWethWidthdraw = "0.1"

const minCallStrikePrice = utils.parseEther("500")
const maxCallStrikePrice = utils.parseEther("20000")
const minPutStrikePrice = utils.parseEther("500")
const maxPutStrikePrice = utils.parseEther("20000")
// one week in seconds
const minExpiry = 86400 * 7
// 365 days in seconds
const maxExpiry = 86400 * 365

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

const CALL_FLAVOR = false
const PUT_FLAVOR = true

describe("RR oracle between update attack vector", function () {
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
		signers = await ethers.getSigners()
		let opynParams = await deployOpyn(signers, productSpotShockValue, timeToExpiry, expiryToValue)
		controller = opynParams.controller
		addressBook = opynParams.addressBook
		oracle = opynParams.oracle
		newCalculator = opynParams.newCalculator
		// get the oracle
		const res = await setupTestOracle(await signers[0].getAddress())
		oracle = res[0] as Oracle
		opynAggregator = res[1] as MockChainlinkAggregator
		let deployParams = await deploySystem(await signers[0].getAddress(), oracle, opynAggregator)
		weth = deployParams.weth
		wethERC20 = deployParams.wethERC20
		usd = deployParams.usd
		optionRegistry = deployParams.optionRegistry
		priceFeed = deployParams.priceFeed
		volFeed = deployParams.volFeed
		portfolioValuesFeed = deployParams.portfolioValuesFeed
		optionProtocol = deployParams.optionProtocol
		senderAddress = await signers[0].getAddress()
	})
	it("Creates a liquidity pool with USDC (erc20) as strikeAsset", async () => {

	})

	it("Adds liquidity to the liquidityPool", async () => {
		const USDC_WHALE = "0x55fe002aeff02f77364de339a1292923a15844b8"
		await hre.network.provider.request({
			method: "hardhat_impersonateAccount",
			params: [USDC_WHALE]
		})
		const usdcWhale = await ethers.getSigner(USDC_WHALE)
		const usdWhaleConnect = await usd.connect(usdcWhale)
		await usdWhaleConnect.transfer(liquidityProviderAddress, toUSDC(liquidityPoolUsdcDeposit))
		await usdWhaleConnect.transfer(attackerAddress, toUSDC("50000"))
		const balance = await usd.balanceOf(liquidityProviderAddress)
		await usd.approve(liquidityPool.address, toWei(liquidityPoolUsdcDeposit))
		const deposit = await liquidityPool.deposit(
			toUSDC(liquidityPoolUsdcDeposit),
			liquidityProviderAddress
		)
		const liquidityPoolBalanceUSDC = await usd.balanceOf(liquidityPool.address)
		const receipt = await deposit.wait(1)
		const event = receipt?.events?.find(x => x.event == "Deposit")
		const newBalance = await usd.balanceOf(liquidityProviderAddress)
		expect(event?.event).to.eq("Deposit")
		expect(balance.sub(newBalance)).to.eq(toUSDC(liquidityPoolUsdcDeposit))
		expect(liquidityPoolBalanceUSDC).to.equal(utils.parseUnits(liquidityPoolUsdcDeposit, 6))
	})

	it("LP Writes a WETH/USD put collateralized by USD for premium to the attacker", async () => {
		const [liquidityProvider, attacker] = signers
		// registry requires liquidity pool to be owner
		optionRegistry.setLiquidityPool(liquidityPool.address)
		const amount = toWei("10")
		const blockNum = await ethers.provider.getBlockNumber()
		const block = await ethers.provider.getBlock(blockNum)
		const { timestamp } = block

		// opyn contracts require expiration to be at 8:00 UTC

		const priceQuote = await priceFeed.getNormalizedRate(weth.address, usd.address)
		const strikePrice = priceQuote.sub(toWei(strike))
		const lpUSDBalanceBefore = await usd.balanceOf(liquidityPool.address)
		const proposedSeries = {
			expiration: expiration,
			isPut: true,
			strike: BigNumber.from(strikePrice),
			strikeAsset: usd.address,
			underlying: weth.address,
			collateral: usd.address
		}
		const localDelta = await calculateOptionDeltaLocally(
			liquidityPool,
			priceFeed,
			proposedSeries,
			amount,
			true
		)
		const localQuote = await calculateOptionQuoteLocally(
			liquidityPool,
			priceFeed,
			proposedSeries,
			amount,
			false
		)
		const quote = (await liquidityPool.quotePriceWithUtilizationGreeks(proposedSeries, amount))[0]
		await usd.connect(attacker).approve(liquidityPool.address, toWei("10000000000"))
		const write = await liquidityPool.connect(attacker).issueAndWriteOption(proposedSeries, amount)
		const receipt = await write.wait(1)
		const events = receipt.events
		const writeEvent = events?.find(x => x.event == "WriteOption")
		const seriesAddress = writeEvent?.args?.series
		const optionToken = new Contract(seriesAddress, Otoken.abi, attacker) as IOToken
		Option = optionToken
		const buyerOptionBalance = await Option.balanceOf(attackerAddress)
		console.log("Pool should now have delta value of: " + localDelta)
		console.log("Pool should now have a portfolio value of: " + localQuote)
		//@ts-ignore
		const totalInterest = await Option.totalSupply()
		const lpUSDBalance = await usd.balanceOf(liquidityPool.address)
		const balanceDiff = lpUSDBalanceBefore.sub(lpUSDBalance)
		expect(fromOpyn(buyerOptionBalance)).to.eq(fromWei(amount))
		expect(fromOpyn(totalInterest)).to.eq(fromWei(amount))
	})

	it("attacker withdraws liquidity before delta and portfolio values update", async () => {
		console.log("liabilities are now 0 because the pool isnt updated")
		const shares = await liquidityPool.balanceOf(senderAddress)
		const usdcBalanceBefore = await usd.balanceOf(attackerAddress)
		const wethBalanceBefore = await wethERC20.balanceOf(attackerAddress)
		const lpBalanceBefore = await usd.balanceOf(liquidityPool.address)
		await liquidityPool.connect(attacker).withdraw(shares, attackerAddress)
		const lpBalanceAfter = await usd.balanceOf(liquidityPool.address)
		const usdcBalanceAfter = await usd.balanceOf(attackerAddress)
		const wethBalanceAfter = await wethERC20.balanceOf(attackerAddress)
		expect(
			lpBalanceAfter.sub(lpBalanceBefore.sub(utils.parseUnits(attackerUsdcDeposit, 6)))
		).to.be.within(-10, 10)
		expect(
			usdcBalanceAfter.sub(usdcBalanceBefore.add(utils.parseUnits(attackerUsdcDeposit, 6)))
		).to.be.within(-10, 10)
	})
})
