console.log('Loaded: Pathfinder.ts');

interface BoardSize {
    height: number;
    width: number;
}

interface BoardProcessTile {
    x: number;
    y: number;
    pathHelper?: number;
    type?: string;
    wasSearched: boolean;
}

interface Coordinates {
    x: number | null;
    y: number | null;
}

/**
 * Class to calculate shortest path between start and finish.
 */
export default class Pathfinder {
    private readonly board: BoardSize;
    private end: BoardProcessTile
    private readonly searchOffsetArr: Array<Coordinates>;
    private start: BoardProcessTile;

    /**
     * Creates basic pathfinder data.
     * @param {number} height - height of the board.
     * @param {number} width - width of the board.
     * @return {Object} - pathfinder.
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
     * Check if offset will be out of index.
     * @private
     * @param {BoardProcessTile} tileData - tile to which offset will be checked.
     * @param {number} offsetID - id of offset data in searchOffsetArr array. Number 0 - 3.
     * @return {boolean} - is offset out of index or not.
     */
    private checkOffsetOutOfIndex(tileData: BoardProcessTile, offsetID: number): boolean {
        if (tileData.x + this.searchOffsetArr[offsetID].x < 0 || tileData.x + this.searchOffsetArr[offsetID].x > this.board.width - 1)
            return true;
        else if (tileData.y + this.searchOffsetArr[offsetID].y < 0 || tileData.y + this.searchOffsetArr[offsetID].y > this.board.height - 1)
            return true;
        return false;
    }

    // /**
    //  * Find end coordinates.
    //  * @param {Array<Array<string>>} board - board array.
    //  */
    // findEnd(board: Array<Array<string>>): void { // TODO: Deprecated: delete
    //   for (let i = 0; i < this.board.height; i++)
    //     for (let j = 0; j < this.board.width; j++)
    //       if (board[i][j] === 'e')
    //         this.end = {
    //           x: j,
    //           y: i
    //         }
    //   console.log('[INFO] Found end at:', this.end);
    // }

    /**
     * Find shortest path between two points marked as start and end.
     * @param {Array<Array<string>>} board - board array.
     * @return {Array<Coordinates>} - array with shortest path.
     */
    findPath(board: Array<Array<string>>): Array<Coordinates> {
        // create new array of boardProcess objects - coordinates and other tile data (BoardProcessTile)
        let boardProcess: Array<Array<BoardProcessTile>> = [];
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
                        this.end = boardProcess[i][j];
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
        let foundEnd = false;
        let pathHelper = 0;
        let tilesToCheckArr: Array<BoardProcessTile> = [boardProcess[this.start.y][this.start.x]];

        while(!foundEnd) {
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

                    // check if end has been found
                    if (tileAround.type === 'e') {
                        foundEnd = true;
                        break;
                    }
                }
                // remove checked tile from list
                tilesToCheckArr.splice(tilesToCheckArr.indexOf(tileToCheck), 1);
            }

            // check if there are tiles to check
            if (tilesToCheckArr.length === 0)
                break ;
            else if (pathHelper >= 500) { // TODO: Dev save flag, delete later
                alert('POG, pathHelper out of range!');
                console.error('pathHelper out of range!');
            }
            pathHelper++;
        }

        // return shortest path
        return this.reverseSearch(boardProcess);
    }

    /**
     * Search shortest path from end to start.
     * @private
     * @param {Array<Array<BoardProcessTile>>} boardProcess - boardProcess array.
     * @return {Array<Coordinates>} - array with shortest path.
     */
    private reverseSearch(boardProcess: Array<Array<BoardProcessTile>>): Array<Coordinates> {
        let pathArr: Array<Coordinates> = [];

        // search shortest path
        let lastTile: BoardProcessTile = this.end;
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
}