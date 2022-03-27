const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode:'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
    },
    plugins: [new HtmlWebpackPlugin({
        title: 'My App',
        filename: 'index.html'
    })],
};