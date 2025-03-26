// about.js
import { getTotalAnswersCount, getAnswersCountByCategory } from '../../utils/answerUtil.js';

Page({
  data: {
    totalAnswers: 0,
    version: '0.1',
    categories: []
  },

  onLoad() {
    // 从工具函数获取答案统计
    const util = require('../../utils/answerUtil.js');
    
    this.setData({
      totalAnswers: util.getTotalAnswersCount(),
      categories: util.getAnswersCountByCategory()
    });
  },
  
  // 返回首页
  onTapBack() {
    wx.navigateBack();
  }
}); 