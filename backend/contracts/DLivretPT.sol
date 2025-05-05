// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@pendle/core-v2/contracts/interfaces/IPAllActionV3.sol"; // ^0.8.0
import "@pendle/core-v2/contracts/interfaces/IPMarket.sol"; // ^0.8.0
import "@pendle/core-v2/contracts/interfaces/IPAllActionTypeV3.sol"; // ^0.8.0
import "@openzeppelin/contracts/access/Ownable.sol"; // ^0.8.20
import "./DLivretTicket.sol"; // 0.8.28

/// @title DLivretPT contract
/// @notice This contract allows users to buy and sell Principal Tokens (PT) on any Pendle market that is not expired.
/// It also mints a lottery ticket each time a user buys or sells PT. Uses the Pendle Router V4 for token swaps.
contract DLivretPT is Ownable {
    IPMarket public market;
    address public tokenIn;
    address public PTtokenIn;
    address public YTtokenIn;
    uint16 public buyingFees = 999;
    uint16 public sellingFees = 999;
    uint224 private _padding;
    IPAllActionV3 public constant router = IPAllActionV3(0x888888888889758F76e7103c6CbF23ABbF58F946);
    DLivretTicket public constant dlivretTicket = DLivretTicket(0x7722f5d7964a04672761cdfdC7c17B7Ac8f197b7);

    /// @dev Emitted when a user buys PT with a specific amount of token.
    /// @param sender The address of the user who bought PT.
    /// @param amountIn The amount of token inputted.
    /// @param netPtOut The amount of PT received after fees.
    event BoughtPT(address sender, uint amountIn, uint netPtOut);

    /// @dev Emitted when a user sells PT for tokens.
    /// @param sender The address of the user who sold PT.
    /// @param amountPtIn The amount of PT inputted by the user.
    /// @param netTokenOut The amount of token received after fees.
    event SoldPT(address sender, uint amountPtIn, uint netTokenOut);

    /// @dev Emitted when the buying or selling fees are updated.
    /// @param buyingFees The new buying fee percentage.
    /// @param sellingFees The new selling fee percentage.
    event FeesUpdated(uint16 buyingFees, uint16 sellingFees);

    /// @dev Error triggered when the transferFrom call fails.
    error TransferFromError();

    /// @notice Constructor to initialize the contract with a Pendle market and token.
    /// @param _market The address of the Pendle market.
    /// @param _tokenIn The address of the token used for buying PT.
    constructor(address _market, address _tokenIn) Ownable(msg.sender) {
        setMarketAndToken(_market, _tokenIn);
    }

    /// @notice Set the Pendle market and associated token to be used in buying PT.
    /// @param _market The address of the Pendle market.
    /// @param _tokenIn The address of the token used for buying PT.
    /// @dev The market must not be expired.
    function setMarketAndToken(address _market, address _tokenIn) public onlyOwner {
        require(!IPMarket(_market).isExpired(), "Market has already expired");
        market = IPMarket(_market);
        tokenIn = _tokenIn;
        ( , IPPrincipalToken _PT, IPYieldToken _YT) = market.readTokens();
        PTtokenIn = address(_PT); // cast to address
        YTtokenIn = address(_YT);

        IERC20(tokenIn).approve(address(router), type(uint256).max);
        IERC20(PTtokenIn).approve(address(router), type(uint256).max);
    }

    /// @notice Set the buying and selling fees.
    /// @param _buyingFees The new buying fee percentage (0-1000).
    /// @param _sellingFees The new selling fee percentage (0-1000).
    /// @dev The fees must be less than or equal to 1000.
    function setFees(uint16 _buyingFees, uint16 _sellingFees) external onlyOwner {
        require(_buyingFees <= 1000 && _sellingFees <= 1000, "Invalid fee percentage");
        buyingFees = _buyingFees;
        sellingFees = _sellingFees;
        emit FeesUpdated(buyingFees, sellingFees);
    }

    /// @notice Allows a user to buy Principal Tokens (PT) with a specified amount of token.
    /// @param amountTokenIn The amount of the input token the user wants to exchange for PT.
    /// @return netPtOut The amount of PT received after fees.
    /// @dev A lottery ticket is minted for the user after the purchase.
    function buyPT(uint256 amountTokenIn) external returns (uint256 netPtOut) {
        require(!IPMarket(market).isExpired(), "Market has expired");
        // Transfer tokenIn from user to contract
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountTokenIn), TransferFromError());
        uint256 amountSwaped = (amountTokenIn * buyingFees) / 1000;
        (netPtOut, , ) = router.swapExactTokenForPt(
            msg.sender, // receiver
            address(market),
            amountSwaped, // minPtOut * input fees
            createDefaultApproxParams(),
            createTokenInputSimple(tokenIn, amountSwaped),
            createEmptyLimitOrderData()
        );

        dlivretTicket.mintTicket(msg.sender);

        emit BoughtPT(msg.sender, amountSwaped, netPtOut);
    }

    /// @notice Allows a user to sell Principal Tokens (PT) for the input token.
    /// @param amountPtIn The amount of PT the user wants to sell.
    /// @return netTokenOut The amount of input token received after fees.
    /// @dev A lottery ticket is minted for the user after the sale.
    function sellPT(uint256 amountPtIn) external returns (uint256 netTokenOut) {
        // Transfer PT from user to contract
        require(IERC20(PTtokenIn).transferFrom(msg.sender, address(this), amountPtIn), TransferFromError());
        uint256 amountSwaped = (amountPtIn * sellingFees) / 1000;
        if(!IPMarket(market).isExpired()){
            (netTokenOut, , ) = router.swapExactPtForToken(
                msg.sender, // receiver
                address(market),
                amountSwaped, // exactPtIn
                createTokenOutputSimple(tokenIn, 0), // tokenOut, minTokenOut
                createEmptyLimitOrderData()
            );

            dlivretTicket.mintTicket(msg.sender);

            emit SoldPT(msg.sender, amountSwaped, netTokenOut);
        }
        else{
            (netTokenOut, ) = router.redeemPyToToken(
                msg.sender,
                YTtokenIn,
                amountSwaped,
                createTokenOutputSimple(tokenIn, 0)
            );

            dlivretTicket.mintTicket(msg.sender);

            emit SoldPT(msg.sender, amountSwaped, netTokenOut);
        }
        
    }

    /// @notice Allows the owner to withdraw any token or native ETH from the contract.
    /// @param token The address of the token to withdraw (use address(0) for native ETH).
    /// @dev Only the contract owner can withdraw funds.
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

    /// @notice Fallback function to accept ETH.
    receive() external payable {}

    /// @notice Fallback function for unsupported function calls.
    fallback() external payable {}
}
