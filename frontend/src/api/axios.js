import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8081',  // Spring Boot 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
