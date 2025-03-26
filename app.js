// app.js
import logger from './utils/logUtil';

App({
  onLaunch() {
    // 初始化日志系统
    logger.init(false); // 禁用文件日志，避免文件系统错误
    logger.info('答案之书小程序启动');
    
    // 获取系统信息 - 使用新API替代已弃用的 wx.getSystemInfoSync
    try {
      // 使用新的API组合
      const deviceInfo = wx.getDeviceInfo();
      const appBaseInfo = wx.getAppBaseInfo();
      const windowInfo = wx.getWindowInfo();
      
      // 组合成兼容旧API的格式
      const systemInfo = {
        ...deviceInfo,
        ...appBaseInfo,
        windowWidth: windowInfo.windowWidth,
        windowHeight: windowInfo.windowHeight,
        screenWidth: windowInfo.screenWidth,
        screenHeight: windowInfo.screenHeight,
        pixelRatio: windowInfo.pixelRatio
      };
      
      this.globalData.systemInfo = systemInfo;
      logger.info(`设备信息: ${deviceInfo.brand} ${deviceInfo.model}, 系统版本: ${appBaseInfo.system}`);
    } catch (e) {
      logger.error('获取系统信息失败: ' + e.message);
    }
    
    // 初始化答案数据
    if (typeof this.initAnswerData === 'function') {
      this.initAnswerData();
    }
    
    // 直接加载解析数据到全局变量
    try {
      const analysisData = require('./utils/analysisDataFallback').analysisDatabase;
      this.globalData.analysisDatabase = analysisData;
      console.log('预加载解析数据成功，包含', Object.keys(analysisData).length, '个解析条目');
      console.log('解析条目列表:', Object.keys(analysisData).slice(0, 5));
    } catch (err) {
      console.error('预加载解析数据失败:', err);
    }
    
    // 尝试加载分包数据
    this.loadAnalysisData().then(data => {
      console.log('分包解析数据加载成功，包含', Object.keys(data).length, '个解析条目');
    }).catch(err => {
      console.error('分包解析数据加载失败:', err);
    });
  },
  
  // 初始化答案数据
  initAnswerData() {
    // 定义所有可能的答案
    const allAnswers = [
      "是的，毫无疑问。",
      "这是确定的。",
      "没有疑问，就是这样。",
      "是，绝对如此。",
      "你可以相信它。",
      "正如我所见，是的。",
      "很可能。",
      "前景很好。",
      "迹象指向是。",
      "答案模糊，请再试一次。",
      "稍后再问。",
      "现在不能预测。",
      "专注后再问。",
      "不要指望它。",
      "我的回答是否定的。",
      "我的消息来源说不。",
      "前景不太好。",
      "非常值得怀疑。",
      "放手，让它去吧。",
      "时间会给你答案。",
      "信任你的直觉。",
      "改变一下思路试试。",
      "换个角度看这个问题。",
      "答案就在你心里。",
      "问问你自己，你真正想要的是什么？",
      "无论选择什么，都要全力以赴。",
      "勇敢前行，不要回头。",
      "等待更好的时机。",
      "决定权在你手中。",
      "相信过程，一切都会好起来。"
    ];
    
    // 将答案保存到全局数据
    this.globalData.answers = allAnswers;
  },
  
  // 初始化全局变量
  globalData: {
    systemInfo: null,
    userInfo: null,
    currentAnswer: '',
    currentQuestion: '',
    historyAnswers: [],
    isRareAnswer: false,
    analysisDatabase: null
  },

  // 懒加载分包数据
  loadAnalysisData: function() {
    return new Promise((resolve, reject) => {
      // 如果数据已加载，直接返回
      if (this.globalData.analysisDatabase) {
        resolve(this.globalData.analysisDatabase);
        return;
      }
      
      // 否则，尝试加载数据分包
      wx.loadSubpackage({
        name: 'dataPackage',
        success: () => {
          // 分包加载成功后，等待分包中的页面注册数据
          const checkInterval = setInterval(() => {
            if (this.globalData.analysisDatabase) {
              clearInterval(checkInterval);
              resolve(this.globalData.analysisDatabase);
            }
          }, 100);
          
          // 设置超时，避免无限等待
          setTimeout(() => {
            clearInterval(checkInterval);
            console.log('加载数据超时，尝试使用备用数据');
            
            // 尝试加载备用数据
            try {
              const fallback = require('./utils/analysisDataFallback').analysisDatabase;
              this.globalData.analysisDatabase = fallback;
              resolve(fallback);
            } catch (err) {
              reject(new Error('无法加载数据：' + err.message));
            }
          }, 5000);
        },
        fail: (err) => {
          console.error('加载分包失败', err);
          // 尝试加载备用数据
          try {
            const fallback = require('./utils/analysisDataFallback').analysisDatabase;
            this.globalData.analysisDatabase = fallback;
            resolve(fallback);
          } catch (fallbackErr) {
            reject(new Error('无法加载数据：' + fallbackErr.message));
          }
        }
      });
    });
  }
}) 