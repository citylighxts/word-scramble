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

const WordScramble = () => {
  const [letters, setLetters] = useState('');
  const [longestWord, setLongestWord] = useState('');
  const [trie, setTrie] = useState(null);

  useEffect(() => {
    // Muat daftar kata dari words_alpha.txt
    fetch('/words_alpha.txt')
      .then(response => response.text())
      .then(text => {
        const words = text.split('\n').map(word => word.trim()).filter(word => word);
        const newTrie = new Trie();
        words.forEach(word => newTrie.insert(word));
        setTrie(newTrie);
      })
      .catch(error => {
        console.error('Gagal memuat kamus:', error);
      });
  }, []);

  const findLongestWord = () => {
    if (!trie) return;

    const used = Array(letters.length).fill(false);
    let maxWord = '';

    const dfs = (path) => {
      const word = path.join('');
      if (!trie.isPrefix(word)) return;
      if (trie.isWord(word) && word.length > maxWord.length) {
        maxWord = word;
      }
      for (let i = 0; i < letters.length; i++) {
        if (!used[i]) {
          used[i] = true;
          path.push(letters[i]);
          dfs(path);
          path.pop();
          used[i] = false;
        }
      }
    };

    dfs([]);
    setLongestWord(maxWord);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Word Scramble Solver</h1>
      <input
        type="text"
        value={letters}
        onChange={(e) => setLetters(e.target.value.toLowerCase())}
        placeholder="Enter scrambled letters (e.g., rates)"
        className="border p-2 w-full mb-4"
      />
      <button onClick={findLongestWord} className="bg-blue-500 text-white px-4 py-2 rounded">
        Find Longest Word
      </button>
      {longestWord && (
        <div className="mt-4 text-green-700 font-medium">
          Longest valid word: <strong>{longestWord}</strong>
        </div>
      )}
    </div>
  );
};

export default WordScramble;
