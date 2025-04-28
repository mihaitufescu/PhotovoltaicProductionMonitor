import React, { useState, useEffect } from "react";
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const images = [
  "https://plus.unsplash.com/premium_photo-1679917152317-170f1613fbfe?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z3JlZW4lMjBlbmVyZ3l8ZW58MHx8MHx8fDA%3D",
  "https://plus.unsplash.com/premium_photo-1678743133487-d501f3b0696b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmVuZXdhYmxlJTIwZW5lcmd5fGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1515344905723-babc01aac23d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlbmV3YWJsZSUyMGVuZXJneXxlbnwwfHwwfHx8MA%3D%3D",
];

const HomePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 flex flex-col items-center min-h-[80vh]">
      {/* Title */}
      <h1 className="text-4xl font-semibold text-green-900 mb-6 text-center md:text-left">
        Welcome to Photovoltaic Monitor
      </h1>

      {/* White Card */}
      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col md:flex-row items-center w-full max-w-6xl">
        
        {/* Left side - Text */}
        <div className="md:w-1/2 flex flex-col justify-center p-6">
          <h2 className="text-2xl font-bold text-green-800 mb-6">Streamline Your Renewable Operations</h2>
          <ul className="space-y-4">
            {[
              "Comprehensive dashboard for real-time monitoring, smart data ingestion, and actionable insights.",
              "Track operational performance, streamline workflows, and make informed decisions based on historical and live data.",
              "Improve productivity, optimize resource allocation, and maintain a complete history of system performance.",
              "Automatic alerts for performance issues based on determined thresholds."
            ].map((text, index) => (
              <li key={index} className="flex items-start space-x-3">
                <CheckCircleIcon className="text-green-600 w-6 h-6 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side - Carousel */}
        <div className="md:w-1/2 flex justify-center items-center p-6">
          <div className="w-full max-w-md overflow-hidden rounded-xl shadow-lg">
            <img
              src={images[currentIndex]}
              alt="Renewable Energy"
              className="w-full h-[250px] object-cover transition-all duration-700 ease-in-out"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
