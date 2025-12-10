import React, { useState } from 'react';
import { Product, Transaction } from '../types';
import { geminiService } from '../services/geminiService';
import { Sparkles, RefreshCw, Loader2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiInsightsProps {
  products: Product[];
  transactions: Transaction[];
}

export const AiInsights: React.FC<AiInsightsProps> = ({ products, transactions }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const result = await geminiService.analyzeBusiness(products, transactions);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-start max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Sparkles className="text-purple-600" /> AI Business Manager
        </h2>
        <p className="text-slate-500 mt-2">
          Use Gemini AI to analyze your sales patterns, suggest stock reorders, and get business advice.
        </p>
      </div>

      {!analysis && !loading && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center max-w-lg">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Analyze?</h3>
          <p className="text-slate-500 mb-6">
            I will look at your current stock of {products.length} items and your {transactions.length} sales records to generate a custom report.
          </p>
          <button 
            onClick={runAnalysis}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
          >
            Generate Insights Report
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-700">Gemini is analyzing your data...</h3>
          <p className="text-sm text-slate-400">This usually takes a few seconds.</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Info size={18} className="text-blue-600" /> Analysis Report
            </h3>
            <button 
              onClick={runAnalysis} 
              className="text-xs flex items-center gap-1 text-slate-600 hover:text-blue-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="p-8 overflow-y-auto max-h-[60vh] prose prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600">
             <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};