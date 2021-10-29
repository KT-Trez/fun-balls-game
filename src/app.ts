import Board from './classes/Board';
import {GameData} from './types/consts';

console.log('Loaded: app.ts');


import './css/fonts.css';
import './css/master.css';
import './css/balls.css';
import './css/dev.css';

window.addEventListener('DOMContentLoaded', () => {
  let board: Board = new Board(9, 9);
  board.startGame(GameData.quantityOfInitialBalls);
});