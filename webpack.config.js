const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function getExampleLinks() {
  const examplesDir = path.resolve(__dirname, 'src/tasks');
  const links = [];

  function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        traverseDir(fullPath);
      } else if (file.endsWith('.html')) {
        const relativePath = path.relative(examplesDir, fullPath);
        const category = dir.split('/').slice(-2, -1)[0];
        const creationDate = new Date(stat.birthtime).toISOString().split('T')[0];

        links.push({
          category,
          creationDate,
          url: `/examples/${relativePath.replace(/\\/g, '/')}`,
          title: dir.split('/').pop().replace(/-/g, ' '),
        });
      }
    });
  }

  traverseDir(examplesDir);
  return links.sort((a, b) => b.creationDate.localeCompare(a.creationDate));
}

function getExampleEntries() {
  const examplesDir = path.resolve(__dirname, 'src/tasks');
  const entries = {};

  function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        traverseDir(fullPath);
      } else if (file.endsWith('.ts')) {
        const relativePath = path.relative(examplesDir, fullPath);
        const name = path.basename(file, '.ts');
        entries[`examples/${relativePath.replace(/\\/g, '/').replace('.ts', '')}`] = fullPath;
      }
    });
  }

  traverseDir(examplesDir);
  return entries;
}

module.exports = {
  entry: {
    main: './src/index.ts',
    ...getExampleEntries(),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      return pathData.chunk.name === 'main' ? 'index.js' : '[name].js';
    },
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      chunks: ['main'],
      templateParameters: {
        examplesLinks: getExampleLinks(),
      },
    }),
    ...Object.keys(getExampleEntries()).map((entry) => {
      return new HtmlWebpackPlugin({
        template: `./src/tasks/${entry.replace('examples/', '')}.html`,
        filename: `examples/${entry.replace('examples/', '')}.html`,
        inject: 'body',
        chunks: [entry],
      });
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, 'src/tasks'),
        publicPath: '/examples',
      },
      {
        directory: path.resolve(__dirname, 'src'),
        publicPath: '/',
      },
    ],
    watchFiles: ['src/tasks/**/*.ts', 'src/tasks/**/*.html', 'src/styles.css'],
    port: 8080,
    hot: true,
    historyApiFallback: true,
  },
  mode: 'development',
};
