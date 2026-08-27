import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Minimize2, RefreshCw, User as UserIcon } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language, toggleLanguage } = useLanguage();

  const TRANSLATIONS = {
    en: {
      welcome: 'Hello! I am your Campus Aid AI Assistant. How can I help you today with scholarships, bursaries, or educational grants?',
      sug1: 'How do I apply for STEM scholarships?',
      sug2: 'Check my application status',
      sug3: 'How to renew my scholarship?',
      sug4: 'What documents are needed for verification?',
      placeholder: 'Ask Aid Assistant...',
      botTitle: 'Campus Aid AI',
      online: 'Online Assistance',
    },
    tl: {
      welcome: 'Kumusta! Ako ang iyong Campus Aid AI Assistant. Paano ko kayo matutulungan ngayon tungkol sa mga scholarship, bursary, o educational grants?',
      sug1: 'Paano mag-apply para sa STEM scholarship?',
      sug2: 'Tingnan ang status ng aking aplikasyon',
      sug3: 'Paano mag-renew ng aking scholarship?',
      sug4: 'Anong mga dokumento ang kailangan sa verification?',
      placeholder: 'Magtanong sa Aid Assistant...',
      botTitle: 'Campus Aid AI',
      online: 'Kasalukuyang Online',
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'm-1',
          sender: 'assistant',
          text: TRANSLATIONS[language].welcome,
          timestamp: 'Just now',
          suggestions: [
            TRANSLATIONS[language].sug1,
            TRANSLATIONS[language].sug2,
            TRANSLATIONS[language].sug3,
            TRANSLATIONS[language].sug4,
          ],
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'm-1') {
      setMessages([
        {
          id: 'm-1',
          sender: 'assistant',
          text: TRANSLATIONS[language].welcome,
          timestamp: 'Just now',
          suggestions: [
            TRANSLATIONS[language].sug1,
            TRANSLATIONS[language].sug2,
            TRANSLATIONS[language].sug3,
            TRANSLATIONS[language].sug4,
          ],
        }
      ]);
    }
  }, [language]);

  const handleReset = () => {
    setMessages([
      {
        id: 'm-1',
        sender: 'assistant',
        text: TRANSLATIONS[language].welcome,
        timestamp: 'Just now',
        suggestions: [
          TRANSLATIONS[language].sug1,
          TRANSLATIONS[language].sug2,
          TRANSLATIONS[language].sug3,
          TRANSLATIONS[language].sug4,
        ],
      }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "I understand your query! For comprehensive guidance, please check our Scholarships page or consult your school aid coordinator.";
      const lower = text.toLowerCase();

      if (lower.includes('stem')) {
        botReply = language === 'en' 
          ? "For STEM Scholarships, you'll need a minimum GPA of 3.5, 2 letters of recommendation from science/math faculty, and to submit your research statement."
          : "Para sa STEM Scholarship, kailangan ng minimum GPA na 3.5, 2 recommendation letters mula sa science/math professors, at research statement.";
      } else if (lower.includes('status') || lower.includes('check')) {
        botReply = language === 'en'
          ? "You can view your real-time application timeline under the 'Applications' tab on your left navigation menu."
          : "Maaari mong makita ang real-time application status sa 'Applications' tab sa iyong navigation menu.";
      } else if (lower.includes('renew') || lower.includes('renewal')) {
        botReply = language === 'en'
          ? "You can perform one-click semestral renewal directly on the 'One-Click Renewal' page under your student tools."
          : "Maaari kang mag-renew bawat semestre sa pamamagitan ng 'One-Click Renewal' page.";
      } else if (lower.includes('document') || lower.includes('requirements')) {
        botReply = language === 'en'
          ? "Required documents include: Certificate of Indigency, Student ID, Enrollment Verification (COR), and your Transcript of Records."
          : "Kabilang sa mga kailangan: Certificate of Indigency, Student ID, Certificate of Registration (COR), at Transcript of Records.";
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/30"
          title="Open AI Aid Assistant"
        >
          <Bot className="h-7 w-7 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
          {/* Top Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-sm">{TRANSLATIONS[language].botTitle}</h3>
                <p className="text-[10px] text-blue-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" /> {TRANSLATIONS[language].online}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleLanguage}
                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-blue-500/30 text-blue-300 hover:bg-blue-500/50 hover:text-white transition-all cursor-pointer mr-1"
                title={language === 'en' ? 'Switch to Tagalog / Palitan sa Tagalog' : 'Switch to English / Palitan sa Ingles'}
              >
                {language === 'en' ? 'EN' : 'TL'}
              </button>
              <button
                onClick={handleReset}
                title={language === 'en' ? 'Reset Chat' : 'I-reset ang Chat'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 dark:bg-slate-950/60 scrollbar-thin text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2.5 max-w-[85%]',
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                <div
                  className={cn(
                    'h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0',
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-blue-400'
                  )}
                >
                  {msg.sender === 'user' ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div className="space-y-1.5">
                  <div
                    className={cn(
                      'p-3 rounded-2xl leading-relaxed shadow-xs',
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                    )}
                  >
                    <p>{msg.text}</p>
                  </div>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-medium rounded-full shadow-2xs transition-all hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={cn(
                      'text-[9px] text-slate-400 block px-1',
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    )}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-400 text-[11px]">
                <div className="h-7 w-7 rounded-lg bg-slate-900 text-blue-400 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 animate-bounce" />
                </div>
                <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse delay-100" />
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse delay-200" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={TRANSLATIONS[language].placeholder}
              className="flex-1 h-9 px-3 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-9 w-9 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 transition-all shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
