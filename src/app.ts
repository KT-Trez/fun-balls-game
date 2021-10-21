console.log('Loaded: app.ts');
import Board from './classes/Board';

import './css/master.css';

window.addEventListener('DOMContentLoaded', () => {
  let boardX = document.getElementById('js-board__x') as HTMLInputElement;
  let boardY = document.getElementById('js-board__y') as HTMLInputElement;

  let obstacles = document.getElementById('js-board__obstacles') as HTMLInputElement;

  let generate = document.getElementById('js-board__generate') as HTMLButtonElement;
  generate.addEventListener('click', () => {
    let board: Board = new Board(parseInt(boardX.value), parseInt(boardY.value), parseInt(obstacles.value));

    let boardDOM: HTMLTableElement = board.generateDOMTable();
    board.appendAndAppendDisplay(boardDOM);


  });
  // todo: game starts

});