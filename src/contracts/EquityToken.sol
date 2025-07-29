// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EquityToken is ERC20, Ownable, ReentrancyGuard {
    struct Investor {
        uint256 investment;
        uint256 tokens;
        uint256 timestamp;
        bool isActive;
    }
    
    struct Milestone {
        string description;
        uint256 targetAmount;
        bool isCompleted;
        uint256 completedAt;
    }
    
    mapping(address => Investor) public investors;
    address[] public investorList;
    Milestone[] public milestones;
    
    uint256 public fundingGoal;
    uint256 public totalRaised;
    uint256 public equityPercentage;
    uint256 public minInvestment;
    uint256 public maxInvestment;
    uint256 public fundingDeadline;
    uint256 public tokenPrice; // Price per token in wei
    
    bool public fundingActive;
    bool public fundingSuccessful;
    
    address public projectCreator;
    string public projectDescription;
    string public projectCategory;
    
    event InvestmentMade(address indexed investor, uint256 amount, uint256 tokens);
    event FundingGoalReached(uint256 totalAmount);
    event MilestoneCompleted(uint256 milestoneIndex, string description);
    event FundsWithdrawn(address indexed creator, uint256 amount);
    event RefundIssued(address indexed investor, uint256 amount);
    
    modifier onlyDuringFunding() {
        require(fundingActive && block.timestamp < fundingDeadline, "Funding period not active");
        _;
    }
    
    modifier onlyAfterFunding() {
        require(!fundingActive || block.timestamp >= fundingDeadline, "Funding still active");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _category,
        uint256 _fundingGoal,
        uint256 _equityPercentage,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _fundingDuration,
        address _projectCreator
    ) ERC20(_name, _symbol) {
        projectDescription = _description;
        projectCategory = _category;
        fundingGoal = _fundingGoal;
        equityPercentage = _equityPercentage;
        minInvestment = _minInvestment;
        maxInvestment = _maxInvestment;
        fundingDeadline = block.timestamp + _fundingDuration;
        projectCreator = _projectCreator;
        
        // Calculate token price based on funding goal and equity percentage
        uint256 totalTokens = (_fundingGoal * equityPercentage) / 100;
        tokenPrice = _fundingGoal / totalTokens;
        
        fundingActive = true;
        
        _transferOwnership(_projectCreator);
    }
    
    function invest() external payable onlyDuringFunding nonReentrant {
        require(msg.value >= minInvestment, "Investment below minimum");
        require(msg.value <= maxInvestment, "Investment above maximum");
        require(totalRaised + msg.value <= fundingGoal, "Would exceed funding goal");
        
        uint256 tokensToMint = (msg.value * 1e18) / tokenPrice;
        
        if (investors[msg.sender].isActive) {
            investors[msg.sender].investment += msg.value;
            investors[msg.sender].tokens += tokensToMint;
        } else {
            investors[msg.sender] = Investor({
                investment: msg.value,
                tokens: tokensToMint,
                timestamp: block.timestamp,
                isActive: true
            });
            investorList.push(msg.sender);
        }
        
        totalRaised += msg.value;
        _mint(msg.sender, tokensToMint);
        
        emit InvestmentMade(msg.sender, msg.value, tokensToMint);
        
        if (totalRaised >= fundingGoal) {
            fundingSuccessful = true;
            fundingActive = false;
            emit FundingGoalReached(totalRaised);
        }
    }
    
    function withdrawFunds() external onlyOwner onlyAfterFunding nonReentrant {
        require(fundingSuccessful, "Funding goal not reached");
        
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds to withdraw");
        
        (bool success, ) = payable(projectCreator).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(projectCreator, amount);
    }
    
    function refund() external onlyAfterFunding nonReentrant {
        require(!fundingSuccessful, "Funding was successful, no refunds");
        require(investors[msg.sender].isActive, "No investment found");
        
        uint256 refundAmount = investors[msg.sender].investment;
        uint256 tokensToburn = investors[msg.sender].tokens;
        
        investors[msg.sender].isActive = false;
        investors[msg.sender].investment = 0;
        investors[msg.sender].tokens = 0;
        
        _burn(msg.sender, tokensToburn);
        
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(msg.sender, refundAmount);
    }
    
    function addMilestone(string memory _description, uint256 _targetAmount) external onlyOwner {
        milestones.push(Milestone({
            description: _description,
            targetAmount: _targetAmount,
            isCompleted: false,
            completedAt: 0
        }));
    }
    
    function completeMilestone(uint256 _milestoneIndex) external onlyOwner {
        require(_milestoneIndex < milestones.length, "Invalid milestone index");
        require(!milestones[_milestoneIndex].isCompleted, "Milestone already completed");
        
        milestones[_milestoneIndex].isCompleted = true;
        milestones[_milestoneIndex].completedAt = block.timestamp;
        
        emit MilestoneCompleted(_milestoneIndex, milestones[_milestoneIndex].description);
    }
    
    function getInvestorCount() external view returns (uint256) {
        return investorList.length;
    }
    
    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }
    
    function getFundingProgress() external view returns (uint256 raised, uint256 goal, uint256 percentage) {
        raised = totalRaised;
        goal = fundingGoal;
        percentage = (totalRaised * 100) / fundingGoal;
    }
    
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= fundingDeadline) {
            return 0;
        }
        return fundingDeadline - block.timestamp;
    }
    
    // Override transfer functions to add equity tracking
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        // Add any equity transfer restrictions here if needed
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        // Add any equity transfer restrictions here if needed
        return super.transferFrom(from, to, amount);
    }
}