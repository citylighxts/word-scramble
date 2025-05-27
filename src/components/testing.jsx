// testing.jsx
import React, { useState, useEffect } from 'react';
import { Trie } from './Trie'; 
import { shuffleString, generateRandomLetters } from './utils'; // dari file utils.js

const WordScramble = () => {
  const [letters, setLetters] = useState('');
  // eslint-disable-next-line
  const [longestWords, setLongestWords] = useState([]);
  const [trie, setTrie] = useState(null);
  const [dictionary, setDictionary] = useState([]);
  const [guess, setGuess] = useState('');
  const [clueIndex, setClueIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [validWords, setValidWords] = useState([]);
  const [guessedWords, setGuessedWords] = useState([]);
  const [hints, setHints] = useState({});

  useEffect(() => {
    fetch('/wordlist-20210729.txt')
      .then(response => response.text())
      .then(text => {
        const words = text.split('\n').map(word => word.trim().replace(/^"|"$/g, '')).filter(word => word.length >= 2);
        const newTrie = new Trie();
        words.forEach(word => newTrie.insert(word));
        setTrie(newTrie);
        setDictionary(words);
      })
      .catch(error => {
        console.error('Gagal memuat kamus:', error);
      });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (guessedWords.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [guessedWords]);


  const generateNewRound = () => {
    if (!dictionary.length || !trie) return;

    const randomLetters = generateRandomLetters(8);
    const shuffled = shuffleString(randomLetters);
    setLetters(shuffled);

    const found = new Set();

    const dfs = (path, used) => {
      const word = path.join('');
      if (!trie.isPrefix(word)) return;
      if (trie.isWord(word) && word.length >= 4) {
        found.add(word);
      }
      for (let i = 0; i < shuffled.length; i++) {
        if (!used[i]) {
          used[i] = true;
          path.push(shuffled[i]);
          dfs(path, used);
          path.pop();
          used[i] = false;
        }
      }
    };

    dfs([], Array(shuffled.length).fill(false));
    const foundWords = Array.from(found).sort();
    setValidWords(foundWords);
    setGuessedWords([]);
    setGuess('');
    setFeedback('');

    // Hitung jumlah kata per panjang
    const hintObj = {};
    foundWords.forEach(word => {
      const len = word.length;
      hintObj[len] = (hintObj[len] || 0) + 1;
    });
    setHints(hintObj);
  };

  const handleGuess = () => {
    const normalizedGuess = guess.toLowerCase();
    if (validWords.includes(normalizedGuess) && !guessedWords.includes(normalizedGuess)) {
      setGuessedWords([...guessedWords, normalizedGuess]);
      setFeedback('🎉 Correct!');
    } else {
      setFeedback('❌ Not quite. Try again!');
    }
    setGuess('');
  };

  // eslint-disable-next-line
  const giveClue = () => {
    if (clueIndex < longestWords[0]?.length) {
      setClueIndex(clueIndex + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">🧩 Word Scramble</h1>

        <div className="text-center mb-4">
          <p className="text-gray-800">Scrambled Letters:</p>
          <p className="font-mono text-xl tracking-widest text-indigo-600">{letters || '________'}</p>
        </div>

        <button
          onClick={generateNewRound}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mb-4"
        >
          🔁 Generate New Round
        </button>

        {validWords.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold mb-1 text-sm">📌 Hints:</p>
            <ul className="text-sm text-gray-600 mb-3">
              {Object.entries(hints).sort((a, b) => a[0] - b[0]).map(([len, count]) => (
                <li key={len}>
                  {len} letters: {count} word{count > 1 ? 's' : ''}
                </li>
              ))}
            </ul>

            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGuess();
                }
              }}
              placeholder="Type your guess..."
              className="border w-full p-2 rounded mb-2"
            />
            <button
              onClick={handleGuess}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              ✅ Submit
            </button>
            {feedback && (
              <div className="mt-2 text-center font-semibold text-sm text-gray-800">{feedback}</div>
            )}
          </div>
        )}

        {guessedWords.length > 0 && (
          <div className="mt-4">
            <p className="font-medium mb-1">✅ Your Found Words:</p>
            <ul className="text-sm text-gray-700 list-disc list-inside">
              {guessedWords.map((word, index) => (
                <li key={index}>{word}</li>
              ))}
            </ul>

          </div>
        )}
      </div>
    </div>
  );

};

export default WordScramble;
