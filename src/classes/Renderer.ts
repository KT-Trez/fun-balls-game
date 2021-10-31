import Board from './Board';
import {BoardData, Coordinates, EndPoints, BoardMapTile} from '../types/interfaces';
import {BoardTilesTypes} from '../types/consts';
import {DeletedBallsEvent, GameEndedEvent, GeneratedBallsEvent, PreviewedBallsEvent} from '../types/events';
import {RendererInterface} from '../types/classInterfaces';

console.log('Loaded: Renderer.ts');


/**
 * Class that renders all DOM operation, inputs and game output.
 */
export default class Renderer implements RendererInterface {
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
     * @private
     * @static
     * @param element - element that will be appended.
     */
    private static clearAndAppendDisplay(element: HTMLElement): void {
        let display = document.getElementById('js-display') as HTMLDivElement;
        while (display.firstChild)
            display.removeChild(display.firstChild);
        display.appendChild(element);
    }

    /**
     * Un-render balls that were deleted.
     * @private
     * @param balls - balls to un-render.
     */
    private static clearDeletedBalls(balls): void {
        for (let i = 0; i < balls.length; i++)
            document.querySelector(`[data-x="${balls[i].x}"][data-y="${balls[i].y}"]`).firstChild.remove();
    }

    /**
     * Clears recently rendered path between points.
     * @private
     * @param hasAfterimage - should afterimage of last path be rendered.
     * @param duration - duration of afterimage in ms.
     */
    private clearLastRenderedPath(hasAfterimage?: boolean, duration?: number): void {
        let copyLastRenderedPath = [...this.lastRenderedPath];
        for (let i = 0; i < copyLastRenderedPath.length; i++) {
            let pathTile = document.querySelector(`[data-x="${copyLastRenderedPath[i].x}"][data-y="${copyLastRenderedPath[i].y}"]`);

            if (!hasAfterimage )
                pathTile.classList.remove('ball--path');
            else {
                pathTile.classList.add('ball--path-afterimage');
                pathTile.classList.remove('ball--path');

                setTimeout(() => {
                    for (let i = 0; i < copyLastRenderedPath.length; i++)
                        pathTile.classList.remove('ball--path-afterimage');
                }, duration);
            }
        }

        this.lastRenderedPath = [];
    }

    /**
     * Generates new DOM board with height and width set in class object.
     */
    renderBoard(): void {
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

        Renderer.clearAndAppendDisplay(boardDOM);
    }

    /**
     * Renders balls on the DOM board.
     * @static
     * @private
     * @param ballsArr - balls to render.
     */
    private static renderBalls(ballsArr: BoardMapTile[]): void {
        for (let i = 0; i < ballsArr.length; i++) {
            let ballData = ballsArr[i];
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
     * Sets renders for board events.
     */
    setRenderForBoardEvents(): void {
        this.board.instance.eventInterface.addEventListener('deletedBalls', (event: DeletedBallsEvent) => {
            Renderer.clearDeletedBalls(event.detail.balls);

            let pointsCountDOM = document.getElementById('js-points-count');
            pointsCountDOM.innerText = (parseInt(pointsCountDOM.innerText) + event.detail.points).toString();
        });

        this.board.instance.eventInterface.addEventListener('gameEnded', (event: GameEndedEvent) => {
            this.clearLastRenderedPath();
            Renderer.renderBalls(event.detail.lastBalls);
            Array.from(document.getElementsByTagName('td')).forEach(tile => {
                tile.onclick = null;
                tile.onmouseenter = null;
                tile.onmouseout = null;
            });

            console.log('[INFO] Game lasted: ' + `${Math.round(event.detail.elapsedTime / 3600000 )}h ${Math.round(event.detail.elapsedTime / 60000)}m ${Math.round(event.detail.elapsedTime / 1000)}s`);
            alert('Koniec gry. Twój wynik to: ' + event.detail.points);
        });

        this.board.instance.eventInterface.addEventListener('generatedBalls', (event: GeneratedBallsEvent) => Renderer.renderBalls(event.detail));

        this.board.instance.eventInterface.addEventListener('previewedBalls', (event: PreviewedBallsEvent) => {
            let colorPreviewDOM = document.getElementById('js-color-preview');
            while (colorPreviewDOM.firstChild)
                colorPreviewDOM.removeChild(colorPreviewDOM.firstChild);

            for (let i = 0; i < event.detail.length; i++) {
                let ballDOM = document.createElement('div');
                ballDOM.className = 'ball ball-color--' + event.detail[i];
                colorPreviewDOM.appendChild(ballDOM);
            }
        });
    }

    /**
     * Sets all events for board tile.
     * @private
     * @param tile - board tile to set events for.
     */
    private setTileEvents(tile: HTMLTableCellElement): void {
        tile.onclick = () => {
            // check if tile can move anywhere
            // let tableAround = [{x: 0, y: -1}, {x: -1, y:0}, {x:1, y: 0}, {x: 0, y: -1}]; // todo: fix
            // let takenTiles = 0;
            //
            // for (let i = 0; i < tableAround.length; i++)
            //   if (parseInt(tile.dataset.x) + tableAround[i].x >= 0 && parseInt(tile.dataset.x) + tableAround[i].x < this.board.width && parseInt(tile.dataset.y) + tableAround[i].y >= 0 && parseInt(tile.dataset.y) + tableAround[i].y < this.board.height)
            //     this.board.instance.getBoardMapTile(parseInt(tile.dataset.x) + tableAround[i].x, parseInt(tile.dataset.y) + tableAround[i].y).type !== BoardTilesTypes.none ? takenTiles++ : null;
            //   else
            //     takenTiles++;
            //
            // if (takenTiles === 4)
            //   return;

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
            } else if (this.selectedStart === tile) {
                Object.assign(this.endPoints, {
                    start: null,
                    end: null
                });

                this.renderPathFlag = false;

                this.selectedStart.children[0].classList.remove('ball--selected');
                this.selectedStart = null;
            } else if(this.selectedStart && this.board.instance.getBoardMapTile(parseInt(tile.dataset.x), parseInt(tile.dataset.y)).type !== BoardTilesTypes.none) {
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

                let startDOM = document.querySelector(`[data-x="${this.endPoints.start.x}"][data-y="${this.endPoints.start.y}"]`);
                let finishDOM = document.querySelector(`[data-x="${this.endPoints.finish.x}"][data-y="${this.endPoints.finish.y}"]`);
                finishDOM.appendChild(startDOM.firstChild);

                if (this.board.instance.moveBall(this.endPoints)) {
                    this.selectedStart = null;
                    this.clearLastRenderedPath(true, 500);
                } else {
                    console.log('[ERROR] Corrupted move. Trying to restore last known layout.');
                    startDOM.appendChild(finishDOM.firstChild);
                }
            }
        };

        tile.oncontextmenu = (event) => {
            event.preventDefault();

            Object.assign(this.endPoints, {
                start: null,
                end: null
            });

            this.renderPathFlag = false;

            if (this.selectedStart) {
                this.selectedStart.children[0].classList.remove('ball--selected');
                this.selectedStart = null;
            }

            this.clearLastRenderedPath();
        };
        document.getElementById('js-display').oncontextmenu = tile.oncontextmenu;

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