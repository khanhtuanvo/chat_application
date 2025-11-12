import React, { useMemo, useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { getSafePartialContent } from '../utils/markdownUtils';

// Simple dark theme for syntax highlighting
const darkTheme = {
  hljs: {
    display: 'block',
    overflowX: 'auto',
    padding: '0.5em',
    background: '#1e1e1e',
    color: '#d4d4d4'
  },
  'hljs-keyword': { color: '#569cd6' },
  'hljs-string': { color: '#ce9178' },
  'hljs-comment': { color: '#6a9955' },
  'hljs-number': { color: '#b5cea8' },
  'hljs-function': { color: '#dcdcaa' },
  'hljs-variable': { color: '#9cdcfe' },
  'hljs-title': { color: '#dcdcaa' },
  'hljs-params': { color: '#9cdcfe' },
  'hljs-built_in': { color: '#4ec9b0' },
  'hljs-literal': { color: '#569cd6' },
  'hljs-type': { color: '#4ec9b0' },
  'hljs-attribute': { color: '#9cdcfe' },
  'hljs-meta': { color: '#6a9955' },
  'hljs-tag': { color: '#569cd6' },
  'hljs-name': { color: '#569cd6' },
  'hljs-property': { color: '#9cdcfe' }
};

// OpenAI logo SVG as a React component (white fill)
const OpenAILogo = () => (
  <svg
    fill="#FFFFFF"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(0, 5)">
      <path
        d="M12 3c-.55 0-1 .45-1 1v2H8C5.24 6 3 8.24 3 11v4c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5v-4c0-2.76-2.24-5-5-5h-3V4c0-.55-.45-1-1-1z"
      />
      <circle cx="9.5" cy="12" r="1.25" fill="black"/>
      <circle cx="14.5" cy="12" r="1.25" fill="black"/>
    </g>
  </svg>



);



const Message = ({ role, content, timestamp, messageId, isStreaming }) => {
  const isUser = role === 'user';
  const [partialContent, setPartialContent] = useState('');
  const [isPartialRendering, setIsPartialRendering] = useState(false);
  
  const timeString = useMemo(() => {
    return timestamp
      ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [timestamp]);

  // Simple content handling for smooth streaming
  useEffect(() => {
    setPartialContent(content);
    setIsPartialRendering(isStreaming);
  }, [content, isStreaming]);

  const markdownComponents = useMemo(() => ({
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter 
          style={darkTheme} 
          language={match[1]} 
          PreTag="div" 
          {...props}
          // Add streaming-specific styling
          className={`${isStreaming || isPartialRendering ? 'streaming-code-block' : ''}`}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code 
          className={`${className || ''} ${isStreaming || isPartialRendering ? 'streaming-inline-code' : ''}`} 
          {...props}
        >
          {children}
        </code>
      );
    },
    // Add streaming indicator for headers
    h1: ({ children, ...props }) => (
      <h1 className={`text-xl font-bold mb-2 ${isStreaming || isPartialRendering ? 'streaming-header' : ''}`} {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className={`text-lg font-bold mb-2 ${isStreaming || isPartialRendering ? 'streaming-header' : ''}`} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className={`text-md font-bold mb-1 ${isStreaming || isPartialRendering ? 'streaming-header' : ''}`} {...props}>
        {children}
      </h3>
    ),
    // Add streaming indicator for lists
    ul: ({ children, ...props }) => (
      <ul className={`list-disc list-inside mb-2 ${isStreaming || isPartialRendering ? 'streaming-list' : ''}`} {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className={`list-decimal list-inside mb-2 ${isStreaming || isPartialRendering ? 'streaming-list' : ''}`} {...props}>
        {children}
      </ol>
    ),
    // Add streaming indicator for paragraphs
    p: ({ children, ...props }) => (
      <p className={`mb-2 ${isStreaming || isPartialRendering ? 'streaming-paragraph' : ''}`} {...props}>
        {children}
      </p>
    ),
    // Add streaming indicator for blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote className={`border-l-4 border-gray-600 pl-4 italic ${isStreaming || isPartialRendering ? 'streaming-blockquote' : ''}`} {...props}>
        {children}
      </blockquote>
    ),
  }), [isStreaming, isPartialRendering]);

  if (isUser) {
    return (
      <div className="flex justify-end w-full" data-message-id={messageId}>
        <div className="chat-message user bg-transparent border-0 text-left px-4 py-2" style={{ display: 'inline-block', maxWidth: '80%' }}>
          <div className="text-sm text-white leading-relaxed">{content}</div>
          <div className="text-xs mt-2 text-blue-100">{timeString}</div>
        </div>
      </div>
    );
  }
  
  // Assistant message
  return (
    <div className="chat-message assistant mr-auto bg-transparent max-w-[75%] border-0" data-message-id={messageId}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-transparent">
          <OpenAILogo />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-100 leading-relaxed">
            {partialContent ? (
              <Markdown components={markdownComponents}>
                {getSafePartialContent(partialContent, isStreaming)}
              </Markdown>
            ) : isStreaming ? (
              <span className="animate-pulse">▍</span>
            ) : null}
          </div>
          <div className="text-xs mt-2 text-gray-400">{timeString}</div>
        </div>
      </div>
    </div>
  );
};

export default Message; 