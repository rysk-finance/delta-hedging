import { BigNumber } from "ethers"
import { toWei } from "./conversion-helper"

const zero: BigNumber = BigNumber.from(0)
const one: BigNumber = toWei("1")
export function computeNewWeights(
	amount: BigNumber,
	strike: BigNumber,
	expiration: BigNumber,
	totalAmount: BigNumber,
	weightedStrike: BigNumber,
	weightedTime: BigNumber,
	isSale: boolean
) {
	if (!isSale) {
		let weight: BigNumber = one
		if (totalAmount.gt(zero)) {
			weight = amount.div(totalAmount.sub(amount))
		}
		const exWeight = one.add(weight)
		const newTotalAmount = totalAmount.add(amount)
		const newWeightedStrike = exWeight.mul(weightedStrike).sub(weight.mul(strike)).div(one)
		const newWeightedTime = exWeight.mul(weightedTime).sub(weight.mul(expiration)).div(one)
		return { newWeightedTime, newWeightedStrike, newTotalAmount }
	} else {
		let weight: BigNumber = one
		if (totalAmount.gt(zero)) {
			weight = amount.div(totalAmount.add(amount))
		}
		const exWeight = one.sub(weight)
		const newTotalAmount = totalAmount.add(amount)
		const newWeightedStrike = exWeight.mul(weightedStrike).add(weight.mul(strike)).div(one)
		const newWeightedTime = exWeight.mul(weightedTime).add(weight.mul(expiration)).div(one)
		return { newWeightedTime, newWeightedStrike, newTotalAmount }
	}
}
