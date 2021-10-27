import { BoardTile, Coordinates, EndPoints } from '../types/interfaces';
import { BoardTilesColors, BoardTilesTypes, GameData } from '../types/consts';
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

  /** Next balls colors that will be used. */
  private ballsColorPreview: string[];

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

    this.ballsColorPreview = Board.generateBallsColorPreview(3);

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
  private generateBalls(quantity: number): BoardTile[] {
    let colorsPreview = [...this.ballsColorPreview];
    this.ballsColorPreview = Board.generateBallsColorPreview(quantity);

    let newBalls: BoardTile[] = []
    while (quantity) { // TODO: can generate only on free tiles
      let randomX: number = Tools.getRandomIntInclusive(0, this.height - 1);
      let randomY: number = Tools.getRandomIntInclusive(0, this.width - 1);

      if (this.boardMap[randomY][randomX].type === BoardTilesTypes.none) {
        newBalls.push({
          color: colorsPreview[quantity - 1],
          type: BoardTilesTypes.obstacle,
          x: randomX,
          y: randomY
        });

        Object.assign(this.boardMap[randomY][randomX], {
          color: colorsPreview[quantity - 1],
          type: BoardTilesTypes.obstacle
        });
        quantity--;
      }
    }
    return newBalls;
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
  moveBall(endpoints: EndPoints): boolean {
    if (this.boardMap[endpoints.finish.y][endpoints.finish.x].type !== BoardTilesTypes.none)
      return false;

    if (this.getPath(endpoints).length === 0)
      return false;

    Object.assign(this.boardMap[endpoints.finish.y][endpoints.finish.x], {
      color: this.boardMap[endpoints.start.y][endpoints.start.x].color,
      type:this.boardMap[endpoints.start.y][endpoints.start.x].type
    });
    Object.assign(this.boardMap[endpoints.start.y][endpoints.start.x], {
      color: null,
      type: BoardTilesTypes.none
    });

    this.runPatternCheckThenKill();
    this.renderer.renderBallsDOM(this.generateBalls(3));
    return true;
  }

  /**
   * Checks if there are balls in pattern that can be killed, then kills them.
   * @private
   */
  private runPatternCheckThenKill() {
    let purgeList = [];

    // check all rows
    this.boardMap.forEach((boardTileRow: BoardTile[]) => {
      // select color and set it's occurrences
      let selectedTileColor = [...boardTileRow][0].color;
      let selectedTileColorOccurrences = 0;

      // select next tiles from row
      for (let i = 0; i < boardTileRow.length; i++) {
        // if next tile color is the same as selected tile's, increase occurrences and continue check, else select new color and set it's occurrences to 0
        if (selectedTileColor && boardTileRow[i].color === selectedTileColor) {
          selectedTileColorOccurrences++;

          // if occurrences allow to kill row; check how long this row is, then kill it
          if (selectedTileColorOccurrences >= GameData.lineToKillLength)
            for (let j = 0; j < boardTileRow.length; j++) {
              // check if tile out of index && check if there are another tiles in row && check if tile is already on list to clear
              let tileInConfirmedRow = boardTileRow[i - (GameData.lineToKillLength - 1) + j];
              if (i - (GameData.lineToKillLength - 1) + j < boardTileRow.length && tileInConfirmedRow.color === selectedTileColor && !purgeList.includes(tileInConfirmedRow))
                purgeList.push(tileInConfirmedRow);
              else
                break;
            }
        } else {
          selectedTileColor = boardTileRow[i].color;
          selectedTileColorOccurrences = 1;
        }
      }
    });

    console.log(purgeList); // todo: create function that also iterates horizontally and cross

    // for (let i = 0; i < sizes.board.width; i++) { // zbijanie piguł i wirusów w pionie // todo: inspiration only: delete later
    //   let checkedStatus = board.tiles[0][i].data.status; // status pola, które będzie testowane na 4-krotne występowanie w kolumnie
    //   let checkSum = 0; // ilość wystąpień takiego samego statusu (piguł/wirusów) w kolumnie
    //
    //   for (let j = 0; j < sizes.board.height; j++) { // testowanie kolumny na ilość wystąpień obecnego statusu
    //     if (checkedStatus && board.tiles[j][i].data.status == checkedStatus) { // zwiększanie sumy kontrolnej, jeśli pole ma testowany status (checkedStatus)
    //       checkSum++;
    //       if (checkSum >= 4) // jeśli występują 4 piguły/wirusy w kolumnie, zbijanie wszystkiego co kwalifikuje się do serii zbicia
    //         for (let k = 0; k < sizes.board.height; k++)
    //           if (j - 3 + k < sizes.board.height && board.tiles[j - 3 + k][i].data.status == checkedStatus) // sprawdzanie czy jest jeszcze plansza i czy zakończyła się seria takich samych piguł/wirusów
    //             purgeList.includes(board.tiles[j - 3 + k][i]) ? null : purgeList.push(board.tiles[j - 3 + k][i]);
    //           else
    //             break;
    //     } else { // jeśli piguła/wirus ma inny status, nadpisywanie testowanego statusu, zerowanie ilości wystąpień i dalsze testowanie serii
    //       checkSum = 1;
    //       checkedStatus = board.tiles[j][i].data.status;
    //     }
    //   }
    // }
  }

  /**
   * Starts and handles game progress.
   * @param initialObstaclesCount - initial obstacle quantity.
   */
  startGame(initialObstaclesCount: number): void {
    this.renderer.renderBoardDOM();
    this.renderer.renderBallsDOM(this.generateBalls(initialObstaclesCount));
  }
}