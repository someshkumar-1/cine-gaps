import React, { useState } from 'react';
import '../App.css';


const movies = [
  {
    title: "Scott Pilgrim vs. the World",
    genres: ["Crime", "Drama"],
    runtime: "2h55",
    release: "1972-03-24",
    directors: ["Francis Ford Coppola"],
    cast: "Marlon Brando, Al Pacino, James Caan",
    plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
  },
  // Add more movies as needed
];

const clueOrder = ["release", "directors", "cast", "plot", "revealMask"];

function getRandomIndices(title, count) {
  // Get indices of all letters
  const letterIndices = [];
  for (let i = 0; i < title.length; i++) {
    if (/[A-Za-z]/.test(title[i])) letterIndices.push(i);
  }
  // Shuffle and pick 'count' indices
  for (let i = letterIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letterIndices[i], letterIndices[j]] = [letterIndices[j], letterIndices[i]];
  }
  return letterIndices.slice(0, count);
}

function maskTitle(title, revealedIndices = []) {
  return title
    .split('')
    .map((char, idx) => {
      if (/[A-Za-z]/.test(char)) {
        if (revealedIndices.includes(idx)) return char;
        return '_';
      }
      if (char === ' ') return ' ';
      return char; // punctuation or special character
    })
    .join('');
}

export default function GapsGame() {
  const [movie] = useState(movies[0]);
  const [guess, setGuess] = useState("");
  const [guessesLeft, setGuessesLeft] = useState(6);
  const [result, setResult] = useState(null);
  const [clueStep, setClueStep] = useState(0);
  const [revealIndices, setRevealIndices] = useState([]);
  const [inputError, setInputError] = useState(false);
  const [guesses, setGuesses] = useState([]); // Track all guesses and skips

  const handleGuess = () => {
    if (guess.trim().toLowerCase() === movie.title.toLowerCase()) {
      setResult("Correct! 🎉");
    } else {
      setGuessesLeft(g => g - 1);
      setResult("Try again!");
      setClueStep(step => {
        const nextStep = Math.min(step + 1, clueOrder.length);
        if (nextStep === 5 && revealIndices.length === 0) {
          // Reveal 20% of the letters (at least 2)
          const letterCount = movie.title.replace(/[^A-Za-z]/g, '').length;
          const revealCount = Math.max(2, Math.floor(letterCount * 0.2));
          setRevealIndices(getRandomIndices(movie.title, revealCount));
        }
        return nextStep;
      });
      setInputError(true);
      setTimeout(() => setInputError(false), 1000);
      setGuesses(prev => [...prev, { type: 'guess', value: guess }]);
    }
    setGuess("");
  };

  const handleSkip = () => {
    setGuessesLeft(g => g - 1);
    setClueStep(step => {
      const nextStep = Math.min(step + 1, clueOrder.length);
      if (nextStep === 5 && revealIndices.length === 0) {
        // Reveal 20% of the letters (at least 2)
        const letterCount = movie.title.replace(/[^A-Za-z]/g, '').length;
        const revealCount = Math.max(2, Math.floor(letterCount * 0.2));
        setRevealIndices(getRandomIndices(movie.title, revealCount));
      }
      return nextStep;
    });
    setGuesses(prev => [...prev, { type: 'skip' }]);
  };

  const showClue = (clue) => {
    if (clue === "release") return clueStep >= 1 ? movie.release : "???";
    if (clue === "directors") return clueStep >= 2 ? movie.directors.join(', ') : "???";
    if (clue === "cast") return clueStep >= 3 ? movie.cast : "???";
    if (clue === "plot") return clueStep >= 4 ? movie.plot : "???";
    return "???";
  };

  let masked;
  if (result === "Correct! 🎉" || guessesLeft === 0) {
    masked = movie.title;
  } else if (clueStep >= 5) {
    masked = maskTitle(movie.title, revealIndices);
  } else {
    masked = maskTitle(movie.title);
  }

  return (
    <div className="gaps-container">
      <header className="gaps-header">
        <h2>#361 - Apr 30, 2025</h2>
        <p className="gaps-subtitle">Guess the name of the movie!</p>
      </header>
      <div className="gaps-masked-title">{masked}</div>
      <div className="gaps-clues-row">
        <div><b>Genres:</b> <span>{movie.genres.join(', ')}</span></div>
        <div><b>Runtime:</b> {movie.runtime}</div>
        <div><b>Release Date:</b> {showClue('release')}</div>
        <div><b>Director:</b> {showClue('directors')}</div>
      </div>
      <div className="gaps-clue"><b>Cast:</b> {showClue('cast')}</div>
      <div className="gaps-clue"><b>Plot:</b> {showClue('plot')}</div>
      <div className="gaps-input-row">
        <input
          className={`gaps-input${inputError ? ' gaps-input-error' : ''}`}
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Enter a movie title"
          onKeyDown={e => { if (e.key === 'Enter') handleGuess(); }}
          disabled={guessesLeft === 0 || result === 'Correct! 🎉'}
        />
        <button
          className="gaps-btn"
          onClick={handleGuess}
          disabled={guessesLeft === 0 || result === 'Correct! 🎉'}
        >SUBMIT</button>
        <button
          className="gaps-btn"
          onClick={handleSkip}
          disabled={guessesLeft === 0 || result === 'Correct! 🎉'}
        >SKIP</button>
      </div>
      <div className="gaps-guesses-left">{guessesLeft} GUESSES REMAINING</div>
      {/* Guesses List */}
      {guesses.length > 0 && (
        <div className="gaps-guesses-list">
          <div className="gaps-guesses-title">Your Guesses:</div>
          {guesses.map((g, i) => (
            <div key={i} className={`gaps-guess-row${g.type === 'skip' ? ' gaps-guess-skip' : ''}`}>
              {g.type === 'skip' ? 'SKIPPED' : g.value}
            </div>
          ))}
        </div>
      )}
      {result && <div className="gaps-result">{result}</div>}
    </div>
  );
} 