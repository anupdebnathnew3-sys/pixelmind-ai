import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Hash, Clock, AlignLeft, Type, Copy, Trash2 } from 'lucide-react';
import { countWords, countSentences, countParagraphs, getKeywordDensity } from '../../utils/cn';
import toast from 'react-hot-toast';

export const WordCounterPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = countWords(text);
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const readingTime = Math.ceil(words / 200);
    const keywordDensity = getKeywordDensity(text);
    return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime, keywordDensity };
  }, [text]);

  const sampleText = `Artificial intelligence is transforming the way we work and live. From automated workflows to creative assistance, AI tools are becoming essential for professionals across all industries. The rapid advancement in machine learning algorithms has enabled unprecedented capabilities, from natural language processing to computer vision.

Modern AI systems can analyze vast amounts of data, identify patterns, and generate insights that would take humans significantly longer to produce. This efficiency gain is driving adoption across sectors including healthcare, finance, education, and creative industries.

The future of AI looks even more promising, with developments in multimodal models, reasoning capabilities, and real-time adaptation. As these technologies mature, the opportunities for innovation and problem-solving will continue to expand.`;

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Word Counter</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time text analysis with keyword density</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard title="Words" value={stats.words.toLocaleString()} icon={<Hash size={18} />} color="#6366F1" />
          <StatCard title="Characters" value={stats.chars.toLocaleString()} icon={<Type size={18} />} color="#8B5CF6" />
          <StatCard title="Without Spaces" value={stats.charsNoSpaces.toLocaleString()} icon={<Type size={18} />} color="#F59E0B" />
          <StatCard title="Sentences" value={stats.sentences.toLocaleString()} icon={<AlignLeft size={18} />} color="#EF4444" />
          <StatCard title="Paragraphs" value={stats.paragraphs.toLocaleString()} icon={<AlignLeft size={18} />} color="#10B981" />
          <StatCard title="Read Time" value={`${stats.readingTime} min`} icon={<Clock size={18} />} color="#3B82F6" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Text Area */}
          <div className="lg:col-span-2">
            <Card padding="none">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#232650]">
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-[#6366F1]" />
                  <span className="font-semibold text-gray-900 dark:text-white">Text Input</span>
                  {text && <span className="text-xs text-[#6366F1] font-medium">{stats.words} words</span>}
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="ghost" onClick={() => { setText(sampleText); }}>Sample Text</Button>
                  <Button size="xs" variant="ghost" icon={<Copy size={12} />} onClick={() => { navigator.clipboard.writeText(text); toast.success('Copied!'); }}>Copy</Button>
                  <Button size="xs" variant="ghost" icon={<Trash2 size={12} />} onClick={() => setText('')} className="text-red-500 hover:bg-red-50">Clear</Button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start typing or paste your text here for real-time analysis..."
                  rows={20}
                  className="w-full bg-transparent text-gray-900 dark:text-gray-100 text-sm leading-relaxed resize-none focus:outline-none"
                />
              </div>
              <div className="px-4 py-2 border-t border-gray-100 dark:border-[#232650] bg-gray-50 dark:bg-gray-800/50 flex flex-wrap gap-4 text-xs text-gray-500">
                <span>{stats.words} words</span>
                <span>{stats.chars} characters</span>
                <span>{stats.sentences} sentences</span>
                <span>{stats.paragraphs} paragraphs</span>
                <span>~{stats.readingTime} min read</span>
              </div>
            </Card>
          </div>

          {/* Keyword Density */}
          <div className="space-y-4">
            <Card>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Keyword Density</h3>
              {Object.keys(stats.keywordDensity).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(stats.keywordDensity).slice(0, 15).map(([word, density]) => (
                    <div key={word}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">{word}</span>
                        <span className="text-[#6366F1] font-bold">{density}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-[#0d1030] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6366F1] rounded-full transition-all"
                          style={{ width: `${Math.min(100, density * 20)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Type text to see keyword density</p>
              )}
            </Card>

            <Card>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Writing Tips</h3>
              <div className="space-y-2">
                {[
                  { label: 'Word variety', value: stats.words > 10 ? 'Good' : 'Add more', color: stats.words > 10 ? 'text-green-500' : 'text-amber-500' },
                  { label: 'Avg sentence length', value: stats.sentences > 0 ? `${Math.round(stats.words / stats.sentences)} words` : 'N/A', color: 'text-blue-500' },
                  { label: 'Keyword density', value: Object.keys(stats.keywordDensity)[0] ? `"${Object.keys(stats.keywordDensity)[0]}" ${stats.keywordDensity[Object.keys(stats.keywordDensity)[0]]}%` : 'N/A', color: 'text-[#6366F1]' },
                ].map(tip => (
                  <div key={tip.label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{tip.label}</span>
                    <span className={`font-medium ${tip.color}`}>{tip.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
