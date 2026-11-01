export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-[#e5e7eb] bg-white px-5 py-4 sm:px-10">
      <div className="mx-auto flex max-w-[1040px] items-center justify-end gap-2">
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-bold text-[#01b4e4] no-underline"
        >
          TMDB
        </a>

        <p className="text-[10px] text-[#6b7280]">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}