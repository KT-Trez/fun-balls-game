import Collider from './Collider';
import {DeletedBallsEvent, GeneratedBallsEvent, PreviewedBallsEvent} from '../types/events';
import {BoardInterface} from '../types/classInterfaces';
import {BoardMapTile, BoardMapTileData, Coordinates, EndPoints} from '../types/interfaces';
import {BoardTilesColors, BoardTilesTypes} from '../types/consts';
import {logStart} from '../types/decorators';
import Pathfinder from './Pathfinder';
import Renderer from './Renderer';
import Tools from '../components/Tools';
import Dev from '../components/Dev';

console.log('Loaded: Board.ts');


/**
 * Class to create and manage game's board.
 */
export default class Board implements BoardInterface {
  /** Interface to dispatch and listen custom events. */
  readonly eventInterface: EventTarget;

  /** Board height. */
  private readonly height: number;
  /** Board width. */
  private readonly width: number;

  /** Next balls colors that will be used. */
  private ballsColorPreview: string[];

  /** Map of board tiles. */
  private readonly boardMap: BoardMapTile[][];
  /** Points gained by user. */
  private points: number;

  /** Board's collider. */
  private readonly collider: Collider;
  /** Board's pathfinder. */
  private readonly pathfinder: Pathfinder;
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

    this.eventInterface = new EventTarget();
    this.points = 0;

    this.ballsColorPreview = [];
    this.generateBallsColorPreview(3);

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

    this.collider = new Collider(this.height, this.width);
    this.pathfinder = new Pathfinder(this.height, this.width);
    this.renderer = new Renderer(this, this.height, this.width);
  }

  /**
   * Checks if there are balls in pattern that can be killed, then kills them.
   * @private
   */
  private checkBoardThenDeleteBalls() {
    let deepCopyBoardMap = JSON.parse(JSON.stringify(this.boardMap));
    let tilesToPurge: BoardMapTileData[] = this.collider.checkAllAxis(deepCopyBoardMap);

    // kill balls if there are any
    if (tilesToPurge.length > 0) {
      // award points
      this.points += tilesToPurge.length;

      // create and dispatch custom event to eventInterface, (with points and killed balls array)
      let event: DeletedBallsEvent = new CustomEvent('deletedBalls', {
        detail: {
          balls: tilesToPurge,
          points: tilesToPurge.length
        }
      });
      this.eventInterface.dispatchEvent(event);

      // clear balls in boardMap
      for (let i = 0; i < tilesToPurge.length; i++)
        this.writeBoardMap(tilesToPurge[i].x, tilesToPurge[i].y, null, BoardTilesTypes.none);
    }
  }

  /**
   * Generates balls on the board.
   * @private
   * @param quantity - balls quantity.
   */
  private generateBalls(quantity: number): void {
    let initialQuantity = quantity;
    let newBalls: BoardMapTileData[] = [];
    while (quantity) { // TODO: can generate only on free tiles && game can end
      let randomX: number = Tools.getRandomIntInclusive(0, this.height - 1);
      let randomY: number = Tools.getRandomIntInclusive(0, this.width - 1);

      if (this.readBoardMap(randomX, randomY).type === BoardTilesTypes.none) {
        newBalls.push({
          color: this.ballsColorPreview[quantity - 1],
          type: BoardTilesTypes.obstacle,
          x: randomX,
          y: randomY
        });

        this.writeBoardMap(randomX, randomY, this.ballsColorPreview[quantity - 1], BoardTilesTypes.obstacle);
        quantity--;
      }
    }
    this.generateBallsColorPreview(initialQuantity);

    let event: GeneratedBallsEvent = new CustomEvent('generatedBalls', {
      detail: newBalls
    });
    this.eventInterface.dispatchEvent(event);
  }

  /**
   * Generates colors for next balls.
   * @private
   * @param quantity - balls quantity.
   */
  private generateBallsColorPreview(quantity: number) {
    let colors: string[] = [];
    for (let i = 0; i < quantity; i++)
      colors.push(BoardTilesColors[Tools.getRandomIntInclusive(0, BoardTilesColors.length - 1)].id);
    this.ballsColorPreview = colors;

    let event: PreviewedBallsEvent = new CustomEvent('previewedBalls', {
      detail: colors
    });
    this.eventInterface.dispatchEvent(event);
  }

  /**
   * Returns board tile from BoardMap.
   * @param x - horizontal coordinate of tile.
   * @param y - vertical coordinate of tile.
   * @return boardTile - board tile.
   */
  getBoardMapTile(x: number, y: number): BoardMapTile {
    return this.readBoardMap(x, y);
  }

  /**
   * Gets the path, from pathfinder, between two points.
   * @param endpoints - start and end points of path.
   */
  getPath(endpoints: EndPoints): Coordinates[] {
    if (this.readBoardMap(endpoints.finish.x, endpoints.finish.y).type === BoardTilesTypes.obstacle)
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
  moveBall(endpoints: EndPoints): boolean {
    if (this.boardMap[endpoints.finish.y][endpoints.finish.x].type !== BoardTilesTypes.none)
      return false;

    if (this.getPath(endpoints).length === 0)
      return false;

    let startPointData: BoardMapTileData = this.readBoardMap(endpoints.start.x, endpoints.start.y);
    this.writeBoardMap(endpoints.finish.x, endpoints.finish.y, startPointData.color, startPointData.type);
    this.writeBoardMap(endpoints.start.x, endpoints.start.y, null, BoardTilesTypes.none);

    this.checkBoardThenDeleteBalls();
    this.generateBalls(3);

    Dev.logBoardMap(this.boardMap, 'color');
    return true;
  }

  /**
   * Reads tile from BoardMap.
   * @private
   * @param x - horizontal coordinate of tile.
   * @param y - vertical coordinate of tile.
   * @return tile - odczytany kafelek.
   */
  private readBoardMap(x: number, y: number): BoardMapTile {
    let deepCopyBoardMapTile = JSON.parse(JSON.stringify(this.boardMap));
    return deepCopyBoardMapTile[y][x];
  }

  /**
   * Starts and handles game progress.
   * @param initialObstaclesCount - initial obstacle quantity.
   */
  @logStart
  startGame(initialObstaclesCount: number): void {
    this.renderer.renderBoard();
    this.renderer.setRenderForBoardEvents();
    this.generateBalls(initialObstaclesCount);
  }

  /**
   * Writes tile in BoardMap.
   * @private
   * @param x - horizontal coordinate of tile.
   * @param y - vertical coordinate of tile.
   * @param color - new color.
   * @param type - new type.
   */
  private writeBoardMap(x: number, y: number, color: string, type: string): void {
    Object.assign(this.boardMap[y][x], {
      color: color,
      type: type
    });
  }
}