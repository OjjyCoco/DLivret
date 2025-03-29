// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Token that is the ticket for a week lotery. The lotery contract is coded in another file.
contract DLivretTicket is ERC1155, Ownable {
    mapping(address => bool) public allowedCallerContracts; // Store multiple caller contracts

    event TicketMinted(address indexed user, uint256 indexed ticketId, uint256 amount);
    event TicketBurned(address indexed user, uint256 indexed ticketId, uint256 amount);
    event CallerContractCAdded(address indexed callerContract);
    event CallerContractRemoved(address indexed callerContract);

    constructor() ERC1155("") Ownable(msg.sender) {

    }

    modifier onlyCallerContract() {
        require(allowedCallerContracts[msg.sender], "Not an authorized caller contract");
        _;
    }

    function addContractCaller(address _callerContract) external onlyOwner {
        allowedCallerContracts[_callerContract] = true;
        emit CallerContractCAdded(_callerContract);
    }

    function removeContractCaller(address _callerContract) external onlyOwner {
        allowedCallerContracts[_callerContract] = false;
        emit CallerContractRemoved(_callerContract);
    }

    function getCurrentTicketId() private view returns (uint256) {
        return block.timestamp / 7 days; // One ticket ID per week
    }

    function mintTicket(address user) external onlyCallerContract {
        uint256 ticketId = getCurrentTicketId();
        _mint(user, ticketId, 1, "");

        emit TicketMinted(user, ticketId, 1);
    }

    function burnTicket(address user, uint256 value) external onlyCallerContract {
        // Lotery contract might be an authorized caller (it might also be the only caller in the Dlivret DApp)
        uint256 ticketId = getCurrentTicketId();
        _burn(user, ticketId, value);

        emit TicketBurned(user, ticketId, value);
    }

    // override transfers to disables tokens transfer between users
    //
    // here
    //
}
