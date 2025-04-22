import webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import { fileURLToPath } from 'url';
import path from 'path';
import config from '../webpack.config.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add hot module replacement settings for development
if (process.env.NODE_ENV !== 'production') {
  config.entry = [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    config.entry
  ]; 
  
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

// Create webpack compiler
const compiler = webpack(config);

export function setupWebpack(app) {
  if (process.env.NODE_ENV === 'production') {
    // In production, we serve static files built by webpack
    const staticPath = path.join(__dirname, '..', 'dist', 'public');
    return staticPath;
  } else {
    // In development, use webpack-dev-middleware and webpack-hot-middleware
    app.use(
      WebpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath || '/',
        stats: { colors: true }
      })
    );
    
    app.use(
      WebpackHotMiddleware(compiler, {
        log: console.log,
        path: '/__webpack_hmr',
        heartbeat: 10 * 1000
      })
    );
    
    return null;
  }
}