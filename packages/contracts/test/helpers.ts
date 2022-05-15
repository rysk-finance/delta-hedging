import hre, { ethers } from "hardhat"
import {
	toWei,
	genOptionTimeFromUnix,
	fromWei,
	tFormatUSDC,
	tFormatEth
} from "../utils/conversion-helper"
import {
	CHAINLINK_WETH_PRICER,
	GAMMA_ORACLE,
	GAMMA_WHITELIST,
	ORACLE_DISPUTE_PERIOD,
	ORACLE_LOCKING_PERIOD,
	ORACLE_OWNER,
	USDC_ADDRESS,
	WETH_ADDRESS
} from "./constants"
//@ts-ignore
import greeks from "greeks"
import { MintableERC20 } from "../types/MintableERC20"
import { WETH } from "../types/WETH"
import { BigNumber, Contract, utils } from "ethers"
import { MockChainlinkAggregator } from "../types/MockChainlinkAggregator"
import { ChainLinkPricer } from "../types/ChainLinkPricer"
import { LiquidityPool } from "../types/LiquidityPool"
import { PriceFeed } from "../types/PriceFeed"
//@ts-ignore
import bs from "black-scholes"
import { E } from "prb-math"
import { OptionRegistry } from "../types/OptionRegistry"

const { provider } = ethers
const { parseEther } = ethers.utils
const chainId = 1
// decimal representation of a percentage
const rfr: string = "0.03"
const belowUtilizationThresholdGradient = 0.1
const aboveUtilizationThresholdGradient = 1.5
const utilizationFunctionThreshold = 0.6 // 60%
const yIntercept = -0.84

export async function whitelistProduct(
	underlying: string,
	strike: string,
	collateral: string,
	isPut: boolean
) {
	const [adminSigner] = await ethers.getSigners()

	await hre.network.provider.request({
		method: "hardhat_impersonateAccount",
		params: [ORACLE_OWNER[chainId]]
	})

	const ownerSigner = await provider.getSigner(ORACLE_OWNER[chainId])

	const whitelist = await ethers.getContractAt("IGammaWhitelist", GAMMA_WHITELIST[chainId])

	await adminSigner.sendTransaction({
		to: ORACLE_OWNER[chainId],
		value: parseEther("1")
	})

	await whitelist.connect(ownerSigner).whitelistCollateral(collateral)

	await whitelist.connect(ownerSigner).whitelistProduct(underlying, strike, collateral, isPut)
}

export async function setupOracle(chainlinkPricer: string, signerAddress: string, useNew = false) {
	const signer = await provider.getSigner(signerAddress)
	await hre.network.provider.request({
		method: "hardhat_impersonateAccount",
		params: [chainlinkPricer]
	})
	await hre.network.provider.request({
		method: "hardhat_impersonateAccount",
		params: [ORACLE_OWNER[chainId]]
	})
	const pricerSigner = await provider.getSigner(chainlinkPricer)

	const forceSendContract = await ethers.getContractFactory("ForceSend")
	const forceSend = await forceSendContract.deploy() // force Send is a contract that forces the sending of Ether to WBTC minter (which is a contract with no receive() function)
	await forceSend.connect(signer).go(chainlinkPricer, { value: parseEther("0.5") })

	const oracle = await ethers.getContractAt("Oracle", GAMMA_ORACLE[chainId])

	const oracleOwnerSigner = await provider.getSigner(ORACLE_OWNER[chainId])

	await signer.sendTransaction({
		to: ORACLE_OWNER[chainId],
		value: parseEther("0.5")
	})
	await oracle.connect(oracleOwnerSigner).setStablePrice(USDC_ADDRESS[chainId], "100000000")
	const pricer = await ethers.getContractAt("ChainLinkPricer", chainlinkPricer)

	await oracle.connect(oracleOwnerSigner).setAssetPricer(await pricer.asset(), chainlinkPricer)
	return oracle
}

