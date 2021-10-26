import {BoardProcessTile} from '../types/interfaces';


/**
 * Debugging class.
 */
export default class Dev {
  /**
   * Stretches text length with spaces.
   * @private
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
   * @param dataArray - boardProcess array.
   * @param type - type of data that should be logged.
   */
  static logBoardProcess(dataArray: Array<Array<BoardProcessTile>>, type: 'pathHelper' | 'xy'| 'type' | 'wasSearched'):void {
    let resultString = '';
    switch (type) {
      case 'pathHelper':
        for (let i = 0; i < dataArray.length; i++) {
          for (let j = 0; j < dataArray[i].length; j++)
            resultString += ' ' + dataArray[i][j].pathHelper.toString();
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
            resultString += ' ' + dataArray[i][j].wasSearched;
          resultString += '\n';
        console.log(resultString);
        break;
    }
  }
}