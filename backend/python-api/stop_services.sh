#!/bin/bash

echo "🚫 모든 Python API 서비스 종료 중..."

# 1. 기존 uvicorn 방식 서비스들
echo "📤 기존 uvicorn 서비스 종료 중..."

# GitHub Search Service (Port 8000)
pkill -f "uvicorn.*8000" 2>/dev/null && echo "✅ GitHub Search API (8000) 종료됨"

# Chatbot Service (Port 8001)  
pkill -f "uvicorn.*8001" 2>/dev/null && echo "✅ Chatbot API (8001) 종료됨"

# Interview Analysis Service (Port 8002)
pkill -f "uvicorn.*8002" 2>/dev/null && echo "✅ Interview Analysis API (8002) 종료됨"

# Portfolio Matching Service (Port 8003)
pkill -f "uvicorn.*8003" 2>/dev/null && echo "✅ Portfolio Matching API (8003) 종료됨"

# Interview Questions Service (Port 8004)
pkill -f "uvicorn.*8004" 2>/dev/null && echo "✅ Interview Questions API (8004) 종료됨"

# OCR Service (Port 8005)
pkill -f "uvicorn.*8005" 2>/dev/null && echo "✅ OCR API (8005) 종료됨"

# 2. 새로운 AI 서비스들
echo "🤖 새로운 AI 서비스 종료 중..."

# Executive Interview S3 Service (Port 8006)
pkill -f "simple_s3_api.py" 2>/dev/null && echo "✅ Executive Interview S3 API (8006) 종료됨"

# AI Analysis Service (Port 8007)
pkill -f "ai_analysis_api.py" 2>/dev/null && echo "✅ AI Analysis API (8007) 종료됨"

# Auto Analyzer Scheduler
pkill -f "auto_analyzer.py" 2>/dev/null && echo "✅ Auto Analyzer Scheduler 종료됨"

# 3. 추가 정리
echo "🧹 추가 정리 중..."

# 모든 Python 프로세스 확인 및 종료
pkill -f "python.*simple_s3_api" 2>/dev/null
pkill -f "python.*ai_analysis_api" 2>/dev/null  
pkill -f "python.*auto_analyzer" 2>/dev/null

# 포트 사용 확인
echo "🔍 포트 사용 상태 확인:"
netstat -an | grep -E ":(8000|8001|8002|8003|8004|8005|8006|8007)" | grep LISTEN || echo "모든 포트가 비어있습니다"

echo ""
echo "🎉 모든 Python API 서비스가 종료되었습니다!"
echo ""
echo "📝 재시작 방법:"
echo "1. 기존 서비스: ./start_services.sh"
echo "2. AI 서비스만: cd executive_interview && ./start_ai_services.sh"
echo "3. 전체 통합: ./start_services.sh (새로 생성 예정)" 