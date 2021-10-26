console.log('Loaded: Board.ts');
import { BoardTilesTypes } from '../types/consts';
import { Coordinates} from '../types/interfaces';
import Pathfinder from './Pathfinder';
import Tools from '../components/Tools';


/**
 * Class to create and manage game's board.
 */
export default class Board {
  /** Board height. */
  private readonly height: number;
  /** Board width. */
  private readonly width: number;

  /** Map of board tiles types. */
  private readonly boardMap: string[][];
  /** Obstacles count. */
  private readonly obstacles: number;
  // /** Points, such as start and finish count */
  // private points: number; // TODO: Deprecated: delete

  /** Board's pathfinder. */
  private pathfinder: Pathfinder;

  /** Is finish point placed. */
  private hasFinish: boolean;
  /** Is start point placed. */
  private hasStart: boolean;

  /** Start point coordinates. */
  private start: Coordinates;

  /**
   * Creates basic board data.
   * @param height - board height.
   * @param width - board width.
   * @param obstacles - obstacles count.
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
        row.push(BoardTilesTypes.none);

      this.boardMap.push(row);
    }

    // lays out obstacles on the board
    while (this.obstacles) {
      let randomX: number = Tools.getRandomIntInclusive(0, this.height - 1);
      let randomY: number = Tools.getRandomIntInclusive(0, this.width - 1);

      if (this.boardMap[randomX][randomY] === BoardTilesTypes.none) {
        this.boardMap[randomX][randomY] = BoardTilesTypes.obstacle;
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

    this.hasFinish = false;
    this.hasStart = false;

    this.start = {
      x: null,
      y: null
    };
  }

  /**
   * Clears div with id 'js-display', and appends new content.
   * @param element - element that will be appended.
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
        if (this.boardMap[i][j] === BoardTilesTypes.obstacle)
          document.querySelector(`[data-x="${j}"][data-y="${i}"]`).classList.add('obstacle');
  }

  /**
   * Sets all events (mostly onclick) for board tile.
   * @param tile - board tile.
   */
  setTileEvents(tile: HTMLTableCellElement): void {
    tile.onclick = () => {
      if (!this.hasStart) {
        tile.classList.add('start'); // TODO: dev only, delete later

        this.start = {
          x: parseInt(tile.dataset.x),
          y: parseInt(tile.dataset.y)
        };
        this.boardMap[parseInt(tile.dataset.y)][parseInt(tile.dataset.x)] = BoardTilesTypes.start;
        this.hasStart = true;
      } else if (!this.hasFinish) {
        tile.classList.add('finish'); // TODO: dev only, delete later

        this.boardMap[parseInt(tile.dataset.y)][parseInt(tile.dataset.x)] = BoardTilesTypes.finish;

        // find shortest path between start and and
        this.pathfinder = new Pathfinder(this.height, this.width);

        let path = this.pathfinder.findPath(this.boardMap); // TODO: dev only, delete later
        for (let i = 0; i < path.length; i++) {
          let pathTile = document.querySelector(`[data-x="${path[i].x}"][data-y="${path[i].y}"]`);
          pathTile.classList.add('path');
        }

        this.hasFinish = true;
      }
    };
  }

}