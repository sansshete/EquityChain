// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EquityCrowdfundingProject is ERC20, Ownable, ReentrancyGuard {
    struct Milestone {
        string description;
        uint256 amount;
        bool isSubmitted;
        bool isApproved;
        bool isRejected;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 submittedAt;
        uint256 votingDeadline;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice; // true = yes, false = no
    }
    
    struct Backer {
        uint256 contribution;
        uint256 tokens;
        uint256 contributedAt;
        bool hasRefunded;
    }
    
    mapping(address => Backer) public backers;
    address[] public backerList;
    mapping(uint256 => Milestone) public milestones;
    
    string public projectTitle;
    string public projectDescription;
    uint256 public fundingGoal;
    uint256 public totalRaised;
    uint256 public fundingDeadline;
    uint256 public milestoneCount;
    uint256 public currentMilestone;
    uint256 public totalReleasedFunds;
    
    address public projectCreator;
    address public factoryContract;
    bool public isActive;
    bool public fundingSuccessful;
    bool public projectCompleted;
    
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_VOTE_PERCENTAGE = 51; // 51% of token holders must vote
    
    event ContributionMade(address indexed backer, uint256 amount, uint256 tokens);
    event MilestoneSubmitted(uint256 indexed milestoneId, string description);
    event VoteCast(uint256 indexed milestoneId, address indexed voter, bool vote, uint256 tokenWeight);
    event MilestoneApproved(uint256 indexed milestoneId, uint256 amount);
    event MilestoneRejected(uint256 indexed milestoneId);
    event FundsReleased(uint256 indexed milestoneId, uint256 amount);
    event RefundIssued(address indexed backer, uint256 amount);
    event ProjectActivated();
    
    modifier onlyFactory() {
        require(msg.sender == factoryContract, "Only factory can call this");
        _;
    }
    
    modifier onlyCreator() {
        require(msg.sender == projectCreator, "Only creator can call this");
        _;
    }
    
    modifier onlyActive() {
        require(isActive, "Project not active");
        _;
    }
    
    modifier onlyBacker() {
        require(backers[msg.sender].contribution > 0, "Not a backer");
        _;
    }
    
    modifier fundingPeriod() {
        require(block.timestamp < fundingDeadline, "Funding period ended");
        require(!fundingSuccessful, "Funding already successful");
        _;
    }
    
    constructor(
        string memory _title,
        string memory _description,
        uint256 _fundingGoal,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _totalSupply,
        uint256 _fundingDuration,
        address _creator,
        address _factory
    ) ERC20(_tokenName, _tokenSymbol) {
        projectTitle = _title;
        projectDescription = _description;
        fundingGoal = _fundingGoal;
        projectCreator = _creator;
        factoryContract = _factory;
        fundingDeadline = block.timestamp + _fundingDuration;
        milestoneCount = _milestoneDescriptions.length;
        
        // Initialize milestones
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            milestones[i].description = _milestoneDescriptions[i];
            milestones[i].amount = _milestoneAmounts[i];
        }
        
        // Mint total supply to contract (will be distributed to backers)
        _mint(address(this), _totalSupply);
        
        _transferOwnership(_creator);
    }
    
    function activateProject() external onlyFactory {
        isActive = true;
        emit ProjectActivated();
    }
    
    function contribute() external payable onlyActive fundingPeriod nonReentrant {
        require(msg.value > 0, "Contribution must be positive");
        require(totalRaised + msg.value <= fundingGoal, "Would exceed funding goal");
        
        uint256 tokenAmount = (msg.value * totalSupply()) / fundingGoal;
        
        if (backers[msg.sender].contribution == 0) {
            backerList.push(msg.sender);
        }
        
        backers[msg.sender].contribution += msg.value;
        backers[msg.sender].tokens += tokenAmount;
        backers[msg.sender].contributedAt = block.timestamp;
        
        totalRaised += msg.value;
        
        // Transfer tokens to backer
        _transfer(address(this), msg.sender, tokenAmount);
        
        emit ContributionMade(msg.sender, msg.value, tokenAmount);
        
        // Check if funding goal reached
        if (totalRaised >= fundingGoal) {
            fundingSuccessful = true;
        }
    }
    
    function submitMilestone(uint256 _milestoneId) external onlyCreator onlyActive {
        require(_milestoneId < milestoneCount, "Invalid milestone ID");
        require(_milestoneId == currentMilestone, "Must submit milestones in order");
        require(!milestones[_milestoneId].isSubmitted, "Milestone already submitted");
        require(fundingSuccessful, "Funding not successful");
        
        milestones[_milestoneId].isSubmitted = true;
        milestones[_milestoneId].submittedAt = block.timestamp;
        milestones[_milestoneId].votingDeadline = block.timestamp + VOTING_PERIOD;
        
        emit MilestoneSubmitted(_milestoneId, milestones[_milestoneId].description);
    }
    
    function voteOnMilestone(uint256 _milestoneId, bool _vote) external onlyBacker onlyActive {
        require(_milestoneId < milestoneCount, "Invalid milestone ID");
        require(milestones[_milestoneId].isSubmitted, "Milestone not submitted");
        require(!milestones[_milestoneId].isApproved && !milestones[_milestoneId].isRejected, "Milestone already decided");
        require(block.timestamp <= milestones[_milestoneId].votingDeadline, "Voting period ended");
        require(!milestones[_milestoneId].hasVoted[msg.sender], "Already voted");
        
        uint256 voterTokens = balanceOf(msg.sender);
        require(voterTokens > 0, "No tokens to vote with");
        
        milestones[_milestoneId].hasVoted[msg.sender] = true;
        milestones[_milestoneId].voteChoice[msg.sender] = _vote;
        
        if (_vote) {
            milestones[_milestoneId].yesVotes += voterTokens;
        } else {
            milestones[_milestoneId].noVotes += voterTokens;
        }
        
        emit VoteCast(_milestoneId, msg.sender, _vote, voterTokens);
        
        // Check if voting should be finalized
        _checkVotingResult(_milestoneId);
    }
    
    function _checkVotingResult(uint256 _milestoneId) internal {
        uint256 totalVotes = milestones[_milestoneId].yesVotes + milestones[_milestoneId].noVotes;
        uint256 totalTokensInCirculation = totalSupply() - balanceOf(address(this));
        
        // Check if minimum participation reached or voting period ended
        bool minParticipationReached = (totalVotes * 100) >= (totalTokensInCirculation * MIN_VOTE_PERCENTAGE);
        bool votingPeriodEnded = block.timestamp > milestones[_milestoneId].votingDeadline;
        
        if (minParticipationReached || votingPeriodEnded) {
            if (milestones[_milestoneId].yesVotes > milestones[_milestoneId].noVotes) {
                milestones[_milestoneId].isApproved = true;
                currentMilestone++;
                emit MilestoneApproved(_milestoneId, milestones[_milestoneId].amount);
            } else {
                milestones[_milestoneId].isRejected = true;
                emit MilestoneRejected(_milestoneId);
            }
        }
    }
    
    function releaseFunds(uint256 _milestoneId) external onlyCreator onlyActive nonReentrant {
        require(_milestoneId < milestoneCount, "Invalid milestone ID");
        require(milestones[_milestoneId].isApproved, "Milestone not approved");
        require(milestones[_milestoneId].amount > 0, "No funds to release");
        
        uint256 releaseAmount = milestones[_milestoneId].amount;
        milestones[_milestoneId].amount = 0; // Prevent re-entrancy
        totalReleasedFunds += releaseAmount;
        
        (bool success, ) = payable(projectCreator).call{value: releaseAmount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(_milestoneId, releaseAmount);
        
        // Check if all milestones completed
        if (currentMilestone >= milestoneCount) {
            projectCompleted = true;
        }
    }
    
    function refund() external onlyBacker nonReentrant {
        require(!fundingSuccessful || _canRefund(), "Refund not available");
        require(!backers[msg.sender].hasRefunded, "Already refunded");
        
        uint256 refundAmount = backers[msg.sender].contribution;
        uint256 tokenAmount = backers[msg.sender].tokens;
        
        backers[msg.sender].hasRefunded = true;
        backers[msg.sender].contribution = 0;
        backers[msg.sender].tokens = 0;
        
        // Burn tokens
        _transfer(msg.sender, address(this), tokenAmount);
        
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(msg.sender, refundAmount);
    }
    
    function _canRefund() internal view returns (bool) {
        // Allow refund if funding failed or if a milestone was rejected
        if (!fundingSuccessful) return true;
        
        for (uint256 i = 0; i < currentMilestone; i++) {
            if (milestones[i].isRejected) return true;
        }
        
        return false;
    }
    
    // View functions
    function getMilestone(uint256 _milestoneId) external view returns (
        string memory description,
        uint256 amount,
        bool isSubmitted,
        bool isApproved,
        bool isRejected,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 submittedAt,
        uint256 votingDeadline
    ) {
        require(_milestoneId < milestoneCount, "Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        
        return (
            milestone.description,
            milestone.amount,
            milestone.isSubmitted,
            milestone.isApproved,
            milestone.isRejected,
            milestone.yesVotes,
            milestone.noVotes,
            milestone.submittedAt,
            milestone.votingDeadline
        );
    }
    
    function getBackerInfo(address _backer) external view returns (
        uint256 contribution,
        uint256 tokens,
        uint256 contributedAt,
        bool hasRefunded
    ) {
        Backer storage backer = backers[_backer];
        return (
            backer.contribution,
            backer.tokens,
            backer.contributedAt,
            backer.hasRefunded
        );
    }
    
    function getProjectInfo() external view returns (
        string memory title,
        string memory description,
        uint256 goal,
        uint256 raised,
        uint256 deadline,
        bool active,
        bool successful,
        bool completed,
        uint256 milestones,
        uint256 currentMilestoneIndex
    ) {
        return (
            projectTitle,
            projectDescription,
            fundingGoal,
            totalRaised,
            fundingDeadline,
            isActive,
            fundingSuccessful,
            projectCompleted,
            milestoneCount,
            currentMilestone
        );
    }
    
    function getBackerCount() external view returns (uint256) {
        return backerList.length;
    }
    
    function hasVoted(uint256 _milestoneId, address _voter) external view returns (bool) {
        return milestones[_milestoneId].hasVoted[_voter];
    }
    
    function getVoteChoice(uint256 _milestoneId, address _voter) external view returns (bool) {
        require(milestones[_milestoneId].hasVoted[_voter], "Has not voted");
        return milestones[_milestoneId].voteChoice[_voter];
    }
}