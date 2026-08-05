export default function ActiveMultiplierBanner({ multiplier }: { multiplier: number }) {
  return (
    <div className="flex items-center justify-center gap-2 border-2 border-ink bg-event-tint px-4 py-3 text-center">
      <span className="flex h-6 w-6 items-center justify-center border-2 border-ink bg-event text-white">
        <span className="icon-bolt" />
      </span>
      <p className="font-black text-event-ink">배팅 배수 {multiplier}배 적용 중</p>
    </div>
  );
}
