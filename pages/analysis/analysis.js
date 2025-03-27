// 答案解析页面
const { getAnswerAnalysis } = require('../../utils/analysisUtil');
const icons = require('../../utils/icons');

Page({
  data: {
    icons: icons,
    answer: "",
    isLoading: true,
    analysisSource: '', // 'ai', 'local', 或 'default'
    analysis: {
      core: "",
      manifestation: "",
      solution: "",
      tips: ""
    },
    expandStatus: {
      manifestation: true,
      solution: true
    }
  },

  onLoad: function(options) {
    // 从路由参数获取答案
    if (options.answer) {
      const answer = decodeURIComponent(options.answer);
      this.setData({
        answer: answer,
        isLoading: true
      });
      
      // 获取解析内容
      this.getAnalysisContent(answer);
    }
  },

  // 获取解析内容
  getAnalysisContent: async function(answer) {
    try {
      // 添加日志，显示当前查找的答案
      console.log('正在获取解析，答案文本:', answer);
      
      // 获取解析内容
      const result = await getAnswerAnalysis(answer);
      console.log('获取到的解析结果:', result);
      
      if (result.success) {
        this.setData({
          analysis: result.data,
          isLoading: false,
          analysisSource: result.source
        });
        console.log('解析内容已设置到页面，来源:', result.source);
      } else {
        // 处理错误情况
        console.error('获取解析失败:', result.error);
        wx.showToast({
          title: result.error || '获取解析失败',
          icon: 'none',
          duration: 2000
        });
        this.setData({
          isLoading: false
        });
      }
    } catch (error) {
      console.error(`获取解析内容失败: ${error.message}`);
      wx.showToast({
        title: '获取解析失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        isLoading: false
      });
    }
  },
  
  // 切换展开/折叠状态
  toggleSection: function(e) {
    const section = e.currentTarget.dataset.section;
    const key = `expandStatus.${section}`;
    this.setData({
      [key]: !this.data.expandStatus[section]
    });
  },
  
  // 导航返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 用户点击右上角分享
  onShareAppMessage: function() {
    return {
      title: `答案之书 - ${this.data.answer}`,
      path: `/pages/analysis/analysis?answer=${encodeURIComponent(this.data.answer)}`
    };
  }
}); 