// 로깅 유틸리티
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  static info(message, ...args) {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  static warn(message, ...args) {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  static error(message, ...args) {
    // 에러는 항상 로깅
    console.error(`[ERROR] ${message}`, ...args);
  }

  static debug(message, ...args) {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
}

export default Logger; 