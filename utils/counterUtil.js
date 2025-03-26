// counterUtil.js

// 基础配置
const CONFIG = {
  // 基准数据
  INITIAL_COUNT: 3578,
  BASE_DATE: '2024-01-01',
  
  // 每日基础增长
  WORKDAY_BASE: 150,
  WEEKEND_BASE: 200,
  MONTHLY_INCREASE: 0.05, // 每月增长率5%
  
  // 时段系数
  TIME_PERIODS: {
    MORNING: {
      start: 7,
      end: 9,
      rate: 0.15
    },
    NOON: {
      start: 11.5,
      end: 14,
      rate: 0.25
    },
    EVENING: {
      start: 19,
      end: 23,
      rate: 0.40
    },
    OTHER: {
      rate: 0.20
    }
  }
};

class VisitCounter {
  constructor() {
    this.now = new Date();
  }

  // 获取当前访问计数
  getCurrentCount() {
    const totalDays = this.getDaysSinceBase();
    const naturalGrowth = this.calculateNaturalGrowth(totalDays);
    const todayGrowth = this.calculateTodayGrowth();
    
    return Math.floor(CONFIG.INITIAL_COUNT + naturalGrowth + todayGrowth);
  }

  // 计算从基准日期到昨天的自然增长
  calculateNaturalGrowth(totalDays) {
    if (totalDays <= 0) return 0;

    let growth = 0;
    const baseDate = new Date(CONFIG.BASE_DATE);
    
    // 计算到昨天为止的增长
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);
      
      // 获取月份系数
      const monthIndex = currentDate.getMonth();
      const monthRate = 1 + (CONFIG.MONTHLY_INCREASE * monthIndex);
      
      // 判断是否周末
      const isWeekend = [0, 6].includes(currentDate.getDay());
      const baseGrowth = isWeekend ? CONFIG.WEEKEND_BASE : CONFIG.WORKDAY_BASE;
      
      growth += baseGrowth * monthRate;
    }

    return growth;
  }

  // 计算今天到当前时刻的增长
  calculateTodayGrowth() {
    const currentHour = this.now.getHours() + (this.now.getMinutes() / 60);
    const isWeekend = [0, 6].includes(this.now.getDay());
    const monthIndex = this.now.getMonth();
    const monthRate = 1 + (CONFIG.MONTHLY_INCREASE * monthIndex);
    const baseGrowth = isWeekend ? CONFIG.WEEKEND_BASE : CONFIG.WORKDAY_BASE;
    const todayBase = baseGrowth * monthRate;

    // 获取当前时段系数
    const periodRate = this.getCurrentPeriodRate(currentHour);
    
    // 计算时段进度
    const periodProgress = this.calculatePeriodProgress(currentHour);
    
    return todayBase * periodRate * periodProgress;
  }

  // 获取当前时段系数
  getCurrentPeriodRate(hour) {
    const periods = CONFIG.TIME_PERIODS;
    
    if (hour >= periods.MORNING.start && hour <= periods.MORNING.end) {
      return periods.MORNING.rate;
    } else if (hour >= periods.NOON.start && hour <= periods.NOON.end) {
      return periods.NOON.rate;
    } else if (hour >= periods.EVENING.start && hour <= periods.EVENING.end) {
      return periods.EVENING.rate;
    } else {
      return periods.OTHER.rate;
    }
  }

  // 计算时段进度
  calculatePeriodProgress(hour) {
    const periods = CONFIG.TIME_PERIODS;
    
    if (hour >= periods.MORNING.start && hour <= periods.MORNING.end) {
      return (hour - periods.MORNING.start) / (periods.MORNING.end - periods.MORNING.start);
    } else if (hour >= periods.NOON.start && hour <= periods.NOON.end) {
      return (hour - periods.NOON.start) / (periods.NOON.end - periods.NOON.start);
    } else if (hour >= periods.EVENING.start && hour <= periods.EVENING.end) {
      return (hour - periods.EVENING.start) / (periods.EVENING.end - periods.EVENING.start);
    } else {
      // 其他时段返回当前小时在24小时制中的进度
      return hour / 24;
    }
  }

  // 计算从基准日期到现在的天数
  getDaysSinceBase() {
    const baseDate = new Date(CONFIG.BASE_DATE);
    const timeDiff = this.now.getTime() - baseDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }
}

export default VisitCounter; 