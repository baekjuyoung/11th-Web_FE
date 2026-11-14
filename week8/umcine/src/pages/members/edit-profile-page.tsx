
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/members/me";
import { useUpdateMeMutation } from "../../hooks/use-update-me-mutation";

export function EditProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState("");
  const [image, setImage] = useState("");
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  const updateMeMutation = useUpdateMeMutation();

  useEffect(() => {
    if (!meQuery.data) return;

    setNickname(meQuery.data.nickname);
    setIsNicknameChecked(false);
  }, [meQuery.data]);

  const trimmedNickname = nickname.trim();

  const canSubmit =
    trimmedNickname.length >= 2 &&
    trimmedNickname.length <= 12;

  // 닉네임 입력값 변경
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setIsNicknameChecked(false);
  };

  // 닉네임 형식 확인
  const handleCheckNickname = () => {
    if (!canSubmit) {
      alert("닉네임은 2~12자로 입력해 주세요.");
      return;
    }

    // 실제 중복 확인 API는 추후 연결
    setIsNicknameChecked(true);
    alert("닉네임 형식 확인이 완료되었습니다.");
  };

  // 프로필 이미지 변경
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있어요.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("5MB 이하의 이미지를 선택해 주세요.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  // 닉네임 저장
  const handleSave = () => {
    if (
      !meQuery.data ||
      !canSubmit ||
      updateMeMutation.isPending
    ) {
      return;
    }

    if (
      trimmedNickname !== meQuery.data.nickname &&
      !isNicknameChecked
    ) {
      alert("닉네임 중복 확인을 먼저 해주세요.");
      return;
    }

    updateMeMutation.mutate({
      nickname: trimmedNickname,
    });
  };

  // 회원 탈퇴
  const handleWithdraw = () => {
    // 실제 회원 탈퇴 API는 추후 연결
    alert("회원 탈퇴 기능은 아직 연결되지 않았어요.");
  };

  return (
    <main className="flex min-h-[calc(100vh-128px)] flex-col bg-[#f7f8fa] px-4 py-8 md:px-[30px] lg:px-20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        {/* 제목 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#17191f]">
              내 정보 수정
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              닉네임과 프로필 이미지만 변경할 수 있어요.
            </p>
          </div>

          {/* 저장 버튼 */}
          <button
            type="button"
            onClick={handleSave}
            disabled={
              !meQuery.data ||
              !canSubmit ||
              updateMeMutation.isPending
            }
            className="rounded-md bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateMeMutation.isPending
              ? "저장 중"
              : "변경사항 저장"}
          </button>
        </div>

        {/* 프로필 수정 */}
        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.6fr]">
          {/* 이미지 */}
          <div className="flex flex-col items-center pt-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#e5e7eb]"
              aria-label="프로필 이미지 선택"
            >
              {image ? (
                <img
                  src={image}
                  alt="프로필"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <svg
                  width="46"
                  height="46"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-[#17191f]"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M3 21v-2c0-4 4-6 9-6s9 2 9 6v2H3z" />
                </svg>
              )}

              <span className="absolute -right-1 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m4 20 4-.8L19 8a2 2 0 0 0-3-3L5 16l-1 4Z" />
                </svg>
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <p className="mt-3 font-semibold text-[#17191f]">
              프로필 이미지
            </p>

            <p className="mt-1 text-xs text-gray-400">
              선택 사항 · 최대 5MB
            </p>
          </div>

          {/* 닉네임 및 이메일 */}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="nickname"
                className="mb-2 block text-sm font-semibold"
              >
                닉네임
              </label>

              <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:border-[#2563eb]">
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) =>
                    handleNicknameChange(e.target.value)
                  }
                  disabled={meQuery.isPending || updateMeMutation.isPending}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={
                    meQuery.isPending ||
                    updateMeMutation.isPending
                  }
                  className="shrink-0 px-4 text-sm font-semibold text-[#2563eb] disabled:opacity-50"
                >
                  중복 확인
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                이메일
              </label>

              <input
                id="email"
                type="email"
                value={meQuery.data?.email ?? ""}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 회원 탈퇴 */}
        <div className="mt-auto pt-20">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-400 bg-red-50 px-5 py-5">
            <div>
              <h2 className="font-semibold text-red-600">
                회원 탈퇴
              </h2>

              <p className="mt-1 text-xs text-red-500">
                탈퇴하면 작성한 평점, 후기와 즐겨찾기가 모두 삭제되며 복구할 수 없습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleWithdraw}
              className="shrink-0 rounded-md border border-red-500 bg-white px-4 py-2 text-sm font-semibold text-red-600"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
