// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DLivretTicket is ERC1155, Ownable {
    // mapping(uint256 => bool) public validTicketIds;
    mapping(address => bool) public allowedCallerContracts; // Store multiple swap contracts

    event TicketMinted(address indexed user, uint256 indexed ticketId, uint256 amount);
    event CallerContractCAdded(address indexed swapContract);
    event CallerContractRemoved(address indexed swapContract);

    constructor() ERC1155("") Ownable(msg.sender) {}

    function addContractCaller(address _swapContract) external onlyOwner {
        allowedCallerContracts[_swapContract] = true;
        emit CallerContractCAdded(_swapContract);
    }

    function removeContractCaller(address _swapContract) external onlyOwner {
        allowedCallerContracts[_swapContract] = false;
        emit CallerContractRemoved(_swapContract);
    }

    function getCurrentTicketId() public view returns (uint256) {
        return block.timestamp / 7 days; // One ticket ID per week
    }

    function mintTicket(address user) external {
        require(allowedCallerContracts[msg.sender], "Not authorized caller");
        uint256 ticketId = getCurrentTicketId();
        _mint(user, ticketId, 1, "");
        // validTicketIds[ticketId] = true;

        emit TicketMinted(user, ticketId, 1);
    }

    // function isValidTicket(uint256 ticketId) external view returns (bool) {
    //     return validTicketIds[ticketId];
    // }
}
