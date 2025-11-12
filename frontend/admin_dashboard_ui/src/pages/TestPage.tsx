import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          ✅ Frontend Working!
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Tailwind CSS and React are properly configured!
        </p>
        
        <div className="space-y-4">
          <div className="text-center">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
              Test Admin Login
            </button>
          </div>
          
          <div className="text-center">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors duration-200">
              Test User Login
            </button>
          </div>
          
          <div>
            <label className="form-label">Test Input Field</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Type something here..."
            />
          </div>
          
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="text-sm">
              <strong>Success!</strong> If you can see this styled message, 
              Tailwind CSS is working correctly.
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Next: Try the <a href="/login" className="text-blue-600 hover:text-blue-500">Login Page</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 