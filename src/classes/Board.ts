import Collider from './Collider';
import {DeletedBallsEvent, GameEndedEvent, GeneratedBallsEvent, PreviewedBallsEvent} from '../types/events';
import {BoardInterface} from '../types/classInterfaces';
import {BoardMapTile, BoardMapTileData, Coordinates, EndPoints} from '../types/interfaces';
import {BoardTilesColors, BoardTilesTypes, GameData} from '../types/consts';
import {logStart, measurePerformance} from '../types/decorators';
import Pathfinder from './Pathfinder';
import Renderer from './Renderer';
import Tools from '../components/Tools';

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
  /** Map of free tiles. */
  private readonly freeTiles: BoardMapTileData[];
  /** Points gained by user. */
  private points: number;
  /** Timestamp of game start. */
  private startTimestamp: Date;

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
   * @param ballsQuantity - initial balls quantity.
   */
  constructor(height: number, width: number, ballsQuantity?: number) {
    this.height = height;
    this.width = width;

    this.boardMap = [];
    this.freeTiles = [];

    for (let i: number = 0; i < this.height; i++) {
      let row = [];
      for (let j: number = 0; j < this.width; j++) {
        let newTile: BoardMapTile = {
          color: null,
          type: BoardTilesTypes.none,
          x: j,
          y: i
        };

        this.freeTiles.push(Object.assign({}, newTile));
        row.push(newTile);
      }

      this.boardMap.push(row);
    }

    this.eventInterface = new EventTarget();
    this.points = 0;
    this.startTimestamp = new Date();

    this.ballsColorPreview = [];
    this.generateBallsColorPreview(ballsQuantity ? ballsQuantity : GameData.quantityOfInitialBalls);

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
      for (let i = 0; i < tilesToPurge.length; i++) {
        this.updateFreeTiles(tilesToPurge[i].x, tilesToPurge[i].y, tilesToPurge[i].color, 'add');
        this.writeBoardMap(tilesToPurge[i].x, tilesToPurge[i].y, null, BoardTilesTypes.none);
      }
    }
  }

  /**
   * Generates balls on the board.
   * @private
   * @param quantity - balls quantity.
   */
  @measurePerformance('balls generation')
  private generateBalls(quantity: number): void {
    let initialQuantity = quantity;
    let newBalls: BoardMapTileData[] = [];
    while (quantity) {
      let randomTile = this.freeTiles[Tools.getRandomIntInclusive(0, this.freeTiles.length - 1)];

      if (this.readBoardMap(randomTile.x, randomTile.y).type === BoardTilesTypes.none) {
        newBalls.push({
          color: this.ballsColorPreview[quantity - 1],
          type: BoardTilesTypes.obstacle,
          x: randomTile.x,
          y: randomTile.y
        });

        this.updateFreeTiles(randomTile.x, randomTile.y, this.ballsColorPreview[quantity - 1], 'delete');
        this.writeBoardMap(randomTile.x, randomTile.y, this.ballsColorPreview[quantity - 1], BoardTilesTypes.obstacle);
        quantity--;
      } else {
        console.error(`tile ${randomTile.x} ${randomTile.y} wasn't free`)
      }

      // end game if all spaces are taken
      if (this.freeTiles.length <= 0) {
        let record = localStorage.getItem('balls_record');
        if (!record || this.points > parseInt(record))
          localStorage.setItem('balls_record', this.points.toString());

        let event: GameEndedEvent = new CustomEvent('gameEnded', {
          detail: {
            elapsedTime: Date.now() - this.startTimestamp.getTime(),
            lastBalls: newBalls,
            points: this.points
          }
        });
        this.eventInterface.dispatchEvent(event);
        return;
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

    this.updateFreeTiles(endpoints.finish.x, endpoints.finish.y, startPointData.color, 'delete');
    this.updateFreeTiles(endpoints.start.x, endpoints.start.y, null, 'add');

    this.writeBoardMap(endpoints.finish.x, endpoints.finish.y, startPointData.color, startPointData.type);
    this.writeBoardMap(endpoints.start.x, endpoints.start.y, null, BoardTilesTypes.none);

    this.checkBoardThenDeleteBalls();
    this.generateBalls(GameData.quantityOfRoundBalls);

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
   * Updates freeTiles list.
   * @private
   */
  private updateFreeTiles(x: number, y: number, color: string, action: 'add' | 'delete'): void {
    if (action === 'add')
      this.freeTiles.push({
        color: color,
        type: BoardTilesTypes.obstacle,
        x: x,
        y: y
      });
    else {
      let tileToDelete = this.freeTiles.find(tile => tile.x === x && tile.y === y);
      if (tileToDelete)
        this.freeTiles.splice(this.freeTiles.indexOf(tileToDelete), 1);
      else
        console.error('Data corrupted!');
    }
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