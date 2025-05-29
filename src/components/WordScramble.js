
// src/components/WordScramble.js
import React, { useState, useEffect, useRef } from 'react';
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
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [hints, setHints] = useState({});
  const [revealedClue, setRevealedClue] = useState('');
  const [clueWordIndex, setClueWordIndex] = useState(0);
  const [clueWord, setClueWord] = useState('');
  const [clueMessage, setClueMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch('/words_alpha.txt')
      .then(response => response.text())
      .then(text => {
        const words = text.split('\n').map(w => w.trim()).filter(w => w.length >= 2);
        const newTrie = new Trie();
        words.forEach(word => newTrie.insert(word));
        setDictionary(words);
        setTrie(newTrie);
      });
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', e => {
      e.preventDefault();
      e.returnValue = '';
    });
  }, []);

  useEffect(() => {
    if (gameStarted && inputRef.current) inputRef.current.focus();
    const focusHandler = () => inputRef.current?.focus();
    window.addEventListener('click', focusHandler);
    return () => window.removeEventListener('click', focusHandler);
  }, [gameStarted]);

  const generateNewRound = () => {
    if (!dictionary.length || !trie) return;

    let foundWords = [];
    for (let attempts = 0; attempts < 10; attempts++) {
      const letters = shuffleString(generateRandomLetters(8));
      const found = new Set();

      const dfs = (path, used) => {
        const word = path.join('');
        if (!trie.isPrefix(word)) return;
        if (trie.isWord(word) && word.length >= 4) found.add(word);
        for (let i = 0; i < letters.length; i++) {
          if (!used[i]) {
            used[i] = true;
            path.push(letters[i]);
            dfs(path, used);
            path.pop();
            used[i] = false;
          }
        }
      };

      dfs([], Array(letters.length).fill(false));
      foundWords = Array.from(found).sort();

      if (foundWords.length > 0) {
        setLetters(letters);
        setValidWords(foundWords);
        setGuessedWords([]);
        setGuess('');
        setFeedback('');
        setClueWord('');
        setRevealedClue('');
        setClueMessage('');
        setClueWordIndex(0);
        setHasSubmittedOnce(false);
        const hints = {};
        foundWords.forEach(w => {
          const len = w.length;
          hints[len] = (hints[len] || 0) + 1;
        });
        setHints(hints);
        return;
      }
    }

    setLetters('________');
    setValidWords([]);
    setGuessedWords([]);
    setFeedback('No valid words found. Please try again.');
    setHints({});
    setClueWord('');
    setRevealedClue('');
    setClueMessage('');
  };

  const handleGuess = () => {
    if (!hasSubmittedOnce) setHasSubmittedOnce(true);

    if (guessedWords.length === validWords.length) {
      setFeedback('🎉 You’ve guessed all the words!');
      setGuess('');
      return;
    }

    const word = guess.toLowerCase();
    if (word.length < 4) {
      setFeedback('⚠️ Your word is too short!');
    } else if (validWords.includes(word)) {
      if (guessedWords.includes(word)) {
        setFeedback('⚠️ You’ve already guessed this word!');
      } else {
        const updatedGuessedWords = [...guessedWords, word]; 
        setGuessedWords(updatedGuessedWords);
        setFeedback('✅ Correct!');
        if (word === clueWord) {
          setRevealedClue(word);
          setClueWord('');
        }
        setClueMessage('');

        if (updatedGuessedWords.length === validWords.length) {
          setFeedback('🎉 You’ve guessed all the words!');
        }
      }
    } else {
      setFeedback('❌ Not quite. Try again!');
    }
    setGuess('');
  };

  const getAClue = () => {
  const remaining = validWords.filter(w => !guessedWords.includes(w));

  if (remaining.length === 0) {
    setRevealedClue('');
    setClueWord('');
    setClueMessage('There are no more clues available.');
    setFeedback('🎉 You’ve guessed all the words!');
    return;
  }

  if (remaining.length === 1 && clueWord === remaining[0]) {
    setClueMessage('There is no other clue.');
    return;
  }

  const nextIndex = clueWordIndex % remaining.length;
  const word = remaining[nextIndex];
  setClueWord(word);
  setRevealedClue(
    word.length <= 2 ? word : word[0] + '_'.repeat(word.length - 2) + word[word.length - 1]
  );
  setClueWordIndex(clueWordIndex + 1);
  setClueMessage('');
  setFeedback('');
};


  return (
    <div className="word-game-container">
      <div className="word-game-card">
        {!gameStarted ? (
          <>
            <h1 className="game-title">🎮 Welcome to Word Scramble!</h1>
            <button onClick={() => { setGameStarted(true); generateNewRound(); }} className="btn-start">▶️ Start</button>
          </>
        ) : (
          <>
            <h1 className="game-title">🧩 Word Scramble</h1>
            <div className="scrambled-display">
              <p>Scrambled Letters:</p>
              <div className="scrambled-letters">
                {letters.split('').map((char, i) => (
                  <button key={i} className="letter-box" onClick={() => setGuess(prev => prev + char)}>{char}</button>
                ))}
              </div>
            </div>
            <button onClick={generateNewRound} className="btn-generate">🔁 Generate New Round</button>
            <button onClick={getAClue} className="btn-clue">💡 {clueWordIndex > 0 ? 'Get Another Clue' : 'Get A Clue'}</button>

            {(revealedClue || clueMessage) && (
              <div className="clue-box">
                {revealedClue && (
                  <>
                    <div className="clue-label">Clue:</div>
                    <div className="scrambled-letters">
                      {revealedClue.split('').map((c, i) => <span key={i} className="letter-box">{c}</span>)}
                    </div>
                </>
            )}
                {clueMessage && <div className="feedback">{clueMessage}</div>}
              </div>
            )}

            {validWords.length > 0 && (
              <div className="game-input-section">
                <p className="hint-title">📌 Hints:</p>
                <ul className="hint-list">
                  {Object.entries(hints).sort((a, b) => a[0] - b[0]).map(([len, count]) => (
                    <li key={len}>{len} letters: {count} word{count > 1 ? 's' : ''}</li>
                  ))}
                </ul>

                <div className="guess-input-box" ref={inputRef} tabIndex={0} onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGuess();
                  else if (/^[a-zA-Z]$/.test(e.key)) setGuess(prev => prev + e.key.toLowerCase());
                  else if (e.key === 'Backspace') setGuess(prev => prev.slice(0, -1));
                }}>
                  <span className="guess-label">❓Your Guess:</span>
                  <div className="scrambled-letters">
                    {guess.split('').map((c, i) => <span key={i} className="letter-box">{c}</span>)}
                    <span className="blinking-cursor" />
                  </div>
                </div>

                <button onClick={handleGuess} className="btn-submit">✅ Submit</button>
                {feedback && <div className="feedback">{feedback}</div>}
              </div>
            )}

            {hasSubmittedOnce && (
              <div className="progress-tracker">
                {guessedWords.length} of {validWords.length} words found
              </div>
            )}

            {guessedWords.length > 0 && (
              <div className="guessed-section">
                <p className="guessed-title">📋 Your Found Words:</p>
                <ul className="guessed-list">{guessedWords.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WordScramble;
