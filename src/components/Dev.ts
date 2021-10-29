import Board from '../classes/Board';
import {BoardMap, BoardProcess} from '../types/interfaces';

/**
 * Debugging class.
 */
export default class Dev {
  /**
   * Stretches text length with spaces.
   * @private
   * @static
   * @param text - text that will be stretched.
   * @param length - length to which text will be stretched.
   * @return formattedText - formatted text.
   */
  private static fixLength(text: string, length: number): string {
    if (text.length === length) {
      for (let i = 0; i < length; i++)
        text += ' ';
      return text;
    }
    return text;
  }

  /**
   * Logs boardProcess's data.
   * @static
   * @param dataArray - boardProcess array.
   * @param type - type of data that should be logged.
   */
  static logBoardMap(dataArray: BoardMap | BoardProcess, type: 'color' | 'pathHelper' | 'xy'| 'type' | 'wasSearched'): void {
    let resultString = '';
    switch (type) {
      case 'color':
        for (let i = 0; i < dataArray.length; i++) {
          for (let j = 0; j < dataArray[i].length; j++) {
            // @ts-ignore
            resultString += ' ' + (dataArray[i][j].color === null ? '-' : dataArray[i][j].color);
          }
          resultString += '\n';
        }
        console.log(resultString);
        break;
      case 'pathHelper':
        for (let i = 0; i < dataArray.length; i++) {
          for (let j = 0; j < dataArray[i].length; j++) {
            // @ts-ignore
            resultString += ' ' + dataArray[i][j].pathHelper.toString();
          }
          resultString += '\n';
        }
        console.log(resultString);
        break;
      case 'type':
        for (let i = 0; i < dataArray.length; i++) {
          for (let j = 0; j < dataArray[i].length; j++)
            resultString += ' ' + dataArray[i][j].type;
          resultString += '\n';
        }
        console.log(resultString);
        break;
      case 'xy':
        for (let i = 0; i < dataArray.length; i++) {
          resultString += '| '
          for (let j = 0; j < dataArray[i].length; j++) {
            resultString += this.fixLength(dataArray[i][j].x.toString(), dataArray.length.toString().length) + ' ';
            resultString += this.fixLength(dataArray[i][j].y.toString(), dataArray[i].length.toString().length) + ' | ';
          }
          resultString += '\n';
        }
        console.log(resultString);
        break;
      case 'wasSearched':
        for (let i = 0; i < dataArray.length; i++)
          for (let j = 0; j < dataArray[i].length; j++)
            { // @ts-ignore
              resultString += ' ' + dataArray[i][j].wasSearched;
            }
          resultString += '\n';
        console.log(resultString);
        break;
    }
  }

  /**
   * Enables custom input for board height, width and obstacles count.
   * @static
   */
  static runCustomInput() {
    document.getElementById('js-custom-input').classList.remove('js-hide');

    let boardX = document.getElementById('js-board__x') as HTMLInputElement;
    let boardY = document.getElementById('js-board__y') as HTMLInputElement;
    let obstaclesCount = document.getElementById('js-board__obstacles') as HTMLInputElement;

    document.getElementById('js-board__generate').onclick = () => {
      if (parseInt(boardX.value) < 5 && parseInt(boardY.value) < 5)
        alert('Board to small.');

      if (parseInt(boardX.value) * parseInt(boardY.value) < parseInt(obstaclesCount.value) - 3)
        alert('Too many obstacles.');

      let board: Board = new Board(parseInt(boardX.value), parseInt(boardY.value), parseInt(obstaclesCount.value));
      board.startGame(parseInt(obstaclesCount.value));
    };
  }
}

globalThis.dev = Dev;