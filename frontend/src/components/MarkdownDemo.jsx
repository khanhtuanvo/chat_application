import React, { useState } from 'react';
import Markdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { completePartialElements } from '../utils/markdownUtils';

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

const MarkdownDemo = () => {
  const [inputText, setInputText] = useState('');
  const [completedText, setCompletedText] = useState('');

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setCompletedText(completePartialElements(text));
  };

  const examples = [
    {
      name: "Unclosed Backtick",
      input: "Here is some `code",
      description: "Auto-closes single backticks for inline code"
    },
    {
      name: "Unclosed Bold",
      input: "This is **bold text",
      description: "Auto-closes asterisk-based bold formatting"
    },
    {
      name: "Unclosed Italic",
      input: "This is *italic text",
      description: "Auto-closes single asterisk for italic"
    },
    {
      name: "Unclosed Underscore",
      input: "This is __bold text",
      description: "Auto-closes underscore-based emphasis"
    },
    {
      name: "Mixed Elements",
      input: "Here is `code and **bold text",
      description: "Handles multiple unclosed elements"
    }
  ];

  const markdownComponents = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter 
          style={darkTheme} 
          language={match[1]} 
          PreTag="div" 
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#1a1b1f] rounded-lg border border-gray-800">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">
        Markdown Completion Demo
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Demo */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-100">Interactive Demo</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type partial markdown:
            </label>
            <textarea
              value={inputText}
              onChange={handleInputChange}
              placeholder="Try typing: Here is some `code"
              className="w-full h-32 px-3 py-2 bg-[#23242a] border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Completed markdown:
            </label>
            <div className="w-full h-32 px-3 py-2 bg-[#23242a] border border-gray-700 rounded-md text-gray-100 overflow-auto">
              <pre className="text-sm">{completedText}</pre>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rendered result:
            </label>
            <div className="w-full min-h-32 px-3 py-2 bg-[#23242a] border border-gray-700 rounded-md text-gray-100 overflow-auto">
              <Markdown components={markdownComponents}>
                {completedText}
              </Markdown>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-100">Examples</h3>
          
          <div className="space-y-3">
            {examples.map((example, index) => (
              <div key={index} className="bg-[#23242a] p-4 rounded border border-gray-700">
                <h4 className="font-medium text-gray-100 mb-1">{example.name}</h4>
                <p className="text-sm text-gray-400 mb-2">{example.description}</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Input:</span>
                    <div className="text-sm bg-[#1a1b1f] p-2 rounded border border-gray-600">
                      {example.input}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Completed:</span>
                    <div className="text-sm bg-[#1a1b1f] p-2 rounded border border-gray-600">
                      {completePartialElements(example.input)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setInputText(example.input)}
                  className="mt-2 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Try This Example
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 p-4 bg-[#23242a] rounded-md">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Features:</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Auto-closes unclosed backticks for inline code</li>
          <li>• Auto-closes unclosed asterisk-based formatting (*, **, ***)</li>
          <li>• Auto-closes unclosed underscore-based formatting (_, __, ___)</li>
          <li>• Handles mixed unclosed elements intelligently</li>
          <li>• Preserves already properly closed elements</li>
          <li>• Works seamlessly with streaming responses</li>
        </ul>
      </div>
    </div>
  );
};

export default MarkdownDemo; 