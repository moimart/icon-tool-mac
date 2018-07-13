'use strict';
const path = require('path');

module.exports = [{
    target: 'node',
    mode: "production",
    externals: [
      /^[a-z\-0-9]+$/ // Ignore node_modules folder
    ],
    output: {
        filename: 'index.js', // output file
        path: path.join(__dirname,"/build"),
        libraryTarget: "commonjs"
    },
    entry: './index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ],
        modules: [
            path.join(__dirname,"/node_modules"),
            'node_modules'
        ]
    }
},
{
    target: 'node',
    mode: "production",
    externals: [
      /^[a-z\-0-9]+$/ // Ignore node_modules folder
    ],
    output: {
        filename: 'index.js', // output file
        path: __dirname,
        libraryTarget: "commonjs"
    },
    entry: './lib/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ],
        modules: [
            path.join(__dirname,"/node_modules"),
            'node_modules'
        ]
    }
}]
