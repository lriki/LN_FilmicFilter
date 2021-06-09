
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
//const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const METADATA = fs.readFileSync("./plugin-description.txt").toString();

module.exports = {
    mode: 'production',
    //mode: 'development',
    entry: './ts/index.ts',
    target: 'node',
    output: {
        path: __dirname,
        filename: './js/plugins/LN_FilmicFilter.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        
        //plugins: [new TsconfigPathsPlugin( { configFile: 'tsconfig.json' } )]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
            // For glsl import
            {
                test: /.(vert|frag)$/,
                use: 'raw-loader',
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    output: {
                        beautify: false,
                        preamble: METADATA,
                    },
                },
            }),
        ],
    },
    plugins: [
        new webpack.BannerPlugin(
            {
                banner: METADATA,
                raw: true,
                entryOnly: true
            }
        )
    ]
}
