// 安全的日志工具类
// 解决文件系统访问错误问题

/**
 * 安全的日志系统，确保不会因为文件系统错误而影响应用
 */
class SafeLogger {
  constructor() {
    this.enabled = false; // 默认禁用文件日志
    this.memoryLogs = []; // 内存中的日志缓存
    this.maxMemoryLogs = 100; // 最大内存日志数量
  }

  /**
   * 初始化日志系统
   * @param {boolean} enabled 是否启用文件日志
   */
  init(enabled = false) {
    this.enabled = enabled;
    console.log(`日志系统初始化, 文件日志${enabled ? '已启用' : '已禁用'}`);
  }

  /**
   * 记录日志
   * @param {string} message 日志消息
   * @param {string} level 日志级别
   */
  log(message, level = 'info') {
    // 控制台输出
    console.log(`[${level.toUpperCase()}] ${message}`);
    
    // 添加到内存缓存
    this.memoryLogs.push({
      timestamp: new Date(),
      level,
      message
    });
    
    // 维持内存日志大小
    if (this.memoryLogs.length > this.maxMemoryLogs) {
      this.memoryLogs.shift();
    }
    
    // 如果启用了文件日志，尝试写入文件
    if (this.enabled) {
      this.writeToFile(message, level);
    }
  }

  /**
   * 写入文件系统（安全模式）
   * @private
   */
  writeToFile(message, level) {
    try {
      const fs = wx.getFileSystemManager();
      const userPath = wx.env.USER_DATA_PATH;
      const logDir = `${userPath}/logs`;
      const logFile = `${logDir}/app.log`;
      const logContent = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
      
      // 确保日志目录存在
      try {
        fs.accessSync(logDir);
      } catch (e) {
        try {
          fs.mkdirSync(logDir, true);
        } catch (dirError) {
          console.error('创建日志目录失败，禁用文件日志', dirError);
          this.enabled = false;
          return;
        }
      }
      
      // 检查文件是否存在，不存在则创建
      try {
        fs.accessSync(logFile);
        // 文件存在，追加内容
        fs.appendFileSync(logFile, logContent, 'utf8');
      } catch (e) {
        // 文件不存在，创建新文件
        try {
          fs.writeFileSync(logFile, logContent, 'utf8');
        } catch (writeError) {
          console.error('写入日志文件失败，禁用文件日志', writeError);
          this.enabled = false;
        }
      }
    } catch (e) {
      console.error('日志系统错误，禁用文件日志', e);
      this.enabled = false;
    }
  }

  /**
   * 获取内存中的日志
   */
  getMemoryLogs() {
    return [...this.memoryLogs];
  }

  /**
   * 清除内存日志
   */
  clearMemoryLogs() {
    this.memoryLogs = [];
  }

  /**
   * 错误日志
   */
  error(message) {
    this.log(message, 'error');
  }

  /**
   * 警告日志
   */
  warn(message) {
    this.log(message, 'warn');
  }

  /**
   * 信息日志
   */
  info(message) {
    this.log(message, 'info');
  }
}

// 创建单例
const logger = new SafeLogger();

export default logger; 