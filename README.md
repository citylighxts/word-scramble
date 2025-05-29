# Word Scramble Game

Word Scramble is a vocabulary-based game where players have to find a set of words in a scrambled set of letters.  This game uses mainly Trie data structure and DFS algorithm to find the right path throughout the letters to make a valid word. This game can be played online with one player in multiple various mobile devices (phone, tab, and laptop).

### Project Description

Word Scramble is a single-player vocabulary-based game in which the player is presented with a randomised set of letters. Using those presented letters, the player attempts to form various valid English words with a set of clues provided to help them work through the game stages. Our gameplay includes randomly generated letters, real-time word guessing and validation, clue system to help the player discover hidden words, and feedback for correct, incorrect, and repeated guesses.

Our game uses Trie, a tree-based data structure where each node represents a single letter and paths from the root to certain nodes form valid words. This structure allows the game to efficiently check whether a partial word could eventually form a valid dictionary word. Unlike Binary Search Tree (BST) structure that stores full words (or keys) in nodes where left children are alphabetically smaller and right children are larger, Trie is more efficient for prefix-heavy tasks like our Word Scramble game, where performance and efficient pruning of invalid paths are key.

We use the Depth-First Search (DFS) algorithm to systematically explore every possible sequence of letters that could be assembled from the scrambled set of letters. This includes shorter words as well as longer ones (four-letter and more words). The algorithm checks whether the current sequence of letters is a valid prefix of any word in the word list using a Trie data structure. If it is, the algorithm continues to explore further down that path. If the current sequence forms a complete word in the word list and meets the minimum length requirement, it’s added to the list of valid words. On the other hand, if the sequence is not a valid prefix, the algorithm prunes the unnecessary path.

For the english words which can be formed, we took reference from repository [https://github.com/dwyl/english-words](https://github.com/dwyl/english-words), specifically from the file [words_alpha.txt](https://github.com/dwyl/english-words/blob/master/words_alpha.txt).

### Project Preview

-	Home Interface
  <img width="440" alt="image" src="https://github.com/user-attachments/assets/489e45c9-1612-4a0e-9665-bbc5b9ad0af0" />

-	Main game display
 <img width="217" alt="image" src="https://github.com/user-attachments/assets/f2f4b310-8843-495c-a929-f8c881e2307c" />

-	Hint display
 <img width="216" alt="image" src="https://github.com/user-attachments/assets/3d79082c-89c1-4702-98d6-3d4a6dd10440" />

-	Game result
  <img width="216" alt="image" src="https://github.com/user-attachments/assets/3f1987f4-6389-4db3-9dca-a1e7242ea83f" />
  <img width="218" alt="image" src="https://github.com/user-attachments/assets/17cb5d71-94df-41cc-af29-1f908578a169" />

### How to Run
1. Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Open a terminal and navigate to the project directory:

    ```bash
    cd word-scramble
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

4. Start the development server:

    ```bash
    npm start
    ```

5. Open your browser and go to [http://localhost:3000](http://localhost:3000) to play the game.

Or you may go to our **deployed website** at [https://word-scramble-beta.vercel.app](https://word-scramble-beta.vercel.app).



