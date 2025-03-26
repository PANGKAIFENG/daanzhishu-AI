// answerUtil.js
// 用于处理答案获取的工具函数

import answers from '../answers.js';

/**
 * 从答案库中按比例随机获取一个答案
 * 实用建议类(30%)、高分享价值类(25%)、幽默反转类(20%)、励志但带点皮的(15%)、流行文化引用类(10%)
 * @returns {Object} 包含答案文本和类型的对象
 */
export function getRandomAnswer() {
  const random = Math.random();
  let category;
  
  // 调整概率分布
  if (random < 0.35) { // 实用建议类从30%提高到35%
    category = 'practical';
  } else if (random < 0.60) { // 人生哲理类从25%提高到25%
    category = 'shareable';
  } else if (random < 0.75) { // 幽默反转类从20%降低到15%
    category = 'humorous';
  } else if (random < 0.85) { // 励志但带点皮的从15%降低到10%
    category = 'motivational';
  } else { // 流行文化引用类从10%提高到15%
    category = 'cultural';
  }
  
  // 从选中的类别中随机获取一条答案
  const categoryAnswers = answers[category];
  const randomIndex = Math.floor(Math.random() * categoryAnswers.length);
  return categoryAnswers[randomIndex];
}

/**
 * 检查是否为罕见答案（可用于第二版本的稀有答案机制）
 * @param {Object} answer 答案对象
 * @returns {Boolean} 是否为罕见答案
 */
export function isRareAnswer(answer) {
  // 简单实现，实际可根据需求调整
  // 这里假设每个类别的最后两个答案为"稀有答案"
  const category = answer.type;
  const answerArray = answers[category];
  const answerIndex = answerArray.indexOf(answer.text);
  
  return answerIndex >= answerArray.length - 2;
}

/**
 * 获取所有答案的总数
 * @returns {Number} 答案总数
 */
export function getTotalAnswersCount() {
  return Object.values(answers).reduce((total, arr) => total + arr.length, 0);
}

/**
 * 按类别获取答案数量统计
 * @returns {Object} 各类别的答案数量
 */
export function getAnswersCountByCategory() {
  const result = {};
  
  for (const category in answers) {
    if (answers.hasOwnProperty(category)) {
      result[category] = answers[category].length;
    }
  }
  
  return result;
} 