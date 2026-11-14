import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLoginMutation } from "../../hooks/use-login-mutation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginMutation();

  const canSubmit =
    EMAIL_REGEX.test(email.trim()) && password.length > 0;

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || loginMutation.isPending) return;

    loginMutation.mutate({
      email: email.trim(),
      password: password,
    });
  };

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4"
      >
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          로그인
        </h1>

        {/* 이메일 */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            이메일
          </label>

          <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:border-[#2563eb]">
            <span className="pl-4 text-gray-500">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>

            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent px-3 py-3 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            비밀번호
          </label>

          <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:border-[#2563eb]">
            <span className="pl-4 text-gray-500">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v3" />
              </svg>
            </span>

            <input
              id="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent px-3 py-3 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        
        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={!canSubmit || loginMutation.isPending}
          className="w-full rounded-lg bg-[#2563eb] py-3 font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loginMutation.isPending ? "로그인 중" : "로그인"}
        </button>


        {/* 회원가입 이동 */}
        <p className="pt-1 text-center text-sm text-gray-500">
          처음이신가요?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#2563eb] hover:underline"
          >
            회원가입
          </Link>
        </p>
      </form>
    </main>
  );
}
