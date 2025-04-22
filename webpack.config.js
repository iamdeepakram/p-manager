import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if we're in production mode
const isProd = process.env.NODE_ENV === 'production';

// Configure the entry point
const entry = isProd 
  ? './client/src/main.tsx'
  : './client/src/main.tsx';

// Configure the webpack config
const config = {
  mode: isProd ? 'production' : 'development',
  entry,
  output: {
    path: path.resolve(__dirname, 'dist', 'public'),
    filename: isProd ? 'bundle.[contenthash].js' : 'bundle.js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@components': path.resolve(__dirname, 'client/src/components'),
      '@lib': path.resolve(__dirname, 'client/src/lib'),
      '@hooks': path.resolve(__dirname, 'client/src/hooks'),
      '@pages': path.resolve(__dirname, 'client/src/pages'),
      '@styles': path.resolve(__dirname, 'client/src/styles'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html',
      inject: true,
    }),
  ],
  // Development settings
  devtool: isProd ? false : 'inline-source-map',
};

// Export the configuration
export default config;