export async function setupTestOracle(signerAddress: string) {
	const signer = await provider.getSigner(signerAddress)

	await hre.network.provider.request({
		method: "hardhat_impersonateAccount",
		params: [ORACLE_OWNER[chainId]]
	})

	const oracle = await ethers.getContractAt("Oracle", GAMMA_ORACLE[chainId])

	const oracleOwnerSigner = await provider.getSigner(ORACLE_OWNER[chainId])

	await signer.sendTransaction({
		to: ORACLE_OWNER[chainId],
		value: parseEther("0.5")
	})
	await oracle.connect(oracleOwnerSigner).setStablePrice(USDC_ADDRESS[chainId], "100000000")
	const newAggInstance = await ethers.getContractFactory("MockChainlinkAggregator")
	const aggregator = (await newAggInstance.deploy()) as MockChainlinkAggregator
	const newPricerInstance = await ethers.getContractFactory("ChainLinkPricer")
	const pricer = (await newPricerInstance.deploy(
		signerAddress,
		WETH_ADDRESS[chainId],
		aggregator.address,
		oracle.address
	)) as ChainLinkPricer
	const price = await oracle.getPrice(WETH_ADDRESS[chainId])
	await oracle.connect(oracleOwnerSigner).setAssetPricer(await pricer.asset(), pricer.address)
	const forceSendContract = await ethers.getContractFactory("ForceSend")
	const forceSend = await forceSendContract.deploy() // force Send is a contract that forces the sending of Ether to WBTC minter (which is a contract with no receive() function)
	await forceSend.connect(signer).go(pricer.address, { value: parseEther("0.5") })
	await aggregator.setLatestAnswer(price)
	return [oracle, aggregator, pricer.address]
}

export async function setOpynOracleExpiryPrice(
	asset: string,
	oracle: Contract,
	expiry: number,
	settlePrice: BigNumber,
	pricer?: string
) {
	await increaseTo(expiry + ORACLE_LOCKING_PERIOD + 100)
	if (pricer == undefined) [(pricer = CHAINLINK_WETH_PRICER[chainId])]
	await hre.network.provider.request({
		method: "hardhat_impersonateAccount",
		params: [pricer]
	})
	const pricerSigner = await provider.getSigner(pricer)
	const res = await oracle.connect(pricerSigner).setExpiryPrice(asset, expiry, settlePrice)

	const receipt = await res.wait()
	const timestamp = (await provider.getBlock(receipt.blockNumber)).timestamp

	await increaseTo(timestamp + ORACLE_DISPUTE_PERIOD + 1000)
}

export async function increaseTo(target: number | BigNumber) {
	if (!BigNumber.isBigNumber(target)) {
		target = BigNumber.from(target)
	}

	const now = BigNumber.from((await ethers.provider.getBlock("latest")).timestamp)

	if (target.lt(now))
		throw Error(`Cannot increase current time (${now}) to a moment in the past (${target})`)

	const diff = target.sub(now)
	return increase(diff)
}

export async function increase(duration: number | BigNumber) {
	if (!BigNumber.isBigNumber(duration)) {
		duration = BigNumber.from(duration)
	}

	if (duration.lt(BigNumber.from("0")))
		throw Error(`Cannot increase time by a negative amount (${duration})`)

	await ethers.provider.send("evm_increaseTime", [duration.toNumber()])

	await ethers.provider.send("evm_mine", [])
}

