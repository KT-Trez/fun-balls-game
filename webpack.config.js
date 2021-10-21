const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: {
        app: './src/app.ts'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i, loader: "file-loader", options: {
                    name: './images/[name].[hash].[ext]',
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        clean: true,
        path: path.join(__dirname, './build'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            title: 'The Great Balls Game',
            template: path.join(__dirname, './src/index.html')
        }),
        new MiniCssExtractPlugin({
            filename: 'master.css'
        })
    ],
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    watch: true
};