import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { usePromptStore, buildContentPrompt } from '../../store/usePromptStore';
import { callAI } from '../../services/aiService';
import { FileText, Zap, Copy, Download, AlertCircle, X, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Inline Markdown Renderer ─────────────────────────────────────────────────

function parseInline(text: string): React.ReactNode {
  const tokens = text.split(/(\*\*[^*\n]*?\*\*|\*[^*\n]+?\*)/g);
  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith('**') && token.endsWith('**') && token.length > 4)
          return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{token.slice(2, -2)}</strong>;
        if (token.startsWith('*') && token.endsWith('*') && !token.startsWith('**') && token.length > 2)
          return <em key={i} className="italic">{token.slice(1, -1)}</em>;
        return <React.Fragment key={i}>{token}</React.Fragment>;
      })}
    </>
  );
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listOrdered = false;
  let k = 0;

  const flushList = () => {
    if (!listItems.length) return;
    const id = k++;
    result.push(listOrdered
      ? <ol key={id} className="list-decimal ml-6 space-y-1 mb-4 text-gray-700 dark:text-gray-300">{listItems.map((it, i) => <li key={i} className="leading-relaxed">{parseInline(it)}</li>)}</ol>
      : <ul key={id} className="list-disc ml-6 space-y-1 mb-4 text-gray-700 dark:text-gray-300">{listItems.map((it, i) => <li key={i} className="leading-relaxed">{parseInline(it)}</li>)}</ul>
    );
    listItems = [];
  };

  for (const line of lines) {
    const h1 = line.match(/^# (.+)/); const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/); const h4 = line.match(/^#### (.+)/);
    const uli = line.match(/^[*-] (.+)/); const oli = line.match(/^\d+\. (.+)/);

    if (h1) { flushList(); result.push(<h1 key={k++} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{parseInline(h1[1])}</h1>); }
    else if (h2) { flushList(); result.push(<h2 key={k++} className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">{parseInline(h2[1])}</h2>); }
    else if (h3) { flushList(); result.push(<h3 key={k++} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">{parseInline(h3[1])}</h3>); }
    else if (h4) { flushList(); result.push(<h4 key={k++} className="text-base font-semibold text-gray-800 dark:text-gray-300 mt-3 mb-1">{parseInline(h4[1])}</h4>); }
    else if (uli) { if (listItems.length > 0 && listOrdered) flushList(); listOrdered = false; listItems.push(uli[1]); }
    else if (oli) { if (listItems.length > 0 && !listOrdered) flushList(); listOrdered = true; listItems.push(oli[1]); }
    else if (line.trim() === '') { flushList(); }
    else { flushList(); result.push(<p key={k++} className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{parseInline(line)}</p>); }
  }
  flushList();
  return <div>{result}</div>;
};

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'youtube script', label: 'YouTube Script' },
  { value: 'story', label: 'Story' },
  { value: 'book chapter', label: 'Book Chapter' },
  { value: 'recipe', label: 'Recipe' },
  { value: 'podcast script', label: 'Podcast Script' },
  { value: 'professional email', label: 'Email' },
  { value: 'marketing copy', label: 'Marketing Copy' },
  { value: 'advertisement', label: 'Advertisement' },
];

const TONES = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Casual', label: 'Casual' },
  { value: 'Creative', label: 'Creative' },
  { value: 'Persuasive', label: 'Persuasive' },
  { value: 'Informative', label: 'Informative' },
  { value: 'Humorous', label: 'Humorous' },
  { value: 'Inspirational', label: 'Inspirational' },
  { value: 'Empathetic', label: 'Empathetic' },
];

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Chinese (Simplified)', label: 'Chinese' },
];

