import Board from './Board';
import { BoardMap, BoardData, Coordinates, EndPoints } from '../types/interfaces';
import { BoardTilesTypes } from '../types/consts';

console.log('Loaded: Renderer.ts');


export default class Renderer {
    private readonly board: BoardData;

    private renderPathFlag: boolean;
    private selectedStart: HTMLTableCellElement | null;

    private readonly endPoints: EndPoints;

    private lastRenderedPath: Coordinates[];

    constructor(board: Board, height: number, width: number) {
        this.board = {
            height: height,
            instance: board,
            width: width
        };

        this.renderPathFlag = false;
        this.selectedStart = null;

        this.endPoints = {
            finish: null,
            start: null
        };

        this.lastRenderedPath = [];
    }

    private cleanLastRenderedPath(): void {
        for (let i = 0; i < this.lastRenderedPath.length; i++) {
            let pathTile = document.querySelector(`[data-x="${this.lastRenderedPath[i].x}"][data-y="${this.lastRenderedPath[i].y}"]`);
            pathTile.classList.remove('ball--path');
        }

        this.lastRenderedPath = [];
    }

    /**
     * Clears div with id 'js-display', and appends new content.
     * @param element - element that will be appended.
     */
    clearAndAppendDisplay(element: HTMLElement): void {
        let display = document.getElementById('js-display') as HTMLDivElement;

        while (display.firstChild)
            display.removeChild(display.firstChild);

        display.appendChild(element);
    }

    /**
     * Generates new DOM board with class instance's height and width.
     */
    renderBoardDOM(): void {
        let boardDOM: HTMLTableElement = document.createElement('table');
        boardDOM.classList.add('board');

        for (let i: number = 0; i < this.board.height; i++) {
            let row: HTMLTableRowElement = document.createElement('tr');

            for (let j: number = 0; j < this.board.width; j++) {
                let cell: HTMLTableCellElement = document.createElement('td');

                cell.classList.add('board__cell');
                cell.setAttribute('data-x', j.toString());
                cell.setAttribute('data-y', i.toString());
                this.setTileEvents(cell);

                row.appendChild(cell);
            }
            boardDOM.appendChild(row);
        }

        this.clearAndAppendDisplay(boardDOM);
    }

    /**
     * Renders obstacles on the DOM board.
     */
    renderObstaclesDOM(boardMap: BoardMap): void {

        for (let i = 0; i < boardMap.length; i++)
            for (let j = 0; j < boardMap[i].length; j++)
                if (boardMap[i][j].type === BoardTilesTypes.obstacle) {
                    let ball = document.createElement('div');
                    ball.classList.add('ball',  'ball-color--' + boardMap[i][j].color);

                    document.querySelector(`[data-x="${j}"][data-y="${i}"]`).appendChild(ball);
                }
    }

    private renderPath(tile: HTMLTableCellElement): void {
        this.cleanLastRenderedPath();

        let endpoints = {
            finish: {
                  x: parseInt(tile.dataset.x),
                  y: parseInt(tile.dataset.y)
              },
            start: this.endPoints.start
        };

        let path = this.board.instance.getPath(endpoints);
        this.lastRenderedPath = [...path];

        for (let i = 0; i < path.length; i++) {
            let pathTile = document.querySelector(`[data-x="${path[i].x}"][data-y="${path[i].y}"]`);
            pathTile.classList.add('ball--path');
        }
    }

    /**
     * Sets all events (mostly onclick) for board tile.
     * @private
     * @param tile - board tile.
     */
    private setTileEvents(tile: HTMLTableCellElement): void {
        tile.onclick = () => {
            if (!this.selectedStart && this.board.instance.getBoardMapTile(parseInt(tile.dataset.x), parseInt(tile.dataset.y)).type !== BoardTilesTypes.none) {
                this.renderPathFlag = true;

                if (this.selectedStart)
                    this.selectedStart.children[0].classList.remove('ball--selected');

                this.selectedStart = tile;
                tile.children[0].classList.add('ball--selected');

                this.endPoints.start = {
                    x: parseInt(tile.dataset.x),
                    y: parseInt(tile.dataset.y)
                };
            } else if (this.selectedStart && this.board.instance.getBoardMapTile(parseInt(tile.dataset.x), parseInt(tile.dataset.y)).type !== BoardTilesTypes.none) {
                this.selectedStart.children[0].classList.remove('ball--selected');

                this.selectedStart = tile;
                tile.children[0].classList.add('ball--selected');

                this.endPoints.start = {
                    x: parseInt(tile.dataset.x),
                    y: parseInt(tile.dataset.y)
                };
            } else if (this.selectedStart && this.board.instance.getBoardMapTile(parseInt(tile.dataset.x), parseInt(tile.dataset.y)).type === BoardTilesTypes.none) {
                this.renderPathFlag = false;

                this.selectedStart.children[0].classList.remove('ball--selected');
                this.selectedStart = null;

                this.endPoints.finish = {
                    x: parseInt(tile.dataset.x),
                    y: parseInt(tile.dataset.y)
                };

                this.board.instance.moveBall(this.endPoints);
            }
        };

        tile.onmouseenter = () => {
            if (this.renderPathFlag)
                this.renderPath(tile);
        };

        tile.onmouseout = () => {
            if (this.renderPathFlag)
                this.cleanLastRenderedPath();
        };
    }
}