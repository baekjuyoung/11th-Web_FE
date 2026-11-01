import { Link, useLocation } from "@tanstack/react-router";

export function Header() {
  const location = useLocation();

  const isMovieActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/movies/");

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 md:px-[30px] lg:px-20">
      <div className="flex items-center gap-4 md:gap-6 lg:gap-10">
        <div className="flex items-center gap-[6px] whitespace-nowrap text-lg font-bold">
          <div className="flex h-6 w-6 items-center justify-center rounded-[5px] border-2 border-black">
            <img className="h-4 w-4" src="/icons/movie.svg" alt="" />
          </div>
          <span>UMCine</span>
        </div>

        <nav className="flex items-center gap-3 text-sm md:gap-[18px] lg:gap-7">
          <Link
            to="/"
            className={`relative whitespace-nowrap py-[22px] pb-5 text-[#111111] no-underline ${
              isMovieActive
                ? "font-semibold after:absolute after:right-0 after:bottom-4 after:left-0 after:h-0.5 after:bg-[#111111]"
                : ""
            }`}
          >
            영화
          </Link>

          <Link
            to="/search"
            className="relative whitespace-nowrap py-[22px] pb-5 text-[#111111] no-underline"
            activeProps={{
              className:
                "font-semibold after:absolute after:right-0 after:bottom-4 after:left-0 after:h-0.5 after:bg-[#111111]",
            }}
          >
            검색
          </Link>

          <a
            href="#"
            className="relative whitespace-nowrap py-[22px] pb-5 text-[#111111] no-underline"
          >
            내 정보
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-[6px] md:gap-3">
        <button
          className="h-9 w-9 shrink-0 cursor-pointer rounded-[6px] border border-[#e5e7eb] bg-white p-2"
          aria-label="검색"
        >
          <img
            className="h-full w-full"
            src="/icons/search.svg"
            alt=""
          />
        </button>

        <button className="h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-[6px] border-0 bg-[#2563eb] px-4 text-white">
          로그인
        </button>
      </div>
    </header>
  );
}