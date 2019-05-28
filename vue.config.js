module.exports = {
  devServer: {
    proxy: 'http://localhost:8080',
    public: 'http://10.51.158.161:8080'
  }
}