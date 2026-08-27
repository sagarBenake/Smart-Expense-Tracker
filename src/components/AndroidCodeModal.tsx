import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Folder, Terminal, BookOpen, Layers } from 'lucide-react';
import { getAndroidProjectFiles, downloadAndroidProjectZip, ProjectFile } from '../services/androidProjectGenerator';

interface AndroidCodeModalProps {
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ onClose }) => {
  const files = getAndroidProjectFiles();
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const fileList = files || [];
  const selectedFile = fileList[selectedFileIndex] || fileList[0] || { path: '', name: '', language: 'kotlin', category: 'app', content: '' };

  const handleCopy = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredFiles = activeCategoryFilter === 'all'
    ? fileList
    : fileList.filter(f => f && f.category === activeCategoryFilter);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Android Studio Project Explorer
              </h3>
              <p className="text-[11px] text-slate-400">
                Production Kotlin • Jetpack Compose • Room SQLite • WorkManager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadAndroidProjectZip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-sm shadow-purple-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ZIP</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar flex-shrink-0">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'docs', label: 'Docs & Setup' },
            { id: 'sms', label: 'SMS Engine' },
            { id: 'room', label: 'Room Database' },
            { id: 'compose', label: 'Jetpack Compose' },
            { id: 'sync', label: 'Sheets Sync' },
            { id: 'tests', label: 'Unit Tests' },
            { id: 'gradle', label: 'Gradle Config' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategoryFilter === cat.id
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Body: File Tree (Left) + Code Viewer (Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/90 border-r border-slate-800 overflow-y-auto p-2 space-y-1 flex-shrink-0 max-h-40 md:max-h-none">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 block">
              Project Structure ({filteredFiles.length})
            </span>
            {filteredFiles.map(file => {
              const originalIndex = files.findIndex(f => f.path === file.path);
              const isSelected = originalIndex === selectedFileIndex;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(originalIndex)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                    isSelected
                      ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                  <div className="truncate">
                    <span className="block truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {file.path}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* File Path Header & Copy Button */}
            <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs flex-shrink-0">
              <span className="font-mono text-slate-300 truncate">
                {selectedFile.path}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Text Area */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed">
              <pre className="select-text whitespace-pre-wrap">{selectedFile.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
