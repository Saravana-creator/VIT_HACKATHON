// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CredentialNFT is ERC721, Ownable {
    uint256 private _tokenIds;

    struct Credential {
        string studentName;
        string course;
        string graduationDate;
        string degreeHash;
        address university;
    }

    mapping(uint256 => Credential) public credentials;
    mapping(address => bool) public authorizedUniversities;

    event CredentialMinted(
        uint256 indexed tokenId,
        address indexed student,
        address indexed university,
        string studentName,
        string course
    );

    constructor() ERC721("Academic Credential", "CRED") Ownable(msg.sender) {}

    modifier onlyAuthorizedUniversity() {
        require(authorizedUniversities[msg.sender] || msg.sender == owner(), "Not authorized university");
        _;
    }

    function authorizeUniversity(address university) external onlyOwner {
        authorizedUniversities[university] = true;
    }

    function revokeUniversity(address university) external onlyOwner {
        authorizedUniversities[university] = false;
    }

    function mintCredential(
        address student,
        string memory studentName,
        string memory course,
        string memory graduationDate,
        string memory degreeHash
    ) external onlyAuthorizedUniversity returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(student, newTokenId);

        credentials[newTokenId] = Credential({
            studentName: studentName,
            course: course,
            graduationDate: graduationDate,
            degreeHash: degreeHash,
            university: msg.sender
        });

        emit CredentialMinted(newTokenId, student, msg.sender, studentName, course);
        return newTokenId;
    }

    function getCredential(uint256 tokenId) external view returns (Credential memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return credentials[tokenId];
    }

    function verifyCredential(uint256 tokenId, string memory degreeHash) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return keccak256(abi.encodePacked(credentials[tokenId].degreeHash)) == keccak256(abi.encodePacked(degreeHash));
    }
}