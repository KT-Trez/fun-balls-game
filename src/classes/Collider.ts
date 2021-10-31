import {ColliderInterface} from '../types/classInterfaces';
import {BoardData, BoardMapTileData} from '../types/interfaces';
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
    checkAllAxis(boardMap: BoardMapTileData[]): BoardMapTileData[] {
        let tilesToPurge: BoardMapTileData[] = [];

        // check columns and rows
        tilesToPurge = tilesToPurge.concat(this.checkAxis(boardMap, 'column'));
        tilesToPurge = tilesToPurge.concat(this.checkAxis(boardMap, 'row'));

        // check slants
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
    checkAxis(boardMap: BoardMapTileData[], direction: 'column' | 'row'): BoardMapTileData[] {
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
            // select tile, it's color and set color's occurrences
            let colorOccurrences = 0;

            let tile: BoardMapTileData = direction === 'column' ? boardMap[0][i] : boardMap[i][0];
            let tileColor: string = tile.color;

            // set flag that checks if tilesList should be merged with tilesToPurge
            let pushNext = false;
            let tilesList: BoardMapTileData[] = [];

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

                // select next tile, check if it has the same color as last; increase color occurrences and continue check or else select new color and repeat
                let nextTile = boardMap[y][x];
                if (tileColor && nextTile.color === tileColor) {
                    colorOccurrences++;

                    tilesList.push(nextTile);

                    // set merging flag to true, when occurrences match set length
                    if (colorOccurrences >= GameData.patternLength)
                        pushNext = true;
                } else {
                    // reset all values
                    colorOccurrences = 1;
                    tile = boardMap[y][x]
                    tileColor = tile.color;

                    pushNext = false;
                    tilesList = [tile];
                }

                // merge tilesList to tilesToPurge
                if (pushNext)
                    tilesToPurge = tilesToPurge.concat(tilesList);
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
     * @param max - max height or width that loop will iterate over.
     * @return tilesArr - list of all balls that can be deleted in a slant.
     */
    checkSlant(boardMap: BoardMapTileData[], x: number, y: number, direction: 1 | -1, max: number): BoardMapTileData[] {
        let tilesToPurge: BoardMapTileData[] = [];

        // select tile, it's color and set color's occurrences
        let colorOccurrences: number = 1;

        let tile: BoardMapTileData = boardMap[y][x];
        let tileColor: string = tile.color;

        // set flag that checks if tilesList should be merged with tilesToPurge
        let pushNext = false;
        let tilesList: BoardMapTileData[] = [tile];

        while (max) {
            // overflow safety
            if (x + direction > this.board.width - 1 || x + direction < 0 || y + 1 > this.board.height - 1)
                break;

            // select next tile, check if it has the same color as last; increase color occurrences and continue check or else select new color and repeat
            let nextTile = boardMap[y + 1][x + direction];
            if (tileColor && tileColor === nextTile.color) {
                colorOccurrences++;

                tilesList.push(nextTile);

                // set merging flag to true, when occurrences match set length
                if (colorOccurrences >= GameData.patternLength)
                    pushNext = true;
            } else {
                // reset all values
                colorOccurrences = 1;
                tile = boardMap[y + 1][x + direction];
                tileColor = tile.color;
                tilesList = [tile];
            }

            // merge tilesList to tilesToPurge
            if (pushNext) {
                pushNext = false;
                tilesToPurge = tilesToPurge.concat(tilesList);
                tilesList = [];
            }

            // increment coordinates values
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
    checkSlants(boardMap: BoardMapTileData[]): BoardMapTileData[] {
        let tilesToPurge: BoardMapTileData[] = [];

        for (let i = 0; i < this.board.width - (GameData.patternLength - 1); i++) {
            tilesToPurge = tilesToPurge.concat(this.checkSlant(boardMap, i, 0, 1, this.board.width - 1));
            tilesToPurge = tilesToPurge.concat(this.checkSlant(boardMap, this.board.width - 1, this.board.height - GameData.patternLength - i, -1, this.board.height - 1));
        }

        for (let i = 0; i < this.board.height; i++) {
            tilesToPurge = tilesToPurge.concat(this.checkSlant(boardMap, 0, i, 1, this.board.width - 1));
            tilesToPurge = tilesToPurge.concat(this.checkSlant(boardMap, i, 0, -1, this.board.height - 1));
        }

        return tilesToPurge;
    }
}