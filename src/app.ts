import Board from './classes/Board';

console.log('Loaded: app.ts');

import './css/master.css';

window.addEventListener('DOMContentLoaded', () => {
  let board: Board = new Board(9, 9);
  board.startGame(3);
});