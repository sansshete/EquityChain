// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./EquityToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ProjectFactory is Ownable, ReentrancyGuard {
    struct ProjectInfo {
        address tokenAddress;
        address creator;
        string name;
        string category;
        uint256 fundingGoal;
        uint256 equityPercentage;
        uint256 createdAt;
        bool isActive;
        bool isApproved;
    }
    
    mapping(address => ProjectInfo) public projects;
    address[] public projectList;
    mapping(address => address[]) public creatorProjects;
    
    uint256 public platformFeePercentage = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    address public feeRecipient;
    
    event ProjectCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        uint256 fundingGoal,
        uint256 equityPercentage
    );
    
    event ProjectApproved(address indexed tokenAddress);
    event ProjectRejected(address indexed tokenAddress);
    
    modifier onlyApprovedProject(address _tokenAddress) {
        require(projects[_tokenAddress].isApproved, "Project not approved");
        _;
    }
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    function createProject(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _category,
        uint256 _fundingGoal,
        uint256 _equityPercentage,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _fundingDuration
    ) external returns (address) {
        require(_fundingGoal > 0, "Funding goal must be positive");
        require(_equityPercentage > 0 && _equityPercentage <= 100, "Invalid equity percentage");
        require(_minInvestment > 0, "Minimum investment must be positive");
        require(_maxInvestment >= _minInvestment, "Maximum investment must be >= minimum");
        require(_fundingDuration > 0, "Funding duration must be positive");
        
        EquityToken newProject = new EquityToken(
            _name,
            _symbol,
            _description,
            _category,
            _fundingGoal,
            _equityPercentage,
            _minInvestment,
            _maxInvestment,
            _fundingDuration,
            msg.sender
        );
        
        address tokenAddress = address(newProject);
        
        projects[tokenAddress] = ProjectInfo({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            name: _name,
            category: _category,
            fundingGoal: _fundingGoal,
            equityPercentage: _equityPercentage,
            createdAt: block.timestamp,
            isActive: true,
            isApproved: false // Requires approval before going live
        });
        
        projectList.push(tokenAddress);
        creatorProjects[msg.sender].push(tokenAddress);
        
        emit ProjectCreated(tokenAddress, msg.sender, _name, _fundingGoal, _equityPercentage);
        
        return tokenAddress;
    }
    
    function approveProject(address _tokenAddress) external onlyOwner {
        require(projects[_tokenAddress].tokenAddress != address(0), "Project does not exist");
        require(!projects[_tokenAddress].isApproved, "Project already approved");
        
        projects[_tokenAddress].isApproved = true;
        
        emit ProjectApproved(_tokenAddress);
    }
    
    function rejectProject(address _tokenAddress) external onlyOwner {
        require(projects[_tokenAddress].tokenAddress != address(0), "Project does not exist");
        require(!projects[_tokenAddress].isApproved, "Project already approved");
        
        projects[_tokenAddress].isActive = false;
        
        emit ProjectRejected(_tokenAddress);
    }
    
    function getProjectCount() external view returns (uint256) {
        return projectList.length;
    }
    
    function getCreatorProjectCount(address _creator) external view returns (uint256) {
        return creatorProjects[_creator].length;
    }
    
    function getCreatorProjects(address _creator) external view returns (address[] memory) {
        return creatorProjects[_creator];
    }
    
    function getAllProjects() external view returns (address[] memory) {
        return projectList;
    }
    
    function getApprovedProjects() external view returns (address[] memory) {
        uint256 approvedCount = 0;
        
        // Count approved projects
        for (uint256 i = 0; i < projectList.length; i++) {
            if (projects[projectList[i]].isApproved && projects[projectList[i]].isActive) {
                approvedCount++;
            }
        }
        
        // Create array of approved projects
        address[] memory approvedProjects = new address[](approvedCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < projectList.length; i++) {
            if (projects[projectList[i]].isApproved && projects[projectList[i]].isActive) {
                approvedProjects[currentIndex] = projectList[i];
                currentIndex++;
            }
        }
        
        return approvedProjects;
    }
    
    function setPlatformFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercentage = _feePercentage;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    function calculatePlatformFee(uint256 _amount) external view returns (uint256) {
        return (_amount * platformFeePercentage) / FEE_DENOMINATOR;
    }
}