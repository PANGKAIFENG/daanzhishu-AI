/**
 * 答案解析工具
 * 提供答案解析的获取和管理功能
 */

let analysisDatabase = null;

/**
 * 获取解析信息数据库
 * 懒加载模式，只在第一次调用时加载
 * @returns {Object} 解析数据库对象
 */
const getAnalysisDatabase = () => {
  if (analysisDatabase) return analysisDatabase;
  
  try {
    // 尝试从全局对象获取数据库
    const app = getApp();
    if (app && app.globalData && app.globalData.analysisDatabase) {
      analysisDatabase = app.globalData.analysisDatabase;
      console.log('成功从全局获取解析数据库');
      return analysisDatabase;
    }
    
    // 如果全局对象中没有，则使用备用数据
    const fallbackData = require('./analysisDataFallback').analysisDatabase;
    analysisDatabase = fallbackData;
    console.log('使用备用解析数据库');
    return analysisDatabase;
  } catch (error) {
    console.error('获取解析数据库失败:', error);
    // 如果加载失败，返回空对象作为备用
    return {};
  }
};

/**
 * 从本地数据库获取预设解析
 * @param {string} answer 答案文本
 * @returns {Object|null} 解析信息对象
 */
const getLocalAnalysis = (answer) => {
  console.log('尝试从本地获取解析');
  
  // 获取解析数据库
  const database = getAnalysisDatabase();
  
  // 在数据库中查找对应答案的解析
  if (database && database[answer]) {
    console.log('找到本地匹配的解析');
    return {
      success: true,
      data: database[answer],
      source: 'local'
    };
  }
  
  // 尝试从各个数据源获取
  try {
    // 尝试从analysisData.js获取
    const analysisData = require('./analysisData').analysisDatabase;
    if (analysisData && analysisData[answer]) {
      console.log('从analysisData.js找到匹配解析');
      return {
        success: true,
        data: analysisData[answer],
        source: 'local'
      };
    }
  } catch (e) {
    console.log('从analysisData.js获取解析失败:', e.message);
  }
  
  // 尝试从本地备用数据获取
  try {
    const fallbackData = require('./analysisDataFallback').analysisDatabase;
    if (fallbackData && fallbackData[answer]) {
      console.log('从fallbackData找到匹配解析');
      return {
        success: true,
        data: fallbackData[answer],
        source: 'local'
      };
    }
  } catch (e) {
    console.log('从fallbackData获取解析失败:', e.message);
  }
  
  return null;
};

/**
 * 获取答案的解析信息
 * 直接使用本地预设解析，不再尝试调用AI
 * @param {string} answer 答案文本
 * @returns {Promise<Object>} 解析信息对象
 */
const getAnswerAnalysis = async (answer) => {
  if (!answer) {
    return {
      success: false,
      error: '答案内容不能为空'
    };
  }
  
  console.log('直接使用本地解析，不再尝试AI分析');
  
  // 尝试使用本地预设解析
  const localResult = getLocalAnalysis(answer);
  if (localResult) {
    return localResult;
  }
  
  // 如果本地也没有匹配的解析，返回默认解析
  return {
    success: true,
    data: {
      core: "这个答案需要你根据自身情况来理解。以下是一些通用的思考方向。",
      manifestation: "• 这可能表现为对现状的不满\n• 对未来的不确定感\n• 内心期望与现实的差距\n• 需要做出重要决定的时刻\n• 希望找到更好的解决方案",
      solution: "• 列出当前情况的优缺点\n• 设定明确可行的小目标\n• 尝试改变视角看问题\n• 寻求可信赖的人建议\n• 给自己留出思考的时间和空间\n• 记录下当前的想法，未来再回顾",
      tips: "记住，每个人都有迷茫和困惑的时候。重要的是保持开放的心态，相信自己的判断，同时也要勇于接受变化和挑战。"
    },
    source: 'default'
  };
};

/**
 * 检查答案是否有对应的解析
 * @param {string} answer 答案文本
 * @returns {boolean} 是否有解析
 */
const hasAnalysis = (answer) => {
  if (!answer) return false;
  const database = getAnalysisDatabase();
  return !!(database && database[answer]);
};

// 导出需要的函数
module.exports = {
  getAnswerAnalysis,
  hasAnalysis
}; 