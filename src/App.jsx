import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setPrediction('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    const res = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setPrediction(data.prediction || data.error);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center text-center p-6">
      <h1 className="text-2xl font-bold mb-4">Sign Language</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <input type="file" onChange={handleFileChange} className="border p-2"/>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4">Predict</button>
      </form>
      {prediction && <div className="mt-4 text-xl">{prediction}</div>}
    </div>
  );
}

export default App;
