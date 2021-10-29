import {ColliderInterface} from '../types/classInterfaces';
import {BoardData, BoardMap, BoardMapTileData} from '../types/interfaces';
import {GameData} from '../types/consts';
import {measurePerformance} from '../types/decorators';
import Tools from '../components/Tools';

console.log('Loaded: Collider.ts');


/**
 *  Checks and searches pattern to detect balls possible to beat.
 */
export default class Collider implements ColliderInterface {
    /** Data about the board. */
    private readonly board: BoardData;

    constructor(height: number, width: number) {
        this.board = {
            height: height,
            width: width
        }
    }

    /**
     * Searches for all balls that can be deleted.
     * @param boardMap - board map.
     * @return tilesArr - list of all balls that can be deleted.
     */
    @measurePerformance('pattern detection')
    checkAllAxis(boardMap: BoardMap): BoardMapTileData[] {
        let tilesToPurge: BoardMapTileData[] = [];

        // check columns and rows
        tilesToPurge = tilesToPurge.concat(this.checkAxis(boardMap, 'column'));
        tilesToPurge = tilesToPurge.concat(this.checkAxis(boardMap, 'row'));

        // // check slants
        tilesToPurge = tilesToPurge.concat(this.checkSlants(boardMap));

        // remove duplicates
        tilesToPurge = Tools.removeArrayDuplicates(tilesToPurge);

        return tilesToPurge;
    }

    /**
     * Searches horizontally and vertically for balls that can be deleted.
     * @param boardMap - board map.
     * @param direction - direction in which board will be searched.
     * @return tilesArr - list of all balls that can be deleted in selected direction.
     */
    checkAxis(boardMap: BoardMap, direction: 'column' | 'row'): BoardMapTileData[] {
        let tilesToPurge: BoardMapTileData[] = [];

        // set boardMap axis to search
        let arrDirectionFirst: number;
        let arrDirectionSecond: number;
        switch (direction) {
            case 'column':
                arrDirectionFirst = this.board.width;
                arrDirectionSecond = this.board.height;
                break;
            case 'row':
                arrDirectionFirst = this.board.height;
                arrDirectionSecond = this.board.width;
                break;
        }

        for (let i = 0; i < arrDirectionFirst; i++) {
            // select color and set it's occurrences
            let colorOccurrences = 0;
            let tileColor: string = direction === 'column' ? boardMap[0][i].color : boardMap[i][0].color;

            // select next tiles from axis
            for (let j = 0; j < arrDirectionSecond; j++) {
                // set boardMap coordinates variables
                let x: number;
                let y: number;

                switch (direction) {
                    case 'column':
                        x = i;
                        y = j;
                        break;
                    case 'row':
                        x = j;
                        y = i;
                        break;
                }

                // if next tile's color is the same as last tile's, increase occurrences and continue check, else select new color and set it's occurrences to 0
                if (tileColor && boardMap[y][x].color === tileColor) {
                    colorOccurrences++;

                    // if occurrences allow to clear axis; check how long this axis is, then clear it
                    if (colorOccurrences >= GameData.patternLength)
                        for (let k = 0; k < arrDirectionSecond; k++) { // todo: optimize - create list of last tiles; if new tile is encountered, clear it
                            // check if tile out of index && check if there are another tiles in axis
                            if (direction === 'column' && y - (GameData.patternLength - 1) + k < arrDirectionSecond && boardMap[y - (GameData.patternLength - 1) + k][x].color === tileColor)
                                !tilesToPurge.includes(boardMap[y - (GameData.patternLength - 1) + k][x]) ? tilesToPurge.push(boardMap[y - (GameData.patternLength - 1) + k][x]) : null;
                            else if (direction === 'row' && x - (GameData.patternLength - 1) + k < arrDirectionSecond && boardMap[y][x - (GameData.patternLength - 1) + k].color === tileColor)
                                !tilesToPurge.includes(boardMap[x - (GameData.patternLength - 1) + k][y]) ? tilesToPurge.push(boardMap[y][x - (GameData.patternLength - 1) + k]) : null;
                            else
                                break;
                        }
                } else {
                    colorOccurrences = 1;
                    tileColor = boardMap[y][x].color;
                }
            }
        }

        return tilesToPurge;
    }

    /**
     * Searches for balls that can be in a slant.
     * @param boardMap - board map.
     * @param x - horizontal coordinate of slant's start.
     * @param y - vertical coordinate of slant's start.
     * @param direction - direction towards which slant is leaning.
     * @return tilesArr - list of all balls that can be deleted in a slant.
     */
    checkSlant(boardMap: BoardMap, x: number, y: number, direction: 1 | -1): BoardMapTileData[] {
        let tilesToPurge: BoardMapTileData[] = [];

        let colorOccurrences: number = 1;

        let tile: BoardMapTileData = boardMap[y][x];
        let tileColor: string = tile.color;

        let pushNext = false;
        let tilesList: BoardMapTileData[] = [tile];

        let loopEngine = direction === 1 ? x < this.board.width - 1 : x > 0
        while (loopEngine) {
            // overflow safety
            if (x + direction > this.board.width - 1 || x + direction < 0 || y + 1 > this.board.height - 1)
                break;

            let nextTile = boardMap[y + 1][x + direction];
            if (tileColor && tileColor === nextTile.color) {
                colorOccurrences++;

                tilesList.push(nextTile);

                if (colorOccurrences >= GameData.patternLength)
                    pushNext = true;
            } else {
                colorOccurrences = 1;
                tile = boardMap[y + 1][x + direction];
                tileColor = tile.color;
                tilesList = [tile];
            }

            if (pushNext) {
                pushNext = false;
                tilesToPurge = tilesToPurge.concat(tilesList);
                tilesList = [];
            }

            direction === 1 ? x++ : x--;
            y++;
        }

        return tilesToPurge;
    }

    /**
     * Searches for balls that can be in all slants.
     * @param boardMap - board map.
     * @return tilesArr - list of all balls that can be deleted in all slants.
     */
    checkSlants(boardMap: BoardMap): BoardMapTileData[] {
        let tilesToPurge: BoardMapTileData[] = [];

        for (let i = 0; i < this.board.height; i++)
            for (let j = 0; j < this.board.width; j++)
                tilesToPurge = tilesToPurge.concat(this.checkSlant(boardMap, j, i, 1));

        for (let i = 0; i < this.board.height; i++)
            for (let j = this.board.width - 1; j > 0; j--)
                tilesToPurge = tilesToPurge.concat(this.checkSlant(boardMap, j, i, -1));

        return tilesToPurge;
    }
}