import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import config from './webpack.config.js';

// Are we in production?
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // Run webpack in production mode
  webpack(config, (err, stats) => {
    if (err) {
      console.error('Webpack build error:', err);
      process.exit(1);
    }
    
    console.log(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    }));
    
    if (stats.hasErrors()) {
      console.error('Webpack stats error');
      process.exit(1);
    }
    
    console.log('Webpack build completed successfully!');
  });
} else {
  // Run webpack-dev-server in development mode
  const compiler = webpack(config);
  const devServerOptions = { ...config.devServer, open: false };
  const server = new WebpackDevServer(devServerOptions, compiler);
  
  const runServer = async () => {
    console.log('Starting webpack dev server...');
    await server.start();
  };
  
  runServer().catch(err => {
    console.error('Failed to start webpack dev server:', err);
    process.exit(1);
  });
}