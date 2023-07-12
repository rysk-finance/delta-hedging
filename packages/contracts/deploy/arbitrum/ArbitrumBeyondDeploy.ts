import { BigNumber, Signer, utils, Contract } from "ethers"
import { expect } from "chai"
import fs from "fs"
import { truncate } from "@ragetrade/sdk"
import { toWei } from "../../utils/conversion-helper"
import hre, { ethers } from "hardhat"
import path from "path"
import {
	WETH,
	ERC20,
	OptionRegistry,
	PriceFeed,
	VolatilityFeed,
	AlphaOptionHandler,
	Protocol,
	LiquidityPool,
	AlphaPortfolioValuesFeed,
	Accounting,
	BlackScholes,
	NormalDist,
	PerpHedgingReactor,
	BeyondPricer,
	OptionCatalogue,
	OptionExchange,
	OpynInteractions,
	GmxHedgingReactor,
	Manager,
	OptionsCompute,
	DHVLensMK1
} from "../../types"

const addressPath = path.join(__dirname, "..", "..", "..", "contracts.json")

//	Arbitrum mainnet specific contract addresses. Change for other networks
const multisig = "0xFBdE2e477Ed031f54ed5Ad52f35eE43CD82cF2A6"
const usdcNativeAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
const usdcBridgedAddress = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
const wethAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
const chainlinkOracleAddress = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612"
const gammaOracleAddress = "0xBA1880CFFE38DD13771CB03De896460baf7dA1E7"
const opynControllerProxyAddress = "0x594bD4eC29F7900AE29549c140Ac53b5240d4019"
const opynAddressBookAddress = "0xCa19F26c52b11186B4b1e76a662a14DA5149EA5a"
const opynNewCalculatorAddress = "0x749a3624ad2a001F935E3319743f53Ecc7466358"
const sequencerUptimeAddress = "0xFdB631F5EE196F0ed6FAa767959853A9F217697D"

// rage trade addresses for Arbitrum Mainnet
const clearingHouseAddress = "0x4521916972A76D5BFA65Fb539Cf7a0C2592050Ac"
const vETHAddress = "0x7ab08069a6ee445703116E4E09049E88a237af5E"

// gmx contracts on arbitrum mainnet
const positionRouterAddress = "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868"
const routerAddress = "0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064"
const readerAddress = "0x22199a49A999c351eF7927602CFB187ec3cae489"
const vaultAddress = "0x489ee077994B6658eAfA855C308275EAd8097C4A"

// uniswap v3 addresses (SAME FOR ALL CHAINS)
const uniswapV3SwapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"

const rfr: string = "0"
const minCallStrikePrice = utils.parseEther("500")
const maxCallStrikePrice = utils.parseEther("5000")
const minPutStrikePrice = utils.parseEther("500")
const maxPutStrikePrice = utils.parseEther("5000")
// one day in seconds
const minExpiry = 86400
// 90 days in seconds
const maxExpiry = 7776000
const bidAskSpread = toWei("0")
const maxNetDhvExposure = toWei("5000")

const slippageGradient = toWei("0.0001")
const deltaBandWidth = toWei("5")
const numberOfTenors = 10
const maxTenorValue = 2800
const tenorPricingParams = [
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	},
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	},
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	},
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	},
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	},
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	},
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	},
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	},
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	},
	{
		callSlippageGradientMultipliers: [],
		putSlippageGradientMultipliers: [],
		callSpreadCollateralMultipliers: [],
		putSpreadCollateralMultipliers: [],
		callSpreadDeltaMultipliers: [],
		putSpreadDeltaMultipliers: []
	}
]

const collateralLendingRate = 40000 // 4%
const deltaBorrowRates = {
	sellLong: 19500,
	sellShort: 15000,
	buyLong: 15000,
	buyShort: 19500
}

const liquidityPoolTokenName = "Rysk DHV ETH/USDC"
const liquidityPoolTokenTicker = "ryUSDC-ETH"

