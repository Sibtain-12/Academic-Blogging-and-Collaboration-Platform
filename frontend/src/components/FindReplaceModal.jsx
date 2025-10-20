import { useState, useEffect } from 'react';

export default function FindReplaceModal({ isOpen, onClose, quillRef }) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Only run if modal is open and quillRef is available
    if (!isOpen || !quillRef.current) {
      return;
    }

    // Verify editor is instantiated before proceeding
    try {
      const editor = quillRef.current; // Vanilla Quill instance
      if (!editor || typeof editor.getLength !== 'function') {
        return;
      }
    } catch (error) {
      // Editor not ready yet, silently return
      return;
    }

    if (findText) {
      findMatches();
    } else {
      clearHighlights();
      setMatches([]);
      setCurrentMatch(0);
      setTotalMatches(0);
    }
  }, [findText, caseSensitive, isOpen]);

  const findMatches = () => {
    if (!quillRef.current || !findText) return;

    const quill = quillRef.current; // Vanilla Quill instance
    const text = quill.getText();
    const searchText = caseSensitive ? findText : findText.toLowerCase();
    const compareText = caseSensitive ? text : text.toLowerCase();
    
    const foundMatches = [];
    let index = 0;

    while (index < compareText.length) {
      const foundIndex = compareText.indexOf(searchText, index);
      if (foundIndex === -1) break;
      
      foundMatches.push({
        index: foundIndex,
        length: findText.length
      });
      
      index = foundIndex + 1;
    }

    setMatches(foundMatches);
    setTotalMatches(foundMatches.length);
    
    if (foundMatches.length > 0) {
      setCurrentMatch(1);
      highlightMatches(foundMatches, 0);
    } else {
      setCurrentMatch(0);
      clearHighlights();
    }
  };

  const highlightMatches = (matchList, activeIndex) => {
    if (!quillRef.current) return;

    const quill = quillRef.current; // Vanilla Quill instance

    // Clear previous highlights
    clearHighlights();

    // Highlight all matches
    matchList.forEach((match, idx) => {
      const format = idx === activeIndex ? 'find-active' : 'find-match';
      quill.formatText(match.index, match.length, 'background', idx === activeIndex ? '#ff9632' : '#ffeb3b');
    });

    // Scroll to active match
    if (matchList[activeIndex]) {
      const bounds = quill.getBounds(matchList[activeIndex].index);
      const editorContainer = quill.root.parentElement;
      if (editorContainer) {
        editorContainer.scrollTop = bounds.top - 100;
      }
    }
  };

  const clearHighlights = () => {
    if (!quillRef.current) return;

    try {
      const quill = quillRef.current; // Vanilla Quill instance
      if (!quill || typeof quill.getLength !== 'function') return;

      const length = quill.getLength();
      // Only remove background color formatting, not all formatting
      // This prevents breaking tables and other structural elements
      quill.formatText(0, length, 'background', false);
    } catch (error) {
      // Silently handle if editor is not ready - no console output
      return;
    }
  };

  const handleFindNext = () => {
    if (matches.length === 0) return;

    const nextMatch = currentMatch >= totalMatches ? 1 : currentMatch + 1;
    setCurrentMatch(nextMatch);
    highlightMatches(matches, nextMatch - 1);
  };

  const handleFindPrevious = () => {
    if (matches.length === 0) return;

    const prevMatch = currentMatch <= 1 ? totalMatches : currentMatch - 1;
    setCurrentMatch(prevMatch);
    highlightMatches(matches, prevMatch - 1);
  };

  const handleReplace = () => {
    if (!quillRef.current || matches.length === 0 || currentMatch === 0) return;

    const quill = quillRef.current; // Vanilla Quill instance
    const match = matches[currentMatch - 1];

    // Remove highlight
    quill.removeFormat(match.index, match.length);

    // Replace text
    quill.deleteText(match.index, match.length);
    quill.insertText(match.index, replaceText);

    // Update matches after replacement
    setTimeout(() => {
      findMatches();
    }, 100);
  };

  const handleReplaceAll = () => {
    if (!quillRef.current || matches.length === 0) return;

    const quill = quillRef.current; // Vanilla Quill instance

    // Replace from end to start to maintain indices
    const sortedMatches = [...matches].reverse();

    sortedMatches.forEach(match => {
      quill.deleteText(match.index, match.length);
      quill.insertText(match.index, replaceText);
    });

    // Clear and update
    clearHighlights();
    setMatches([]);
    setCurrentMatch(0);
    setTotalMatches(0);
    setFindText('');
  };

  const handleClose = () => {
    clearHighlights();
    setFindText('');
    setReplaceText('');
    setMatches([]);
    setCurrentMatch(0);
    setTotalMatches(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Find and Replace</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Find Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Find
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter text to find..."
                autoFocus
              />
              <button
                onClick={handleFindPrevious}
                disabled={matches.length === 0}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                title="Previous"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleFindNext}
                disabled={matches.length === 0}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                title="Next"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            {findText && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {totalMatches > 0 ? `${currentMatch} of ${totalMatches} matches` : 'No matches found'}
              </p>
            )}
          </div>

          {/* Replace Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Replace with
            </label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter replacement text..."
            />
          </div>

          {/* Case Sensitive Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="caseSensitive"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="caseSensitive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Case sensitive
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleReplace}
              disabled={matches.length === 0 || currentMatch === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={matches.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Replace All
            </button>
          </div>

          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

