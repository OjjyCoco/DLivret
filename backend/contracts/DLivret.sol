// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@pendle/core-v2/contracts/interfaces/IPAllActionV3.sol"; // ^0.8.0
import "@pendle/core-v2/contracts/interfaces/IPMarket.sol"; // ^0.8.0
import "./StructGen.sol"; // >=0.8.23 <0.9.0

contract RouterSampleUSDe is StructGen {
    IPAllActionV3 public constant router = IPAllActionV3(0x888888888889758F76e7103c6CbF23ABbF58F946);
    IPMarket public constant market = IPMarket(0x9Df192D13D61609D1852461c4850595e1F56E714); // USDe market address
    address public constant USDe = 0x4c9EDD5852cd905f086C759E8383e09bff1E68B3; // USDe token address
    address public constant PTUSDe = 0x917459337CaAC939D41d7493B3999f571D20D667; // PT USDe token address

    function approveTokens() external {
        IERC20(USDe).approve(address(router), type(uint256).max);
        IERC20(PTUSDe).approve(address(router), type(uint256).max);
        IERC20(address(market)).approve(address(router), type(uint256).max);
    }

    function buyPT(uint256 amountIn) external returns (uint256 netPtOut) {
        // First, transfer USDe from user to contract
        require(IERC20(USDe).transferFrom(msg.sender, address(this), amountIn), "Transfer USDe failed");

        (netPtOut, , ) = router.swapExactTokenForPt(
            msg.sender, // receiver
            address(market),
            0,
            defaultApprox,
            createTokenInputStruct(USDe, amountIn),
            emptyLimit
        );

        // emit BoughtPT(msg.sender, amountIn, netPtOut);
    }

    function sellPT(uint256 amountPtIn) external returns (uint256 netTokenOut) {
        // Transfer PT from user to contract
        require(IERC20(PTUSDe).transferFrom(msg.sender, address(this), amountPtIn), "Transfer PT failed");

        (netTokenOut, , ) = router.swapExactPtForToken(
            msg.sender, // receiver
            address(market),
            amountPtIn,
            createTokenOutputStruct(USDe, 0),
            emptyLimit
        );

        // emit SoldPT(msg.sender, amountPtIn, netTokenOut);
    }
}
