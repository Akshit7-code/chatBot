// frontend/src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/history").then(res => setHistory(res.data));
  }, []);

  return (
    <div>
      <h2>Chat History</h2>
      {history.map((h, i) => (
        <div key={i}>
          <p>User: {h.user}</p>
          <p>Bot: {h.bot}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
