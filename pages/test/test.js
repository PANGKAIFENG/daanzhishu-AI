Page({
  data: {
    testAnswers: [
      "换个角度想，如果三年后这事根本不重要，那现在也别太纠结",  // 实用建议类
      "答案不在远方，而在脚下的每一步",  // 人生哲理类
      "这事靠谱，但你不一定靠谱🤔",  // 幽默反转类
      "你比99%的人都强，剩下1%都在装",  // 励志但带点皮的
      "人间不值得，但有外卖和奶茶🧋"  // 流行文化引用类
    ],
    currentTestIndex: 0,
    testResults: [],
    isLoading: false
  },

  // 测试下一个答案
  testNextAnswer: function() {
    if (this.data.isLoading) return;
    
    const currentAnswer = this.data.testAnswers[this.data.currentTestIndex];
    
    this.setData({ isLoading: true });
    
    wx.cloud.callFunction({
      name: 'analyzeAnswer',
      data: {
        answer: currentAnswer
      }
    }).then(res => {
      let results = this.data.testResults;
      results.push({
        answer: currentAnswer,
        result: res.result,
        timestamp: new Date().toLocaleString()
      });
      
      this.setData({
        testResults: results,
        currentTestIndex: (this.data.currentTestIndex + 1) % this.data.testAnswers.length,
        isLoading: false
      });
    }).catch(err => {
      console.error(err);
      let results = this.data.testResults;
      results.push({
        answer: currentAnswer,
        error: err.message,
        timestamp: new Date().toLocaleString()
      });
      
      this.setData({
        testResults: results,
        currentTestIndex: (this.data.currentTestIndex + 1) % this.data.testAnswers.length,
        isLoading: false
      });
    });
  },

  // 清除测试结果
  clearResults: function() {
    this.setData({
      testResults: [],
      currentTestIndex: 0
    });
  }
}); 