import React, { useState } from 'react';
import { Bot, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export const PublicInquiryChat: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! Welcome to Campus Aid Hub Help Desk. I'm your automated assistant. How can I guide you today?",
    },
  ]);
  const [input, setInput] = useState('');

  const QUICK_QUESTIONS = [
    'What are the scholarship requirements?',
    'When is the document verification deadline?',
    'How do I track my disbursement payment?',
    'How do I apply for QC Educational Grants?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');

    // Rule-based automated bot responses
    setTimeout(() => {
      let botResponse =
        "Thank you for your inquiry. For specific eligibility evaluations, please use our Eligibility Pre-Checker tool or book an appointment with our Financial Aid Officers.";
      const lower = query.toLowerCase();

      if (lower.includes('requirement') || lower.includes('scholarship')) {
        botResponse =
          "Main scholarship requirements: 1. Official Transcript / COR, 2. Minimum GPA of 3.0 (for Merit awards), 3. Income Affidavit, 4. Valid Government or Student ID.";
      } else if (lower.includes('deadline') || lower.includes('fafsa')) {
        botResponse =
          "The upcoming document verification deadline for Fiscal Year 2026 is August 20, 2026.";
      } else if (lower.includes('disbursement') || lower.includes('payment') || lower.includes('track')) {
        botResponse =
          "Disbursements are released electronically via GCash or Bank Transfer. You can check your payout status using the 'Check Status' tab on this portal!";
      } else if (lower.includes('grant') || lower.includes('subsidy')) {
        botResponse =
          "Quezon City Educational Grants provide tuition aid and living stipends for qualified enrolled college youth. Check our Discover Opportunities page!";
      }

      setMessages([...newMsgs, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  const handleEscalate = () => {
    toast.success('Your inquiry has been escalated to a Financial Aid Officer! Reference Ticket #TIC-9042 created.');
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Public AI Assistant Chatbot
          </CardTitle>
          <CardDescription>Instant answers for financial aid, deadlines, and document rules</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleEscalate} leftIcon={<MessageSquare className="h-4 w-4" />}>
          Escalate to Officer
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <div className="h-[280px] p-4 bg-slate-50 border border-slate-200 rounded-2xl overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl max-w-sm ${
                m.sender === 'user'
                  ? 'bg-primary text-white ml-auto font-medium shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-50 shadow-xs transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question about scholarships..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 h-10 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
          />
          <Button variant="primary" size="md" onClick={() => handleSend()} leftIcon={<Send className="h-4 w-4" />} className="font-bold">
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
