const app = getApp();
import { getRandomAnswer } from '../../utils/answerUtil.js';
import logger from '../../utils/logUtil';

Page({
  data: {
    answer: "",
    displayAnswer: "",
    encouragement: "",
    visitCount: 0,
    showCursor: true,
    showEncouragement: false,
    showCommunityNote: false,
    showFooterNote: false,
    footerNote: "",
    typewriterSpeed: 80, // 加快打字速度
    currentIndex: 0 // 当前打字机索引
  },

  onLoad: function (options) {
    // 获取系统信息 - 使用新API替代已弃用的 wx.getSystemInfoSync
    try {
      // 使用新的API组合
      const appBaseInfo = wx.getAppBaseInfo();
      const benchmarkLevel = appBaseInfo.benchmarkLevel;
      
      logger.info('设备性能级别: ' + benchmarkLevel);
      
      // 判断设备性能级别
      if (benchmarkLevel <= 20) { // 性能较低
        this.setData({
          typewriterSpeed: 150 // 降低打字速度
        });
      } else if (benchmarkLevel >= 50) { // 性能较高
        this.setData({
          typewriterSpeed: 80 // 提高打字速度
        });
      }
    } catch (e) {
      logger.error('获取系统信息失败: ' + e.message);
    }
    
    // 解码接收到的答案参数
    const answer = options.answer ? decodeURIComponent(options.answer) : '宇宙的答案是42';
    
    // 去掉答案末尾的句号
    this.setData({
      answer: this.formatAnswer(answer),
      encouragement: this.getEncouragement(),
      showCommunityNote: false,
      footerNote: this.getRandomFooterNote()
    });

    // 更新访问计数
    this.updateVisitCount();
    
    this.startTypewriter();
  },
  
  // 格式化答案，为长答案添加表情和分段
  formatAnswer: function(answer) {
    // 如果最后一个字符是句号，去掉它
    return answer.replace(/。$/, '');
  },
  
  // 获取随机鼓励文案
  getEncouragement: function() {
    const encouragements = [
      "希望这个答案能给你一些启发",
      "相信你能找到最好的方向",
      "答案就在你的心里",
      "保持希望，继续前进"
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  },
  
  // 获取随机底部文案
  getRandomFooterNote: function() {
    const footerNotes = [
      "带着这个答案继续前行，下一个转角或许有惊喜",
      "不确定的未来才有无限可能，继续探索吧",
      "每一个寻找答案的人，都在用心感受生活的真谛",
      "此刻的你，和千万个寻找方向的人一样勇敢",
      "有时候，答案的意义不在结果，而在思考的过程",
      "答案只是开始，思考才是永恒"
    ];
    return footerNotes[Math.floor(Math.random() * footerNotes.length)];
  },
  
  // 更新访问计数器
  updateVisitCount: function() {
    // 初始基数
    const BASE_COUNT = 3578;
    
    // 计算累计自然增长
    const today = new Date();
    const startDate = new Date('2025-03-25'); // 设置起始日期为2025年3月25日
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // 计算工作日和周末天数
    const weekdays = Math.floor(daysDiff * 5 / 7);
    const weekends = daysDiff - weekdays;
    
    // 计算月系数（每月递增5%）
    const monthDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                     (today.getMonth() - startDate.getMonth());
    const monthFactor = 1 + (monthDiff * 0.05);
    
    // 计算累计自然增长
    const weekdayGrowth = weekdays * (150 * monthFactor);
    const weekendGrowth = weekends * (200 * monthFactor);
    const totalGrowth = weekdayGrowth + weekendGrowth;
    
    // 计算当天时段增长
    const hour = today.getHours();
    let timeFactor = 1;
    let timeProgress = 0;
    
    // 设置时段系数
    if (hour >= 0 && hour < 6) {
      timeFactor = 0.5;
      timeProgress = hour / 6;
    } else if (hour >= 6 && hour < 12) {
      timeFactor = 1.2;
      timeProgress = (hour - 6) / 6;
    } else if (hour >= 12 && hour < 18) {
      timeFactor = 1.5;
      timeProgress = (hour - 12) / 6;
    } else {
      timeFactor = 0.8;
      timeProgress = (hour - 18) / 6;
    }
    
    // 计算当天基础值（工作日200，周末300）
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    const dailyBase = isWeekend ? 300 : 200;
    
    // 计算当天时段增长
    const dailyGrowth = dailyBase * timeFactor * timeProgress;
    
    // 计算总访问数
    const totalCount = Math.floor(BASE_COUNT + totalGrowth + dailyGrowth);
    
    // 更新UI
    this.setData({
      visitCount: totalCount
    });
  },
  
  // 启动打字机效果
  startTypewriter: function() {
    this.clearTypewriter();
    this.typewriterTimer = setInterval(() => {
      if (this.data.currentIndex < this.data.answer.length) {
        this.setData({
          displayAnswer: this.data.answer.slice(0, this.data.currentIndex + 1),
          currentIndex: this.data.currentIndex + 1
        });
      } else {
        this.clearTypewriter();
        this.showAdditionalContent();
      }
    }, this.data.typewriterSpeed);
  },
  
  // 清理打字机定时器
  clearTypewriter: function() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
  },
  
  // 显示附加内容
  showAdditionalContent: function() {
    // 答案显示完成后等待100ms再显示鼓励文案
    setTimeout(() => {
      this.setData({
        showCursor: false,
        showEncouragement: true
      });
      
      // 鼓励文案显示后100ms显示访问计数
      setTimeout(() => {
        this.setData({
          showCommunityNote: true
        });
        
        // 访问计数显示后100ms显示底部文案
        setTimeout(() => {
          this.setData({
            showFooterNote: true
          });
        }, 50);
      }, 50);
    }, 50);
  },
  
  // 页面隐藏时暂停动画
  onHide: function() {
    this.clearTypewriter();
  },
  
  // 页面卸载时清除定时器
  onUnload: function() {
    this.clearTypewriter();
  },
  
  // 保存到历史记录
  saveToHistory: function(question, answer) {
    const timestamp = new Date().getTime();
    
    const historyItem = {
      question: question, 
      answer: answer,
      timestamp: timestamp
    };
    
    // 获取现有历史
    let history = wx.getStorageSync('answer_history') || [];
    
    // 添加新记录
    history.unshift(historyItem);
    
    // 限制历史记录最多50条
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    
    // 保存到本地存储
    wx.setStorageSync('answer_history', history);
  },
  
  // 打开答案解析页面
  onTapAnalysis: function() {
    wx.navigateTo({
      url: `/pages/analysis/analysis?answer=${encodeURIComponent(this.data.answer)}`
    });
  },
  
  // 返回首页/再问一次
  onTapAskAgain: function() {
    // 添加反馈并返回首页
    wx.showToast({
      title: '返回首页',
      icon: 'none',
      duration: 500
    });
    
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 300);
  },
  
  // 分享功能
  onShareAppMessage: function() {
    return {
      title: `『${this.data.answer}』- 来自答案之书的回答`,
      path: '/pages/index/index'
    };
  }
}) 