import { BallsDeletedEvent, BallsGeneratedEvent } from '../types/events';
import { BoardMapTile, BoardMapTileData, Coordinates, EndPoints } from '../types/interfaces';
import { BoardTilesColors, BoardTilesTypes, GameData } from '../types/consts';
import Pathfinder from './Pathfinder';
import Renderer from './Renderer';
import Tools from '../components/Tools';

console.log('Loaded: Board.ts');


/**
 * Class to create and manage game's board.
 */
export default class Board {
  /** Interface to dipach and listen custom events. */
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

  /** Board's pathfinder. */
  readonly pathfinder: Pathfinder;
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

    this.ballsColorPreview = Board.generateBallsColorPreview(3);
    this.eventInterface = new EventTarget();
    this.points = 0;

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
   * Generates colors for next balls.
   * @private
   * @static
   * @param quantity - balls quantity.
   *
   */
  private static generateBallsColorPreview(quantity: number): string[] {
    let colors: string[] = [];
    for (let i = 0; i < quantity; i++)
      colors.push(BoardTilesColors[Tools.getRandomIntInclusive(0, BoardTilesColors.length - 1)].id);
    return colors;
  }

  /**
   * Generates balls on the board.
   * @private
   * @param quantity - balls quantity.
   */
  private generateBalls(quantity: number): void {
    let colorsPreview = [...this.ballsColorPreview];
    this.ballsColorPreview = [...Board.generateBallsColorPreview(quantity)];

    let newBalls: BoardMapTileData[] = [];
    while (quantity) { // TODO: can generate only on free tiles
      let randomX: number = Tools.getRandomIntInclusive(0, this.height - 1);
      let randomY: number = Tools.getRandomIntInclusive(0, this.width - 1);

      if (this.readBoardMap(randomX, randomY).type === BoardTilesTypes.none) {
        newBalls.push({
          color: colorsPreview[quantity - 1],
          type: BoardTilesTypes.obstacle,
          x: randomX,
          y: randomY
        });

        this.writeBoardMap(randomX, randomY, colorsPreview[quantity - 1], BoardTilesTypes.obstacle);
        quantity--;
      }
    }
    let event: BallsGeneratedEvent = new CustomEvent('ballsGenerated', {
      detail: newBalls
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

    this.runPatternCheckThenKill();
    this.generateBalls(3);
    return true;
  }

  private readBoardMap(x: number, y: number): BoardMapTile {
    let deepCopyBoardMapTile = JSON.parse(JSON.stringify(this.boardMap));
    return deepCopyBoardMapTile[y][x];
  }

  /**
   * Checks if there are balls in pattern that can be killed, then kills them.
   * @private
   */
  private runPatternCheckThenKill() {
    // todo: optimize
    let toPurgeArr = [];

    // check all rows
    this.boardMap.forEach((boardTileRow: BoardMapTile[]) => {
      // select color and set it's occurrences
      let selectedTileColor = boardTileRow[0].color;
      let selectedTileColorOccurrences = 0;

      // select next tiles from row
      for (let i = 0; i < boardTileRow.length; i++) {
        // if next tile color is the same as selected tile's, increase occurrences and continue check, else select new color and set it's occurrences to 0
        if (selectedTileColor && boardTileRow[i].color === selectedTileColor) {
          selectedTileColorOccurrences++;

          // if occurrences allow to kill row; check how long this row is, then kill it
          if (selectedTileColorOccurrences >= GameData.lineToKillLength)
            for (let j = 0; j < this.width; j++) {
              // check if tile out of index && check if there are another tiles in row && check if tile is already on list to clear
              let tileInConfirmedRow = boardTileRow[i - (GameData.lineToKillLength - 1) + j];
              if (i - (GameData.lineToKillLength - 1) + j < this.width && tileInConfirmedRow.color === selectedTileColor && !toPurgeArr.includes(tileInConfirmedRow))
                toPurgeArr.push(tileInConfirmedRow);
              else
                break;
            }
        } else {
          selectedTileColor = boardTileRow[i].color;
          selectedTileColorOccurrences = 1;
        }
      }
    });

    // check all columns
    for (let i = 0; i < this.width; i++) {
      // select color
      let selectedTileColor = this.boardMap[0][i].color;
      let selectedTileColorOccurrences = 0;
      // select next tiles from column
      for (let j = 0; j < this.height; j++) {
        // if next tile color is the same as selected tile's, increase occurrences and continue check, else select new color and set it's occurrences to 0
        if (selectedTileColor && this.boardMap[j][i].color === selectedTileColor) {
          selectedTileColorOccurrences++;

          // if occurrences allow to kill column; check how long this row is, then kill it
          if (selectedTileColorOccurrences >= GameData.lineToKillLength)
            for (let k = 0; k < this.height; k++) {
              // check if tile out of index && check if there are another tiles in row && check if tile is already on list to clear
              if (j - (GameData.lineToKillLength - 1) + k < this.height && this.boardMap[j - (GameData.lineToKillLength - 1) + k][i].color === selectedTileColor && !toPurgeArr.includes(this.boardMap[j - (GameData.lineToKillLength - 1) + k][i]))
                toPurgeArr.push(this.boardMap[j - (GameData.lineToKillLength - 1) + k][i]);
              else
                break;
            }
        } else {
          selectedTileColor = this.boardMap[j][i].color;
          selectedTileColorOccurrences = 1;
        }
      }
    }

    // todo: create function that iterates cross
    // kill balls if there are any
    if (toPurgeArr.length > 0) {
      // award points
      this.points += toPurgeArr.length;

      // create and dispatch custom event to eventInterface, (with points and killed balls array)
      let event: BallsDeletedEvent = new CustomEvent('deletedBalls', {
        detail: {
          balls: toPurgeArr,
          points: toPurgeArr.length
        }
      });
      this.eventInterface.dispatchEvent(event);

      // clear balls in boardMap
      for (let i = 0; i < toPurgeArr.length; i++) {
        let tileToKill = toPurgeArr[i]
        Object.assign(this.boardMap[tileToKill.y][tileToKill.x], {
          color: null,
          type: BoardTilesTypes.none
        });
      }
    }
  }

  /**
   * Starts and handles game progress.
   * @param initialObstaclesCount - initial obstacle quantity.
   */
  startGame(initialObstaclesCount: number): void {
    this.renderer.renderBoardDOM();
    this.renderer.setRenderForBoardEvents();
    this.generateBalls(initialObstaclesCount);
  }

  private writeBoardMap(x: number, y: number, color: string, type: string) {
    Object.assign(this.boardMap[y][x], {
      color: color,
      type: type
    });
  }
}