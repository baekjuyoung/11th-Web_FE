import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";

import { useSignupMutation } from "../../hooks/use-signup-mutation";

// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 영문 대소문자, 숫자, 특수문자를 모두 포함해 8자 이상
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

type DefaultFormKey = keyof typeof DEFAULT_FORM;
type DefaultFormValue = (typeof DEFAULT_FORM)[DefaultFormKey];

// 중복 확인 초기 상태
const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type DuplicateCheckKey = "email" | "nickname";

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);

  // 이메일과 닉네임의 중복 확인 상태
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });

  const signupMutation = useSignupMutation();

  // 입력값 유효성 검사
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());

  const isNicknameValid =
    form.nickname.trim().length >= 2 &&
    form.nickname.trim().length <= 12;

  const isPasswordValid = PASSWORD_REGEX.test(form.password);

  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 &&
    form.password === form.passwordConfirm;

  // 오류 메시지 표시 조건
  const showEmailError = form.email.length > 0 && !isEmailValid;

  const showNicknameError =
    form.nickname.length > 0 && !isNicknameValid;

  const showPasswordError =
    form.password.length > 0 && !isPasswordValid;

  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 &&
    !isPasswordConfirmValid;

  // 모든 입력값이 유효한지 확인
  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  // 입력 조건과 두 중복 확인을 모두 통과해야 제출 가능
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  // 입력값 변경 처리
  const handleChangeField = (
    key: DefaultFormKey,
    value: DefaultFormValue
  ) => {
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key].isChecking) return;

      // 확인한 값을 바꾸면 다시 중복 확인해야 함
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: DEFAULT_DUPLICATE_CHECK,
      }));
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 이메일 또는 닉네임 중복 확인
  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;

    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === "email" ? "이메일" : "닉네임";

    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: {
        isChecking: true,
        isAvailable: false,
      },
    }));

    try {
      const response =
        key === "email"
          ? await checkEmailDuplicate(form.email.trim())
          : await checkNicknameDuplicate(form.nickname.trim());

      const isAvailable = response.available;

      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isAvailable,
        },
      }));

      alert(
        isAvailable
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`
      );
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isAvailable: false,
        },
      }));

      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isChecking: false,
        },
      }));
    }
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || signupMutation.isPending) return;

    signupMutation.mutate({
      email: form.email.trim(),
      nickname: form.nickname.trim(),
      password: form.password,
    });
  };

  const inputStyle =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4F63E6]";

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md space-y-4"
      >
        <h1 className="mb-6 text-3xl font-bold">회원가입</h1>

        {/* 이메일 */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold"
          >
            이메일
          </label>

          <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:border-[#4F63E6]">
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              disabled={
                duplicateCheck.email.isChecking ||
                signupMutation.isPending
              }
              onChange={(e) =>
                handleChangeField("email", e.target.value)
              }
              className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
            />

            <button
              type="button"
              disabled={
                !isEmailValid ||
                duplicateCheck.email.isChecking ||
                signupMutation.isPending
              }
              onClick={() => handleCheckDuplicate("email")}
              className="px-3 text-sm font-semibold text-[#4F63E6] disabled:opacity-40"
            >
              {duplicateCheck.email.isChecking
                ? "확인 중"
                : "중복 확인"}
            </button>
          </div>

          {showEmailError && (
            <p className="mt-1 text-xs text-red-500">
              올바른 이메일 형식을 입력해 주세요.
            </p>
          )}
        </div>

        {/* 닉네임 */}
        <div>
          <label
            htmlFor="nickname"
            className="mb-2 block text-sm font-semibold"
          >
            닉네임
          </label>

          <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:border-[#4F63E6]">
            <input
              id="nickname"
              type="text"
              placeholder="2~12자"
              value={form.nickname}
              disabled={
                duplicateCheck.nickname.isChecking ||
                signupMutation.isPending
              }
              onChange={(e) =>
                handleChangeField("nickname", e.target.value)
              }
              className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
            />

            <button
              type="button"
              disabled={
                !isNicknameValid ||
                duplicateCheck.nickname.isChecking ||
                signupMutation.isPending
              }
              onClick={() => handleCheckDuplicate("nickname")}
              className="px-3 text-sm font-semibold text-[#4F63E6] disabled:opacity-40"
            >
              {duplicateCheck.nickname.isChecking
                ? "확인 중"
                : "중복 확인"}
            </button>
          </div>

          {showNicknameError && (
            <p className="mt-1 text-xs text-red-500">
              닉네임은 2~12자로 입력해 주세요.
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold"
          >
            비밀번호
          </label>

          <input
            id="password"
            type="password"
            placeholder="8자 이상"
            value={form.password}
            disabled={signupMutation.isPending}
            onChange={(e) =>
              handleChangeField("password", e.target.value)
            }
            className={inputStyle}
          />

          <p className="mt-1 text-xs text-gray-400">
            영문 대소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해 주세요.
          </p>

          {showPasswordError && (
            <p className="mt-1 text-xs text-red-500">
              비밀번호 조건을 확인해 주세요.
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label
            htmlFor="passwordConfirm"
            className="mb-2 block text-sm font-semibold"
          >
            비밀번호 확인
          </label>

          <input
            id="passwordConfirm"
            type="password"
            placeholder="다시 입력"
            value={form.passwordConfirm}
            disabled={signupMutation.isPending}
            onChange={(e) =>
              handleChangeField("passwordConfirm", e.target.value)
            }
            className={inputStyle}
          />

          {showPasswordConfirmError && (
            <p className="mt-1 text-xs text-red-500">
              비밀번호가 일치하지 않습니다.
            </p>
          )}
        </div>

        {/* 가입하기 */}
        {/* 8주차 수정: isSubmitting을 signupMutation.isPending으로 변경 */}
        <button
          type="submit"
          disabled={!canSubmit || signupMutation.isPending}
          className="w-full rounded-lg bg-[#2563eb] py-3 font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {signupMutation.isPending ? "가입 중" : "가입하기"}
        </button>

        {/* 로그인 페이지 이동 */}
        <p className="text-center text-sm text-gray-500">
          이미 계정이 있나요?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#2563eb] hover:underline"
          >
            로그인
          </Link>
        </p>
      </form>
    </main>
  );
}
