export default function ActiveMultiplierBanner({ multiplier }: { multiplier: number }) {
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-center dark:border-purple-900 dark:bg-purple-950">
      <p className="font-bold text-purple-700 dark:text-purple-300">🎲 배팅 배수 {multiplier}배 적용 중</p>
    </div>
  );
}
