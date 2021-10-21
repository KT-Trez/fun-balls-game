console.log('Loaded: Board.ts');
import Tools from '../components/Tools';

export default class Board {
  private readonly boardMap: string[][];
  private readonly obstacles: number;
  private readonly points: number;

  private readonly height: number;
  private readonly width: number;

  constructor(height: number, width: number, obstacles: number) {
    this.height = height;
    this.width = width;

    this.obstacles = obstacles;
    this.points = 2;

    this.boardMap = [];
    for (let i: number = 0; i < this.height; i++) {
      let row: string[] = []
      for (let j: number = 0; j < this.width; j++)
        row.push('0');

      this.boardMap.push(row);
    }

    while (this.obstacles) {
      let randomX: number = Tools.getRandomIntInclusive(0, this.height - 1);
      let randomY: number = Tools.getRandomIntInclusive(0, this.width - 1);

      if (this.boardMap[randomX][randomY] === '0') {
        this.boardMap[randomX][randomY] = 'x';
        this.obstacles--;
      }
    }

    while (this.points) {
      let randomX: number = Tools.getRandomIntInclusive(0, this.height - 1);
      let randomY: number = Tools.getRandomIntInclusive(0, this.width - 1);

      if (this.points == 2) {
        this.boardMap[randomX][randomY] = 's';
        this.points--;
      } else if (this.points == 1) {
        this.boardMap[randomX][randomY] = 'm';
        this.points--;
      }
    }
  }

  appendAndAppendDisplay(element: HTMLElement): void {
    let display = document.getElementById('js-display') as HTMLDivElement;

    while (display.firstChild)
      display.removeChild(display.firstChild);

    display.appendChild(element);
  }

  generateDOMTable(): HTMLTableElement {
    let table: HTMLTableElement = document.createElement('table');

    for (let i: number = 0; i < this.height; i++) {
      let row: HTMLTableRowElement = document.createElement('tr');

      for (let j: number = 0; j < this.width; j++) {
        let cell: HTMLTableCellElement = document.createElement('td');

        cell.classList.add('board__cell');
        cell.setAttribute('data-x', i.toString());
        cell.setAttribute('data-y', j.toString());

        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    return table;
  }
}