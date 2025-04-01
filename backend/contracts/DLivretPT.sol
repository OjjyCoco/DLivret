// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@pendle/core-v2/contracts/interfaces/IPAllActionV3.sol"; // ^0.8.0
import "@pendle/core-v2/contracts/interfaces/IPMarket.sol"; // ^0.8.0
import "@pendle/core-v2/contracts/interfaces/IPAllActionTypeV3.sol"; // ^0.8.0
import "@openzeppelin/contracts/access/Ownable.sol"; // ^0.8.20
import "./DLivretTicket.sol"; // 0.8.28

contract DLivretPT is Ownable {
    IPAllActionV3 public constant router = IPAllActionV3(0x888888888889758F76e7103c6CbF23ABbF58F946);
    IPMarket public market;
    address public tokenIn;
    address public PTtokenIn;
    DLivretTicket public constant dlivretTicket = DLivretTicket(0xeA2e668d430e5AA15babA2f5c5edfd4F9Ef6EB73);
    uint16 public buyingFees = 1000;
    uint16 public sellingFees = 1000;

    event BoughtPT(address sender, uint amountIn, uint netPtOut);
    event SoldPT(address sender, uint amountPtIn, uint netTokenOut);
    event FeesUpdated(uint16 buyingFees, uint16 sellingFees);

    error TransferFromError();

    constructor (address _market, address _tokenIn) Ownable(msg.sender) {
        setMarketAndToken(_market, _tokenIn);
    }

    function setMarketAndToken(address _market, address _tokenIn) public onlyOwner {
        require(!IPMarket(_market).isExpired(), "Market has already expired");
        market = IPMarket(_market);
        tokenIn = _tokenIn;
        ( , IPPrincipalToken _PT, ) = market.readTokens();
        PTtokenIn = address(_PT); // cast to address
    }

    function setFees(uint16 _buyingFees, uint16 _sellingFees) external onlyOwner {
        require(_buyingFees <= 1000 && _sellingFees <= 1000, "Invalid fee percentage");
        buyingFees = _buyingFees;
        sellingFees = _sellingFees;
        emit FeesUpdated(buyingFees, sellingFees);
    }

    function buyPT(uint256 amountTokenIn) external returns (uint256 netPtOut) {
        // Transfer tokenIn from user to contract
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountTokenIn), TransferFromError());
        IERC20(tokenIn).approve(address(router), amountTokenIn);
        uint256 amountSwaped = (amountTokenIn * buyingFees) / 1000;
        (netPtOut, , ) = router.swapExactTokenForPt(
            msg.sender, // receiver
            address(market),
            amountSwaped, // minPtOut * input fees
            createDefaultApproxParams(),
            createTokenInputSimple(tokenIn, amountSwaped), // we take 0.03% input fees
            createEmptyLimitOrderData()
        );

        dlivretTicket.mintTicket(msg.sender);

        emit BoughtPT(msg.sender, amountSwaped, netPtOut);
    }

    function sellPT(uint256 amountPtIn) external returns (uint256 netTokenOut) {
        // Transfer PT from user to contract
        require(IERC20(PTtokenIn).transferFrom(msg.sender, address(this), amountPtIn), TransferFromError());
        IERC20(PTtokenIn).approve(address(router), amountPtIn);
        uint256 amountSwaped = (amountPtIn * sellingFees) / 1000;
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

    function withdrawFunds(address token) external onlyOwner {
        if (token == address(0)) {
            // Withdraw all native ETH
            uint256 balance = address(this).balance;
            require(balance > 0, "No ETH to withdraw");
            (bool success, ) = payable(owner()).call{value: balance}("");
            require(success, "ETH withdrawal failed");
        } else {
            // Withdraw all ERC20 tokens
            uint256 balance = IERC20(token).balanceOf(address(this));
            require(balance > 0, "No ERC20 to withdraw");
            require(IERC20(token).transfer(owner(), balance), "ERC20 withdrawal failed");
        }
    }


    receive() external payable {}

    fallback() external payable {}

}
