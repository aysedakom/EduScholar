import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const SurveysPage: React.FC = () => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [surveyType, setSurveyType] = useState('Scholarship Portal Experience');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error('Please enter your feedback comments before submitting.');
      return;
    }
    setSubmitted(true);
    toast.success('Thank you for your feedback! Your survey response has been recorded.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">Student Feedback & Surveys</h1>
            <Badge variant="info">Continuous Improvement</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Help us improve the Quezon City Campus Aid Hub portal experience by leaving your thoughts and suggestions.
          </p>
        </div>
      </div>

      <Card className="bg-white border border-slate-200 shadow-soft max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">Annual Portal & Aid Experience Survey</CardTitle>
          <CardDescription>Your honest feedback guides future program enhancements and distribution speed</CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in duration-300">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Feedback Submitted Successfully!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you for taking the time to complete the survey. Your input has been logged.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="font-bold">
                Submit Another Response
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Survey Topic</label>
                <select
                  value={surveyType}
                  onChange={(e) => setSurveyType(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-medium"
                >
                  <option value="Scholarship Portal Experience">Scholarship Portal & Application Flow</option>
                  <option value="Disbursement Speed">Disbursement & Payout Efficiency</option>
                  <option value="Grants & Subsidies">Grants & Bursaries Selection</option>
                  <option value="Support & Chatbot Assistance">Support & AI Assistant Quality</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-2">Overall Satisfaction Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-all focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Comments & Suggestions</label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share your thoughts on what went well or what we can improve..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full font-bold" leftIcon={<Send className="h-4 w-4" />}>
                Submit Survey Response
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveysPage;
