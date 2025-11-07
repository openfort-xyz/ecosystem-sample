const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = function override(config, env) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    vm: require.resolve("vm-browserify"),
    buffer: require.resolve("buffer/"),
    http: false,
    https: false,
    zlib: false,
    url: false,
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);
  config.resolve.extensions.push(".mjs");
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });
  
  // Handle ESM packages
  config.module.rules.push({
    test: /\.m?js$/,
    include: /node_modules/,
    type: 'javascript/auto',
    resolve: {
      fullySpecified: false,
    },
  });
  if (env === "production") {
    // Disable source maps in production
    config.devtool = false;

    // Optimize CSS
    config.optimization.minimizer.push(
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
          output: {
            comments: false,
          },
        },
      })
    );

    // Aggressive code splitting
    config.optimization.splitChunks = {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            if (!module.context) {
              return 'npm.vendor';
            }
            const match = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            );
            if (!match || !match[1]) {
              return 'npm.vendor';
            }
            const packageName = match[1];
            return `npm.${packageName.replace("@", "")}`;
          },
        },
      },
    };
  }

  return config;
};

