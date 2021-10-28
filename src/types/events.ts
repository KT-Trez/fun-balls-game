import { BoardMapTile } from './interfaces';

/** Custom Event fired when balls are deleted. */
export interface DeletedBallsEvent extends CustomEvent {
    detail: {
        /** Deleted balls. */
        balls: BoardMapTile[];
        /** Points earned from move. */
        points: number;
    };
}

/** Custom Event fired when new balls are generated on the board. */
export interface GeneratedBallsEvent extends CustomEvent {
    /** Generated balls. */
    detail: BoardMapTile[];
}

/** Custom Event fired when balls color preview is generated. */
export interface PreviewedBallsEvent extends CustomEvent {
    /** Generated colors of next balls. */
    detail: string[];
}