// src/components/WordScramble.js
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
  const [revealedClue, setRevealedClue] = useState('');
  const [clueWordIndex, setClueWordIndex] = useState(0);
  const [clueWord, setClueWord] = useState('');
  const [gameStarted, setGameStarted] = useState(false);


  // Ambil kamus kata dan bangun Trie
  useEffect(() => {
    fetch('/words_alpha.txt')
      .then(response => response.text())
      .then(text => {
        const words = text
          .split('\n')
          .map(word => word.trim())
          .filter(word => word.length >= 2);
        const newTrie = new Trie();
        words.forEach(word => newTrie.insert(word));
        setTrie(newTrie);
        setDictionary(words);
      })
      .catch(error => {
        console.error('Failed to load dictionary:', error);
      });
  }, []);

  // Tambahkan warning sebelum halaman di-refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const generateNewRound = () => {
    if (!dictionary.length || !trie) return;

    let attempts = 0;
    let foundWords = [];

    while (attempts < 10) {
      const randomLetters = generateRandomLetters(8);
      const shuffled = shuffleString(randomLetters);
      const found = new Set();

      const dfs = (path, used) => {
        const word = path.join('');
        if (!trie.isPrefix(word)) return;
        if (trie.isWord(word) && word.length >= 4) found.add(word);
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
        setClueWordIndex(0);

        const hintObj = {};
        foundWords.forEach(word => {
          const len = word.length;
          hintObj[len] = (hintObj[len] || 0) + 1;
        });
        setHints(hintObj);
        break;
      }
      attempts++;
    }

    if (foundWords.length === 0) {
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
    const normalized = guess.toLowerCase();
    if (validWords.includes(normalized)) {
      if (guessedWords.includes(normalized)) {
        setFeedback('⚠️ You’ve already guessed this word!');
      } else {
        setGuessedWords([...guessedWords, normalized]);
        setFeedback('🎉 Correct!');
      }
    } else {
      setFeedback('❌ Not quite. Try again!');
    }
    setGuess('');
  };


  const getAClue = () => {
    const remaining = validWords.filter(w => !guessedWords.includes(w));
    if (remaining.length === 0) {
      setFeedback('🎉 You’ve guessed all the words!');
      setRevealedClue(''); 
      return;
    }

    if (remaining.length === 1 && clueWordIndex > 0) {
      setFeedback('There is no other clue.');
      return;
    }

    const idx = clueWordIndex % remaining.length;
    const word = remaining[idx];
    setClueWord(word);

    if (word.length <= 2) {
      setRevealedClue(word);
    } else {
      setRevealedClue(word[0] + '_'.repeat(word.length - 2) + word[word.length - 1]);
    }

    setClueWordIndex(prev => prev + 1);
    setFeedback('');
  };


  return (
    <div className="word-game-container">
      <div className="word-game-card">
        {!gameStarted ? (
          <>
            <h1 className="game-title">🎮 Welcome to Word Scramble!</h1>
            <button onClick={() => {
              setGameStarted(true);
              generateNewRound();
            }} className="btn-generate">
              ▶️ Start
            </button>
          </>
        ) : (
          <>
            <h1 className="game-title">🧩 Word Scramble</h1>

            <div className="scrambled-display">
              <p>Scrambled Letters:</p>
              <div className="scrambled-letters">
                {(letters || '________').split('').map((char, idx) => (
                  <button
                    key={idx}
                    className="letter-box"
                    onClick={() => setGuess(prev => prev + char)}
                    style={{ cursor: 'pointer' }}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generateNewRound} className="btn-generate">
              🔁 Generate New Round
            </button>

            {validWords.length > 0 && (
              <div className="game-input-section">
                <p className="hint-title">📌 Hints:</p>
                <ul className="hint-list">
                  {Object.entries(hints).sort((a, b) => a[0] - b[0]).map(([len, count]) => (
                    <li key={len}>{len} letters: {count} word{count > 1 ? 's' : ''}</li>
                  ))}
                </ul>

                <div
                  className="guess-input-box"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleGuess();
                    } else if (/^[a-zA-Z]$/.test(e.key)) {
                      setGuess(prev => prev + e.key.toLowerCase());
                    } else if (e.key === 'Backspace') {
                      setGuess(prev => prev.slice(0, -1));
                    }
                  }}
                >
                  <span className="guess-label">Your guess:</span>
                  <div className="scrambled-letters">
                    {guess.split('').map((char, idx) => (
                      <span key={idx} className="letter-box">{char}</span>
                    ))}
                    <span className="blinking-cursor" />
                  </div>
                </div>

                <button onClick={handleGuess} className="btn-submit">
                  ✅ Submit
                </button>

                <button onClick={getAClue} className="btn-clue">
                  💡 {clueWord ? 'Get Another Clue' : 'Get a Clue'}
                </button>

                {feedback && <div className="feedback">{feedback}</div>}
                {revealedClue && (
                  <div className="feedback">
                    <div className="clue-label">Clue:</div>
                    <div className="scrambled-letters">
                      {revealedClue.split('').map((char, idx) => (
                        <span key={idx} className="letter-box">{char}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {guessedWords.length > 0 && (
              <div className="guessed-section">
                <p className="guessed-title">✅ Your Found Words:</p>
                <ul className="guessed-list">
                  {guessedWords.map((word, index) => <li key={index}>{word}</li>)}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WordScramble;
