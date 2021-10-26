console.log('Loaded: Pathfinder.ts');
import { BoardProcess, BoardProcessTile, BoardSize, Coordinates } from '../types/interfaces';


/**
 * Class to calculate shortest path between start and finish.
 */
export default class Pathfinder {
    /** Board height and width. */
    private readonly board: BoardSize;
    /** Array with offset data. Useful while searching tiles around a selected tile. */
    private readonly searchOffsetArr: Array<Coordinates>;

    /** Finish point data. */
    private finish: BoardProcessTile
    /** Start point data. */
    private start: BoardProcessTile;

    /**
     * Creates basic pathfinder data.
     * @param height - height of the board.
     * @param width - width of the board.
     */
    constructor(height: number, width: number) {
        // board dimensions
        this.board = {
            height: height,
            width: width
        };

        // offset which will be search around selected
        this.searchOffsetArr = [
            {
                x: 0,
                y: -1
            },
            {
                x: -1,
                y: 0
            },
            {
                x: 1,
                y: 0
            },
            {
                x: 0,
                y: 1
            }
        ];
    }

    /**
     * Checks if start and finish tiles are neighbours.
     * @private
     * @param boardProcess - boardProcess array.
     * @return areNeighbours - are tiles neighbours.
     */
    private checkIfEndPointsAreNeighbors(boardProcess: BoardProcess): boolean {
        for (let i = 0; i < this.searchOffsetArr.length; i++) {
            if (this.checkOffsetOutOfIndex(this.finish, i))
                continue;
            if (boardProcess[this.finish.y + this.searchOffsetArr[i].y][this.finish.x + this.searchOffsetArr[i].x].type === 's')
                return true;
        }
        return false;
    }

    /**
     * Check if offset will be out of index.
     * @private
     * @param tileData - tile to which offset will be checked.
     * @param offsetID - id of offset data in searchOffsetArr array. Number 0 - 3.
     * @return isOutOfIndex - is offset out of index or not.
     */
    private checkOffsetOutOfIndex(tileData: BoardProcessTile, offsetID: number): boolean {
        if (tileData.x + this.searchOffsetArr[offsetID].x < 0 || tileData.x + this.searchOffsetArr[offsetID].x > this.board.width - 1)
            return true;
        else if (tileData.y + this.searchOffsetArr[offsetID].y < 0 || tileData.y + this.searchOffsetArr[offsetID].y > this.board.height - 1)
            return true;
        return false;
    }

    /**
     * Search shortest path from finish to start.
     * @private
     * @param boardProcess - boardProcess array.
     * @return shortestPath - array with shortest path.
     */
    private reverseSearch(boardProcess: BoardProcess): Array<Coordinates> {
        let pathArr: Array<Coordinates> = [];

        // check if start is next to finish
        if (this.checkIfEndPointsAreNeighbors(boardProcess))
            return pathArr;

        // search shortest path
        let lastTile: BoardProcessTile = this.finish;
        let pathCreated = false;

        while(!pathCreated) {
            let lastTileBeforeSearch = lastTile;

            // check all tiles around lastTile
            for (let i = 0; i < this.searchOffsetArr.length; i++) {
                // check if offset is out of index
                if (this.checkOffsetOutOfIndex(lastTile, i))
                    continue;

                let selectedTile = boardProcess[lastTile.y + this.searchOffsetArr[i].y][lastTile.x + this.searchOffsetArr[i].x];

                // check if selectedTile is the shortest path to start
                if (selectedTile.pathHelper === lastTile.pathHelper - 1) {
                    pathArr.push(selectedTile)
                    lastTile = selectedTile;
                }

                // check if start has been found
                if (selectedTile.pathHelper === 0) {
                    pathCreated = true;
                    break;
                }
            }

            // check if there is next tile or path is blocked by obstacles
            if (lastTile === lastTileBeforeSearch) {
                alert('Cannot find path!');
                pathCreated = true;
                break;
            }
        }

        // return shortest path
        return pathArr;
    }

    /**
     * Find shortest path between two points marked as start and finish.
     * @param board - board array.
     * @return shortestPath - array with shortest path.
     */
    findPath(board: Array<Array<string>>): Array<Coordinates> {
        // create new array of boardProcess objects - coordinates and other tile data (BoardProcessTile)
        let boardProcess: BoardProcess = [];
        for (let i = 0; i < this.board.height; i++) {
            boardProcess.push([]);
            for (let j = 0; j < this.board.width; j++) {
                boardProcess[i].push({
                    pathHelper: -1,
                    x: j,
                    y: i,
                    wasSearched: false
                });
                switch (board[i][j]) {
                    case '0':
                        boardProcess[i][j].type = '0';
                        break;
                    case 'e':
                        boardProcess[i][j].type = 'e';
                        this.finish = boardProcess[i][j];
                        break;
                    case 's':
                        Object.assign(boardProcess[i][j], {
                            type: 's',
                            wasSearched: true
                        });
                        this.start = boardProcess[i][j];
                        break;
                    case 'x':
                        boardProcess[i][j].type = 'x';
                        break;
                    default:
                        console.log('[ERROR] Board corrupted. ' + `x: ${i} y: ${j}, type: ${board[i][j]}`, board);
                }
            }
        }

        // search for shortest path
        let foundFinish = false;
        let pathHelper = 0;
        let tilesToCheckArr: Array<BoardProcessTile> = [boardProcess[this.start.y][this.start.x]];

        while(!foundFinish) {
            // check all tile from the list
            let tilesToCheckArrCopy = [...tilesToCheckArr];
            for (let i = 0; i < tilesToCheckArrCopy.length; i++) {
                // check all tiles around tileToCheck
                let tileToCheck = tilesToCheckArrCopy[i];
                for (let j = 0; j < this.searchOffsetArr.length; j++) {
                    // check if offset is out of index
                    if (this.checkOffsetOutOfIndex(tileToCheck, j))
                        continue;

                    // select tile from boardProcessArr and check if it has been already searched; if not, fill with pathHelper number
                    let tileAround = boardProcess[tileToCheck.y + this.searchOffsetArr[j].y][tileToCheck.x + this.searchOffsetArr[j].x];
                    if (tileAround.wasSearched)
                        continue;
                    tileAround.wasSearched = true;

                    // check if tile is an obstacle
                    if (tileAround.type === 'x')
                        continue;

                    // set pathHelper number and add to list to further search
                    tileAround.pathHelper = pathHelper;
                    tilesToCheckArr.push(tileAround);

                    // check if finish has been found
                    if (tileAround.type === 'e') {
                        foundFinish = true;
                        break;
                    }
                }
                // remove checked tile from list
                tilesToCheckArr.splice(tilesToCheckArr.indexOf(tileToCheck), 1);
            }

            // check if there are tiles to check
            if (tilesToCheckArr.length === 0)
                break ;
            pathHelper++;
        }

        // return shortest path
        return this.reverseSearch(boardProcess);
    }
}