export const ContentWriterPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const { deductCredits } = useStore();
  const { getTemplate } = usePromptStore();

  const [form, setForm] = useState({
    category: 'blog',
    topic: '',
    charCount: 2000,
    tone: 'Professional',
    language: 'English',
  });
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');

  const handleClear = () => {
    setForm({ category: 'blog', topic: '', charCount: 2000, tone: 'Professional', language: 'English' });
    setContent('');
    setWordCount(0);
    setErrorMsg('');
    setViewMode('rendered');
    toast.success('Cleared!');
  };

  const handleGenerate = async () => {
    if (!form.topic.trim()) { toast.error('Please enter a topic'); return; }

    const template = getTemplate('content-writer');
    if (!template) { toast.error('Content writer template not found'); return; }

    setLoading(true);
    setErrorMsg('');
    setContent('');

    const contentTypeLabel = CONTENT_TYPES.find(c => c.value === form.category)?.label || form.category;

    const prompt = buildContentPrompt(template, {
      contentType: contentTypeLabel,
      topic: form.topic,
      tone: form.tone,
      language: form.language,
      charCount: form.charCount,
    });

    try {
      const response = await callAI({
        prompt,
        systemPrompt: template.systemPrompt,
        maxTokens: Math.min(4000, Math.ceil(form.charCount / 3)),
      });

      const generated = response.text;
      setContent(generated);
      setWordCount(generated.trim().split(/\s+/).length);
      setViewMode('rendered');
      deductCredits(1);
      toast.success('Content generated!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const downloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${form.topic.slice(0, 30).replace(/\s+/g, '-')}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const downloadDocx = () => {
    // Simple HTML-based download that opens as a document
    const html = `<html><body><pre style="font-family: Arial; font-size: 12pt; white-space: pre-wrap;">${content}</pre></body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${form.topic.slice(0, 30).replace(/\s+/g, '-')}.doc`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded as DOC!');
  };

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Content Writer</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Generate high-quality content for any purpose</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Content Settings</h3>
            <div className="space-y-4">
              <Select
                label="Content Type"
                options={CONTENT_TYPES}
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              />
              <Input
                label="Topic / Title"
                placeholder="e.g., Benefits of AI in Healthcare"
                value={form.topic}
                onChange={(e) => setForm(f => ({ ...f, topic: e.target.value }))}
              />
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Character Count</label>
                  <span className="text-xs font-bold text-[#6366F1]">{form.charCount.toLocaleString()}</span>
                </div>
                <input
                  type="range" min={200} max={10000} step={100}
                  value={form.charCount}
                  onChange={(e) => setForm(f => ({ ...f, charCount: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>200</span><span>10,000</span>
                </div>
              </div>
              <Select
                label="Tone"
                options={TONES}
                value={form.tone}
                onChange={(e) => setForm(f => ({ ...f, tone: e.target.value }))}
              />
              <Select
                label="Language"
                options={LANGUAGES}
                value={form.language}
                onChange={(e) => setForm(f => ({ ...f, language: e.target.value }))}
              />
              <Button fullWidth size="lg" loading={loading} onClick={handleGenerate} icon={<Zap size={18} />}>
                Generate Content
              </Button>
              <Button fullWidth variant="secondary" size="sm" icon={<X size={14} />} onClick={handleClear}>
                Clear All
              </Button>
              <p className="text-[10px] text-center text-gray-400">5 credits per generation</p>
            </div>
          </Card>

          {/* Output */}
          <div className="lg:col-span-2 space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Generation Failed</p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{errorMsg}</p>
                  <p className="text-xs text-red-500 mt-1">Please add an API key in <strong>AI Settings</strong> to use this tool.</p>
                </div>
              </div>
            )}

            {content ? (
              <Card padding="none">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#232650] flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-[#6366F1]" />
                    <span className="font-semibold text-gray-900 dark:text-white">Generated Content</span>
                    <span className="text-xs text-gray-400">{wordCount} words · {content.length} chars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode(v => v === 'rendered' ? 'raw' : 'rendered')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        viewMode === 'rendered'
                          ? 'bg-[#6366F1] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {viewMode === 'rendered' ? <><Eye size={12} className="mr-1" />Preview</> : <><Edit3 size={12} className="mr-1" />Edit</>}
                    </button>
                    <Button size="xs" variant="ghost" icon={<Copy size={12} />} onClick={copyContent}>Copy</Button>
                    <Button size="xs" variant="secondary" icon={<Download size={12} />} onClick={downloadTxt}>TXT</Button>
                    <Button size="xs" variant="secondary" icon={<Download size={12} />} onClick={downloadDocx}>DOC</Button>
                  </div>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  {viewMode === 'rendered' ? (
                    <MarkdownRenderer text={content} />
                  ) : (
                    <Textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        setWordCount(e.target.value.trim().split(/\s+/).length);
                      }}
                      rows={22}
                      className="font-mono text-sm leading-relaxed"
                    />
                  )}
                </div>
              </Card>
            ) : !errorMsg ? (
              <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-[#191c40] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <FileText size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Your content will appear here</p>
                <p className="text-sm text-gray-400 mt-1">Fill in the settings and click Generate</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
