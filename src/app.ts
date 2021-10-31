import Board from './classes/Board';
import {GameData} from './types/consts';

console.log('Loaded: app.ts');


import './css/fonts.css';
import './css/master.css';
import './css/balls.css';
import './css/dev.css';

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('balls_record'))
    document.getElementById('js-points-record').innerText = localStorage.getItem('balls_record');

  let board: Board = new Board(9, 9);
  board.startGame(GameData.quantityOfInitialBalls);
});