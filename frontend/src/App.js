// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// The backend URL. This is where our React app will send requests.
const SOCKET_SERVER_URL = 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [dbStatus, setDbStatus] = useState('Checking DB connection...');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);

  useEffect(() => {
    // --- API Test ---
    // Fetch data from the backend API to check the DB connection.
    fetch(`${SOCKET_SERVER_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        setDbStatus(`DB Connection Successful! Server time: ${data.time}`);
      })
      .catch(err => {
        setDbStatus('DB Connection FAILED. Is the backend running?');
        console.error(err);
      });

    // --- WebSocket Connection ---
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // Listen for 'connect' event
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server with ID:', newSocket.id);
    });

    // Listen for incoming messages
    newSocket.on('receive_message', (data) => {
      setChatLog(prevLog => [...prevLog, data]);
    });

    // Clean up the connection when the component unmounts
    return () => newSocket.close();
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (socket && message) {
      socket.emit('send_message', { message });
      setMessage('');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + Node.js + Sockets + Postgres</h1>
        <p><strong>Status:</strong> {dbStatus}</p>

        <div className="chat-box">
          <h2>Real-time Chat</h2>
          <div className="chat-log">
            {chatLog.map((entry, index) => (
              <p key={index}>
                <strong>{entry.senderId.substring(0, 5)}:</strong> {entry.message}
              </p>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;