async function main() {
	const [deployer] = await ethers.getSigners()

	console.log("Deploying contracts with the account:", deployer.address)

	console.log("Account balance:", (await deployer.getBalance()).toString())

	// deploy system
	let deployParams = await deploySystem(deployer, chainlinkOracleAddress)
	console.log("system deployed")
	const weth = deployParams.weth
	const usdcNative = deployParams.usdcNative
	const usdcBridged = deployParams.usdcBridged
	const optionRegistry = deployParams.optionRegistry
	const priceFeed = deployParams.priceFeed
	const volFeed = deployParams.volFeed
	const portfolioValuesFeed = deployParams.portfolioValuesFeed
	const optionProtocol = deployParams.optionProtocol
	const authority = deployParams.authority
	const interactions = deployParams.opynInteractions
	const blackScholes = deployParams.blackScholes
	const normDist = deployParams.normDist
	const optionsCompute = deployParams.optionsCompute

	let lpParams = await deployLiquidityPool(
		deployer,
		optionProtocol,
		usdcNative,
		usdcBridged,
		weth,
		rfr,
		minCallStrikePrice,
		minPutStrikePrice,
		maxCallStrikePrice,
		maxPutStrikePrice,
		minExpiry,
		maxExpiry,
		optionRegistry,
		portfolioValuesFeed,
		authority.address,
		priceFeed,
		blackScholes,
		interactions,
		optionsCompute
	)
	const liquidityPool = lpParams.liquidityPool
	const handler = lpParams.handler
	const accounting = lpParams.accounting
	const uniswapV3HedgingReactor = lpParams.uniswapV3HedgingReactor
	const perpHedgingReactor = lpParams.perpHedgingReactor
	const gmxHedgingReactor = lpParams.gmxHedgingReactor
	const catalogue = lpParams.catalogue
	const pricer = lpParams.pricer
	const exchange = lpParams.exchange
	const manager = lpParams.manager
	console.log("liquidity pool deployed")

	await authority.pushGovernor(multisig)
	await authority.pushManager(manager.address)
	await manager.pullManager()

	console.log({
		OpynController: opynControllerProxyAddress,
		OpynAddressBook: opynAddressBookAddress,
		OpynOracle: gammaOracleAddress,
		OpynNewCalculator: opynNewCalculatorAddress,
		OpynOptionRegistry: optionRegistry.address,
		priceFeed: priceFeed.address,
		volFeed: volFeed.address,
		optionProtocol: optionProtocol.address,
		liquidityPool: liquidityPool.address,
		authority: authority.address,
		pvFeed: portfolioValuesFeed.address,
		optionHandler: handler.address,
		opynInteractions: interactions.address,
		normDist: normDist.address,
		blackScholes: blackScholes.address,
		optionsCompute: optionsCompute.address,
		accounting: accounting.address,
		uniswapV3HedgingReactor: uniswapV3HedgingReactor.address,
		perpHedgingReactor: perpHedgingReactor.address,
		gmxHedgingReactor: gmxHedgingReactor.address,
		optionCatalogue: catalogue.address,
		optionExchange: exchange.address,
		beyondPricer: pricer.address,
		manager: manager.address,
		weth: weth.address,
		usdcNative: usdcNative.address,
		usdcBridged: usdcBridged.address
	})
	// console.log(contractAddresses)
}

// --------- DEPLOY RYSK SYSTEM ----------------

