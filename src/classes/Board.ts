import { BoardTile, Coordinates, EndPoints } from '../types/interfaces';
import { BoardTilesColors, BoardTilesTypes } from '../types/consts';
import Pathfinder from './Pathfinder';
import Renderer from './Renderer';
import Tools from '../components/Tools';

console.log('Loaded: Board.ts');


/**
 * Class to create and manage game's board.
 */
export default class Board {
  /** Board height. */
  private readonly height: number;
  /** Board width. */
  private readonly width: number;

  /** Map of board tiles. */
  private readonly boardMap: BoardTile[][];

  /** Board's pathfinder. */
  pathfinder: Pathfinder;
  /** Board's renderer. */
  private readonly renderer: Renderer;

  /** Is finish point placed. */
  private hasFinish: boolean;
  /** Is start point placed. */
  private hasStart: boolean;

  /** Finish point coordinates. */
  private finish: Coordinates;
  /** Start point coordinates. */
  private start: Coordinates;

  /**
   * Creates basic board data.
   * @param height - board height.
   * @param width - board width.
   */
  constructor(height: number, width: number) {
    this.height = height;
    this.width = width;

    this.boardMap = [];
    for (let i: number = 0; i < this.height; i++) {
      let row = [];
      for (let j: number = 0; j < this.width; j++)
        row.push({
          color: null,
          type: BoardTilesTypes.none,
          x: j,
          y: i
        });

      this.boardMap.push(row);
    }

    this.hasFinish = false;
    this.hasStart = false;

    this.finish = {
      x: null,
      y: null
    };

    this.start = {
      x: null,
      y: null
    };

    this.pathfinder = new Pathfinder(this.height, this.width);
    this.renderer = new Renderer(this, this.height, this.width);
  }

  /**
   * Generates obstacles on the board.
   * @private
   * @param obstaclesCount - obstacles quantity.
   */
  private generateObstacles(obstaclesCount: number): void {
    while (obstaclesCount) {
      let randomColor: string = BoardTilesColors[Tools.getRandomIntInclusive(0, BoardTilesColors.length)].id;
      let randomX: number = Tools.getRandomIntInclusive(0, this.height - 1);
      let randomY: number = Tools.getRandomIntInclusive(0, this.width - 1);

      if (this.boardMap[randomX][randomY].type === BoardTilesTypes.none) {
        Object.assign(this.boardMap[randomX][randomY], {
          color: randomColor,
          type: BoardTilesTypes.obstacle
        });
        obstaclesCount--;
      }
    }
  }

  /**
   * Returns board tile from BoardMap.
   * @param x - horizontal coordinate of tile.
   * @param y - vertical coordinate of tile.
   * @return boardTile - board tile.
   */
  getBoardMapTile(x: number, y: number): BoardTile {
    return this.boardMap[y][x];
  }

  /**
   * Gets the path, from pathfinder, between two points.
   * @param endpoints - start and end points of path.
   */
  getPath(endpoints: EndPoints): Coordinates[] {
    if (this.boardMap[endpoints.finish.y][endpoints.finish.x].type === BoardTilesTypes.obstacle)
      return [];

    let deepCopyBoardMap = JSON.parse(JSON.stringify(this.boardMap));

    deepCopyBoardMap[endpoints.finish.y][endpoints.finish.x].type = BoardTilesTypes.finish;
    deepCopyBoardMap[endpoints.start.y][endpoints.start.x].type = BoardTilesTypes.start;

    return this.pathfinder.findPath(deepCopyBoardMap);
  }

  /**
   * Moves ball between two points.
   * @param endpoints - points from and to which ball will be moved.
   */
  moveBall(endpoints: EndPoints): void {
    console.log('Moving ball.', endpoints);
  }

  /**
   * Starts and handles game progress.
   * @param initialObstaclesCount - initial obstacle quantity.
   */
  startGame(initialObstaclesCount: number): void {
    this.generateObstacles(initialObstaclesCount);
    this.renderer.renderBoardDOM();
    this.renderer.renderObstaclesDOM(this.boardMap);

    // todo: game progress
  }
}