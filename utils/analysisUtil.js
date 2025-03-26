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
 * 获取答案对应的解析信息
 * @param {string} answer 答案文本
 * @returns {Object|null} 解析信息对象，包含core, manifestation, solution, tips字段
 */
const getAnswerAnalysis = (answer) => {
  if (!answer) return null;
  
  console.log('getAnswerAnalysis 被调用, 答案:', answer);
  
  // 获取解析数据库
  const database = getAnalysisDatabase();
  console.log('获取到的数据库包含', database ? Object.keys(database).length : 0, '个解析条目');
  
  // 在数据库中查找对应答案的解析
  if (database && database[answer]) {
    console.log('找到匹配的解析');
    return database[answer];
  }
  
  // 如果无法直接匹配，尝试从各个解析数据源中直接加载
  try {
    // 尝试从各个数据源获取
    let alternativeSource = null;
    
    // 尝试从analysisData.js获取
    try {
      const analysisData = require('./analysisData').analysisDatabase;
      if (analysisData && analysisData[answer]) {
        console.log('从analysisData.js找到匹配解析');
        return analysisData[answer];
      }
    } catch (e) {
      console.log('从analysisData.js获取解析失败:', e.message);
    }
    
    // 尝试从analysisDatabase.js获取
    try {
      const analysisDBModule = require('./analysisDatabase');
      if (typeof analysisDBModule.getAnswerAnalysis === 'function') {
        alternativeSource = analysisDBModule.getAnswerAnalysis(answer);
        if (alternativeSource) {
          console.log('从analysisDatabase.js的函数获取到解析');
          return alternativeSource;
        }
      }
    } catch (e) {
      console.log('从analysisDatabase.js获取解析失败:', e.message);
    }
    
    // 尝试从本地备用数据获取
    try {
      const fallbackData = require('./analysisDataFallback').analysisDatabase;
      if (fallbackData && fallbackData[answer]) {
        console.log('从fallbackData找到匹配解析');
        return fallbackData[answer];
      }
    } catch (e) {
      console.log('从fallbackData获取解析失败:', e.message);
    }
  } catch (err) {
    console.error('尝试所有数据源均失败:', err.message);
  }
  
  console.log(`未找到答案 "${answer}" 的解析信息, 可用的答案列表:`, database ? Object.keys(database).slice(0, 5) : []);
  return null;
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