const path = require("path");
const fs = require("fs");

// src 直下のディレクトリ一覧を取得する関数
const getEntries = () => {
  const srcPath = path.resolve(__dirname, "src");
  const entries = {};

  // src 内のファイル/フォルダをループ
  fs.readdirSync(srcPath).forEach((dir) => {
    const indexPath = path.join(srcPath, dir, "index.ts");

    // index.ts が存在するフォルダだけをエントリーに追加
    if (fs.existsSync(indexPath)) {
      // 例: { "179_main": "./src/179/index.ts" } という形式を作る
      entries[`${dir}_main`] = `./src/${dir}/index.ts`;
    }
  });

  return entries;
};
module.exports = {
  mode: "development", // デバッグ中は 'production' から 'development' に変更
  devtool: "eval-source-map",
  entry: getEntries(), // 最初の読み込みファイル
  output: {
    filename: "[name].js", // kintoneにアップロードするファイル名
    path: path.resolve(__dirname, "dist"), // 出力先ディレクトリ
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