export async function deploySystem(deployer: Signer, chainlinkOracleAddress: string) {
	const deployerAddress = await deployer.getAddress()

	// deploy libraries
	const interactionsFactory = await ethers.getContractFactory("OpynInteractions")
	const interactions = (await interactionsFactory.deploy()) as OpynInteractions
	try {
		await hre.run("verify:verify", {
			address: interactions.address,
			constructorArguments: []
		})
		console.log("opynInterections verified")
	} catch (err: any) {
		console.log(err)
	}

	const normDistFactory = await ethers.getContractFactory(
		"contracts/libraries/NormalDist.sol:NormalDist",
		{
			libraries: {}
		}
	)
	const normDist = (await normDistFactory.deploy()) as NormalDist
	console.log("normal dist deployed")

	try {
		await hre.run("verify:verify", {
			address: normDist.address,
			constructorArguments: []
		})
		console.log("normDist verified")
	} catch (err: any) {
		console.log(err)
	}

	const optionsCompFactory = await ethers.getContractFactory("OptionsCompute", {
		libraries: {}
	})
	const optionsCompute = (await optionsCompFactory.deploy()) as OptionsCompute
	console.log("options compute deployed")

	try {
		await hre.run("verify:verify", {
			address: optionsCompute.address,
			constructorArguments: []
		})
		console.log("optionsCompute verified")
	} catch (err: any) {
		console.log(err)
	}

	const blackScholesFactory = await ethers.getContractFactory(
		"contracts/libraries/BlackScholes.sol:BlackScholes",
		{
			libraries: {
				NormalDist: normDist.address
			}
		}
	)
	const blackScholes = (await blackScholesFactory.deploy()) as BlackScholes
	console.log("BS deployed")

	try {
		await hre.run("verify:verify", {
			address: blackScholes.address,
			constructorArguments: []
		})
		console.log("blackScholes verified")
	} catch (err: any) {
		console.log(err)
	}

	// get weth and usdc contracts

	const weth = (await ethers.getContractAt("ERC20Interface", wethAddress)) as ERC20
	const usdcNative = (await ethers.getContractAt(
		"contracts/tokens/ERC20.sol:ERC20",
		usdcNativeAddress
	)) as ERC20
	const usdcBridged = (await ethers.getContractAt(
		"contracts/tokens/ERC20.sol:ERC20",
		usdcBridgedAddress
	)) as ERC20

	// deploy Rysk contracts
	const authorityFactory = await ethers.getContractFactory("Authority")
	const authority = await authorityFactory.deploy(deployerAddress, deployerAddress, deployerAddress)
	console.log("authority deployed")
	try {
		await hre.run("verify:verify", {
			address: authority.address,
			constructorArguments: [deployerAddress, deployerAddress, deployerAddress]
		})
		console.log("authority verified")
	} catch (err: any) {
		console.log(err)
	}

	const protocolFactory = await ethers.getContractFactory("contracts/Protocol.sol:Protocol")
	const optionProtocol = (await protocolFactory.deploy(authority.address)) as Protocol
	console.log("protocol deployed")
	try {
		await hre.run("verify:verify", {
			address: optionProtocol.address,
			constructorArguments: [authority.address]
		})
		console.log("optionProtocol verified")
	} catch (err: any) {
		console.log(err)
	}

	const priceFeedFactory = await ethers.getContractFactory("contracts/PriceFeed.sol:PriceFeed")
	const priceFeed = (await priceFeedFactory.deploy(
		authority.address,
		sequencerUptimeAddress
	)) as PriceFeed
	console.log("priceFeed deployed")

	try {
		await hre.run("verify:verify", {
			address: priceFeed.address,
			constructorArguments: [authority.address, sequencerUptimeAddress]
		})
		console.log("priceFeed verified")
	} catch (err: any) {
		console.log(err)
	}
	await priceFeed.addPriceFeed(weth.address, usdcNative.address, chainlinkOracleAddress)

	const volFeedFactory = await ethers.getContractFactory("VolatilityFeed")
	const volFeed = (await volFeedFactory.deploy(
		authority.address,
		optionProtocol.address
	)) as VolatilityFeed
	console.log("volFeed deployed")

	try {
		await hre.run("verify:verify", {
			address: volFeed.address,
			constructorArguments: [authority.address, optionProtocol.address]
		})
	} catch (err: any) {
		console.log(err)
	}

	console.log("volFeed verified")

	const portfolioValuesFeedFactory = await ethers.getContractFactory("AlphaPortfolioValuesFeed", {
		libraries: {
			BlackScholes: blackScholes.address
		}
	})
	const portfolioValuesFeed = (await portfolioValuesFeedFactory.deploy(
		authority.address,
		maxNetDhvExposure,
		optionProtocol.address
	)) as AlphaPortfolioValuesFeed
	console.log("alpha portfolio values feed deployed")

	try {
		await hre.run("verify:verify", {
			address: portfolioValuesFeed.address,
			constructorArguments: [authority.address, maxNetDhvExposure, optionProtocol.address]
		})

		console.log("portfolio values feed verified")
	} catch (err: any) {
		console.log(err)
	}

	const optionRegistryFactory = await ethers.getContractFactory("OptionRegistry", {
		libraries: {
			OpynInteractions: interactions.address,
			OptionsCompute: optionsCompute.address
		}
	})
	const optionRegistry = (await optionRegistryFactory.deploy(
		usdcNative.address,
		deployerAddress,
		opynAddressBookAddress,
		authority.address,
		{ gasLimit: BigNumber.from("500000000") }
	)) as OptionRegistry
	console.log("option registry deployed")

	try {
		await hre.run("verify:verify", {
			address: optionRegistry.address,
			constructorArguments: [
				usdcNative.address,
				deployerAddress,
				opynAddressBookAddress,
				authority.address
			]
		})
		console.log("optionRegistry verified")
	} catch (err: any) {
		console.log(err)
	}

	// add contract addresses to Protocol
	await optionProtocol.changeOptionRegistry(optionRegistry.address)
	await optionProtocol.changeVolatilityFeed(volFeed.address)
	await optionProtocol.changePortfolioValuesFeed(portfolioValuesFeed.address)
	await optionProtocol.changePriceFeed(priceFeed.address)
	expect(await optionProtocol.optionRegistry()).to.equal(optionRegistry.address)
	expect(await optionProtocol.volatilityFeed()).to.equal(volFeed.address)
	expect(await optionProtocol.portfolioValuesFeed()).to.equal(portfolioValuesFeed.address)
	expect(await optionProtocol.priceFeed()).to.equal(priceFeed.address)

	return {
		weth: weth,
		usdcNative: usdcNative,
		usdcBridged: usdcBridged,
		optionRegistry: optionRegistry,
		priceFeed: priceFeed,
		volFeed: volFeed,
		portfolioValuesFeed: portfolioValuesFeed,
		optionProtocol: optionProtocol,
		authority: authority,
		opynInteractions: interactions,
		blackScholes: blackScholes,
		normDist: normDist,
		optionsCompute: optionsCompute
	}
}

