import React, { useState } from 'react';

const AutoTitleDemo = () => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(null);

  const steps = [
    {
      id: 1,
      title: "Create New Chat",
      description: "Click 'New Chat' button to create a conversation without a title",
      action: () => setStep(2)
    },
    {
      id: 2,
      title: "Send First Message",
      description: "Type your first message and send it to the AI",
      action: () => setStep(3)
    },
    {
      id: 3,
      title: "AI Responds",
      description: "The AI provides a helpful response to your message",
      action: () => setStep(4)
    },
    {
      id: 4,
      title: "Title Generated Automatically",
      description: "The system automatically generates a meaningful title based on your conversation",
      action: () => {
        setTitle("Python Programming Basics");
        setStep(5);
      }
    },
    {
      id: 5,
      title: "Title Appears in UI",
      description: "The generated title appears in both the sidebar and header automatically",
      action: () => setStep(1)
    }
  ];

  const currentStep = steps.find(s => s.id === step);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#1a1b1f] rounded-lg border border-gray-800">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">
        Automatic Title Generation Demo
      </h2>
      
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex justify-between items-center">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s.id <= step ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {s.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  s.id < step ? 'bg-blue-600' : 'bg-gray-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Current Step */}
        <div className="bg-[#23242a] p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium text-gray-100 mb-2">
            Step {currentStep.id}: {currentStep.title}
          </h3>
          <p className="text-gray-400 mb-4">
            {currentStep.description}
          </p>
          
          {/* Demo UI */}
          <div className="space-y-4">
            {/* Sidebar Demo */}
            <div className="bg-[#1a1b1f] p-4 rounded border border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Sidebar</h4>
              <div className="flex items-center gap-3 p-2 bg-[#23242a] rounded">
                <div className="flex-1">
                  <h3 className={`font-medium truncate conversation-title ${title ? 'generated' : ''}`}>
                    {title ? (
                      title
                    ) : (
                      <span className="title-generating">Generating title...</span>
                    )}
                  </h3>
                </div>
              </div>
            </div>

            {/* Header Demo */}
            <div className="bg-[#1a1b1f] p-4 rounded border border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Header</h4>
              <div className="flex items-center gap-2">
                <h1 className={`text-lg font-semibold conversation-title ${title ? 'generated' : ''}`}>
                  {title ? (
                    title
                  ) : (
                    <span className="title-generating">Generating title...</span>
                  )}
                </h1>
              </div>
            </div>
          </div>

          <button
            onClick={currentStep.action}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {step === steps.length ? 'Restart Demo' : 'Next Step'}
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#23242a] p-4 rounded border border-gray-700">
            <h4 className="font-medium text-gray-100 mb-2">✨ Automatic</h4>
            <p className="text-sm text-gray-400">
              No user interaction required. Titles are generated automatically after the first AI response.
            </p>
          </div>
          <div className="bg-[#23242a] p-4 rounded border border-gray-700">
            <h4 className="font-medium text-gray-100 mb-2">🤖 AI-Powered</h4>
            <p className="text-sm text-gray-400">
              Uses OpenAI GPT to analyze conversation content and generate meaningful titles.
            </p>
          </div>
          <div className="bg-[#23242a] p-4 rounded border border-gray-700">
            <h4 className="font-medium text-gray-100 mb-2">⚡ Fast</h4>
            <p className="text-sm text-gray-400">
              Titles appear immediately after the first exchange (2 messages total).
            </p>
          </div>
          <div className="bg-[#23242a] p-4 rounded border border-gray-700">
            <h4 className="font-medium text-gray-100 mb-2">🎨 Beautiful</h4>
            <p className="text-sm text-gray-400">
              Smooth animations and visual feedback show the title generation process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoTitleDemo; 