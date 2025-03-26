// 数据加载器页面
const { analysisDatabase } = require('../analysisData');

Page({
  data: {
    loaded: false
  },
  onLoad: function() {
    // 这个页面仅用于加载数据分包
    // 实际上不会被用户直接访问
    
    try {
      // 将数据注册到全局
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.analysisDatabase = analysisDatabase;
        console.log('分包数据已注册到全局');
      } else {
        console.error('无法访问全局App实例');
      }
      
      this.setData({
        loaded: true
      });
    } catch (e) {
      console.error('数据加载器初始化失败', e);
      this.setData({
        loaded: true,
        error: e.message
      });
    }
  }
}) 