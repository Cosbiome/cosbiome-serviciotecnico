module.exports = {
  webpack: {
    configure: {
      target: "electron-renderer",
      optimization: {
        minimize: false,
      },
    },
  },
};
