// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@pendle/core-v2/contracts/interfaces/IPAllActionV3.sol";
import "@pendle/core-v2/contracts/interfaces/IPMarket.sol";
import "./StructGen.sol";

// Already imported in Pendle contracts I think
// interface IERC20 {
//     function approve(address spender, uint256 amount) external returns (bool);
//     function balanceOf(address owner) external view returns (uint256);
// }

contract RouterSampleUSDe is StructGen {
    IPAllActionV3 public constant router = IPAllActionV3(0x888888888889758F76e7103c6CbF23ABbF58F946);
    IPMarket public constant market = IPMarket(0x9Df192D13D61609D1852461c4850595e1F56E714); // USDe market address
    address public constant USDe = 0x4c9EDD5852cd905f086C759E8383e09bff1E68B3; // USDe token address

    constructor() {
        IERC20(USDe).approve(address(router), type(uint256).max);
        IERC20(address(market)).approve(address(router), type(uint256).max);
    }

    function buyPT(uint256 amountIn) external returns (uint256 netPtOut) {
        (netPtOut, , ) = router.swapExactTokenForPt(
            msg.sender,
            address(market),
            0,
            defaultApprox,
            createTokenInputStruct(USDe, amountIn),
            emptyLimit
        );

        // emit BoughtPT(msg.sender, amountIn, netPtOut);
    }

    function sellPT(uint256 amountPtIn) external returns (uint256 netTokenOut) {
        (netTokenOut, , ) = router.swapExactPtForToken(
            msg.sender,
            address(market),
            amountPtIn,
            createTokenOutputStruct(USDe, 0),
            emptyLimit
        );

        // emit SoldPT(msg.sender, amountPtIn, netTokenOut);
    }
}
