import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useParams, useNavigate } from 'react-router-dom'; // 🔥 여기
import styled from 'styled-components';

export default function ResponderList() {

  const List = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin: 0;
  `;

const Card = styled.li`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  `;

const Field = styled.div`
  display: auto;
  justify-content: space-between;
  margin-bottom: 0.75rem;

  & > strong {
    color: #333;
  }

  & > span {
    color: #555;
  }
  `;

  const DetailButton = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background-color: #2DC997;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  align-self: flex-end;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2DC100;
  }
`;

// 모달창 스타일일
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; 
  align-items: center; 
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff; 
  padding: 2rem; 
  border-radius: 8px;
  width: 1100px; 
  max-width: 2000px; 
  max-height: 80%; 
  overflow-y: auto;
`;
const CloseButton = styled.button`
  margin-top: 1rem; padding: .5rem 1rem;
  background: #2DC997; color: #fff; border: none; border-radius: 4px;
  cursor: pointer;
  &:hover { background: #2DC100; }
`;

// 모달 안의 포트폴리오 칸
const SliderWrapper = styled.div`
  position: relative;
  width: 800px;      /* 원하는 크기로 조정 */
  height: 600px;     /* 원하는 크기로 조정 */
  margin: 1rem auto;
  overflow: hidden;
`;
const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
`;
const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  z-index: 10;
  &:hover { background: rgba(0,0,0,0.7); }
`;

// 모달창 내부의 그리드
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  width: 60%;         
  margin: 0 0 1rem 50px; 
`;

// 회신자상세정보
const title = styled.p`
  
`

/**
 * | 가능한 값                               | 설명                                                 |
| ----------------------------------- | -------------------------------------------------- |
| `repeat(2, 1fr)`                    | 2개의 열을 동일 비율(`1fr`씩)로 분할.                          |
| `repeat(3, 1fr)`                    | 3개의 열을 동일 비율로 분할.                                  |
| `1fr 2fr`                           | 첫 번째 열이 전체의 1/3, 두 번째 열이 전체의 2/3를 차지.              |
| `100px 1fr`                         | 첫 번째 열 고정 100px, 두 번째 열은 남은 공간 모두 사용.              |
| `auto auto auto`                    | 내용 크기에 맞춰 3개의 열을 자동 생성.                            |
| `minmax(200px, 1fr) repeat(2, 2fr)` | 첫 열 최소 200px, 최대 나머지 비율만큼; 나머지 두 열은 각각 2fr 비율로 분할. |

 * 
 */



  const { postId } = useParams();
  const [responder, setResponder] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedResponder, setSelectedResponder] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  // 모달 내부 state 선언부 근처
  const portfolioImages = [
    'https://picsum.photos/800/900?random=1',
    'https://picsum.photos/800/900?random=2',
    'https://picsum.photos/800/900?random=3',
  ];

  const PrevButton = styled(NavButton)`left: 0.5rem;`;
  const NextButton = styled(NavButton)`right: 0.5rem;`;

  // 데이터 가져오기
  useEffect(() => {
    fetch(`http://localhost:8081/api/responder/${postId}`)
      .then(res => res.json())
      .then(setResponder)
      .catch(err => console.error('❌ 후보자 목록 오류:', err));
  }, [postId]);

  // 모달 핸들러
  const handleDetail = (r) => {
    setSelectedResponder(r);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedResponder(null);
  };
  console.log(responder);

const prev = () => {
  setCurrentIdx((idx) =>
    idx === 0 ? portfolioImages.length - 1 : idx - 1
  );
};
const next = () => {
  setCurrentIdx((idx) =>
    idx === portfolioImages.length - 1 ? 0 : idx + 1
  );
};

  return (
    <div>
      <Navbar />
      <div style={{ padding: '7rem 3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>
          🔍 {postId}번 공고 회신자 목록
        </h2>

        {responder.length === 0 ? (
          <p>회신자가 없습니다.</p>
        ) : (
          <List>
            {responder.map((r, i) => (
              <Card key={i}>
                <Field>
                  <strong>이름 : </strong>
                  <span>{r.name}</span>
                </Field>
                <Field>
                  <strong>이메일 : </strong>
                  <span>{r.email}</span>
                </Field>
                <Field>
                  <strong>지역 : </strong>
                  <span>{r.location}</span>
                </Field>
                <Field>
                  <strong>언어 : </strong>
                  <span>{r.languages}</span>
                </Field>
                <Field>
                  <strong>점수 : </strong>
                  <span>{r.score}</span>
                </Field>
                <Field>
                  <strong>분석요약 : </strong>
                  <span>{r.portfolioAnalysis}</span>
                </Field>
                <DetailButton onClick={() => handleDetail(r)}>
                  자세히보기
                </DetailButton>
              </Card>
            ))}
          </List>
        )}

        {isModalOpen && selectedResponder && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <h3>회신자 상세 정보</h3>
                <InfoGrid>
                  <p><strong>이름:</strong> {selectedResponder.name}</p>
                  <p><strong>이메일:</strong> {selectedResponder.email}</p>
                  <p><strong>지역:</strong> {selectedResponder.location}</p>
                  <p><strong>언어:</strong> {selectedResponder.languages}</p>
                  <p><strong>점수:</strong> {selectedResponder.score}</p>
                  <p><strong>분석:</strong> {selectedResponder.portfolioAnalysis}</p>
                </InfoGrid>

              {/* ← 이 부분에 포트폴리오 영역 추가 */}
              <h4>포트폴리오 미리보기</h4>
               <SliderWrapper>
                <PrevButton
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={e => { prev(); e.currentTarget.blur(); }}
                >
                  ‹
                </PrevButton>
                  <SlideImage src={portfolioImages[currentIdx]} alt={`포트폴리오 ${currentIdx+1}`} />
                  <NextButton
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={e => { next(); e.currentTarget.blur(); }}
                  >
                    ›
                  </NextButton>
              </SliderWrapper>

              
              <CloseButton onClick={closeModal}>닫기</CloseButton>
            </ModalContent>
          </ModalOverlay>
        )}
      </div>
    </div>
  );
}
