// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@pendle/core-v2/contracts/interfaces/IPAllActionV3.sol"; // ^0.8.0
import "@pendle/core-v2/contracts/interfaces/IPMarket.sol"; // ^0.8.0
import "@pendle/core-v2/contracts/interfaces/IPAllActionTypeV3.sol"; // ^0.8.0
import "@openzeppelin/contracts/access/Ownable.sol"; // ^0.8.20

contract RouterSampleUSDe is Ownable {
    IPAllActionV3 public constant router = IPAllActionV3(0x888888888889758F76e7103c6CbF23ABbF58F946);
    IPMarket public market; // = IPMarket(0x9Df192D13D61609D1852461c4850595e1F56E714); // tokenIn market address
    address public tokenIn; // = 0x4c9EDD5852cd905f086C759E8383e09bff1E68B3; // tokenIn token address
    address public PTtokenIn; // = 0x917459337CaAC939D41d7493B3999f571D20D667; // PT tokenIn token address

    event BoughtPT(address sender, uint amountIn, uint netPtOut);
    event SoldPT(address sender, uint amountPtIn, uint netTokenOut);

    error TransferFromError();

    function setMarketAndToken(address _market, address _tokenIn) public onlyOwner {
        require(!IPMarket(_market).isExpired(), "Market has already expired");
        market = IPMarket(_market);
        tokenIn = _tokenIn;
        ( , IPPrincipalToken _PT, ) = market.readTokens();
        PTtokenIn = address(_PT); // cast to address
    }

    constructor (address _market, address _tokenIn) Ownable(msg.sender) {
        setMarketAndToken(_market, _tokenIn);
    }

    function buyPT(uint256 amountIn) external returns (uint256 netPtOut) {
        // First, transfer tokenIn from user to contract
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), TransferFromError());
        IERC20(tokenIn).approve(address(router), type(uint256).max);
        (netPtOut, , ) = router.swapExactTokenForPt(
            msg.sender, // receiver
            address(market),
            amountIn, // minPtOut
            createDefaultApproxParams(),
            createTokenInputSimple(tokenIn, amountIn),
            createEmptyLimitOrderData()
        );

        emit BoughtPT(msg.sender, amountIn, netPtOut);
    }

    function sellPT(uint256 amountPtIn) external returns (uint256 netTokenOut) {
        // Transfer PT from user to contract
        require(IERC20(PTtokenIn).transferFrom(msg.sender, address(this), amountPtIn), TransferFromError());
        IERC20(PTtokenIn).approve(address(router), type(uint256).max);
        (netTokenOut, , ) = router.swapExactPtForToken(
            msg.sender, // receiver
            address(market),
            amountPtIn, // exactPtIn
            createTokenOutputSimple(tokenIn, 0), // tokenOut, minTokenOut
            createEmptyLimitOrderData()
        );

        emit SoldPT(msg.sender, amountPtIn, netTokenOut);
    }
}
