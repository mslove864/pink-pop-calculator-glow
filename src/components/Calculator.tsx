import React, { useState } from 'react';
import { Calculator as CalculatorIcon } from 'lucide-react';
import History from './History';

interface HistoryItem {
  id: number;
  expression: string;
  result: string;
  timestamp: Date;
}

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [showScientific, setShowScientific] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyId, setHistoryId] = useState(1);

  const addToHistory = (expression: string, result: string) => {
    const newHistoryItem: HistoryItem = {
      id: historyId,
      expression,
      result,
      timestamp: new Date()
    };
    
    setHistory(prev => {
      const updated = [newHistoryItem, ...prev];
      // Keep only the latest 20 items
      return updated.slice(0, 20);
    });
    
    setHistoryId(prev => prev + 1);
  };

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearLastDigit = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      // Add to history when calculation is performed
      if (nextOperation === '=') {
        const expression = `${currentValue} ${operation} ${inputValue}`;
        addToHistory(expression, String(newValue));
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const performScientificOperation = (scientificOp: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    switch (scientificOp) {
      case 'sin':
        result = Math.sin(inputValue * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(inputValue * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(inputValue * Math.PI / 180);
        break;
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
        break;
      case 'sqrt':
        result = Math.sqrt(inputValue);
        break;
      case 'square':
        result = inputValue * inputValue;
        break;
      case 'inverse':
        result = 1 / inputValue;
        break;
      default:
        return;
    }

    // Add scientific operations to history
    addToHistory(`${scientificOp}(${inputValue})`, String(result));

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '^':
        return Math.pow(firstValue, secondValue);
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleButtonPress = (callback: () => void) => {
    return () => {
      callback();
      setTimeout(() => {}, 150);
    };
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setDisplay(item.result);
    setShowHistory(false);
    setWaitingForOperand(true);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-300 via-rose-300 to-pink-400 flex items-center justify-center p-4">
        <div className="w-full max-w-lg mx-auto">
          <History 
            history={history}
            onSelectItem={selectHistoryItem}
            onClearHistory={clearHistory}
            onBack={() => setShowHistory(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-rose-300 to-pink-400 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-in-down">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CalculatorIcon className="w-8 h-8 text-white drop-shadow-lg" />
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Scientific Pink Calc</h1>
          </div>
          <p className="text-white/80 text-sm mb-4">Your dreamy scientific calculator ✨</p>
        </div>

        {/* Calculator */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/30 animate-bounce-in">
          {/* Display */}
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/40 animate-glow-pulse">
            <div className="text-right">
              <div className="text-4xl font-light text-white break-all min-h-[3rem] flex items-center justify-end">
                {display}
              </div>
            </div>
          </div>

          {/* Mode and History Controls */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={handleButtonPress(() => setShowScientific(!showScientific))}
              className="bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
            >
              {showScientific ? 'Hide Sci' : 'Show Sci'}
            </button>
            <button
              onClick={handleButtonPress(() => setShowHistory(true))}
              className="bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
            >
              History
            </button>
          </div>

          {/* Scientific Functions - Conditionally Rendered */}
          {showScientific && (
            <>
              {/* Scientific Functions Row */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <button
                  onClick={handleButtonPress(() => performScientificOperation('sin'))}
                  className="bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  sin
                </button>
                <button
                  onClick={handleButtonPress(() => performScientificOperation('cos'))}
                  className="bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  cos
                </button>
                <button
                  onClick={handleButtonPress(() => performScientificOperation('tan'))}
                  className="bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  tan
                </button>
                <button
                  onClick={handleButtonPress(() => performScientificOperation('log'))}
                  className="bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  log
                </button>
                <button
                  onClick={handleButtonPress(() => performScientificOperation('ln'))}
                  className="bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  ln
                </button>
              </div>

              {/* Second Scientific Functions Row */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <button
                  onClick={handleButtonPress(() => performScientificOperation('sqrt'))}
                  className="bg-gradient-to-b from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  √
                </button>
                <button
                  onClick={handleButtonPress(() => performScientificOperation('square'))}
                  className="bg-gradient-to-b from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  x²
                </button>
                <button
                  onClick={handleButtonPress(() => performOperation('^'))}
                  className="bg-gradient-to-b from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  x^y
                </button>
                <button
                  onClick={handleButtonPress(() => performScientificOperation('inverse'))}
                  className="bg-gradient-to-b from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  1/x
                </button>
                <button
                  onClick={handleButtonPress(() => inputNumber(Math.PI.toString()))}
                  className="bg-gradient-to-b from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-3 px-3 rounded-xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 text-sm"
                >
                  π
                </button>
              </div>
            </>
          )}

          {/* Main Calculator Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <button
              onClick={handleButtonPress(clearAll)}
              className="bg-gradient-to-b from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press"
            >
              C
            </button>
            <button
              onClick={handleButtonPress(clearLastDigit)}
              className="bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press"
            >
              Clear
            </button>
            <button
              onClick={handleButtonPress(() => performOperation('÷'))}
              className="bg-gradient-to-b from-magenta-400 to-magenta-500 hover:from-magenta-500 hover:to-magenta-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press"
            >
              ÷
            </button>
            <button
              onClick={handleButtonPress(() => performOperation('×'))}
              className="bg-gradient-to-b from-magenta-400 to-magenta-500 hover:from-magenta-500 hover:to-magenta-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press"
            >
              ×
            </button>

            {/* Row 2 */}
            <button
              onClick={handleButtonPress(() => inputNumber('7'))}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              7
            </button>
            <button
              onClick={handleButtonPress(() => inputNumber('8'))}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              8
            </button>
            <button
              onClick={handleButtonPress(() => inputNumber('9'))}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              9
            </button>
            <button
              onClick={handleButtonPress(() => performOperation('-'))}
              className="bg-gradient-to-b from-magenta-400 to-magenta-500 hover:from-magenta-500 hover:to-magenta-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press"
            >
              -
            </button>

            {/* Row 3 */}
            <button
              onClick={handleButtonPress(() => inputNumber('4'))}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              4
            </button>
            <button
              onClick={handleButtonPress(() => inputNumber('5'))}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              5
            </button>
            <button
              onClick={handleButtonPress(() => inputNumber('6'))}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              6
            </button>
            <button
              onClick={handleButtonPress(() => performOperation('+'))}
              className="bg-gradient-to-b from-magenta-400 to-magenta-500 hover:from-magenta-500 hover:to-magenta-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press"
            >
              +
            </button>

            {/* Row 4 */}
            <button
              onClick={handleButtonPress(() => inputNumber('1'))}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              1
            </button>
            <button
              onClick={handleButtonPress(() => inputNumber('2'))}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              2
            </button>
            <button
              onClick={handleButtonPress(() => inputNumber('3'))}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              3
            </button>
            <button
              onClick={handleButtonPress(() => performOperation('='))}
              className="row-span-2 bg-gradient-to-b from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press"
            >
              =
            </button>

            {/* Row 5 */}
            <button
              onClick={handleButtonPress(() => inputNumber('0'))}
              className="col-span-2 bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              0
            </button>
            <button
              onClick={handleButtonPress(inputDecimal)}
              className="bg-white/40 backdrop-blur-sm hover:bg-white/50 text-pink-800 font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 active:animate-button-press border border-white/30"
            >
              .
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-xs">Made with 💖 for pink lovers - Now with science! 🧪</p>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
