<h1 >
    Orbs Game
</h1>

<h3>
    Description
</h3>
<hr>
<p>
    Simple web browser based game to pass prolonged time.
</p>

<h3>
    How to run
</h3>
<hr>
<ol>
    <li>Install latest version of Node.js</li>
    <li>Install dependencies with <code>npm install</code></li>
    <li>Build project with <code>npm run prod</code></li>
    <li>Open <code>index.html</code> from <code>dist</code> directory</li>
</ol>

<h3>
    How to play
</h3>
<hr>
<p>
    You must put three or more orbs (of the same colors) in a row to score points.
    Layout is absolutely unlimited as long as it is a row, so horizontal, vertical and diagonal arrangement is allowed.
    To move an orb, you simply click on it and hover your mouse on to the new placement, click again 
</p>

<h3>
    Optional config
</h3>
<hr>
<p>
    You can customize your game a bit by changing values of the GameData variable in <code>src/config.ts</code> file.
</p>

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

<h3>
    Scripts
</h3>
<hr>
<ul>
    <li><code>dev</code> - compiles typescript files in development mode and watches for changes</li>
    <li><code>docs</code> - creates documentation from JSDoc</li>
    <li><code>prod</code> - compiles typescript files in production mode</li>
    <li><code>serve</code> - runs a Webpack development server</li>
</ul>