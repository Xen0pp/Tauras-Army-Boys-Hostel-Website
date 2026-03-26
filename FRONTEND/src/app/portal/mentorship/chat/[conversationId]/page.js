"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const POLL_INTERVAL = 4000; // 4 second polling

function useMessages(conversationId, token) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!token || !conversationId) return;
    try {
      const res = await axios.get(`/api/mentorship/messages?conversationId=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.results || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [token, conversationId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  return { messages, loading, refetch: fetchMessages };
}

export default function ChatPage({ params }) {
  const { conversationId } = params;
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState(null);
  const [convInfo, setConvInfo] = useState(null);
  const bottomRef = useRef(null);
  const textAreaRef = useRef(null);

  // Get the firebase auth token
  useEffect(() => {
    if (user) {
      user.getIdToken().then(setToken).catch(console.error);
    }
  }, [user]);

  // Fetch conversation info (names etc)
  useEffect(() => {
    if (!token || !conversationId) return;
    axios.get('/api/mentorship/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const conv = (res.data.results || []).find(c => c.id === conversationId);
      if (conv) setConvInfo(conv);
    }).catch(console.error);
  }, [token, conversationId]);

  const { messages, loading } = useMessages(conversationId, token);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending || !token) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      await axios.post('/api/mentorship/messages', {
        conversationId, text: content,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Send failed:', err);
      setText(content); // restore on failure
    } finally {
      setSending(false);
      textAreaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine the other person's name for the header
  const otherName = convInfo
    ? (user?.uid === convInfo.mentorUid ? convInfo.menteeName : convInfo.mentorName)
    : 'Conversation';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <Link href="/portal/mentorship/my-connections">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </Link>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300">
          {otherName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{otherName || 'Loading...'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mentorship chat</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Say hello! This is the start of your conversation.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = msg.senderUid === user?.uid;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-br-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-sm'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-gray-400 dark:text-gray-600' : 'text-gray-400'}`}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 flex-shrink-0">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            ref={textAreaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 resize-none px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm max-h-32 overflow-y-auto"
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex-shrink-0 p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
