import Board from './Board';
import { BoardData, Coordinates, EndPoints, BoardTile } from '../types/interfaces';
import { BoardTilesTypes } from '../types/consts';

console.log('Loaded: Renderer.ts');


/**
 * Class that renders all DOM operation, inputs and game output.
 */
export default class Renderer {
    /** Data about the board. */
    private readonly board: BoardData;

    /** Don't render path before selecting start flag. */
    private renderPathFlag: boolean;
    /** Selected start tile. */
    private selectedStart: HTMLTableCellElement | null;

    /** Data about start and finish points. */
    private readonly endPoints: EndPoints;
    /** Last path that was rendered on the board. */
    private lastRenderedPath: Coordinates[];

    /**
     * Creates new renderer for board.
     * @param board - board instance that will allow using dynamic board data.
     * @param height - board height.
     * @param width - board width.
     */
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
     * Clears recently rendered path between points.
     * @private
     */
    private clearLastRenderedPath(): void {
        for (let i = 0; i < this.lastRenderedPath.length; i++) {
            let pathTile = document.querySelector(`[data-x="${this.lastRenderedPath[i].x}"][data-y="${this.lastRenderedPath[i].y}"]`);
            pathTile.classList.remove('ball--path');
        }

        this.lastRenderedPath = [];
    }

    /**
     * Generates new DOM board with height and width set in class object.
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
     * Renders balls on the DOM board.
     */
    renderBallsDOM(obstaclesArr: BoardTile[]): void {
        for (let i = 0; i < obstaclesArr.length; i++) {
            let ballData = obstaclesArr[i];
            let ball = document.createElement('div');

            ball.classList.add('ball', 'ball-color--' + ballData.color);
            document.querySelector(`[data-x="${ballData.x}"][data-y="${ballData.y}"]`).appendChild(ball);
        }
    }

    /**
     * Renders path between start set in class object and specified tile.
     * @private
     * @param tile - end point of path.
     */
    private renderPath(tile: HTMLTableCellElement): void {
        this.clearLastRenderedPath();

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
     * Sets all events for board tile.
     * @private
     * @param tile - board tile to set events for.
     */
    private setTileEvents(tile: HTMLTableCellElement): void {
        tile.onclick = () => {
            if (!this.selectedStart && this.board.instance.getBoardMapTile(parseInt(tile.dataset.x), parseInt(tile.dataset.y)).type !== BoardTilesTypes.none) {
                this.endPoints.start = {
                    x: parseInt(tile.dataset.x),
                    y: parseInt(tile.dataset.y)
                };

                this.renderPathFlag = true;

                if (this.selectedStart)
                    this.selectedStart.children[0].classList.remove('ball--selected');

                this.selectedStart = tile;
                tile.children[0].classList.add('ball--selected');
            } else if (this.selectedStart && this.board.instance.getBoardMapTile(parseInt(tile.dataset.x), parseInt(tile.dataset.y)).type !== BoardTilesTypes.none) {
                this.endPoints.start = {
                    x: parseInt(tile.dataset.x),
                    y: parseInt(tile.dataset.y)
                };

                this.selectedStart.children[0].classList.remove('ball--selected');

                this.selectedStart = tile;
                tile.children[0].classList.add('ball--selected');
            } else if (this.selectedStart && this.board.instance.getBoardMapTile(parseInt(tile.dataset.x), parseInt(tile.dataset.y)).type === BoardTilesTypes.none) {
                this.endPoints.finish = {
                    x: parseInt(tile.dataset.x),
                    y: parseInt(tile.dataset.y)
                };

                if (this.board.instance.getPath(this.endPoints).length === 0)
                    return this.endPoints.finish = null;

                this.renderPathFlag = false;

                this.selectedStart.children[0].classList.remove('ball--selected');
                this.selectedStart = null;

                if (this.board.instance.moveBall(this.endPoints)) {
                    let startDOM = document.querySelector(`[data-x="${this.endPoints.start.x}"][data-y="${this.endPoints.start.y}"]`);
                    document.querySelector(`[data-x="${this.endPoints.finish.x}"][data-y="${this.endPoints.finish.y}"]`).appendChild(startDOM.firstChild);

                    this.selectedStart = null;
                    this.clearLastRenderedPath();
                }
            }
        };

        tile.onmouseenter = () => {
            if (this.renderPathFlag)
                this.renderPath(tile);
        };

        tile.onmouseout = () => {
            if (this.renderPathFlag)
                this.clearLastRenderedPath();
        };
    }
}