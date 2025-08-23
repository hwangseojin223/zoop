#!/bin/bash

echo "🚀 AI 면접 분석 서비스 시작 중..."

# 1. S3 업로드 API 시작
echo "📤 S3 업로드 API 시작..."
python simple_s3_api.py &
S3_API_PID=$!
echo "S3 API PID: $S3_API_PID"

# 2. AI 분석 API 시작
echo "🤖 AI 분석 API 시작..."
python ai_analysis_api.py &
AI_API_PID=$!
echo "AI Analysis API PID: $AI_API_PID"

# 3. 자동 분석 스케줄러 시작
echo "⏰ 자동 분석 스케줄러 시작..."
python auto_analyzer.py &
AUTO_ANALYZER_PID=$!
echo "Auto Analyzer PID: $AUTO_ANALYZER_PID"

# 4. 서비스 상태 확인
sleep 5
echo ""
echo "📊 서비스 상태 확인:"
echo "S3 API (포트 8006): $(curl -s http://localhost:8006/health | grep -o '"status":"[^"]*"' || echo '실행 중이 아닙니다')"
echo "AI Analysis API (포트 8007): $(curl -s http://localhost:8007/health | grep -o '"status":"[^"]*"' || echo '실행 중이 아닙니다')"

echo ""
echo "✅ 모든 AI 면접 분석 서비스가 시작되었습니다!"
echo ""
echo "📝 사용 방법:"
echo "1. S3 업로드 API: http://localhost:8006"
echo "2. AI 분석 API: http://localhost:8007"
echo "3. 자동 분석 스케줄러: 백그라운드에서 실행 중"
echo ""
echo "🛑 서비스 중지: ./stop_ai_services.sh"
echo "📋 로그 확인: tail -f *.log"

# PID 파일 저장
echo $S3_API_PID > s3_api.pid
echo $AI_API_PID > ai_api.pid
echo $AUTO_ANALYZER_PID > auto_analyzer.pid

echo ""
echo "💡 프론트엔드에서 면접 녹화 후 'S3에 업로드' 버튼을 클릭하면"
echo "   자동으로 AI 분석이 시작됩니다!" 