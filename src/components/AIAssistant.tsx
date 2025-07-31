import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Lightbulb, TrendingUp, Shield, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your EquityChain assistant. I can help you with investing, creating projects, understanding blockchain equity, and navigating the platform. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { icon: TrendingUp, text: "How to invest?", query: "How do I invest in a project on EquityChain?" },
    { icon: Lightbulb, text: "Create project", query: "How do I create a new project for funding?" },
    { icon: Shield, text: "Security info", query: "How secure are my investments on the blockchain?" },
    { icon: HelpCircle, text: "Equity tokens", query: "What are equity tokens and how do they work?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('invest') || message.includes('investment')) {
      return "To invest in a project:\n\n1. **Connect your wallet** using the 'Connect Wallet' button\n2. **Browse projects** on the home page or discover section\n3. **Click on a project** to view details\n4. **Enter investment amount** (must meet minimum requirement)\n5. **Confirm transaction** in your wallet\n\nYour equity tokens will be automatically distributed to your wallet upon successful investment. You can track all investments in your Portfolio dashboard.";
    }
    
    if (message.includes('create') || message.includes('project') || message.includes('funding')) {
      return "To create a project for funding:\n\n1. **Click 'Create Project'** in the header\n2. **Fill out project details** (title, description, category)\n3. **Set funding parameters** (goal, equity %, minimum investment)\n4. **Review and submit** for approval\n5. **Complete KYC verification** (required for creators)\n\nProjects undergo a 2-5 day review process before going live. You'll receive notifications about approval status and can track progress in your Creator Dashboard.";
    }
    
    if (message.includes('security') || message.includes('safe') || message.includes('blockchain')) {
      return "EquityChain uses multiple security layers:\n\n🔒 **Smart Contract Security**\n- Audited contracts with ReentrancyGuard\n- Multi-signature wallet protection\n- Immutable blockchain records\n\n🛡️ **Platform Security**\n- KYC verification for all users\n- Due diligence on all projects\n- Milestone-based fund release\n\n⚡ **Your Control**\n- Non-custodial wallet integration\n- Direct ownership of equity tokens\n- Transparent transaction history";
    }
    
    if (message.includes('equity') || message.includes('token') || message.includes('ownership')) {
      return "Equity tokens represent your ownership stake:\n\n📊 **What they are:**\n- ERC-20 tokens representing company shares\n- Proportional to your investment amount\n- Stored directly in your wallet\n\n💰 **Benefits:**\n- Voting rights on company decisions\n- Dividend distributions (if applicable)\n- Potential capital appreciation\n- Tradeable on secondary markets\n\n🔄 **How it works:**\n- Tokens minted automatically upon investment\n- Smart contract calculates exact equity percentage\n- Immediate ownership verification on blockchain";
    }
    
    if (message.includes('wallet') || message.includes('metamask') || message.includes('connect')) {
      return "Wallet connection guide:\n\n🦊 **MetaMask Setup:**\n1. Install MetaMask browser extension\n2. Create or import your wallet\n3. Add funds (ETH for Ethereum, MATIC for Polygon)\n4. Click 'Connect Wallet' on EquityChain\n\n🌐 **Supported Networks:**\n- Ethereum Mainnet\n- Polygon (lower fees)\n- Sepolia Testnet (for testing)\n\n💡 **Tips:**\n- Keep some ETH/MATIC for gas fees\n- Never share your private keys\n- Use hardware wallets for large amounts";
    }
    
    if (message.includes('fee') || message.includes('cost') || message.includes('gas')) {
      return "Platform fees and costs:\n\n💳 **Platform Fees:**\n- 2.5% fee on successful funding\n- No fees for failed campaigns\n- No monthly subscription costs\n\n⛽ **Blockchain Fees:**\n- Gas fees for transactions (varies by network)\n- Ethereum: $5-50 depending on congestion\n- Polygon: $0.01-1 (much cheaper alternative)\n\n💰 **Investment Minimums:**\n- Set by individual projects\n- Typically $1,000-$5,000\n- No maximum limits";
    }
    
    if (message.includes('dashboard') || message.includes('portfolio') || message.includes('track')) {
      return "Dashboard features:\n\n📈 **Investor Dashboard:**\n- Real-time portfolio valuation\n- Investment performance tracking\n- Transaction history\n- Dividend/return notifications\n\n🚀 **Creator Dashboard:**\n- Funding progress monitoring\n- Investor management\n- Milestone tracking\n- Fund withdrawal tools\n\n📊 **Key Metrics:**\n- ROI calculations\n- Equity percentages\n- Project valuations\n- Market performance";
    }
    
    if (message.includes('kyc') || message.includes('verification') || message.includes('legal')) {
      return "KYC and legal compliance:\n\n📋 **KYC Requirements:**\n- Government-issued ID verification\n- Address confirmation\n- Accredited investor status (for large amounts)\n- Anti-money laundering checks\n\n⚖️ **Legal Framework:**\n- SEC-compliant equity offerings\n- Smart contract legal templates\n- Investor protection measures\n- Regulatory compliance monitoring\n\n🔒 **Privacy:**\n- Encrypted data storage\n- GDPR compliance\n- Minimal data collection\n- User consent management";
    }
    
    // Default response for unmatched queries
    return "I'd be happy to help! I can assist with:\n\n• **Investment guidance** - How to invest and manage your portfolio\n• **Project creation** - Steps to launch your funding campaign\n• **Platform navigation** - Finding features and understanding the interface\n• **Blockchain basics** - Understanding equity tokens and smart contracts\n• **Security questions** - How we protect your investments\n• **Technical support** - Wallet connection and transaction issues\n\nWhat specific topic would you like to explore?";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(inputMessage),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (query: string) => {
    setInputMessage(query);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
        <div className="flex items-center">
          <Bot className="h-6 w-6 mr-2" />
          <div>
            <h3 className="font-semibold">EquityChain Assistant</h3>
            <p className="text-xs text-blue-100">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:text-blue-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <div className="flex items-start">
                {message.type === 'assistant' && (
                  <Bot className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.type === 'user' && (
                  <User className="h-4 w-4 ml-2 mt-0.5" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 p-3 rounded-lg rounded-bl-none max-w-[80%]">
              <div className="flex items-center">
                <Bot className="h-4 w-4 mr-2 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 mb-3">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.query)}
                className="flex items-center p-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <action.icon className="h-3 w-3 mr-2 text-blue-600" />
                {action.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about EquityChain..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};