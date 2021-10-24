console.log('Loaded: Board.ts');
import Pathfinder from './Pathfinder';
import Tools from '../components/Tools';

interface Coordinates {
  x: number | null;
  y: number | null;
}


/**
 * Class to create and manage game's board.
 */
export default class Board {
  private readonly boardMap: string[][];
  private readonly obstacles: number;
  private pathfinder: Pathfinder;
  // private points: number; // TODO: Deprecated: delete

  private readonly height: number;
  private readonly width: number;

  private start: Coordinates;

  private hasEnd: boolean;
  private hasStart: boolean;

  /**
   * Creates basic board data.
   * @param {number} height - board height.
   * @param {number} width - board width.
   * @param {number} obstacles - obstacles count.
   * @return {Object} - board data.
   */
  constructor(height: number, width: number, obstacles: number) {
    this.height = height;
    this.width = width;

    this.obstacles = obstacles;
    // this.points = 2; // TODO: Deprecated: delete

    this.boardMap = [];
    for (let i: number = 0; i < this.height; i++) {
      let row: string[] = []
      for (let j: number = 0; j < this.width; j++)
        row.push('0');

      this.boardMap.push(row);
    }

    // lays out obstacles on the board
    while (this.obstacles) {
      let randomX: number = Tools.getRandomIntInclusive(0, this.height - 1);
      let randomY: number = Tools.getRandomIntInclusive(0, this.width - 1);

      if (this.boardMap[randomX][randomY] === '0') {
        this.boardMap[randomX][randomY] = 'x';
        this.obstacles--;
      }
    }

    // while (this.points) { // TODO: Deprecated: delete
    //   let randomX: number = Tools.getRandomIntInclusive(0, this.height - 1);
    //   let randomY: number = Tools.getRandomIntInclusive(0, this.width - 1);
    //
    //   if (this.points == 2) {
    //     this.boardMap[randomX][randomY] = 's';
    //     this.points--;
    //   } else if (this.points == 1) {
    //     this.boardMap[randomX][randomY] = 'e';
    //     this.points--;
    //   }
    // }

    this.hasEnd = false;
    this.hasStart = false;

    this.start = {
      x: null,
      y: null
    };
  }

  /**
   * Clears div with id 'js-display', and appends new content.
   * @param {HTMLElement} element - element that will be appended.
   */
  clearAndAppendDisplay(element: HTMLElement): void {
    let display = document.getElementById('js-display') as HTMLDivElement;

    while (display.firstChild)
      display.removeChild(display.firstChild);

    display.appendChild(element);
  }

  /**
   * Generates new DOM board with class instance's height and width.
   */
  renderBoardDOM(): HTMLTableElement {
    let table: HTMLTableElement = document.createElement('table');

    for (let i: number = 0; i < this.height; i++) {
      let row: HTMLTableRowElement = document.createElement('tr');

      for (let j: number = 0; j < this.width; j++) {
        let cell: HTMLTableCellElement = document.createElement('td');

        cell.classList.add('board__cell');
        cell.setAttribute('data-x', j.toString());
        cell.setAttribute('data-y', i.toString());
        this.setTileEvents(cell);

        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    return table;
  }

  /**
   * Renders obstacles on the DOM board.
   */
  renderObstaclesDOM(): void {
    for (let i = 0; i < this.boardMap.length; i++)
      for (let j = 0; j < this.boardMap[i].length; j++)
        if (this.boardMap[i][j] === 'x')
          document.querySelector(`[data-x="${j}"][data-y="${i}"]`).classList.add('obstacle');
  }

  /**
   * Sets all events (mostly onclick) for board tile.
   * @param {HTMLTableCellElement} tile - board tile.
   */
  setTileEvents(tile: HTMLTableCellElement): void {
    tile.onclick = () => {
      if (!this.hasStart) {
        tile.classList.add('start'); // TODO: dev only, delete later

        this.start = {
          x: parseInt(tile.dataset.x),
          y: parseInt(tile.dataset.y)
        };
        this.boardMap[parseInt(tile.dataset.y)][parseInt(tile.dataset.x)] = 's';
        this.hasStart = true;
      } else if (!this.hasEnd) {
        tile.classList.add('end'); // TODO: dev only, delete later

        this.boardMap[parseInt(tile.dataset.y)][parseInt(tile.dataset.x)] = 'e';

        // find shortest path between start and and
        this.pathfinder = new Pathfinder(this.height, this.width);

        let path = this.pathfinder.findPath(this.boardMap); // TODO: dev only, delete later
        for (let i = 0; i < path.length; i++) {
          let pathTile = document.querySelector(`[data-x="${path[i].x}"][data-y="${path[i].y}"]`);
          pathTile.classList.add('path');
        }

        this.hasEnd = true;
      }
    };
  }
}