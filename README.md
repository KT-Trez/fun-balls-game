# Orbs Game
Simple web browser based game to pass prolonged time.

# How to run
1. Install latest version of Node.js
2. Install dependencies with `npm install`
3. Build project with `npm run prod`
4. Open `index.html` from `dist` directory

# How to play
You must put three or more orbs (of the same colors) in a row to score points.
Layout is absolutely unlimited as long as it is a row, so horizontal, vertical and diagonal arrangement is allowed.
To move an orb, you simply click on it and hover your mouse on to the new placement, click again 

# Optional config
You can customize your game a bit by changing values of the GameData variable in [src/config.ts](./src/config.ts) file.

```js
const GameData = {
    // how long a row needs to be in order to score points
    patternLength: 3,
    // quantity of orbs you start the game with
    quantityOfInitialBalls: 3,
    // quantity of orbs you will get at the beginning of the new round
    quantityOfRoundBalls: 3
}
```

# Scripts
- `npm run dev` - compiles typescript files in development mode and watches for changes
- `npm run docs` - creates documentation from JSDoc
- `npm run prod` - compiles typescript files in production mode
- `npm run serve` - runs a Webpack development server
