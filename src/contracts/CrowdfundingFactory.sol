// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./EquityCrowdfundingProject.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CrowdfundingFactory is Ownable, ReentrancyGuard {
    struct ProjectInfo {
        address contractAddress;
        address creator;
        string title;
        string description;
        uint256 fundingGoal;
        uint256 createdAt;
        bool isApproved;
        bool isActive;
    }
    
    mapping(address => ProjectInfo) public projects;
    address[] public projectList;
    mapping(address => address[]) public creatorProjects;
    
    uint256 public platformFeePercentage = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event ProjectCreated(
        address indexed contractAddress,
        address indexed creator,
        string title,
        uint256 fundingGoal
    );
    
    event ProjectApproved(address indexed contractAddress);
    event ProjectRejected(address indexed contractAddress);
    
    modifier onlyApprovedProject(address _contractAddress) {
        require(projects[_contractAddress].isApproved, "Project not approved");
        _;
    }
    
    constructor() {}
    
    function createProject(
        string memory _title,
        string memory _description,
        uint256 _fundingGoal,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _totalSupply,
        uint256 _fundingDuration
    ) external returns (address) {
        require(_fundingGoal > 0, "Funding goal must be positive");
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Milestone arrays length mismatch");
        require(_milestoneDescriptions.length > 0, "At least one milestone required");
        require(_totalSupply > 0, "Total supply must be positive");
        
        // Verify milestone amounts sum to funding goal
        uint256 totalMilestoneAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalMilestoneAmount += _milestoneAmounts[i];
        }
        require(totalMilestoneAmount == _fundingGoal, "Milestone amounts must sum to funding goal");
        
        EquityCrowdfundingProject newProject = new EquityCrowdfundingProject(
            _title,
            _description,
            _fundingGoal,
            _milestoneDescriptions,
            _milestoneAmounts,
            _tokenName,
            _tokenSymbol,
            _totalSupply,
            _fundingDuration,
            msg.sender,
            address(this)
        );
        
        address contractAddress = address(newProject);
        
        projects[contractAddress] = ProjectInfo({
            contractAddress: contractAddress,
            creator: msg.sender,
            title: _title,
            description: _description,
            fundingGoal: _fundingGoal,
            createdAt: block.timestamp,
            isApproved: false,
            isActive: true
        });
        
        projectList.push(contractAddress);
        creatorProjects[msg.sender].push(contractAddress);
        
        emit ProjectCreated(contractAddress, msg.sender, _title, _fundingGoal);
        
        return contractAddress;
    }
    
    function approveProject(address _contractAddress) external onlyOwner {
        require(projects[_contractAddress].contractAddress != address(0), "Project does not exist");
        require(!projects[_contractAddress].isApproved, "Project already approved");
        
        projects[_contractAddress].isApproved = true;
        
        // Activate the project contract
        EquityCrowdfundingProject project = EquityCrowdfundingProject(_contractAddress);
        project.activateProject();
        
        emit ProjectApproved(_contractAddress);
    }
    
    function rejectProject(address _contractAddress) external onlyOwner {
        require(projects[_contractAddress].contractAddress != address(0), "Project does not exist");
        require(!projects[_contractAddress].isApproved, "Project already approved");
        
        projects[_contractAddress].isActive = false;
        
        emit ProjectRejected(_contractAddress);
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
    
    function getCreatorProjects(address _creator) external view returns (address[] memory) {
        return creatorProjects[_creator];
    }
    
    function getProjectCount() external view returns (uint256) {
        return projectList.length;
    }
    
    function setPlatformFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%");
        platformFeePercentage = _feePercentage;
    }
    
    function calculatePlatformFee(uint256 _amount) external view returns (uint256) {
        return (_amount * platformFeePercentage) / FEE_DENOMINATOR;
    }
}