// --------- DEPLOY LIQUIDITY POOL AND RELATED LIBRARIES ----------------

export async function deployLiquidityPool(
	deployer: Signer,
	optionProtocol: Protocol,
	usdcNative: ERC20,
	usdcBridged: ERC20,
	weth: ERC20,
	rfr: string,
	minCallStrikePrice: any,
	minPutStrikePrice: any,
	maxCallStrikePrice: any,
	maxPutStrikePrice: any,
	minExpiry: any,
	maxExpiry: any,
	optionRegistry: OptionRegistry,
	pvFeed: AlphaPortfolioValuesFeed,
	authority: string,
	priceFeed: PriceFeed,
	blackScholes: BlackScholes,
	interactions: OpynInteractions,
	optionsCompute: OptionsCompute
) {
	const liquidityPoolFactory = await ethers.getContractFactory("LiquidityPool", {
		libraries: {
			OptionsCompute: optionsCompute.address
		}
	})

	const liquidityPool = (await liquidityPoolFactory.deploy(
		optionProtocol.address,
		usdcNative.address,
		weth.address,
		usdcNative.address,
		toWei(rfr),
		liquidityPoolTokenName,
		liquidityPoolTokenTicker,
		{
			minCallStrikePrice,
			maxCallStrikePrice,
			minPutStrikePrice,
			maxPutStrikePrice,
			minExpiry,
			maxExpiry
		},
		authority,
		{ gasLimit: BigNumber.from("500000000") }
	)) as LiquidityPool

	console.log("lp deployed")

	try {
		await hre.run("verify:verify", {
			address: liquidityPool.address,
			constructorArguments: [
				optionProtocol.address,
				usdcNative.address,
				weth.address,
				usdcNative.address,
				toWei(rfr),
				liquidityPoolTokenName,
				liquidityPoolTokenTicker,
				{
					minCallStrikePrice,
					maxCallStrikePrice,
					minPutStrikePrice,
					maxPutStrikePrice,
					minExpiry,
					maxExpiry
				},
				authority
			]
		})
		console.log("liquidityPool verified")
	} catch (err: any) {
		console.log(err)
	}
	await optionRegistry.setLiquidityPool(liquidityPool.address)
	console.log("registry lp set")

	await pvFeed.setLiquidityPool(liquidityPool.address)
	console.log("pv feed lp set")

	await pvFeed.fulfill(weth.address, usdcNative.address)
	console.log("pv feed fulfilled")

	const accountingFactory = await ethers.getContractFactory("Accounting")
	const accounting = (await accountingFactory.deploy(liquidityPool.address)) as Accounting
	console.log("Accounting deployed")

	try {
		await hre.run("verify:verify", {
			address: accounting.address,
			constructorArguments: [liquidityPool.address]
		})
		console.log("Accounting verified")
	} catch (err: any) {
		console.log(err)
	}

	const updateAccountingTx = await optionProtocol.changeAccounting(accounting.address)
	await updateAccountingTx.wait()

	const PricerFactory = await ethers.getContractFactory("BeyondPricer", {
		libraries: {
			BlackScholes: blackScholes.address
		}
	})
	const pricer = (await PricerFactory.deploy(
		authority,
		optionProtocol.address,
		liquidityPool.address,
		opynAddressBookAddress,
		slippageGradient,
		collateralLendingRate,
		deltaBorrowRates
	)) as BeyondPricer

	console.log("pricer deployed")

	try {
		await hre.run("verify:verify", {
			address: pricer.address,
			constructorArguments: [
				authority,
				optionProtocol.address,
				liquidityPool.address,
				opynAddressBookAddress,
				slippageGradient,
				collateralLendingRate,
				deltaBorrowRates
			]
		})
		console.log("pricer verified")
	} catch (err: any) {
		console.log(err)
	}

	const catalogueFactory = await ethers.getContractFactory("OptionCatalogue", {
		libraries: {
			OptionsCompute: optionsCompute.address
		}
	})
	const catalogue = (await catalogueFactory.deploy(authority, usdcNative.address)) as OptionCatalogue

	try {
		await hre.run("verify:verify", {
			address: catalogue.address,
			constructorArguments: [authority, usdcNative.address]
		})
		console.log("catalogue verified")
	} catch (err: any) {
		console.log(err)
	}
	console.log("catalogue deployed")

	const exchangeFactory = await ethers.getContractFactory("OptionExchange", {
		libraries: {
			OpynInteractions: interactions.address,
			OptionsCompute: optionsCompute.address
		}
	})
	const exchange = (await exchangeFactory.deploy(
		authority,
		optionProtocol.address,
		liquidityPool.address,
		pricer.address,
		opynAddressBookAddress,
		uniswapV3SwapRouter,
		liquidityPool.address,
		catalogue.address,
		{ gasLimit: BigNumber.from("500000000") }
	)) as OptionExchange

	try {
		await hre.run("verify:verify", {
			address: exchange.address,
			constructorArguments: [
				authority,
				optionProtocol.address,
				liquidityPool.address,
				pricer.address,
				opynAddressBookAddress,
				uniswapV3SwapRouter,
				liquidityPool.address,
				catalogue.address
			]
		})
		console.log("exchange verified")
	} catch (err: any) {
		console.log(err)
	}
	console.log("exchange deployed")

	await optionProtocol.changeOptionExchange(exchange.address)
	await exchange.changeApprovedCollateral(usdcNative.address, true, true)
	await exchange.changeApprovedCollateral(usdcNative.address, false, true)
	await exchange.changeApprovedCollateral(weth.address, true, true)
	await exchange.changeApprovedCollateral(weth.address, false, true)
	console.log("exchange collateral approvals set")
	await exchange.setPoolFee(weth.address, 500)
	console.log("exchange pool fees set")
	await liquidityPool.changeHandler(exchange.address, true)
	console.log("exchange set as Liquidity Pool handler")

	await exchange.pause()
	// FILL IN WITH PARAMS
	await pricer.setBidAskIVSpread(bidAskSpread)
	await pricer.setRiskFreeRate(rfr)
	await pricer.initializeTenorParams(
		deltaBandWidth,
		numberOfTenors,
		maxTenorValue,
		tenorPricingParams
	)
	await exchange.unpause()

	const handlerFactory = await ethers.getContractFactory("AlphaOptionHandler", {
		libraries: {
			OptionsCompute: optionsCompute.address
		}
	})
	const handler = (await handlerFactory.deploy(
		authority,
		optionProtocol.address,
		liquidityPool.address
	)) as AlphaOptionHandler
	console.log("option handler deployed")

	try {
		await hre.run("verify:verify", {
			address: handler.address,
			constructorArguments: [authority, optionProtocol.address, liquidityPool.address]
		})
		console.log("optionHandler verified")
	} catch (err: any) {
		console.log(err)
	}

	await liquidityPool.changeHandler(handler.address, true)
	console.log("option handler set as Liquidity Pool handler")

	await pvFeed.setHandler(handler.address, true)
	await pvFeed.setHandler(exchange.address, true)
	console.log("pvFeed handlers set")

	// deploy proxy manager contract

	const managerFactory = await ethers.getContractFactory("Manager")
	const manager = (await managerFactory.deploy(
		authority,
		liquidityPool.address,
		handler.address,
		catalogue.address,
		exchange.address,
		pricer.address
	)) as Manager
	console.log("manager deployed")
	try {
		await hre.run("verify:verify", {
			address: manager.address,
			constructorArguments: [
				authority,
				liquidityPool.address,
				handler.address,
				catalogue.address,
				exchange.address,
				pricer.address
			]
		})
		console.log("manager verified")
	} catch (err: any) {
		console.log(err)
		if (err.message.includes("Reason: Already Verified")) {
			console.log("Manager contract already verified")
		}
	}

	// deploy rage trade perpetual hedging reactor

	const perpHedgingReactorFactory = await ethers.getContractFactory("PerpHedgingReactor")
	const perpHedgingReactor = (await perpHedgingReactorFactory.deploy(
		clearingHouseAddress,
		usdcBridged.address,
		usdcNative.address,
		weth.address,
		liquidityPool.address,
		truncate(vETHAddress),
		truncate(usdcBridged.address),
		priceFeed.address,
		authority
	)) as PerpHedgingReactor

	console.log("perp hedging reactor deployed")

	try {
		await hre.run("verify:verify", {
			address: perpHedgingReactor.address,
			constructorArguments: [
				clearingHouseAddress,
				usdcBridged.address,
				usdcNative.address,
				weth.address,
				liquidityPool.address,
				truncate(vETHAddress),
				truncate(usdcBridged.address),
				priceFeed.address,
				authority
			]
		})
		console.log("perp hedging reactor verified")
	} catch (err: any) {
		console.log(err)
	}
	await usdcBridged.approve(perpHedgingReactor.address, 1)
	await perpHedgingReactor.initialiseReactor()
	console.log("Perp hedging reactor initialised")

	// deploy uniswap hedging reactor
	const uniswapV3HedgingReactorFactory = await ethers.getContractFactory("UniswapV3HedgingReactor")
	const uniswapV3HedgingReactor = await uniswapV3HedgingReactorFactory.deploy(
		uniswapV3SwapRouter,
		usdcNative.address,
		weth.address,
		liquidityPool.address,
		500,
		priceFeed.address,
		authority
	)
	console.log("Uniswap v3 hedging reactor deployed")
	try {
		await hre.run("verify:verify", {
			address: uniswapV3HedgingReactor.address,
			constructorArguments: [
				uniswapV3SwapRouter,
				usdcNative.address,
				weth.address,
				liquidityPool.address,
				500,
				priceFeed.address,
				authority
			]
		})
		console.log("Uniswap v3 hedging reactor verified")
	} catch (err: any) {
		console.log(err)
	}

	// deploy GMX hedging reactor
	const gmxHedgingReactorFactory = await ethers.getContractFactory("GmxHedgingReactor")
	const gmxHedgingReactor = (await gmxHedgingReactorFactory.deploy(
		positionRouterAddress,
		routerAddress,
		readerAddress,
		vaultAddress,
		usdcNativeAddress,
		wethAddress,
		liquidityPool.address,
		priceFeed.address,
		authority
	)) as GmxHedgingReactor

	console.log("gmx hedging reactor deployed")

	try {
		await hre.run("verify:verify", {
			address: gmxHedgingReactor.address,
			constructorArguments: [
				positionRouterAddress,
				routerAddress,
				readerAddress,
				vaultAddress,
				usdcNativeAddress,
				wethAddress,
				liquidityPool.address,
				priceFeed.address,
				authority
			]
		})
		console.log("gmx hedging reactor verified")
	} catch (err: any) {
		if (err.message.includes("Reason: Already Verified")) {
			console.log("perp hedging reactor contract already verified")
		}
	}

	await liquidityPool.setHedgingReactorAddress(uniswapV3HedgingReactor.address)
	await liquidityPool.setHedgingReactorAddress(perpHedgingReactor.address)
	await liquidityPool.setHedgingReactorAddress(gmxHedgingReactor.address)
	await liquidityPool.setHedgingReactorAddress(exchange.address)

	console.log("hedging reactors added to liquidity pool")

	const lensFactory = await ethers.getContractFactory("DHVLensMK1")
	const lens = (await lensFactory.deploy(
		optionProtocol.address,
		catalogue.address,
		pricer.address,
		usdcNative.address,
		weth.address,
		usdcNative.address
	)) as DHVLensMK1

	console.log("lens contract deployed")

	try {
		await hre.run("verify:verify", {
			address: lens.address,
			constructorArguments: [
				optionProtocol.address,
				catalogue.address,
				pricer.address,
				usdcNative.address,
				weth.address,
				usdcNative.address
			]
		})
		console.log("lens verified")
	} catch (err: any) {
		console.log(err)
		console.log("lens contract already verified")
	}

	return {
		liquidityPool: liquidityPool,
		handler: handler,
		accounting,
		uniswapV3HedgingReactor,
		perpHedgingReactor,
		gmxHedgingReactor,
		catalogue,
		exchange,
		pricer,
		manager,
		lens
	}
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})

// func.tags = ["localhost"]
// export default func
// function ZERO_ADDRESS(arg0: string, arg1: string, arg2: BigNumber, ZERO_ADDRESS: any): any {
// 	throw new Error("Function not implemented.")
// }
