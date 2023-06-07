pragma solidity 0.8.10;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "prb-math/contracts/PRBMathSD59x18.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";

contract SlippageTest is Test {
	using Strings for uint256;
	using Strings for int256;
	using PRBMathSD59x18 for int256;
	using PRBMathUD60x18 for uint256;

	struct DeltaBorrowRates {
		int sellLong; // when someone sells puts to DHV (we need to long to hedge)
		int sellShort; // when someone sells calls to DHV (we need to short to hedge)
		int buyLong; // when someone buys calls from DHV (we need to long to hedge)
		int buyShort; // when someone buys puts from DHV (we need to short to hedge)
	}
	struct DeltaBandMultipliers {
		// array of slippage multipliers for each delta band. e18
		uint256[20] callSlippageGradientMultipliers;
		uint256[20] putSlippageGradientMultipliers;
		// array of spread multipliers for each delta band. e18
		uint256[20] callSpreadMultipliers;
		uint256[20] putSpreadMultipliers;
	}

	uint256 minAmount;
	uint256 slippageGradient;
	// multiplier values for spread and slippage delta bands
	DeltaBandMultipliers internal deltaBandMultipliers;
	uint256 deltaBandWidth;
	// BIPS
	uint256 private constant SIX_DPS = 1_000_000;
	uint256 private constant ONE_YEAR_SECONDS = 31557600;
	// used to convert e18 to e8
	uint256 private constant SCALE_FROM = 10 ** 10;
	uint256 private constant ONE_DELTA = 100e18;
	uint256 private constant ONE_SCALE = 1e18;
	int256 private constant ONE_SCALE_INT = 1e18;
	int256 private constant SIX_DPS_INT = 1_000_000;

	function setUp() public {
		minAmount = 1e15;
		deltaBandMultipliers = DeltaBandMultipliers([
			uint256(1e18),
			1.1e18,
			1.2e18,
			1.3e18,
			1.4e18,
			1.5e18,
			1.6e18,
			1.7e18,
			1.8e18,
			1.9e18,
			2.0e18,
			2.1e18,
			2.2e18,
			2.3e18,
			2.4e18,
			2.5e18,
			2.6e18,
			2.7e18,
			2.8e18,
			2.9e18
		], [
			uint256(1e18),
			1.1e18,
			1.2e18,
			1.3e18,
			1.4e18,
			1.5e18,
			1.6e18,
			1.7e18,
			1.8e18,
			1.9e18,
			2.0e18,
			2.1e18,
			2.2e18,
			2.3e18,
			2.4e18,
			2.5e18,
			2.6e18,
			2.7e18,
			2.8e18,
			2.9e18
		], [
			uint256(1e18),
			1.1e18,
			1.2e18,
			1.3e18,
			1.4e18,
			1.5e18,
			1.6e18,
			1.7e18,
			1.8e18,
			1.9e18,
			2.0e18,
			2.1e18,
			2.2e18,
			2.3e18,
			2.4e18,
			2.5e18,
			2.6e18,
			2.7e18,
			2.8e18,
			2.9e18
		], [
			uint256(1e18),
			1.1e18,
			1.2e18,
			1.3e18,
			1.4e18,
			1.5e18,
			1.6e18,
			1.7e18,
			1.8e18,
			1.9e18,
			2.0e18,
			2.1e18,
			2.2e18,
			2.3e18,
			2.4e18,
			2.5e18,
			2.6e18,
			2.7e18,
			2.8e18,
			2.9e18
		]);
		deltaBandWidth = 5e18;
		slippageGradient = 1e15;
	}

	function testSlippageMultiplierFuzzAmount(uint256 _amount) public {
		vm.assume(_amount > 1e16);
		vm.assume(_amount < 1000e18);
		_getSlippageMultiplier(_amount, 5e17, 100e18, true);
		_getSlippageMultiplier(_amount, -5e17, 100e18, true);
		_getSlippageMultiplier(_amount, 5e17, -100e18, true);
		_getSlippageMultiplier(_amount, -5e17, -100e18, true);
		_getSlippageMultiplier(_amount, 5e17, 100e18, false);
		_getSlippageMultiplier(_amount, -5e17, 100e18, false);
		_getSlippageMultiplier(_amount, 5e17, -100e18, false);
		_getSlippageMultiplier(_amount, -5e17, -100e18, false);
		_getSlippageMultiplier(_amount, -1e16, 100e18, true);
		_getSlippageMultiplier(_amount, 99e16, 100e18, true);
		_getSlippageMultiplier(_amount, -1e16, -100e18, true);
		_getSlippageMultiplier(_amount, 99e16, -100e18, true);
		_getSlippageMultiplier(_amount, -1e16, 100e18, false);
		_getSlippageMultiplier(_amount, 99e16, 100e18, false);
		_getSlippageMultiplier(_amount, -1e16, -100e18, false);
		_getSlippageMultiplier(_amount, 99e16, -100e18, false);
		_getSlippageMultiplier(_amount, 5e17, 0, true);
		_getSlippageMultiplier(_amount, -5e17, 0, true);
		_getSlippageMultiplier(_amount, 5e17, -1000e18, true);
		_getSlippageMultiplier(_amount, -5e17, -1000e18, true);
		_getSlippageMultiplier(_amount, 5e17, 0, false);
		_getSlippageMultiplier(_amount, -5e17, 0, false);
		_getSlippageMultiplier(_amount, 5e17, -1000e18, false);
		_getSlippageMultiplier(_amount, -5e17, -1000e18, false);
		_getSlippageMultiplier(_amount, -1e16, 0, true);
		_getSlippageMultiplier(_amount, 99e16, 0, true);
		_getSlippageMultiplier(_amount, -1e16, -1000e18, true);
		_getSlippageMultiplier(_amount, 99e16, -1000e18, true);
		_getSlippageMultiplier(_amount, -1e16, 0, false);
		_getSlippageMultiplier(_amount, 99e16, 0, false);
		_getSlippageMultiplier(_amount, -1e16, -1000e18, false);
		_getSlippageMultiplier(_amount, 99e16, -1000e18, false);
	}

	function testSlippageMultiplierFuzzDelta(int64 _delta) public {
		vm.assume(_delta <= 1e18);
		vm.assume(_delta >= -1e18);
		_getSlippageMultiplier(1000e18, _delta, 100e18, true);
		_getSlippageMultiplier(1000e18, _delta, 100e18, false);
		_getSlippageMultiplier(1000e18, _delta, -100e18, true);
		_getSlippageMultiplier(1000e18, _delta, -100e18, false);
		_getSlippageMultiplier(1e16, _delta, 100e18, true);
		_getSlippageMultiplier(1e16, _delta, 100e18, false);
		_getSlippageMultiplier(1e16, _delta, -100e18, true);
		_getSlippageMultiplier(1e16, _delta, -100e18, false);
		_getSlippageMultiplier(50e18, _delta, 100e18, true);
		_getSlippageMultiplier(50e18, _delta, 100e18, false);
		_getSlippageMultiplier(50e18, _delta, -100e18, true);
		_getSlippageMultiplier(50e18, _delta, -100e18, false);
		_getSlippageMultiplier(1e18, _delta, 100e18, true);
		_getSlippageMultiplier(1e18, _delta, 100e18, false);
		_getSlippageMultiplier(1e18, _delta, -100e18, true);
		_getSlippageMultiplier(1e18, _delta, -100e18, false);
		_getSlippageMultiplier(1000e18, _delta, 0, true);
		_getSlippageMultiplier(1000e18, _delta, 0, false);
		_getSlippageMultiplier(1000e18, _delta, -1000e18, true);
		_getSlippageMultiplier(1000e18, _delta, -1000e18, false);
		_getSlippageMultiplier(1e16, _delta, 0, true);
		_getSlippageMultiplier(1e16, _delta, 0, false);
		_getSlippageMultiplier(1e16, _delta, -1000e18, true);
		_getSlippageMultiplier(1e16, _delta, -1000e18, false);
		_getSlippageMultiplier(50e18, _delta, 0, true);
		_getSlippageMultiplier(50e18, _delta, 0, false);
		_getSlippageMultiplier(50e18, _delta, -1000e18, true);
		_getSlippageMultiplier(50e18, _delta, -1000e18, false);
		_getSlippageMultiplier(1e18, _delta, 0, true);
		_getSlippageMultiplier(1e18, _delta, 0, false);
		_getSlippageMultiplier(1e18, _delta, -1000e18, true);
		_getSlippageMultiplier(1e18, _delta, -1000e18, false);
	}

	function testSlippageMultiplierFuzzNetDhvExposure(int96 _netDhvExposure) public {
		vm.assume(_netDhvExposure <= 5000e18);
		vm.assume(_netDhvExposure >= -5000e18);
		_getSlippageMultiplier(1000e18, 5e17, _netDhvExposure, true);
		_getSlippageMultiplier(1000e18, -5e17, _netDhvExposure, false);
		_getSlippageMultiplier(1000e18, 5e17, _netDhvExposure, true);
		_getSlippageMultiplier(1000e18, -5e17, _netDhvExposure, false);
		_getSlippageMultiplier(1e16, 5e17, _netDhvExposure, true);
		_getSlippageMultiplier(1e16, -5e17, _netDhvExposure, false);
		_getSlippageMultiplier(1e16, 5e17, _netDhvExposure, true);
		_getSlippageMultiplier(1e16, -5e17, _netDhvExposure, false);
		_getSlippageMultiplier(50e18, 5e17, _netDhvExposure, true);
		_getSlippageMultiplier(50e18, -5e17, _netDhvExposure, false);
		_getSlippageMultiplier(50e18, 5e17, _netDhvExposure, true);
		_getSlippageMultiplier(50e18, -5e17, _netDhvExposure, false);
		_getSlippageMultiplier(1e18, 5e17, _netDhvExposure, true);
		_getSlippageMultiplier(1e18, -5e17, _netDhvExposure, false);
		_getSlippageMultiplier(1e18, 5e17, _netDhvExposure, true);
		_getSlippageMultiplier(1e18, -5e17, _netDhvExposure, false);
		_getSlippageMultiplier(1000e18, -1e16, _netDhvExposure, true);
		_getSlippageMultiplier(1000e18, 99e16, _netDhvExposure, false);
		_getSlippageMultiplier(1000e18, -1e16, _netDhvExposure, true);
		_getSlippageMultiplier(1000e18, 99e16, _netDhvExposure, false);
		_getSlippageMultiplier(1e16, -1e16, _netDhvExposure, true);
		_getSlippageMultiplier(1e16, 99e16, _netDhvExposure, false);
		_getSlippageMultiplier(1e16, -1e16, _netDhvExposure, true);
		_getSlippageMultiplier(1e16, 99e16, _netDhvExposure, false);
		_getSlippageMultiplier(50e18, -1e16, _netDhvExposure, true);
		_getSlippageMultiplier(50e18, 99e16, _netDhvExposure, false);
		_getSlippageMultiplier(50e18, -1e16, _netDhvExposure, true);
		_getSlippageMultiplier(50e18, 99e16, _netDhvExposure, false);
		_getSlippageMultiplier(1e18, -1e16, _netDhvExposure, true);
		_getSlippageMultiplier(1e18, 99e16, _netDhvExposure, false);
		_getSlippageMultiplier(1e18, -1e16, _netDhvExposure, true);
		_getSlippageMultiplier(1e18, 99e16, _netDhvExposure, false);
	}

	function testSlippageMultiplierFuzzSlippageGradient(uint64 _slippageGradient) public {
		vm.assume(_slippageGradient >= 1e12);
		vm.assume(_slippageGradient <= 0.01e18);
		slippageGradient = _slippageGradient;
		_getSlippageMultiplier(1000e18, 5e17, 100e18, true);
		_getSlippageMultiplier(1000e18, -5e17, 100e18, false);
		_getSlippageMultiplier(1000e18, 5e17, -100e18, true);
		_getSlippageMultiplier(1000e18, -5e17, -100e18, false);
		_getSlippageMultiplier(1e16, 5e17, 100e18, true);
		_getSlippageMultiplier(1e16, -5e17, 100e18, false);
		_getSlippageMultiplier(1e16, 5e17, -100e18, true);
		_getSlippageMultiplier(1e16, -5e17, -100e18, false);
		_getSlippageMultiplier(50e18, 5e17, 100e18, true);
		_getSlippageMultiplier(50e18, -5e17, 100e18, false);
		_getSlippageMultiplier(50e18, 5e17, -100e18, true);
		_getSlippageMultiplier(50e18, -5e17, -100e18, false);
		_getSlippageMultiplier(1e18, 5e17, 100e18, true);
		_getSlippageMultiplier(1e18, -5e17, 100e18, false);
		_getSlippageMultiplier(1e18, 5e17, -100e18, true);
		_getSlippageMultiplier(1e18, -5e17, -100e18, false);
		_getSlippageMultiplier(1000e18, -1e16, 100e18, true);
		_getSlippageMultiplier(1000e18, 99e16, 100e18, false);
		_getSlippageMultiplier(1000e18, -1e16, -100e18, true);
		_getSlippageMultiplier(1000e18, 99e16, -100e18, false);
		_getSlippageMultiplier(1e16, -1e16, 100e18, true);
		_getSlippageMultiplier(1e16, 99e16, 100e18, false);
		_getSlippageMultiplier(1e16, -1e16, -100e18, true);
		_getSlippageMultiplier(1e16, 99e16, -100e18, false);
		_getSlippageMultiplier(50e18, -1e16, 100e18, true);
		_getSlippageMultiplier(50e18, 99e16, 100e18, false);
		_getSlippageMultiplier(50e18, -1e16, -100e18, true);
		_getSlippageMultiplier(50e18, 99e16, -100e18, false);
		_getSlippageMultiplier(1e18, -1e16, 100e18, true);
		_getSlippageMultiplier(1e18, 99e16, 100e18, false);
		_getSlippageMultiplier(1e18, -1e16, -100e18, true);
		_getSlippageMultiplier(1e18, 99e16, -100e18, false);
		_getSlippageMultiplier(1000e18, 5e17, 0, true);
		_getSlippageMultiplier(1000e18, -5e17, 0, false);
		_getSlippageMultiplier(1000e18, 5e17, -1000e18, true);
		_getSlippageMultiplier(1000e18, -5e17, -1000e18, false);
		_getSlippageMultiplier(1e16, 5e17, 0, true);
		_getSlippageMultiplier(1e16, -5e17, 0, false);
		_getSlippageMultiplier(1e16, 5e17, -1000e18, true);
		_getSlippageMultiplier(1e16, -5e17, -1000e18, false);
		_getSlippageMultiplier(50e18, 5e17, 0, true);
		_getSlippageMultiplier(50e18, -5e17, 0, false);
		_getSlippageMultiplier(50e18, 5e17, -1000e18, true);
		_getSlippageMultiplier(50e18, -5e17, -1000e18, false);
		_getSlippageMultiplier(1e18, 5e17, 0, true);
		_getSlippageMultiplier(1e18, -5e17, 0, false);
		_getSlippageMultiplier(1e18, 5e17, -1000e18, true);
		_getSlippageMultiplier(1e18, -5e17, -1000e18, false);
		_getSlippageMultiplier(1000e18, -1e16, 0, true);
		_getSlippageMultiplier(1000e18, 99e16, 0, false);
		_getSlippageMultiplier(1000e18, -1e16, -1000e18, true);
		_getSlippageMultiplier(1000e18, 99e16, -1000e18, false);
		_getSlippageMultiplier(1e16, -1e16, 0, true);
		_getSlippageMultiplier(1e16, 99e16, 0, false);
		_getSlippageMultiplier(1e16, -1e16, -1000e18, true);
		_getSlippageMultiplier(1e16, 99e16, -1000e18, false);
		_getSlippageMultiplier(50e18, -1e16, 0, true);
		_getSlippageMultiplier(50e18, 99e16, 0, false);
		_getSlippageMultiplier(50e18, -1e16, -1000e18, true);
		_getSlippageMultiplier(50e18, 99e16, -1000e18, false);
		_getSlippageMultiplier(1e18, -1e16, 0, true);
		_getSlippageMultiplier(1e18, 99e16, 0, false);
		_getSlippageMultiplier(1e18, -1e16, -1000e18, true);
		_getSlippageMultiplier(1e18, 99e16, -1000e18, false);
	}

	function testSlippageFFIGetSlippageMultiplier() public {
		uint256 amount = 10e18;
		int256 delta = 5e17;
		int256 netDhvExposure = -1000e18;
		uint256 solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, true);
		uint256 pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, true, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e7);
		solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, false);
		pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, false, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e7);
	}

	function testSlippageFFIFuzzAmountGetSlippageMultiplier(uint128 amount) public {
		vm.assume(amount > 1e16);
		vm.assume(amount < 1000e18);
		int256 delta = 5e17;
		int256 netDhvExposure = -1000e18;
		uint256 solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, true);
		uint256 pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, true, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e7);
		solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, false);
		pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, false, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e7);
	}

	function testSlippageFFIFuzzDeltaGetSlippageMultiplier(int64 delta) public {
		vm.assume(delta <= 1e18);
		vm.assume(delta >= -1e18);
		uint256 amount = 1000e18;
		int256 netDhvExposure = -1000e18;
		uint256 solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, true);
		uint256 pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, true, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e9);
		solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, false);
		pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, false, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e9);
	}

	function testSlippageFFIFuzzNetDhvExposureGetSlippageMultiplier(int96 netDhvExposure) public {
		vm.assume(netDhvExposure <= 5000e18);
		vm.assume(netDhvExposure >= -5000e18);
		uint256 amount = 100e18;
		int256 delta = 5e17;
		uint256 solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, true);
		uint256 pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, true, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e10);
		solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, false);
		pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, false, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e10);
	}

	function testSlippageFFIFuzzSlippageGradientGetSlippageMultiplier(uint64 _slippageGradient) public {
		vm.assume(_slippageGradient >= 1e12);
		vm.assume(_slippageGradient <= 5e15);
		slippageGradient = _slippageGradient;
		uint256 amount = 100e18;
		int256 delta = 5e17;
		int256 netDhvExposure = -100e18;
		uint256 solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, true);
		uint256 pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, true, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e11);
		solSlippageMul = _getSlippageMultiplier(amount, delta, netDhvExposure, false);
		pySlippageMul = getSlippageMultiplier(amount, netDhvExposure, delta, false, slippageGradient);
		assertApproxEqAbs(solSlippageMul, pySlippageMul, 1e11);
	}

	function getSlippageMultiplier(
		uint256 _amount,
		int256 _netDhvExposure,
		int256 _delta,
		bool _isSellBool,
		uint256 _slippageGradient
	) private returns (uint256) {
		uint256 isNetDhvExposureNegative;
		uint256 isDeltaNegative;
		uint256 isSell;
		if (_netDhvExposure < 0) {
			isNetDhvExposureNegative = 1;
			_netDhvExposure = -_netDhvExposure;
		}
		if (_delta < 0) {
			isDeltaNegative = 1;
			_delta = -_delta;
		}
		if (_isSellBool) {
			isSell = 1;
		}
		string[] memory inputs = new string[](16);
		inputs[0] = "python3";
		inputs[1] = "test/foundry/slippage.py";
		inputs[2] = "--amount";
		inputs[3] = uint256(_amount).toString();
		inputs[4] = "--netDhvExposure";
		inputs[5] = uint256(_netDhvExposure).toString();
		inputs[6] = "--isNetDhvExposureNegative";
		inputs[7] = uint256(isNetDhvExposureNegative).toString();
		inputs[8] = "--isSell";
		inputs[9] = uint256(isSell).toString();
		inputs[10] = "--slippageGradient";
		inputs[11] = uint256(_slippageGradient).toString();
		inputs[12] = "--delta";
		inputs[13] = uint256(_delta).toString();
		inputs[14] = "--isDeltaNegative";
		inputs[15] = uint256(isDeltaNegative).toString();
		bytes memory res = vm.ffi(inputs);
		uint256 vol = abi.decode(res, (uint256));
		return vol;
	}

	// FUNCTION TO BE FUZZED

	/**
	 * @notice function to add slippage to orders to prevent over-exposure to a single option type
	 * @param _amount amount of options contracts being traded. e18
	 * @param _optionDelta the delta exposure of the option
	 * @param _netDhvExposure how many contracts of this series the DHV is already exposed to. e18. negative if net short.
	 * @param _isSell true if someone is selling option to DHV. False if they're buying from DHV
	 */
	function _getSlippageMultiplier(
		uint256 _amount,
		int256 _optionDelta,
		int256 _netDhvExposure,
		bool _isSell
	) internal view returns (uint256 slippageMultiplier) {
		// slippage will be exponential with the exponent being the DHV's net exposure
		int256 newExposureExponent = _isSell
			? _netDhvExposure + int256(_amount)
			: _netDhvExposure - int256(_amount);
		int256 oldExposureExponent = _netDhvExposure;
		uint256 modifiedSlippageGradient;
		// not using math library here, want to reduce to a non e18 integer
		// integer division rounds down to nearest integer
		uint256 deltaBandIndex = (uint256(_optionDelta.abs()) * 100) / deltaBandWidth;
		if (_optionDelta > 0) {
			modifiedSlippageGradient = slippageGradient.mul(
				deltaBandMultipliers.callSlippageGradientMultipliers[deltaBandIndex]
			);
		} else {
			modifiedSlippageGradient = slippageGradient.mul(
				deltaBandMultipliers.putSlippageGradientMultipliers[deltaBandIndex]
			);
		}
		if (slippageGradient == 0) {
			slippageMultiplier = ONE_SCALE;
			return slippageMultiplier;
		}
		// integrate the exponential function to get the slippage multiplier as this represents the average exposure
		// if it is a sell then we need to do lower bound is old exposure exponent, upper bound is new exposure exponent
		// if it is a buy then we need to do lower bound is new exposure exponent, upper bound is old exposure exponent
		int256 slippageFactor = int256(ONE_SCALE + modifiedSlippageGradient);
		if (_isSell) {
			slippageMultiplier = uint256(
				(slippageFactor.pow(-oldExposureExponent) - slippageFactor.pow(-newExposureExponent)).div(
					slippageFactor.ln()
				)
			).div(_amount);
		} else {
			slippageMultiplier = uint256(
				(slippageFactor.pow(-newExposureExponent) - slippageFactor.pow(-oldExposureExponent)).div(
					slippageFactor.ln()
				)
			).div(_amount);
		}
	}
}
