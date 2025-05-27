// WordScramble.jsx
import React, { useState, useEffect } from 'react';

// Trie Node class
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

// Trie class for word lookup
class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  isPrefix(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return true;
  }

  isWord(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEndOfWord;
  }
}

// Utility function to shuffle a string
const shuffleString = (str) => {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

// Generate random letters from alphabet
const generateRandomLetters = (length = 8) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
};

const WordScramble = () => {
  const [letters, setLetters] = useState('');
  const [longestWords, setLongestWords] = useState([]);
  const [trie, setTrie] = useState(null);
  const [dictionary, setDictionary] = useState([]);
  const [guess, setGuess] = useState('');
  const [clueIndex, setClueIndex] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetch('/words_alpha.txt')
      .then(response => response.text())
      .then(text => {
        const words = text.split('\n').map(word => word.trim()).filter(word => word.length >= 2);
        const newTrie = new Trie();
        words.forEach(word => newTrie.insert(word));
        setTrie(newTrie);
        setDictionary(words);
      })
      .catch(error => {
        console.error('Gagal memuat kamus:', error);
      });
  }, []);

  const generateNewRound = () => {
    if (!dictionary.length || !trie) return;

    const randomLetters = generateRandomLetters(8);
    const shuffled = shuffleString(randomLetters);
    setLetters(shuffled);

    let maxLength = 0;
    const found = new Set();

    const dfs = (path, used) => {
      const word = path.join('');
      if (!trie.isPrefix(word)) return;
      if (trie.isWord(word)) {
        if (word.length > maxLength) {
          maxLength = word.length;
          found.clear();
          found.add(word);
        } else if (word.length === maxLength) {
          found.add(word);
        }
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
    setLongestWords(Array.from(found).sort());
    setGuess('');
    setClueIndex(0);
    setFeedback('');
  };

  const handleGuess = () => {
    const normalizedGuess = guess.toLowerCase();
    if (longestWords.includes(normalizedGuess)) {
      setFeedback('🎉 Correct!');
    } else {
      setFeedback('❌ Not quite. Try again!');
    }
  };

  const giveClue = () => {
    if (clueIndex < longestWords[0]?.length) {
      setClueIndex(clueIndex + 1);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Word Scramble Game</h1>
      <div className="text-lg mb-2">Scrambled Letters: <strong>{letters}</strong></div>
      <button onClick={generateNewRound} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Generate New Round
      </button>

      {longestWords.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-700">Hint: The longest word(s) has <strong>{longestWords[0].length} letter</strong></p>
          <p className="text-gray-700">Clue: <strong>{longestWords[0].slice(0, clueIndex).padEnd(longestWords[0].length, '_')}</strong></p>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Your guess..."
            className="border p-2 w-full my-2"
          />
          <div className="flex gap-2">
            <button onClick={handleGuess} className="bg-green-500 text-white px-4 py-2 rounded">Submit</button>
            <button onClick={giveClue} className="bg-yellow-500 text-white px-4 py-2 rounded">Get A Clue</button>
          </div>
          {feedback && <div className="mt-2 text-lg font-semibold">{feedback}</div>}
        </div>
      )}
    </div>
  );
};

export default WordScramble;
