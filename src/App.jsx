import React, { useState, useRef, useEffect } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [useLiveVideo, setUseLiveVideo] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let intervalRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setPrediction("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setPrediction("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch('https://sign-language-using-cnn-backend.onrender.com/predict', {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setPrediction(data.prediction || data.error);
    } catch (error) {
      setPrediction("Error processing request");
    } finally {
      setLoading(false);
    }
  };

  const toggleVideoMode = () => {
    setUseLiveVideo((prev) => !prev);
    if (!useLiveVideo) {
      startVideo();
    } else {
      stopVideo();
    }
  };

  const startVideo = async () => {
    setPrediction("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      intervalRef.current = setInterval(captureFrame, 500);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    clearInterval(intervalRef.current);
    setPrediction("");
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    const base64Data = imageData.split(",")[1];

    try {
      const res = await fetch("https://sign-language-using-cnn-backend.onrender.com/predict_frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data }),
      });

      const data = await res.json();
      setPrediction(data.prediction || "");
    } catch (error) {
      console.error("Error sending frame:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center text-center p-6">
      <h1 className="text-2xl font-bold mb-4">Sign Language</h1>

      <button 
        onClick={toggleVideoMode} 
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        {useLiveVideo ? "Switch to Image Upload" : "Switch to Live Video"}
      </button>

      {!useLiveVideo ? (
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
          <input type="file" onChange={handleFileChange} className="border p-2" />
          <button 
            type="submit" 
            className="bg-blue-500 text-white py-2 px-4 disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? "Predicting..." : "Predict"}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center">
          <video ref={videoRef} autoPlay className="w-80 h-60 border" />
          <canvas ref={canvasRef} width="50" height="50" hidden />
        </div>
      )}

      {loading && <div className="mt-4 text-lg text-gray-500">Processing...</div>}
      {!loading && prediction && <div className="mt-4 text-xl">{prediction}</div>}

      <div className="mt-10 w-full bg-gray-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold">Created by:</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-2">
          <div className="p-2 bg-white shadow-md rounded-md w-40">
            <p className="font-bold">John Naquin</p>
            <p className="text-sm text-gray-600">Coding, Researching, and Writing</p>
          </div>
          <div className="p-2 bg-white shadow-md rounded-md w-40">
            <p className="font-bold">Andy Mattick</p>
            <p className="text-sm text-gray-600">Coding, Researching, and Writing</p>
          </div>
          <div className="p-2 bg-white shadow-md rounded-md w-40">
            <p className="font-bold">Heather Anderson</p>
            <p className="text-sm text-gray-600">Coding, Researching, and Writing</p>
          </div>
        </div>
      </div>

      <div className="mt-6 w-full bg-gray-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold">Links</h2>
        <div className="flex flex-col items-center mt-2 space-y-2">
          <a href="https://colab.research.google.com/drive/17L05fD9TnHiXQEqRxX-_GVzSV7ckBAgy?usp=sharing" 
             target="_blank" className="text-blue-500 hover:underline">
            📜 Project Model Code
          </a>
          <a href="https://github.com/John-Naquin/Sign-Language-Using-CNN-Frontend"
             target="_blank" className="text-blue-500 hover:underline">
            📜 Project Frontend Code
          </a>
          <a href="https://github.com/John-Naquin/Sign-Language-Using-CNN-Backend"
             target="_blank" className="text-blue-500 hover:underline">
            📜 Project Backend Code
          </a>
          <a href="https://drive.google.com/file/d/1Vx_iG7MVuC_gE0j8P55KEwjpL0WGbEqR/view?usp=sharing" 
             target="_blank" className="text-blue-500 hover:underline">
            📄 Research Paper
          </a>
          <a href="https://www.kaggle.com/code/sayakdasgupta/sign-language-classification-cnn-99-40-accuracy/notebook" 
             target="_blank" className="text-blue-500 hover:underline">
            📊 Dataset Used
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
