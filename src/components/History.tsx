
import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: number;
  expression: string;
  result: string;
  timestamp: Date;
}

interface HistoryProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onBack: () => void;
}

const History: React.FC<HistoryProps> = ({
  history,
  onSelectItem,
  onClearHistory,
  onBack,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/30 animate-bounce-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h2 className="text-xl font-bold text-white">History</h2>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-2 bg-gradient-to-b from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* History List */}
      <div className="bg-white/30 backdrop-blur-sm rounded-2xl border border-white/40 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <div className="p-6 text-center text-white/60">
            No calculations yet
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="w-full text-left p-3 bg-white/20 hover:bg-white/30 rounded-xl border border-white/20 transition-all duration-150 hover:scale-[1.02] group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-white/80 text-sm font-medium">
                      {item.expression}
                    </div>
                    <div className="text-white text-lg font-semibold">
                      = {item.result}
                    </div>
                  </div>
                  <div className="text-white/60 text-xs ml-2">
                    {formatTime(item.timestamp)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center">
        <p className="text-white/60 text-xs">
          Saves up to 20 calculations • Tap any item to use result
        </p>
      </div>
    </div>
  );
};

export default History;
