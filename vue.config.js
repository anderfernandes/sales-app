module.exports = {
  devServer: {
    proxy: 'http://localhost:8080',
    public: 'http://10.51.150.214:8080'
  }
}