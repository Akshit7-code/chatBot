import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send } from 'lucide-react';
// import SpeechRecognition from 'react-speech-recognition';
function App() {
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
  
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        if (finalTranscript) {
          setMsg(prev => prev + ' ' + finalTranscript); // Appends if you're speaking multiple times
        }
      };
  
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const sendMessage = async () => {
    if (!msg.trim()) return;

    const userMessage = { you: msg, bot: null };
    setChat(prev => [...prev, userMessage]);
    setMsg('');
    setLoading(true);

    try {
      const res = await axios.post('https://chatbot-backend-3-kqah.onrender.com/chat', {
        message: msg,
      });
      setChat(prev =>
        prev.map((c, i) =>
          i === prev.length - 1 ? { ...c, bot: res.data.response } : c
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setChat([]);
    setMsg('');
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo(0, chatContainerRef.current.scrollHeight);
    }
  }, [chat, loading]);

  return (
    <div className="app bg-gradient-to-br from-[#1e1e2f] to-[#0f0f1a] text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="chat-box w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-6 relative">
        
        {/* Header */}
        <div className="flex flex-wrap sm:flex-row justify-between items-center gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-400">💬 AI Chatbot</h1>
          <button
  onClick={resetChat}
  className="text-sm text-white border border-white/20 rounded-xl px-4 py-2 hover:bg-white/10 transition-all shadow-sm"
>
  🔄 Clear
</button>

        </div>
  
        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="chat-messages h-[60vh] sm:h-96 overflow-y-auto px-2 sm:px-4 py-2 rounded-xl scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent"
        >
          {chat.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="w-full max-w-xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-4 sm:p-8 animate-fade-in">
                <div className="mb-6">
                  <div className="mx-auto w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center bg-indigo-500 rounded-full shadow-md text-white text-xl sm:text-2xl">
                    🤖
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mt-4">Welcome! I'm your AI Assistant</h2>
                  <p className="text-gray-400 mt-2 text-sm">
                    Ask me anything! You can type or use voice input.
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left text-sm text-gray-300 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-400">💡</span>
                    <p>How to build a React app?</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-400">🧠</span>
                    <p>What is ChatGPT?</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-400">😂</span>
                    <p>Tell me a joke!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            chat.map((c, i) => (
              <div key={i} className="mb-6">
                <div className="text-right">
                  <p className="bg-indigo-600 text-white inline-block px-4 py-2 rounded-2xl mb-2 max-w-[90%] sm:max-w-[75%] break-words">
                    {c.you}
                  </p>
                </div>
                <div className="text-left">
                  {c.bot ? (
                    <p className="bg-gray-700 text-white inline-block px-4 py-2 rounded-2xl max-w-[90%] sm:max-w-[75%] break-words">
                      {c.bot}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic px-4 py-2 rounded-2xl inline-block bg-gray-800 animate-pulse">
                      Typing...
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
  
        {/* Input & Send */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full px-4 py-2 pr-12 rounded-xl bg-[#1e1e2f] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={toggleListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                isListening ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Send size={20} /> Send
          </button>
        </div>
      </div>
    </div>
  );
  
}

export default App;