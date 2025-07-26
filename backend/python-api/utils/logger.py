import logging
import os
from datetime import datetime

# 로깅 설정
def setup_logger(name, log_file=None, level=logging.INFO):
    """로거 설정"""
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # 이미 핸들러가 있으면 추가하지 않음
    if logger.handlers:
        return logger
    
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 콘솔 핸들러
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 파일 핸들러 (선택사항)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

# 기본 로거
logger = setup_logger('zoop')

def info(message):
    """정보 로그"""
    logger.info(message)

def warn(message):
    """경고 로그"""
    logger.warning(message)

def error(message, exc_info=None):
    """에러 로그"""
    logger.error(message, exc_info=exc_info)

def debug(message):
    """디버그 로그"""
    logger.debug(message) 