export async function calculateOptionQuoteLocally(
	liquidityPool: LiquidityPool,
	optionRegistry: OptionRegistry,
	collateralAsset: MintableERC20,
	priceFeed: PriceFeed,
	optionSeries: {
		expiration: number
		strike: BigNumber
		isPut: boolean
		strikeAsset: string
		underlying: string
		collateral: string
	},
	amount: BigNumber,
	toBuy: boolean = false
) {
	const blockNum = await ethers.provider.getBlockNumber()
	const block = await ethers.provider.getBlock(blockNum)
	const { timestamp } = block
	const timeToExpiration = genOptionTimeFromUnix(Number(timestamp), optionSeries.expiration)
	const underlyingPrice = await priceFeed.getNormalizedRate(
		WETH_ADDRESS[chainId],
		USDC_ADDRESS[chainId]
	)
	const priceNorm = fromWei(underlyingPrice)
	const iv = await liquidityPool.getImpliedVolatility(
		optionSeries.isPut,
		underlyingPrice,
		optionSeries.strike,
		optionSeries.expiration
	)
	const maxDiscount = ethers.utils.parseUnits("1", 17) // 10%

	const NAV = await liquidityPool.getNAV()
	const collateralAllocated = await liquidityPool.collateralAllocated()
	const lpUSDBalance = await collateralAsset.balanceOf(liquidityPool.address)
	const portfolioDeltaBefore = await liquidityPool.getPortfolioDelta()
	const optionDelta = await calculateOptionDeltaLocally(
		liquidityPool,
		priceFeed,
		optionSeries,
		amount,
		!toBuy
	)
	// optionDelta will already be inverted if we are selling it
	const portfolioDeltaAfter = portfolioDeltaBefore.add(optionDelta)
	const portfolioDeltaIsDecreased = portfolioDeltaAfter.abs().sub(portfolioDeltaBefore.abs()).lt(0)
	const normalisedDelta = portfolioDeltaBefore
		.add(portfolioDeltaAfter)
		.div(2)
		.abs()
		.div(NAV.div(underlyingPrice))

	const deltaTiltAmount = parseFloat(
		utils.formatEther(normalisedDelta.gt(maxDiscount) ? maxDiscount : normalisedDelta)
	)
	const liquidityAllocated = await optionRegistry.getCollateral(
		{
			expiration: optionSeries.expiration,
			strike: optionSeries.strike.div(10 ** 10),
			isPut: optionSeries.isPut,
			underlying: optionSeries.underlying,
			strikeAsset: optionSeries.strikeAsset,
			collateral: optionSeries.collateral
		},
		amount
	)
	const utilizationBefore =
		tFormatUSDC(collateralAllocated) / tFormatUSDC(collateralAllocated.add(lpUSDBalance))
	const utilizationAfter =
		tFormatUSDC(collateralAllocated.add(liquidityAllocated)) /
		tFormatUSDC(collateralAllocated.add(lpUSDBalance))
	const bidAskSpread = tFormatEth(await liquidityPool.bidAskIVSpread())
	const localBS =
		bs.blackScholes(
			priceNorm,
			fromWei(optionSeries.strike),
			timeToExpiration,
			toBuy ? Number(fromWei(iv)) * (1 - Number(bidAskSpread)) : fromWei(iv),
			parseFloat(rfr),
			optionSeries.isPut ? "put" : "call"
		) * parseFloat(fromWei(amount))
	let utilizationPrice = toBuy
		? localBS
		: getUtilizationPrice(utilizationBefore, utilizationAfter, localBS)
	// if delta exposure reduces, subtract delta skew from  pricequotes
	if (portfolioDeltaIsDecreased) {
		if (toBuy) {
			utilizationPrice = utilizationPrice + utilizationPrice * deltaTiltAmount
		} else {
			utilizationPrice = utilizationPrice - utilizationPrice * deltaTiltAmount
		}
		return utilizationPrice
		// if delta exposure increases, add delta skew to price quotes
	} else {
		if (toBuy) {
			utilizationPrice = utilizationPrice - utilizationPrice * deltaTiltAmount
		} else {
			utilizationPrice = utilizationPrice + utilizationPrice * deltaTiltAmount
		}

		return utilizationPrice
	}
}

