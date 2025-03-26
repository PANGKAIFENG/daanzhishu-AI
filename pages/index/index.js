import { getRandomAnswer } from '../../utils/answerUtil.js';
import VisitCounter from '../../utils/counterUtil.js';

// 获取应用实例
const app = getApp()

Page({
  data: {
    questions: [
      "今天我该做出什么选择？",
      "我现在的方向是否正确？",
      "如何面对当前的挑战？",
      "对于这个困扰，我该如何处理？",
      "我内心真正想要的是什么？"
    ],
    currentQuestionIndex: 0,  // 当前显示的问题索引
    questionInterval: null,   // 问题轮播的定时器
    shakeable: true,          // 是否可以摇动（防止频繁触发）
    isThinking: false,        // 是否处于"思考"状态
    pulseAnimation: true      // 按钮脉动动画
  },
  
  onLoad: function() {
    // 启动问题轮播
    this.startQuestionCarousel();
  },
  
  onShow: function() {
    // 页面显示时启动问题轮播和按钮脉动
    this.startQuestionCarousel();
    this.setData({
      pulseAnimation: true,
      isThinking: false
    });
  },
  
  onHide: function() {
    // 页面隐藏时清除轮播
    this.clearQuestionCarousel();
  },
  
  onUnload: function() {
    // 页面卸载时清除轮播
    this.clearQuestionCarousel();
  },
  
  // 开始问题轮播
  startQuestionCarousel: function() {
    // 清除已有的轮播
    this.clearQuestionCarousel();
    
    // 设置问题轮播间隔
    const interval = setInterval(() => {
      let nextIndex = (this.data.currentQuestionIndex + 1) % this.data.questions.length;
      this.setData({
        currentQuestionIndex: nextIndex
      });
    }, 2000);
    
    this.setData({
      questionInterval: interval
    });
  },
  
  // 清除问题轮播
  clearQuestionCarousel: function() {
    if (this.data.questionInterval) {
      clearInterval(this.data.questionInterval);
      this.setData({
        questionInterval: null
      });
    }
  },
  
  // 处理寻找答案按钮点击
  onTapGetAnswer: function() {
    // 设置思考状态
    this.setData({
      isThinking: true
    });
    
    // 停止问题轮播
    this.clearQuestionCarousel();
    
    // 延迟执行，显示思考动画
    setTimeout(() => {
      // 获取当前问题
      let currentQuestion = this.data.questions[this.data.currentQuestionIndex];
      
      // 获取随机答案
      const answer = getRandomAnswer();
      
      // 获取访问计数
      const counter = new VisitCounter();
      const visitCount = counter.getCurrentCount();
      
      // 保存答案到全局数据
      app.globalData.currentAnswer = answer;
      app.globalData.currentQuestion = currentQuestion;
      
      // 跳转到答案页，并传递答案参数
      wx.navigateTo({
        url: `/pages/answer/answer?answer=${encodeURIComponent(answer)}&visitCount=${visitCount}`
      });
      
      // 保存到历史记录
      this.saveToHistory(answer);
      
      // 重置思考状态
      this.setData({
        isThinking: false
      });
    }, 1500);
  },
  
  // 分享小程序
  onShareAppMessage() {
    return {
      title: '《解忧杂货铺》- 每个烦恼都能找到答案',
      path: '/pages/index/index'
    };
  },
  
  // 保存到历史记录(为第二版本准备)
  saveToHistory: function(answer) {
    const timestamp = new Date().getTime();
    const question = this.data.questions[this.data.currentQuestionIndex];
    
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
  
  // 获取访问计数
  getVisitCount: function() {
    const stats = wx.getStorageSync('answer_stats') || {};
    const today = new Date().toDateString();
    
    if (!stats.date || stats.date !== today) {
      stats.date = today;
      stats.count = 1;
    } else {
      stats.count += 1;
    }
    
    wx.setStorageSync('answer_stats', stats);
    return stats.count;
  },
  
  getRandomAnswer: function() {
    const random = Math.random();
    let answer;
    
    // 调整概率分布
    if (random < 0.35) { // 实用建议类从30%提高到35%
      answer = this.getRandomFromCategory('practical');
    } else if (random < 0.60) { // 人生哲理类从25%提高到25%
      answer = this.getRandomFromCategory('shareable');
    } else if (random < 0.75) { // 幽默反转类从20%降低到15%
      answer = this.getRandomFromCategory('humorous');
    } else if (random < 0.85) { // 励志但带点皮的从15%降低到10%
      answer = this.getRandomFromCategory('motivational');
    } else { // 流行文化引用类从10%提高到15%
      answer = this.getRandomFromCategory('cultural');
    }
    
    return answer;
  },
  
  getRandomFromCategory: function(category) {
    // Implementation of getRandomFromCategory method
  }
}) 