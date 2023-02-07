import hre, { ethers, network } from "hardhat"
import { Signer, BigNumber, BigNumberish, utils } from "ethers"
import { expect } from "chai"
import dotenv from "dotenv"
dotenv.config()
//@ts-ignore

import { USDC_ADDRESS, WETH_ADDRESS } from "./constants"
import { arbitrum as addresses } from "../contracts.json"
import {
	ERC20,
	GmxHedgingReactor,
	LiquidityPool,
	IReader,
	IPositionRouter,
	PriceFeed,
	MockChainlinkAggregator
} from "../types"
// edit depending on the chain id to be tested on
const chainId = 42161

let signers: Signer[]
let deployer: Signer
let liquidityPool: LiquidityPool
let priceFeed: PriceFeed
let usdc: ERC20
let gmxReactor: GmxHedgingReactor
let gmxVault: any
let gmxReader: IReader
let gmxPositionRouter: IPositionRouter
let mockChainlinkFeed: MockChainlinkAggregator
const funderAddress = "0xf89d7b9c864f589bbF53a82105107622B35EaA40"
const deployerAddress: string = "0xFBdE2e477Ed031f54ed5Ad52f35eE43CD82cF2A6" // governor multisig address
const liquidityPoolAddress: string = addresses.liquidityPool
const priceFeedAddress: string = addresses.priceFeed
const authorityAddress: string = addresses.authority
const gmxReaderAddress: string = "0x22199a49A999c351eF7927602CFB187ec3cae489"
const gmxPositionRouterAddress: string = "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868"
const gmxRouterAddress: string = "0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064"
const gmxVaultPricefeedAddress: string = "0x2d68011bcA022ed0E474264145F46CC4de96a002"
const gmxVaultAddress: string = "0x489ee077994B6658eAfA855C308275EAd8097C4A"
const gmxPriceFeedTimelockAddress: string = "0x7b1FFdDEEc3C4797079C7ed91057e399e9D43a8B"
const usdcAddress: string = USDC_ADDRESS[chainId]
const wethAddress: string = WETH_ADDRESS[chainId]

