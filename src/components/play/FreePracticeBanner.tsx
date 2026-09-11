import './FreePracticeBanner.css';

/** 自由練習モードの簡潔ヘッダー */
export function FreePracticeBanner() {
  return (
    <section className="free-practice-banner" aria-label="自由練習">
      <p className="free-practice-banner__en">FREE PRACTICE</p>
      <p className="free-practice-banner__ja">
        じゆうに
        <br />
        もじを れんしゅうしよう！
      </p>
    </section>
  );
}
