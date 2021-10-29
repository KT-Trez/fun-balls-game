import {ColliderInterface} from '../types/classInterfaces';
import {BoardData, BoardMap, BoardMapTileData} from '../types/interfaces';
import {GameData} from '../types/consts';
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

    checkAllAxis(boardMap: BoardMap): BoardMapTileData[] {
        let tilesToPurge: BoardMapTileData[] = [];

        // check columns and rows
        tilesToPurge = tilesToPurge.concat(this.checkAxis(boardMap, 'column'));
        tilesToPurge = tilesToPurge.concat(this.checkAxis(boardMap, 'row'));

        // // check slants // todo: fix that shit
        // this.checkSlants(boardMap);

        // remove duplicates
        tilesToPurge = Tools.removeArrayDuplicates(tilesToPurge);

        return tilesToPurge;
    }

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
                    if (colorOccurrences >= GameData.lineToKillLength)
                        for (let k = 0; k < arrDirectionSecond; k++) { // todo: optimize - create list of last tiles; if new tile is encountered, clear it
                            // check if tile out of index && check if there are another tiles in axis
                            if (direction === 'column' && y - (GameData.lineToKillLength - 1) + k < arrDirectionSecond && boardMap[y - (GameData.lineToKillLength - 1) + k][x].color === tileColor)
                                !tilesToPurge.includes(boardMap[y - (GameData.lineToKillLength - 1) + k][x]) ? tilesToPurge.push(boardMap[y - (GameData.lineToKillLength - 1) + k][x]) : null;
                            else if (direction === 'row' && x - (GameData.lineToKillLength - 1) + k < arrDirectionSecond && boardMap[y][x - (GameData.lineToKillLength - 1) + k].color === tileColor)
                                !tilesToPurge.includes(boardMap[x - (GameData.lineToKillLength - 1) + k][y]) ? tilesToPurge.push(boardMap[y][x - (GameData.lineToKillLength - 1) + k]) : null;
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

    checkSlants(boardMap: BoardMap): BoardMapTileData[] {
        let tilesToPurge: BoardMapTileData[] = [];

        let x = 0;
        let y = 0;

        let colorOccurrences: number = 1;

        let tile: BoardMapTileData = boardMap[y][x];
        let tileColor: string = tile.color;

        let pushNext = false;
        let tilesList: BoardMapTileData[] = [tile];
        while (y < this.board.height - 1) {
            while (x < this.board.width - 1) {
                tilesList.push(tile);

                let nextTile = boardMap[y + 1][x + 1];
                if (tileColor && tileColor === nextTile.color) {
                    colorOccurrences++;
                    tilesList.push(nextTile);

                    if (colorOccurrences >= GameData.lineToKillLength)
                        pushNext = true;


                } else {
                    colorOccurrences = 1;
                    tile = boardMap[y + 1][x + 1];
                    tileColor = tile.color;
                    tilesList = [tile];
                }

                if (pushNext) {
                    pushNext = false;
                    tilesToPurge = tilesToPurge.concat(tilesList);
                    tilesList = [];
                }

                x++;
                y++;
            }
        }

        return tilesToPurge;
    }
}