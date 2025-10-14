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
  <svg fill="#FFFFFF" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <title>OpenAI icon</title>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"></path>
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