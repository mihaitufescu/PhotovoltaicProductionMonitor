import React, { useState, useEffect } from "react";
import axios from "axios";

const HelloPage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("/api/hello/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("Error fetching data from API", error);
        setMessage("Failed to fetch message.");
      });
  }, []);

  return (
    <div>
      <h1>API Response:</h1>
      <p>{message}</p>
    </div>
  );
};

export default HelloPage;