export async function calculateOptionDeltaLocally(
	liquidityPool: LiquidityPool,
	priceFeed: PriceFeed,
	optionSeries: {
		expiration: number
		isPut: boolean
		strike: BigNumber
		strikeAsset: string
		underlying: string
		collateral: string
	},
	amount: BigNumber,
	isShort: boolean
) {
	const priceQuote = await priceFeed.getNormalizedRate(WETH_ADDRESS[chainId], USDC_ADDRESS[chainId])
	const blockNum = await ethers.provider.getBlockNumber()
	const block = await ethers.provider.getBlock(blockNum)
	const { timestamp } = block
	const time = genOptionTimeFromUnix(timestamp, optionSeries.expiration)
	const vol = await liquidityPool.getImpliedVolatility(
		optionSeries.isPut,
		priceQuote,
		optionSeries.strike,
		optionSeries.expiration
	)
	const opType = optionSeries.isPut ? "put" : "call"
	let localDelta = greeks.getDelta(
		fromWei(priceQuote),
		fromWei(optionSeries.strike),
		time,
		fromWei(vol),
		rfr,
		opType
	)
	localDelta = isShort ? -localDelta : localDelta
	return toWei(localDelta.toString()).mul(amount.div(toWei("1")))
}

export async function getBlackScholesQuote(
	liquidityPool: LiquidityPool,
	optionRegistry: OptionRegistry,
	collateralAsset: MintableERC20,
	priceFeed: PriceFeed,
	optionSeries: {
		expiration: number
		strike: BigNumber
		isPut: boolean
		strikeAsset: string
		underlying: string
		collateral: string
	},
	amount: BigNumber,
	toBuy: boolean = false
) {
	const underlyingPrice = await priceFeed.getNormalizedRate(
		WETH_ADDRESS[chainId],
		USDC_ADDRESS[chainId]
	)
	const iv = await liquidityPool.getImpliedVolatility(
		optionSeries.isPut,
		underlyingPrice,
		optionSeries.strike,
		optionSeries.expiration
	)
	const blockNum = await ethers.provider.getBlockNumber()
	const block = await ethers.provider.getBlock(blockNum)
	const { timestamp } = block
	const timeToExpiration = genOptionTimeFromUnix(Number(timestamp), optionSeries.expiration)

	const priceNorm = fromWei(underlyingPrice)
	const bidAskSpread = tFormatEth(await liquidityPool.bidAskIVSpread())
	const localBS =
		bs.blackScholes(
			priceNorm,
			fromWei(optionSeries.strike),
			timeToExpiration,
			toBuy ? Number(fromWei(iv)) * (1 - Number(bidAskSpread)) : fromWei(iv),
			parseFloat(rfr),
			optionSeries.isPut ? "put" : "call"
		) * parseFloat(fromWei(amount))

	return localBS
}

function getUtilizationPrice(
	utilizationBefore: number,
	utilizationAfter: number,
	optionPrice: number
) {
	if (
		utilizationBefore < utilizationFunctionThreshold &&
		utilizationAfter < utilizationFunctionThreshold
	) {
		return (
			optionPrice +
			((optionPrice * (utilizationBefore + utilizationAfter)) / 2) * belowUtilizationThresholdGradient
		)
	} else if (
		utilizationBefore > utilizationFunctionThreshold &&
		utilizationAfter > utilizationFunctionThreshold
	) {
		const utilizationPremiumFactor =
			((utilizationBefore + utilizationAfter) / 2) * aboveUtilizationThresholdGradient + yIntercept
		return optionPrice + optionPrice * utilizationPremiumFactor
	} else {
		const weightingRatio =
			(utilizationFunctionThreshold - utilizationBefore) /
			(utilizationAfter - utilizationFunctionThreshold)
		const averageFactorBelow =
			((utilizationFunctionThreshold + utilizationBefore) / 2) * belowUtilizationThresholdGradient
		const averageFactorAbove =
			((utilizationFunctionThreshold + utilizationAfter) / 2) * aboveUtilizationThresholdGradient +
			yIntercept
		const multiplicationFactor =
			(weightingRatio * averageFactorBelow + averageFactorAbove) / (1 + weightingRatio)
		return optionPrice + optionPrice * multiplicationFactor
	}
}
