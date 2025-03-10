import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoSvg from '/assets/icons/logo.svg';
import validateAuth from '@/pages/Auth/utils';
import useAuth from '@/hooks/useAuth';

// 로딩 화면 컴포넌트
const LoginLoadingScreen = () => (
  <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">로그인 중...</p>
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [pwd, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 사용자가 이미 인증되어 있다면 자동으로 홈으로 리디렉션
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 로딩 상태가 너무 오래 지속되지 않도록 타임아웃 설정
  useEffect(() => {
    if (isLoading || isRedirecting) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsRedirecting(false);
      }, 3000); // 최대 3초 후 로딩 상태 해제

      return () => clearTimeout(timer);
    }
  }, [isLoading, isRedirecting]);

  useEffect(() => {
    setError('');
  }, [email, pwd]);

  // 폼 제출 처리 함수
  const handleSubmit = async e => {
    e.preventDefault();

    const validation = validateAuth({ email, pwd });
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔒 [Login] 로그인 시도:', email);
      const success = await login(email, pwd);

      if (success) {
        console.log('✅ [Login] 로그인 성공, 홈으로 이동');
        setIsRedirecting(true);

        // 세션 스토리지에 로그인 상태 저장 확인
        const sessionUser = sessionStorage.getItem('sessionUser');
        console.log('🔍 [Login] 세션 사용자:', sessionUser);

        // 강제로 홈으로 이동 (페이지 새로고침)
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        console.error('❌ [Login] 로그인 실패: 성공 응답 없음');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ [Login] 로그인 오류:', error);
      setError(error.message || '로그인에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  // 로딩 중이거나 리디렉션 중이면 로딩 화면 표시
  if (isLoading || isRedirecting) {
    return <LoginLoadingScreen />;
  }

  return (
    <div className="max-w-[768px] w-full h-screen mx-auto overflow-hidden border border-gray-300 flex flex-col">
      {/* 로그인 폼 박스 */}
      <div className="p-6 sm:p-10 mb-4">
        {/* 로고 */}
        <div className="flex justify-center mb-8">
          <img src={logoSvg} alt="Instagram" className="h-[51px] w-auto" />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}

        {/* 로그인 폼 */}
        <form
          className="space-y-2 flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          {/* 이메일 입력 */}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-[40%] px-2 py-[9px] bg-[#fafafa] text-sm border border-gray-300 rounded-sm
                    focus:outline-none focus:border-gray-400 placeholder:text-xs text-neutral-800"
          />

          {/* 비밀번호 입력 */}
          <input
            type="password"
            value={pwd}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-[40%] px-2 py-[9px] bg-[#fafafa] text-sm border border-gray-300 rounded-sm
                    focus:outline-none focus:border-gray-400 placeholder:text-xs text-neutral-800"
          />

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-[40%] mt-2 bg-[#0095F6] text-white py-[7px] rounded text-sm font-semibold
            hover:bg-[#0095F6]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isRedirecting}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      {/* 회원가입 링크 */}
      <div className="py-4 text-center">
        <span className="text-neutral-500 text-[14px]">계정이 없으신가요?</span>
        <Link
          to="/signup"
          className="text-[#4CB5F9] font-semibold text-[14px] hover:text-[#4CB5F9]/90"
        >
          가입하기
        </Link>
      </div>
    </div>
  );
};

export default Login;
