import React, { useState } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSupported, setShowSupported] = useState(false);
  const [result, setResult] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/hello');
      const data = await response.text();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult('Error fetching data');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white relative">
      {showSupported && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 relative">
            <button 
              onClick={() => setShowSupported(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Supported Links</h3>
            <div className="text-gray-600 space-y-2">
              <p>- Youtube</p>
              <p>- Youtube Music</p>
              <p>- Soundcloud</p>
              <p>- Spotify</p>
              <p>- Apple Music</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center w-[600px]">
        <span id="emoji" className="text-6xl">🌸</span>
        <h1 className="text-2xl font-semibold text-gray-800 mt-4">tanos's free media</h1>
        <p className="text-gray-600 mt-2 text-center">A quick yet ad-free media downloader</p>
        
        <textarea
          id="tracker-text"
          className="w-full mt-4 p-3 border rounded-lg shadow-sm text-gray-800 resize-none"
          rows="1"
          placeholder="Enter your link here..."
          value={result}
          onChange={(e) => setResult(e.target.value)}
        />
        <button 
          onClick={fetchData}
          id="fc" 
          className="mt-4 px-12 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 flex items-center text-lg w-full justify-center"
        >
          <span id="btn-text">Download</span>
          <svg 
            id="spinner" 
            className={`w-6 h-6 ml-3 ${isLoading ? '' : 'hidden'} animate-spin text-white`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        </button>

        <div className="mt-8 text-center">
          <button
            className="text-blue-500 hover:text-blue-700 underline text-sm"
            onClick={() => setShowSupported(!showSupported)}
          >
            What links are supported?
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;