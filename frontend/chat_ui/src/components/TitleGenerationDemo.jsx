import React, { useState } from 'react';
import { generateConversationTitle } from '../services/api';

const TitleGenerationDemo = () => {
  const [conversationId, setConversationId] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateTitle = async () => {
    if (!conversationId.trim()) {
      setError('Please enter a conversation ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const conversation = await generateConversationTitle(parseInt(conversationId));
      setGeneratedTitle(conversation.title);
    } catch {
      setError('Failed to generate title. Make sure the conversation exists and has messages.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-[#1a1b1f] rounded-lg border border-gray-800">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">
        Title Generation Demo
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Conversation ID
          </label>
          <input
            type="number"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            placeholder="Enter conversation ID"
            className="w-full px-3 py-2 bg-[#23242a] border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleGenerateTitle}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </div>
          ) : (
            'Generate Title'
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}

        {generatedTitle && (
          <div className="p-3 bg-green-900/20 border border-green-800 rounded-md">
            <p className="text-sm text-gray-300 mb-1">Generated Title:</p>
            <p className="text-green-400 font-medium">{generatedTitle}</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-[#23242a] rounded-md">
        <h3 className="text-sm font-medium text-gray-300 mb-2">How it works:</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Enter a conversation ID that has messages</li>
          <li>• The AI analyzes the conversation content</li>
          <li>• Generates a descriptive title (3-8 words)</li>
          <li>• Titles are professional and topic-focused</li>
        </ul>
      </div>
    </div>
  );
};

export default TitleGenerationDemo; 