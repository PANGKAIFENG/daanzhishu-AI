// 答案解析页面
const { getAnswerAnalysis } = require('../../utils/analysisUtil');
const icons = require('../../utils/icons');

Page({
  data: {
    icons: icons,
    answer: "",
    isLoading: true,
    usingDefault: false,
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
  getAnalysisContent: function(answer) {
    try {
      // 添加日志，显示当前查找的答案
      console.log('正在获取解析，答案文本:', answer);
      
      // 同步获取解析内容
      const analysis = getAnswerAnalysis(answer);
      console.log('获取到的解析内容:', analysis ? '找到解析' : '未找到解析');
      
      if (analysis) {
        this.setData({
          analysis: analysis,
          isLoading: false,
          usingDefault: false
        });
        console.log('解析内容已设置到页面');
      } else {
        // 默认解析，当没有找到匹配的解析时使用
        console.log('未找到匹配解析，使用默认解析');
        this.setData({
          analysis: {
            core: "这个答案需要你根据自身情况来理解。以下是一些通用的思考方向。",
            manifestation: "• 这可能表现为对现状的不满\n• 对未来的不确定感\n• 内心期望与现实的差距\n• 需要做出重要决定的时刻\n• 希望找到更好的解决方案",
            solution: "• 列出当前情况的优缺点\n• 设定明确可行的小目标\n• 尝试改变视角看问题\n• 寻求可信赖的人建议\n• 给自己留出思考的时间和空间\n• 记录下当前的想法，未来再回顾",
            tips: "记住，每个人都有迷茫和困惑的时候。重要的是保持开放的心态，相信自己的判断，同时也要勇于接受变化和挑战。"
          },
          isLoading: false,
          usingDefault: true
        });
      }
    } catch (error) {
      console.error(`获取解析内容失败: ${error.message}`);
      this.setData({
        analysis: {
          core: "抱歉，获取解析内容时出现了问题。请尝试返回后重新进入。",
          manifestation: "",
          solution: "",
          tips: "如果问题持续存在，请尝试重启小程序。"
        },
        isLoading: false,
        usingDefault: true
      });
    }
  },
  
  // 导航返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 用户点击右上角分享
  onShareAppMessage: function() {
    return {
      title: `解忧杂货铺 - ${this.data.answer}`,
      path: `/pages/analysis/analysis?answer=${encodeURIComponent(this.data.answer)}`
    };
  }
}); 