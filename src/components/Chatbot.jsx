import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2, Bot, User } from 'lucide-react';
import { getChatCompletion } from '../services/aiService';

export function Chatbot({ contextData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    } else {
      setMessages([{ role: 'assistant', text: "Hello! I can answer questions about the ISS and current news. What would you like to know?" }]);
    }
  }, []);

  // Save to local storage (max 30)
  useEffect(() => {
    if (messages.length > 0) {
      const recent = messages.slice(-30);
      localStorage.setItem('chat_messages', JSON.stringify(recent));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    const reply = await getChatCompletion(userText, contextData);
    
    setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', text: "Chat history cleared. How can I help you?" }]);
    localStorage.removeItem('chat_messages');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-background border rounded-xl shadow-2xl w-80 sm:w-96 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold text-sm">Dashboard Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} className="p-1 hover:bg-primary-foreground/20 rounded transition-colors" title="Clear Chat">
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-foreground/20 rounded transition-colors" title="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 min-h-[300px] space-y-4 custom-scrollbar bg-muted/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                  {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border text-card-foreground'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-muted-foreground/20 text-muted-foreground flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="px-3 py-2 rounded-lg bg-card border flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-background flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about ISS or News..."
              className="flex-1 bg-muted px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isTyping}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="p-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center animate-bounce"
          title="Open Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
