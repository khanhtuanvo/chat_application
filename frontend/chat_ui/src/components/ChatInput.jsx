import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const ChatInput = ({ onSend, disabled = false, placeholder = "Message..." }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        className={`chat-input flex-1 min-h-[40px] max-h-32 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Select a conversation to start chatting..." : placeholder}
        rows={1}
        disabled={disabled}
      />
      <button
        className={`send-button ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        aria-label="Send"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput; 