describe("GMX Hedging Reactor", () => {
	before(async function () {
		await network.provider.request({
			method: "hardhat_reset",
			params: [
				{
					forking: {
						jsonRpcUrl: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA}`,
						chainId: 42161,
						blockNumber: 36000000
					}
				}
			]
		})
	})

	it("obtains Rysk contracts", async () => {
		signers = await ethers.getSigners()
		await network.provider.request({
			method: "hardhat_impersonateAccount",
			params: [deployerAddress]
		})
		await network.provider.request({
			method: "hardhat_impersonateAccount",
			params: [funderAddress]
		})
		deployer = await ethers.getSigner(deployerAddress)
		const funder = await ethers.getSigner(funderAddress)
		await funder.sendTransaction({ to: deployerAddress, value: utils.parseEther("100") })
		liquidityPool = (await ethers.getContractAt("LiquidityPool", liquidityPoolAddress, deployer)) as LiquidityPool

		priceFeed = (await ethers.getContractAt("contracts/PriceFeed.sol:PriceFeed", priceFeedAddress, deployer)) as PriceFeed

		// await liquidityPool.setHedgingReactorAddress(usdcAddress)

		expect(liquidityPool).to.have.property("setHedgingReactorAddress")
		expect(liquidityPool).to.have.property("rebalancePortfolioDelta")
		expect(await liquidityPool.collateralAllocated()).to.not.eq(0)
		usdc = (await ethers.getContractAt("contracts/tokens/ERC20.sol:ERC20", usdcAddress)) as ERC20
		const liquidityPoolBalance = await usdc.balanceOf(liquidityPoolAddress)
	})
	it("deploys mock chainlink price feed and hooks to GMX Vault Price feed", async () => {
		const mockChainlinkFeedFactory = await ethers.getContractFactory("MockChainlinkAggregator")
		mockChainlinkFeed = (await mockChainlinkFeedFactory.deploy()) as MockChainlinkAggregator
		const gmxVaultPriceFeed = await ethers.getContractAt("VaultPriceFeed", gmxVaultPricefeedAddress)
		await priceFeed.addPriceFeed(wethAddress, usdcAddress, mockChainlinkFeed.address)

		const govAddress = await gmxVaultPriceFeed.gov()
		expect(govAddress.toLowerCase()).to.eq("0x7b1ffddeec3c4797079c7ed91057e399e9d43a8b")

		gmxVault = (await ethers.getContractAt("Vault", gmxVaultAddress)) as any
		gmxReader = (await ethers.getContractAt("IReader", gmxReaderAddress)) as IReader

		const gmxPriceFeedTimelock = await ethers.getContractAt("PriceFeedTimelock", gmxPriceFeedTimelockAddress)
		const adminAddress = await gmxPriceFeedTimelock.admin()
		expect(adminAddress).to.eq("0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b")

		await network.provider.request({
			method: "hardhat_impersonateAccount",
			params: [adminAddress]
		})
		const admin = await ethers.getSigner(adminAddress)

		await gmxPriceFeedTimelock
			.connect(admin)
			.signalPriceFeedSetTokenConfig(gmxVaultPricefeedAddress, wethAddress, mockChainlinkFeed.address, 8, false)

		await gmxPriceFeedTimelock.connect(admin).setIsSecondaryPriceEnabled(gmxVaultPricefeedAddress, false)

		// fast forward a day
		await ethers.provider.send("evm_increaseTime", [86400])
		await ethers.provider.send("evm_mine")
		await gmxPriceFeedTimelock
			.connect(admin)
			.priceFeedSetTokenConfig(gmxVaultPricefeedAddress, wethAddress, mockChainlinkFeed.address, 8, false)

		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("2000", 8))
	})
	it("deploys GMX perp hedging reactor", async () => {
		const reactorFactory = await ethers.getContractFactory("GmxHedgingReactor")
		gmxReactor = (await reactorFactory.deploy(
			gmxPositionRouterAddress,
			gmxRouterAddress,
			gmxReaderAddress,
			gmxVaultAddress,
			usdcAddress,
			wethAddress,
			liquidityPoolAddress,
			priceFeedAddress,
			authorityAddress
		)) as GmxHedgingReactor
		const funder = await ethers.getSigner(funderAddress)
		await funder.sendTransaction({ to: gmxReactor.address, value: utils.parseEther("1") })

		await gmxReactor.connect(deployer).setKeeper(signers[0].getAddress(), true)

		expect(await gmxReactor.parentLiquidityPool()).to.eq(liquidityPoolAddress)
		expect(await gmxReactor.getDelta()).to.eq(0)
	})
	it("adds GMX router to liquidity pool", async () => {
		expect(await liquidityPool.hedgingReactors(0)).to.not.eq(0)
		expect(await liquidityPool.hedgingReactors(1)).to.not.eq(0)
		await expect(liquidityPool.hedgingReactors(2)).to.be.reverted // should not be set yet

		await liquidityPool.setHedgingReactorAddress(gmxReactor.address)

		expect(await liquidityPool.hedgingReactors(0)).to.not.eq(0)
		expect(await liquidityPool.hedgingReactors(1)).to.not.eq(0)
		expect(await liquidityPool.hedgingReactors(2)).to.eq(gmxReactor.address) // should now be set
	})
	it("opens a long position", async () => {
		const delta = 2
		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPoolAddress), 6))
		const usdcBalanceBeforeReactor = parseFloat(utils.formatUnits(await usdc.balanceOf(gmxReactor.address), 6))
		const currentPriceBefore = parseFloat(utils.formatEther(await priceFeed.getNormalizedRate(wethAddress, usdcAddress)))

		await liquidityPool.rebalancePortfolioDelta(utils.parseEther(`-${delta}`), 2)
		const logs = await gmxReactor.queryFilter(gmxReactor.filters.CreateIncreasePosition(), 0)

		const positionKey = logs[0].args[0]

		// fast forward 3 min
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const executePositionTx = await gmxReactor.executeIncreasePosition(positionKey)

		await executePositionTx.wait()
		console.log("position executed")

		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPoolAddress), 6))
		const usdcBalanceAfterReactor = parseFloat(utils.formatUnits(await usdc.balanceOf(gmxReactor.address), 6))
		// check that the reactor doesnt hold any USDC before or after
		expect(usdcBalanceBeforeReactor).to.eq(usdcBalanceAfterReactor).to.eq(0)
		// check that the correct amount of USDC was taken from LP
		expect(usdcBalanceAfterLP - (usdcBalanceBeforeLP - (delta / 2) * currentPriceBefore)).to.be.within(-5, 5)

		const positions = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)

		expect(parseFloat(utils.formatUnits(positions[0], 30))).to.eq(4000)
		expect(parseFloat(utils.formatUnits(positions[1], 30))).to.be.within(1980, 2000)

		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("2"))

		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(parseFloat(utils.formatUnits(positions[1], 30)))
	})
	it("rebalances the collateral on an open long position that has unrealised loss", async () => {
		// set price to 1800
		// should be a $400 unrealised loss
		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("1800", 8))
		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))

		await gmxReactor.update()

		// fast forward 3 min
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")

		const logs = await gmxReactor.queryFilter(gmxReactor.filters.CreateIncreasePosition(), 0)
		const positionKey = logs[logs.length - 1].args[0]
		const executePositionTx = await gmxReactor.executeIncreasePosition(positionKey)

		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcDiff = usdcBalanceBeforeLP - usdcBalanceAfterLP
		// should cost slightly more than 400 due to trading fees
		expect(usdcDiff).to.be.gt(400)
		expect(usdcDiff).to.be.lt(420)

		const positions = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)

		expect(parseFloat(utils.formatUnits(positions[0], 30))).to.eq(4000)
		expect(parseFloat(utils.formatUnits(positions[1], 30))).to.be.within(2380, 2400)

		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("2"))
		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(parseFloat(utils.formatUnits(positions[1].sub(positions[8]), 30)))
	})
	it("rebalances that same position now that it is break even", async () => {
		// set price back  to 2000
		// should be exactly break even (not incl. fees)
		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("2000", 8))
		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcBalanceBeforeReactor = parseFloat(utils.formatUnits(await usdc.balanceOf(gmxReactor.address), 6))
		const positionsBefore = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)
		console.log({ positionsBefore })

		await gmxReactor.update()

		// fast forward 3 min
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")

		const logs = await gmxReactor.queryFilter(gmxReactor.filters.CreateDecreasePosition(), 0)

		const positionKey = logs[logs.length - 1].args[0]
		await gmxReactor.executeDecreasePosition(positionKey)
		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcBalanceAfterReactor = parseFloat(utils.formatUnits(await usdc.balanceOf(gmxReactor.address), 6))
		const usdcDiffLP = usdcBalanceAfterLP - usdcBalanceBeforeLP
		const usdcDiffReactor = usdcBalanceAfterReactor - usdcBalanceBeforeReactor
		expect(usdcDiffReactor).to.eq(0)

		const positions = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)
		// collateral should be back to 2000
		expect(parseFloat(utils.formatUnits(positions[1], 30))).to.be.within(1999, 2001)

		// should be slightly less than 400 due to trading fees
		expect(usdcDiffLP).to.be.lt(400)
		expect(usdcDiffLP).to.be.gt(380)
		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("2"))
		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(parseFloat(utils.formatUnits(positions[1], 30)))
	})
	it("closes the long position at a loss", async () => {
		// at $1600, should be a $800 loss
		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("1600", 8))
		const positionsBefore = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)
		expect(positionsBefore[7]).to.eq(0) // indicated position in loss
		expect(positionsBefore[8]).to.eq(utils.parseUnits("800", 30)) // unrealised pnl
		const usdcBalanceBeforeReactor = parseFloat(utils.formatUnits(await usdc.balanceOf(gmxReactor.address), 6))

		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const delta = 2
		await liquidityPool.rebalancePortfolioDelta(utils.parseEther(`${delta}`), 2)

		const logs = await gmxReactor.queryFilter(gmxReactor.filters.CreateDecreasePosition(), 0)
		console.log("logs length:", logs.length)
		const positionKey = logs[logs.length - 1].args[0]

		// fast forward 3 min
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		await gmxReactor.executeDecreasePosition(positionKey)
		console.log("position executed")

		const usdcBalanceAfterReactor = parseFloat(utils.formatUnits(await usdc.balanceOf(gmxReactor.address), 6))
		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcBalanceDiff = usdcBalanceAfterLP - usdcBalanceBeforeLP
		const positionsAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)
		expect(positionsAfter[0]).to.eq(positionsAfter[1]).to.eq(positionsAfter[8]).to.eq(0)
		// expect balance to be 1200 minus trading fees
		expect(usdcBalanceDiff).to.be.lt(1200)
		expect(usdcBalanceDiff).to.be.gt(1180)
		expect(usdcBalanceAfterReactor).to.eq(usdcBalanceBeforeReactor).to.eq(0)

		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("0"))

		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(0)
	})
	it("opens a short position", async () => {
		// set price to $2000
		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("2000", 8))
		expect(await gmxReactor.internalDelta()).to.eq(0)
		const delta = 10
		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))

		await liquidityPool.rebalancePortfolioDelta(utils.parseEther(`${delta}`), 2)
		const logs = await gmxReactor.queryFilter(gmxReactor.filters.CreateIncreasePosition(), 0)
		const positionKey = logs[logs.length - 1].args[0]
		console.log({ positionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const tx = await gmxReactor.executeIncreasePosition(positionKey)
		await tx.wait()
		console.log("position executed")

		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcBalanceDiff = usdcBalanceBeforeLP - usdcBalanceAfterLP
		expect(usdcBalanceDiff).to.eq(10000)

		const positionsAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)
		expect(positionsAfter[0]).to.eq(utils.parseUnits("20000", 30))
		expect(parseFloat(utils.formatUnits(positionsAfter[1], 30))).to.be.within(9950, 10000)
		expect(positionsAfter[2]).to.eq(utils.parseUnits("2000", 30))
		expect(positionsAfter[8]).to.eq(0)
		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("-10"))

		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(parseFloat(utils.formatUnits(positionsAfter[1], 30)))
	})
	it("closes half the short pos in profit", async () => {
		// set price to $1400
		// should be $6000 unrealised profit
		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("1400", 8))
		const delta = -5

		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))

		const positionsBefore = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)
		console.log({ positionsBefore })

		await liquidityPool.rebalancePortfolioDelta(utils.parseEther(`${delta}`), 2)
		const logs = await gmxReactor.queryFilter(gmxReactor.filters.CreateDecreasePosition(), 0)
		const positionKey = logs[logs.length - 1].args[0]
		console.log({ positionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const tx = await gmxReactor.executeDecreasePosition(positionKey)
		await tx.wait()
		console.log("position executed")

		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcBalanceDiff = usdcBalanceAfterLP - usdcBalanceBeforeLP
		const positionsAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)
		console.log({ positionsAfter })
		const deltaAfter = await gmxReactor.internalDelta()
		// 8000 USDC should be removed from collateral, plus 3000 USDC in unrealised pnl
		console.log({ usdcBalanceDiff })
		expect(usdcBalanceDiff).to.be.within(10900, 11000)
		expect(deltaAfter).to.eq(utils.parseEther("-5"))

		expect(positionsAfter[0]).to.eq(utils.parseUnits("10000", 30))
		expect(parseFloat(utils.formatUnits(positionsAfter[1], 30))).to.be.within(1990, 2010)
		expect(positionsAfter[2]).to.eq(utils.parseUnits("2000", 30))
		expect(parseFloat(utils.formatUnits(positionsAfter[8], 30))).to.eq(3000)

		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(parseFloat(utils.formatUnits(positionsAfter[1].add(positionsAfter[8]), 30)))
	})
	it("closes remaining short and flips long in a single tx", async () => {
		// currently short 5 delta
		// this should close short and open a 5 delta long
		const price = 1400
		const delta = -10
		const deltaBefore = await gmxReactor.internalDelta()
		expect(deltaBefore).to.eq(utils.parseEther("-5"))
		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))

		const shortPositionBefore = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)
		const longPositionBefore = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)
		expect(shortPositionBefore[0]).to.eq(utils.parseUnits("10000", 30))
		expect(longPositionBefore[0]).to.eq(0)

		await liquidityPool.rebalancePortfolioDelta(utils.parseEther(`${delta}`), 2)
		// -------- execute the decrease short request
		const decreaseLogs = await gmxReactor.queryFilter(gmxReactor.filters.CreateDecreasePosition(), 0)
		const decreasePositionKey = decreaseLogs[decreaseLogs.length - 1].args[0]
		console.log({ decreasePositionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const executeDecreaseTx = await gmxReactor.executeDecreasePosition(decreasePositionKey)
		await executeDecreaseTx.wait()
		console.log("decrease position executed")

		// -------- execute the increase long request
		const increaseLogs = await gmxReactor.queryFilter(gmxReactor.filters.CreateIncreasePosition(), 0)
		const increasePositionKey = increaseLogs[increaseLogs.length - 1].args[0]
		console.log({ increasePositionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const executeIncreaseTx = await gmxReactor.executeIncreasePosition(increasePositionKey)
		await executeIncreaseTx.wait()
		console.log("increase position executed")

		// positions after

		const shortPositionAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)
		const longPositionAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)

		expect(shortPositionAfter[0]).to.eq(0)
		// trading fees are taking from collateral
		expect(shortPositionAfter[1]).to.eq(0)
		expect(shortPositionAfter[8]).to.eq(0)
		expect(longPositionAfter[0]).to.eq(utils.parseUnits("7000", 30))
		expect(parseFloat(utils.formatUnits(longPositionAfter[1], 30))).to.be.within(3480, 3500)
		expect(longPositionAfter[8]).to.eq(0)

		// expected to be the collateral returned from closing short minus collateral required to open long
		const expectedUdscDiff =
			parseFloat(utils.formatUnits(shortPositionBefore[1].add(shortPositionBefore[8]), 30)) -
			((-delta + parseInt(utils.formatEther(deltaBefore))) * price) / 2
		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcBalanceDiff = usdcBalanceAfterLP - usdcBalanceBeforeLP
		expect(usdcBalanceDiff).to.be.within(expectedUdscDiff * 0.99, expectedUdscDiff)
		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("5"))

		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(parseFloat(utils.formatUnits(longPositionAfter[1], 30)))
	})
	it("it increases long when position is in a small profit", async () => {
		// set price to $1600
		// should be $1000 unrealised profit
		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("1600", 8))
		// add 5 delta to long
		const delta = -5

		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))

		const longPositionBefore = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)

		await liquidityPool.rebalancePortfolioDelta(utils.parseEther(`${delta}`), 2)

		// -------- execute the increase long request
		const increaseLogs = await gmxReactor.queryFilter(gmxReactor.filters.CreateIncreasePosition(), 0)
		const increasePositionKey = increaseLogs[increaseLogs.length - 1].args[0]
		console.log({ increasePositionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const executeIncreaseTx = await gmxReactor.executeIncreasePosition(increasePositionKey)
		await executeIncreaseTx.wait()
		console.log("increase position executed")

		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcBalanceDiff = usdcBalanceBeforeLP - usdcBalanceAfterLP

		const longPositionAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)
		// 3000 plus the trading fees that were deducted in last test
		const expectedUdscDiff = 3000 + 3500 - parseFloat(utils.formatUnits(longPositionBefore[1], 30))
		expect(usdcBalanceDiff).to.be.within(expectedUdscDiff - 0.1, expectedUdscDiff + 0.1)
		expect(longPositionAfter[0]).to.eq(utils.parseUnits("15000", 30))
		expect(parseFloat(utils.formatUnits(longPositionAfter[1], 30))).to.be.within(6480, 6500)
		expect(longPositionAfter[2]).to.eq(utils.parseUnits("1500", 30))
		expect(longPositionAfter[8]).to.eq(utils.parseUnits("1000", 30))

		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("10"))

		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(parseFloat(utils.formatUnits(longPositionAfter[1].add(longPositionAfter[8]), 30)))
	})
	it("closes long in loss and flips short again", async () => {
		// currently long 10 delta
		const delta = 20

		// set price to $1300
		// should be $2000 unrealised loss
		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("1300", 8))

		const longPositionBefore = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)
		console.log(longPositionBefore)

		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))

		await liquidityPool.rebalancePortfolioDelta(utils.parseEther(`${delta}`), 2)

		// -------- execute the decrease long request
		const decreaseLogs = await gmxReactor.queryFilter(gmxReactor.filters.CreateDecreasePosition(), 0)
		const decreasePositionKey = decreaseLogs[decreaseLogs.length - 1].args[0]
		console.log({ decreasePositionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const executeDecreaseTx = await gmxReactor.executeDecreasePosition(decreasePositionKey)
		await executeDecreaseTx.wait()
		console.log("decrease position executed")

		// -------- execute the increase short request
		const increaseLogs = await gmxReactor.queryFilter(gmxReactor.filters.CreateIncreasePosition(), 0)
		const increasePositionKey = increaseLogs[increaseLogs.length - 1].args[0]
		console.log({ increasePositionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const executeIncreaseTx = await gmxReactor.executeIncreasePosition(increasePositionKey)
		await executeIncreaseTx.wait()
		console.log("increase position executed")

		// positions after

		const shortPositionAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)
		const longPositionAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)
		expect(longPositionAfter[0]).to.eq(0)
		// trading fees are taking from collateral
		expect(longPositionAfter[1]).to.eq(0)
		expect(longPositionAfter[8]).to.eq(0)

		expect(shortPositionAfter[0]).to.eq(utils.parseUnits("13000", 30))
		expect(parseFloat(utils.formatUnits(shortPositionAfter[1], 30))).to.be.within(6480, 6500)
		expect(shortPositionAfter[8]).to.eq(0)

		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))

		const usdcBalanceDiff = usdcBalanceAfterLP - usdcBalanceBeforeLP
		console.log({ usdcBalanceBeforeLP, usdcBalanceAfterLP })

		const expectedUdscDiff = parseFloat(utils.formatUnits(longPositionBefore[1].sub(longPositionBefore[8]), 30)) - 6500
		expect(usdcBalanceDiff).to.be.within(expectedUdscDiff - 40, expectedUdscDiff)

		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("-10"))

		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(parseFloat(utils.formatUnits(shortPositionAfter[1], 30)))
	})
	it("adds to short when in loss", async () => {
		// currently short 10 delta
		// add another 5 delta to short
		const delta = 5
		// set price to $1500
		// should be $2000 unrealised loss
		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("1500", 8))

		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))

		const shortPositionBefore = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)

		await liquidityPool.rebalancePortfolioDelta(utils.parseEther(`${delta}`), 2)

		// -------- execute the increase short request
		const increaseLogs = await gmxReactor.queryFilter(gmxReactor.filters.CreateIncreasePosition(), 0)
		const increasePositionKey = increaseLogs[increaseLogs.length - 1].args[0]
		console.log({ increasePositionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const executeIncreaseTx = await gmxReactor.executeIncreasePosition(increasePositionKey)
		await executeIncreaseTx.wait()
		console.log("increase position executed")

		// position after

		const shortPositionAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)
		expect(shortPositionAfter[0]).to.eq(utils.parseUnits("20500", 30)) // 1300 * 10 + 1500 * 5
		expect(parseFloat(utils.formatUnits(shortPositionAfter[1], 30))).to.be.within(12220, 12250) // (20500 / 2) + 2000
		expect(parseInt(utils.formatUnits(shortPositionAfter[2], 30))).to.eq(1366)

		expect(parseFloat(utils.formatUnits(shortPositionAfter[8], 30))).to.eq(2000)

		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcBalanceDiff = usdcBalanceBeforeLP - usdcBalanceAfterLP

		const expectedUdscDiff =
			3750 +
			parseFloat(
				utils.formatUnits(shortPositionBefore[8].add(shortPositionBefore[0].div(2).sub(shortPositionBefore[1])), 30)
			)

		expect(usdcBalanceDiff).to.be.within(expectedUdscDiff - 1, expectedUdscDiff + 1)

		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("-15"))

		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(
			parseFloat(utils.formatUnits(shortPositionAfter[1].sub(shortPositionAfter[8]), 30))
		)
	})
	it("syncs internal delta when short. should not change value", async () => {
		const deltaBefore = await gmxReactor.internalDelta()
		expect(deltaBefore).to.eq(utils.parseEther("-15"))

		await gmxReactor.sync()

		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("-15"))
	})
	it("closes short in loss and flips long", async () => {
		// currently short 15 delta
		// go long 25 delta
		const delta = -25
		// set price to $1600
		// should be $3500 unrealised loss
		await mockChainlinkFeed.setLatestAnswer(utils.parseUnits("1600", 8))

		const usdcBalanceBeforeLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))

		const shortPositionBefore = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)
		expect(parseFloat(utils.formatUnits(shortPositionBefore[8], 30))).to.eq(3500)

		await liquidityPool.rebalancePortfolioDelta(utils.parseEther(`${delta}`), 2)

		// -------- execute the decrease short request
		const decreaseLogs = await gmxReactor.queryFilter(gmxReactor.filters.CreateDecreasePosition(), 0)
		const decreasePositionKey = decreaseLogs[decreaseLogs.length - 1].args[0]
		console.log({ decreasePositionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const executeDecreaseTx = await gmxReactor.executeDecreasePosition(decreasePositionKey)
		await executeDecreaseTx.wait()
		console.log("decrease position executed")

		// -------- execute the increase long request
		const increaseLogs = await gmxReactor.queryFilter(gmxReactor.filters.CreateIncreasePosition(), 0)
		const increasePositionKey = increaseLogs[increaseLogs.length - 1].args[0]
		console.log({ increasePositionKey })
		// fast forward 3 min and execute tx
		await ethers.provider.send("evm_increaseTime", [180])
		await ethers.provider.send("evm_mine")
		const executeIncreaseTx = await gmxReactor.executeIncreasePosition(increasePositionKey)
		await executeIncreaseTx.wait()
		console.log("increase position executed")

		// positions after

		const shortPositionAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[usdcAddress],
			[wethAddress],
			[false]
		)
		const longPositionAfter = await gmxReader.getPositions(
			"0x489ee077994B6658eAfA855C308275EAd8097C4A",
			gmxReactor.address,
			[wethAddress],
			[wethAddress],
			[true]
		)
		expect(shortPositionAfter[0]).to.eq(0)
		expect(shortPositionAfter[1]).to.eq(0)
		expect(shortPositionAfter[8]).to.eq(0)

		expect(longPositionAfter[0]).to.eq(utils.parseUnits("16000", 30))
		expect(parseFloat(utils.formatUnits(longPositionAfter[1], 30))).to.be.within(7950, 8000)
		expect(longPositionAfter[8]).to.eq(0)

		const usdcBalanceAfterLP = parseFloat(utils.formatUnits(await usdc.balanceOf(liquidityPool.address), 6))
		const usdcBalanceDiff = usdcBalanceAfterLP - usdcBalanceBeforeLP

		const expectedUdscDiff = parseFloat(utils.formatUnits(shortPositionBefore[1].sub(shortPositionBefore[8]), 30)) - 8000
		expect(usdcBalanceDiff).to.be.within(expectedUdscDiff - 30, expectedUdscDiff)

		// check internalDelta var is correct
		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("10"))

		// check getPoolDemoninatedvalue is correct
		const poolDenominatedValue = parseFloat(utils.formatEther(await gmxReactor.callStatic.getPoolDenominatedValue()))
		expect(poolDenominatedValue).to.eq(parseFloat(utils.formatUnits(longPositionAfter[1], 30)))
	})
	it("syncs internal delta when long. should not change value", async () => {
		const deltaBefore = await gmxReactor.internalDelta()
		expect(deltaBefore).to.eq(utils.parseEther("10"))

		await gmxReactor.sync()

		const deltaAfter = await gmxReactor.internalDelta()
		expect(deltaAfter).to.eq(utils.parseEther("10"))
	})
	it("withdraws ETH from contract", async () => {
		const contractBalanceBefore = await ethers.provider.getBalance(gmxReactor.address)
		const deployerBalanceBefore = await ethers.provider.getBalance(funderAddress)

		const amountOut = utils.parseEther("0.1")
		await gmxReactor.connect(deployer).sweepFunds(amountOut, funderAddress)

		const contractBalanceAfter = await ethers.provider.getBalance(gmxReactor.address)
		const deployerBalanceAfter = await ethers.provider.getBalance(funderAddress)
		expect(contractBalanceAfter).to.eq(contractBalanceBefore.sub(amountOut))
		expect(deployerBalanceAfter).to.eq(deployerBalanceBefore.add(amountOut))
	})
	it("withdraws all ETH from contract", async () => {
		const contractBalanceBefore = await ethers.provider.getBalance(gmxReactor.address)
		const deployerBalanceBefore = await ethers.provider.getBalance(funderAddress)
		// more than available
		const amountOut = utils.parseEther("1000")
		await gmxReactor.connect(deployer).sweepFunds(amountOut, funderAddress)

		const contractBalanceAfter = await ethers.provider.getBalance(gmxReactor.address)
		const deployerBalanceAfter = await ethers.provider.getBalance(funderAddress)
		expect(contractBalanceAfter).to.eq(0)
		expect(deployerBalanceAfter).to.eq(deployerBalanceBefore.add(contractBalanceBefore))
	})
})
