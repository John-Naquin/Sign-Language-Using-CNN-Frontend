import React, { useState, useRef, useEffect } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [useLiveVideo, setUseLiveVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let intervalRef = useRef(null);
  let timeoutRef = useRef(null);

  useEffect(() => {
    const checkMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

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
      const res = await fetch("https://sign-language-using-cnn-backend.onrender.com/predict", {
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.setAttribute("muted", true);
      }
      intervalRef.current = setInterval(captureFrame, 500);

      timeoutRef.current = setTimeout(() => {
        stopVideo();
        setUseLiveVideo(false);
      }, 30000);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center p-6">
      <header className="w-full max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center">
          <div className="bg-indigo-600 p-3 rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold ml-3 text-gray-800">Sign Language Interpreter</h1>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => useLiveVideo && toggleVideoMode()}
                className={`px-6 py-2 text-sm font-medium rounded-l-lg ${!useLiveVideo ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Image Upload
                </span>
              </button>
              <button
                onClick={() => !useLiveVideo && toggleVideoMode()}
                className={`px-6 py-2 text-sm font-medium rounded-r-lg ${useLiveVideo ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Live Video
                </span>
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            {!useLiveVideo ? (
              <div className="w-full">
                <div className="mb-6 text-center">
                  <p className="text-gray-600 mb-4">Upload an image of a sign language gesture</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <label className="cursor-pointer w-full text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-500">
                            {selectedFile ? selectedFile.name : "Click to select an image or drag and drop"}
                          </p>
                        </div>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
                        loading || !selectedFile
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                      disabled={loading || !selectedFile}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Interpret Sign"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full max-w-md h-64 md:h-80 bg-black rounded-lg overflow-hidden shadow-lg mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs">
                    Camera turns off after 30 seconds
                  </div>
                </div>
                <canvas ref={canvasRef} width="50" height="50" hidden />
              </div>
            )}
            {prediction && (
              <div className="mt-8 w-full">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Interpretation Result</h3>
                  <div className="flex items-center justify-center h-20 bg-white rounded shadow-inner">
                    <p className="text-3xl font-bold text-indigo-600">{prediction}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <section className="w-full max-w-4xl mx-auto mt-12 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "John Naquin", role: "Coding, Researching, and Writing" },
              { name: "Andy Mattick", role: "Coding, Researching, and Writing" },
              { name: "Heather Anderson", role: "Coding, Researching, and Writing" }
            ].map((member, index) => (
              <div key={index} className="bg-indigo-50 rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:transform hover:scale-105">
                <div className="bg-indigo-600 h-8"></div>
                <div className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-indigo-600 mx-auto -mt-16 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-indigo-600">{member.name.charAt(0)}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-gray-800">{member.name}</h3>
                  <p className="text-gray-600 mt-1">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full max-w-4xl mx-auto mt-8 mb-12 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Project Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                title: "Project Model Code", 
                url: "https://colab.research.google.com/drive/17L05fD9TnHiXQEqRxX-_GVzSV7ckBAgy?usp=sharing",
                icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
              },
              { 
                title: "Frontend Code", 
                url: "https://github.com/John-Naquin/Sign-Language-Using-CNN-Frontend",
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              },
              { 
                title: "Backend Code", 
                url: "https://github.com/John-Naquin/Sign-Language-Using-CNN-Backend",
                icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" 
              },
              { 
                title: "Research Paper", 
                url: "https://drive.google.com/file/d/1Vx_iG7MVuC_gE0j8P55KEwjpL0WGbEqR/view?usp=sharing",
                icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
              }
            ].map((resource, index) => (
              <a 
                key={index} 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200 hover:bg-indigo-50 hover:border-indigo-200"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={resource.icon} />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-800">{resource.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">View Resource</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a 
              href="https://www.kaggle.com/code/sayakdasgupta/sign-language-classification-cnn-99-40-accuracy/notebook" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Dataset Used
            </a>
          </div>
        </div>
      </section>

      <footer className="w-full max-w-4xl mx-auto mt-auto pt-6 pb-4">
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Sign Language Interpreter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;