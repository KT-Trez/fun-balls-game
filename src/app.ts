console.log('Loaded: app.ts');
import Board from './classes/Board';

import './css/master.css';

window.addEventListener('DOMContentLoaded', () => {
  let board: Board = new Board(9, 9);
  board.startGame(3);
});