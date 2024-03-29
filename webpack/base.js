require("dotenv").config();
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
	mode: "development",
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: [/\.vert$/, /\.frag$/],
				use: "raw-loader",
			},
			{
				test: /\.(gif|png|jpe?g|svg|xml)$/i,
				use: "file-loader",
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin({
			root: path.resolve(__dirname, "../"),
		}),
		new webpack.DefinePlugin({
			CANVAS_RENDERER: JSON.stringify(true),
			WEBGL_RENDERER: JSON.stringify(true),
			PROCESS_ENV: JSON.stringify(process.env),
		}),
		new HtmlWebpackPlugin({
			template: "./index.html",
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "./assets",
					to: "./assets",
				},
			],
		}),
	],
	devServer: {
		port: 8090,
		disableHostCheck: true,
		host: "0.0.0.0"
	},
};
