const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = function override(config, env) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    vm: require.resolve("vm-browserify"),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ]);
  config.resolve.extensions.push(".mjs");
  config.module.rules.push({
    test: /\.m?js/,
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
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `npm.${packageName.replace("@", "")}`;
          },
        },
      },
    };
  }

  return config;
};
