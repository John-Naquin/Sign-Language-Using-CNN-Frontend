import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setPrediction('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setPrediction('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('https://sign-language-using-cnn-backend.onrender.com/predict', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setPrediction(data.prediction || data.error);
    } catch (error) {
      setPrediction('Error processing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center text-center p-6">
      <h1 className="text-2xl font-bold mb-4">Sign Language</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <input type="file" onChange={handleFileChange} className="border p-2"/>
        <button 
          type="submit" 
          className="bg-blue-500 text-white py-2 px-4 disabled:opacity-50" 
          disabled={loading}
        >
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      </form>
      {loading && <div className="mt-4 text-lg text-gray-500">Processing...</div>}
      {prediction && !loading && <div className="mt-4 text-xl">{prediction}</div>}

      <div className="mt-10 w-full bg-gray-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold">Created by:</h2>
        <div className="flex justify-center space-x-6 mt-2">
          <div className="p-2 bg-white shadow-md rounded-md w-40">
            <p className="font-bold">John Naquin</p>
            <p className="text-sm text-gray-600">Coding/Wirtting</p>
          </div>
          <div className="p-2 bg-white shadow-md rounded-md w-40">
            <p className="font-bold">Andy Mattick</p>
            <p className="text-sm text-gray-600">Coding/Wirtting</p>
          </div>
          <div className="p-2 bg-white shadow-md rounded-md w-40">
            <p className="font-bold">Heather Anderson</p>
            <p className="text-sm text-gray-600">Coding/Wirtting</p>
          </div>
        </div>
      </div>

      <div className="mt-6 w-full bg-gray-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold">Links</h2>
        <div className="flex flex-col items-center mt-2 space-y-2">
          <a 
            href="https://colab.research.google.com/drive/17L05fD9TnHiXQEqRxX-_GVzSV7ckBAgy?usp=sharing" 
            target="_blank" 
            className="text-blue-500 hover:underline"
          >
            📜 Project Model Code
          </a>
          <a 
            href="https://github.com/John-Naquin/Sign-Language-Using-CNN-Frontend"
            target="_blank" 
            className="text-blue-500 hover:underline"
          >
            📜 Project Code Frontend
          </a>
          <a 
            href="https://github.com/John-Naquin/Sign-Language-Using-CNN-Backend"
            target="_blank" 
            className="text-blue-500 hover:underline"
          >
            📜 Project Code Backend
          </a>
          <a 
            href="" 
            target="_blank" 
            className="text-blue-500 hover:underline"
          >
            📄 Research Paper
          </a>
          <a 
            href="https://www.kaggle.com/code/paultimothymooney/interpret-sign-language-with-deep-learning/notebook" 
            target="_blank" 
            className="text-blue-500 hover:underline"
          >
            📊 Dataset Used
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;