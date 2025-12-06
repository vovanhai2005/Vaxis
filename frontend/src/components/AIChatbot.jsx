import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Sparkles } from 'lucide-react';
import { useAIChatStore } from '../store/useAIChatStore';
import ReactMarkdown from 'react-markdown';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const { messages, isLoading, sendMessage, clearChat } = useAIChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestionQuestions = [
    "What vaccines do you offer?",
    "Tell me about COVID-19 vaccines",
    "What are common vaccine side effects?",
    "How do I book an appointment?",
    "What is the price of flu vaccine?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white p-4 rounded-full shadow-lg transition-all z-50 group"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs opacity-90">Ask our chatbot for help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                className="hover:bg-teal-800 p-1 rounded text-xs"
                title="Clear chat"
              >
                Clear
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-teal-800 p-1 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                <div className="bg-gradient-to-r from-teal-100 to-cyan-100 p-4 rounded-lg mb-4">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-teal-600" />
                  <p className="font-semibold text-gray-800 mb-2">Ask me for your health problem!</p>
                  <p className="text-xs text-gray-600">I can answer all the basic health information you need.</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Try these questions:</p>
                  {suggestionQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(question)}
                      className="block w-full text-left p-3 bg-white rounded-lg hover:bg-teal-50 hover:border-teal-300 text-sm border border-gray-200 transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, idx) => (
              <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-3 w-3 text-teal-600" />
                      <span className="text-xs font-semibold text-teal-600">AI Assistant</span>
                    </div>
                  )}
                  {message.role === 'assistant' ? (
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-strong:font-bold prose-ul:text-gray-800 prose-ol:text-gray-800">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-teal-100' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white p-3 rounded-lg disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
