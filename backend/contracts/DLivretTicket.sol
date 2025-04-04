// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title DLivretTicket contract
/// @notice This contract allows minting and burning of lottery tickets (ERC1155 tokens).
/// It is used for tracking lottery tickets for a weekly lottery. Only authorized contracts can mint/burn tickets.
contract DLivretTicket is ERC1155, Ownable {
    mapping(address => bool) public allowedCallerContracts; // Store multiple caller contracts

    /// @dev Emitted when a lottery ticket is minted for a user.
    /// @param user The address of the user receiving the ticket.
    /// @param ticketId The ID of the ticket that is minted.
    /// @param amount The number of tickets minted.
    event TicketMinted(address user, uint256 ticketId, uint256 amount);

    /// @dev Emitted when a lottery ticket is burned by a user.
    /// @param user The address of the user burning the ticket.
    /// @param ticketId The ID of the ticket being burned.
    /// @param amount The number of tickets burned.
    event TicketBurned(address user, uint256 ticketId, uint256 amount);

    /// @dev Emitted when a new caller contract is added to the allowed caller list.
    /// @param callerContract The address of the added caller contract.
    event CallerContractAdded(address callerContract);

    /// @dev Emitted when a caller contract is removed from the allowed caller list.
    /// @param callerContract The address of the removed caller contract.
    event CallerContractRemoved(address callerContract);

    /// @notice Constructor to initialize the contract.
    /// @dev The base URI is set as an empty string for now.
    constructor() ERC1155("") Ownable(msg.sender) {}

    /// @dev Modifier to restrict function access to authorized caller contracts.
    modifier onlyCallerContract() {
        require(allowedCallerContracts[msg.sender], "Not an authorized caller contract");
        _;
    }

    /// @notice Adds a contract to the list of allowed caller contracts.
    /// @param _callerContract The address of the contract to be added.
    /// @dev Only the owner can add a caller contract.
    function addContractCaller(address _callerContract) external onlyOwner {
        allowedCallerContracts[_callerContract] = true;
        emit CallerContractAdded(_callerContract);
    }

    /// @notice Removes a contract from the list of allowed caller contracts.
    /// @param _callerContract The address of the contract to be removed.
    /// @dev Only the owner can remove a caller contract.
    function removeContractCaller(address _callerContract) external onlyOwner {
        allowedCallerContracts[_callerContract] = false;
        emit CallerContractRemoved(_callerContract);
    }

    /// @notice Returns the current ticket ID based on the current timestamp (one ticket ID per week).
    /// @return ticketId The ticket ID corresponding to the current week.
    /// @dev The ticket ID is calculated as the current timestamp divided by 7 days.
    function getCurrentTicketId() private view returns (uint256) {
        return block.timestamp / 7 days; // One ticket ID per week
    }

    /// @notice Mints a lottery ticket for the specified user.
    /// @param user The address of the user to receive the minted ticket.
    /// @dev Only authorized caller contracts can call this function. This function is meant to be called by DLivret contracts.
    function mintTicket(address user) external onlyCallerContract {
        uint256 ticketId = getCurrentTicketId();
        _mint(user, ticketId, 1, "");

        emit TicketMinted(user, ticketId, 1);
    }

    // Lotery contract might be an authorized caller (it might also be the only caller in the Dlivret DApp)
    // function burnTicket(address user, uint256 value) external onlyCallerContract {
    //     uint256 ticketId = getCurrentTicketId();
    //     _burn(user, ticketId, value);

    //     emit TicketBurned(user, ticketId, value);
    // }

    /// @notice Overridden safeTransferFrom function to disable transfers of tickets.
    /// @dev Transfers are disabled for this contract. Only minting and burning by authorized callers are allowed.
    /// @param from The address transferring the ticket.
    /// @param to The address receiving the ticket.
    /// @param id The ticket ID.
    /// @param amount The amount of tickets being transferred.
    /// @param data Additional data with the transfer.
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        require(from == address(0) || to == address(0), "Transfers disabled");
        super.safeTransferFrom(from, to, id, amount, data);
    }

    /// @notice Overridden safeBatchTransferFrom function to disable batch transfers of tickets.
    /// @dev Batch transfers are disabled for this contract. Only minting and burning by authorized callers are allowed.
    /// @param from The address transferring the tickets.
    /// @param to The address receiving the tickets.
    /// @param ids The array of ticket IDs being transferred.
    /// @param amounts The array of amounts of tickets being transferred.
    /// @param data Additional data with the transfer.
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
        require(from == address(0) || to == address(0), "Transfers disabled");
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

}
