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
      <h1 className="text-4xl font-semibold text-green-900 mb-6 text-center md:text-left">
        Bine ai venit!
      </h1>

      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col md:flex-row items-center w-full max-w-6xl">
        
        <div className="md:w-1/2 flex flex-col justify-center p-6">
          <h2 className="text-2xl font-bold text-green-800 mb-6">Optimizează producția proprie!</h2>
          <ul className="space-y-4">
            {[
              "Tablou de bord pentru monitorizare, ingestie a datelor și alerte.",
              "Simulează potentialul unei instalații fotovoltaice.",
              "Îmbunătățește productivitatea, optimizează alocarea resurselor și menține un istoric complet al performanței sistemului.",
              "Alerte automate pentru probleme de performanță bazate pe praguri stabilite."
            ].map((text, index) => (
              <li key={index} className="flex items-start space-x-3">
                <CheckCircleIcon className="text-green-600 w-6 h-6 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:w-1/2 flex justify-center items-center p-6">
          <div className="w-full max-w-md overflow-hidden rounded-xl shadow-lg">
            <img
              src={images[currentIndex]}
              alt="Energie regenerabila"
              className="w-full h-[250px] object-cover transition-all duration-700 ease-in-out"
            />
          </div>
        </div>

      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-6xl">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-green-800 mb-4">Estimare producție fotovoltaică</h3>
          <p className="text-gray-700 mb-4">
            Simulează performanțele unei instalații fotovoltaice fără autentificare.
          </p>
          <a
            href="/estimate-pv"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Simulează acum
          </a>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-green-800 mb-4">Panou de control - Mod demonstrativ</h3>
          <p className="text-gray-700 mb-4">
            Explorează cum ar arăta performanțele unei instalații reale, cu date demo. Modifică valorile și vezi rezultatele în grafice!
          </p>
          <a
            href="/demo-dashboard"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Vezi demo
          </a>
        </div>      
      </div>          
    </div>
  );
};

export default HomePage;
