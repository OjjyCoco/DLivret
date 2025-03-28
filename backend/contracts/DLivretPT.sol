// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@pendle/core-v2/contracts/interfaces/IPAllActionV3.sol"; // ^0.8.0
import "@pendle/core-v2/contracts/interfaces/IPMarket.sol"; // ^0.8.0
import "@pendle/core-v2/contracts/interfaces/IPAllActionTypeV3.sol"; // ^0.8.0
import "@openzeppelin/contracts/access/Ownable.sol"; // ^0.8.20
import "./DLivretTicket.sol"; // 0.8.28

contract DLivretPT is Ownable {
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
        // Transfer tokenIn from user to contract
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), TransferFromError());
        IERC20(tokenIn).approve(address(router), type(uint256).max);
        uint256 amountSwaped = (amountIn * 997) / 1000;
        (netPtOut, , ) = router.swapExactTokenForPt(
            msg.sender, // receiver
            address(market),
            amountSwaped, // minPtOut * input fees
            createDefaultApproxParams(),
            createTokenInputSimple(tokenIn, amountSwaped), // we take 0.03% input fees
            createEmptyLimitOrderData()
        );

        // DLivretTicket(ticketContract).mintTicket(user);

        emit BoughtPT(msg.sender, amountSwaped, netPtOut);
    }

    function sellPT(uint256 amountPtIn) external returns (uint256 netTokenOut) {
        // Transfer PT from user to contract
        require(IERC20(PTtokenIn).transferFrom(msg.sender, address(this), amountPtIn), TransferFromError());
        IERC20(PTtokenIn).approve(address(router), type(uint256).max);
        uint256 amountSwaped = (amountPtIn * 999) / 1000;
        (netTokenOut, , ) = router.swapExactPtForToken(
            msg.sender, // receiver
            address(market),
            amountSwaped, // exactPtIn
            createTokenOutputSimple(tokenIn, 0), // tokenOut, minTokenOut
            createEmptyLimitOrderData()
        );

        // DLivretTicket(ticketContract).mintTicket(user);

        emit SoldPT(msg.sender, amountSwaped, netTokenOut);
    }

}
