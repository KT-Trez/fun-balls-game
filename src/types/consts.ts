/** All colors of board tiles. */
export const BoardTilesColors = [
    {
        id: 'r',
        name: 'red'
    },
    {
        id: 'o',
        name: 'orange'
    },
    {
        id: 'y',
        name: 'yellow'
    },
    {
        id: 'g',
        name: 'green'
    },
    {
        id: 'c',
        name: 'cyan'
    },
    {
        id: 'b',
        name: 'blue'
    },
    {
        id: 'v',
        name: 'violet'
    }
]

/** Types of board tiles. */
export const BoardTilesTypes = {
    finish: 'f',
    none: '-',
    obstacle: 'x',
    start: 's'
}

/** Additional game data. */
export const GameData = {
    lineToKillLength: 5
}