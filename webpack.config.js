const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const path = require('path');
const polyfill = require("babel-polyfill");
console.log(__dirname)
module.exports = {
    devtool: 'eval',
    plugins: [
        new CleanWebpackPlugin(['public']),
        new Webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({
            title: 'DH - D3',
            hash: true,
            template: './src/index.html'
        }),
        new ExtractTextPlugin({
            filename: 'css/styles.css',
            allChunks: true
        }),
        new Webpack.optimize.UglifyJsPlugin({
            test: /\.js($|\?)/i,
            sourceMap: false,
            parallel: true,
        })
    ],
    entry:["babel-polyfill", './src/js/index.js'] ,
    output: {
        path: path.join(__dirname, './public'),
        filename: 'js/bundle.js',
        pathinfo: true
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{ loader: 'css-loader' },
                        {
                            loader: 'postcss-loader', options:
                                {
                                    ident: 'postcss',
                                    plugins: () => [Autoprefixer(),]
                                },
                        },
                        {loader: "sass-loader"}]
                })
            },
            {
                test: /\.js/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.(png|svg|jp?g|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    }
};