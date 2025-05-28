import React, { useState, useEffect } from 'react';
import { Trie } from './Trie';
import { shuffleString, generateRandomLetters } from './utils';
import '../styles/WordScramble.css';

const WordScramble = () => {
  const [letters, setLetters] = useState('');
  const [trie, setTrie] = useState(null);
  const [dictionary, setDictionary] = useState([]);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [validWords, setValidWords] = useState([]);
  const [guessedWords, setGuessedWords] = useState([]);
  const [hints, setHints] = useState({});
  // eslint-disable-next-line
  const [clueWord, setClueWord] = useState('');
  const [revealedClue, setRevealedClue] = useState('');

  useEffect(() => {
    fetch('/wordlist-20210729.txt')
      .then(response => response.text())
      .then(text => {
        const words = text
          .split('\n')
          .map(word => word.trim().replace(/^"|"$/g, ''))
          .filter(word => word.length >= 2);
        const newTrie = new Trie();
        words.forEach(word => newTrie.insert(word));
        setTrie(newTrie);
        setDictionary(words);

        // Auto-generate round on dictionary load
        generateNewRound(words, newTrie);
      })
      .catch(error => {
        console.error('Failed to load dictionary:', error);
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
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [guessedWords]);

  const generateNewRound = (dict = dictionary, tr = trie) => {
    if (!dict.length || !tr) return;

    let attempts = 0;
    let foundWords = [];

    while (attempts < 10) {
      const randomLetters = generateRandomLetters(8);
      const shuffled = shuffleString(randomLetters);

      const found = new Set();

      const dfs = (path, used) => {
        const word = path.join('');
        if (!tr.isPrefix(word)) return;
        if (tr.isWord(word) && word.length >= 4) {
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
      foundWords = Array.from(found).sort();

      if (foundWords.length > 0) {
        setLetters(shuffled);
        setValidWords(foundWords);
        setGuessedWords([]);
        setGuess('');
        setFeedback('');
        setClueWord('');
        setRevealedClue('');

        const hintObj = {};
        foundWords.forEach(word => {
          const len = word.length;
          hintObj[len] = (hintObj[len] || 0) + 1;
        });
        setHints(hintObj);
        break; // valid round found, keluar loop
      }
      attempts++;
    }

    if (foundWords.length === 0) {
      // fallback kalau gak ketemu kata sama sekali
      setLetters('________');
      setValidWords([]);
      setGuessedWords([]);
      setFeedback('No valid words found. Please try again.');
      setHints({});
      setClueWord('');
      setRevealedClue('');
    }
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

  const getAClue = () => {
    const remainingWords = validWords.filter(w => !guessedWords.includes(w));
    if (remainingWords.length === 0) {
      setFeedback('No more clues available!');
      return;
    }

    const randomClue = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    setClueWord(randomClue);
    setRevealedClue('');
    setFeedback('');

    let index = 0;
    const interval = setInterval(() => {
      setRevealedClue((prev) => {
        const next = prev + randomClue[index];
        index++;
        if (index >= randomClue.length) clearInterval(interval);
        return next;
      });
    }, 500); // Reveal one letter every 500ms
  };

  return (
    <div className="word-game-container">
      <div className="word-game-card">
        <h1 className="game-title">🧩 Word Scramble</h1>

        <div className="scrambled-display">
          <p>Scrambled Letters:</p>
          <p className="scrambled-letters">{letters || '________'}</p>
        </div>

        <button onClick={() => generateNewRound()} className="btn-generate">
          🔁 Generate New Round
        </button>

        {validWords.length > 0 && (
          <div className="game-input-section">
            <p className="hint-title">📌 Hints:</p>
            <ul className="hint-list">
              {Object.entries(hints)
                .sort((a, b) => a[0] - b[0])
                .map(([len, count]) => (
                  <li key={len}>
                    {len} letters: {count} word{count > 1 ? 's' : ''}
                  </li>
                ))}
            </ul>

            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
              placeholder="Type your guess..."
              className="guess-input"
              autoComplete="off"
            />
            <button onClick={handleGuess} className="btn-submit">
              ✅ Submit
            </button>

            <button onClick={getAClue} className="btn-clue">
              💡 Get a Clue
            </button>

            {feedback && <div className="feedback">{feedback}</div>}

            {revealedClue && (
              <div className="feedback">
                Clue: <span className="clue-word">{revealedClue}</span>
              </div>
            )}
          </div>
        )}

        {guessedWords.length > 0 && (
          <div className="guessed-section">
            <p className="guessed-title">✅ Your Found Words:</p>
            <ul className="guessed-list">
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