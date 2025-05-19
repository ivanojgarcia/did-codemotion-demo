// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DIDRegistry
 * @dev A simple decentralized identity registry contract for managing DIDs
 */
contract DIDRegistry is Ownable {
    // Mapping from DID identifier to its controller address
    mapping(string => address) private _controllers;
    
    // Mapping from DID identifier to its document hash
    mapping(string => string) private _documentHashes;
    
    // Mapping from DID identifier to its last update timestamp
    mapping(string => uint256) private _updateTimestamps;
    
    // Events
    event DIDRegistered(string indexed didId, address controller);
    event DIDControllerChanged(string indexed didId, address newController);
    event DIDDocumentHashUpdated(string indexed didId, string newDocumentHash);
    event DIDDeactivated(string indexed didId);
    
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Generates a new DID based on the caller's Ethereum address
     * Uses the `did:ethr:ganache:` method for local development
     * @return A DID string in the format did:ethr:ganache:<address>
     */
    function createDID() external view returns (string memory) {
        // Convert the caller's address to ASCII and concatenate
        return string(abi.encodePacked("did:ethr:codemtn:", toAsciiString(msg.sender)));
    }

    
    /**
     * @dev Registers a new DID with the specified identifier
     * @param didId The DID identifier to register
     * @param documentHash IPFS hash or other reference to the DID document
     */
    function registerDID(string calldata didId, string calldata documentHash) external {
        require(_controllers[didId] == address(0), "DID already registered");
        
        _controllers[didId] = msg.sender;
        _documentHashes[didId] = documentHash;
        _updateTimestamps[didId] = block.timestamp;
        
        emit DIDRegistered(didId, msg.sender);
        emit DIDDocumentHashUpdated(didId, documentHash);
    }
    
    /**
     * @dev Updates the DID document hash
     * @param didId The DID identifier
     * @param newDocumentHash New IPFS hash or reference to the updated DID document
     */
    function updateDIDDocument(string calldata didId, string calldata newDocumentHash) external {
        require(_controllers[didId] != address(0), "DID not registered");
        require(_controllers[didId] == msg.sender, "Not authorized");
        
        _documentHashes[didId] = newDocumentHash;
        _updateTimestamps[didId] = block.timestamp;
        
        emit DIDDocumentHashUpdated(didId, newDocumentHash);
    }
    
    /**
     * @dev Transfers control of a DID to a new address
     * @param didId The DID identifier
     * @param newController Address of the new controller
     */
    function changeController(string calldata didId, address newController) external {
        require(_controllers[didId] != address(0), "DID not registered");
        require(_controllers[didId] == msg.sender, "Not authorized");
        require(newController != address(0), "Invalid new controller");
        
        _controllers[didId] = newController;
        _updateTimestamps[didId] = block.timestamp;
        
        emit DIDControllerChanged(didId, newController);
    }
    
    /**
     * @dev Deactivates a DID by removing its controller
     * @param didId The DID identifier
     */
    function deactivateDID(string calldata didId) external {
        require(_controllers[didId] != address(0), "DID not registered");
        require(_controllers[didId] == msg.sender, "Not authorized");
        
        delete _controllers[didId];
        _updateTimestamps[didId] = block.timestamp;
        
        emit DIDDeactivated(didId);
    }
    
    /**
     * @dev Retrieves information about a DID
     * @param didId The DID identifier
     * @return controller The address controlling this DID
     * @return documentHash The hash of the DID document
     * @return lastUpdated Timestamp of the last update
     */
    function getDIDInfo(string calldata didId) external view 
        returns (address controller, string memory documentHash, uint256 lastUpdated) {
        return (_controllers[didId], _documentHashes[didId], _updateTimestamps[didId]);
    }
    
    /**
     * @dev Checks if a DID exists and is active
     * @param didId The DID identifier
     * @return True if the DID exists and is active
     */
    function isDIDActive(string calldata didId) external view returns (bool) {
        return _controllers[didId] != address(0);
    }

     /**
     * @dev Internal helper to convert an address to its ASCII string representation
     * @param x The address to convert
     * @return The ASCII string of the address (without 0x prefix)
     */
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
        }
        return string(s);
    }

    /**
     * @dev Internal helper to convert a single byte to its ASCII hex character
     * @param b The byte to convert (0x0–0xF)
     */
    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
} 