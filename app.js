// app.js
App({
  onLaunch: function () {
    // 初始化全局数据
    this.globalData = {
      userInfo: null,
      currentAnswer: '',
      currentQuestion: '',
      historyAnswers: [],
      isRareAnswer: false,
      aiSupported: false,
      aiExtendSupported: false
    };
    
    // 检查基础库版本
    const sdkVersion = wx.getSystemInfoSync().SDKVersion;
    console.log('当前基础库版本:', sdkVersion);
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-6g0h9t3t6fef0dd2',
        traceUser: true,
      });
      console.log('云开发环境初始化成功');
      
      // 初始化 AI 能力 - 使用 wx.cloud.extend.AI 尝试不同的初始化方式
      try {
        // 尝试方式1：使用extend.AI
        if (wx.cloud.extend && wx.cloud.extend.AI) {
          console.log('使用 wx.cloud.extend.AI 初始化 AI 能力');
          this.globalData.aiExtendSupported = true;
        } 
        // 尝试方式2：使用cloud.ai()
        else if (typeof wx.cloud.ai === 'function') {
          const ai = wx.cloud.ai();
          console.log('使用 wx.cloud.ai() 初始化 AI 能力成功');
          this.globalData.aiSupported = true;
        } else {
          console.log('当前环境不支持直接调用AI能力，将使用云函数方式');
        }
      } catch (error) {
        console.error('AI 能力初始化失败:', error);
        console.log('将使用云函数方式调用AI');
      }
    }
  }
}); 