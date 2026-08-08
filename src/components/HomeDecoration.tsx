import Image from "next/image";

// 홈 화면 전용 배경 장식(땅·나무·잔디·별·반짝임) — 참가자에게 처음 보이는
// 화면이라 다른 기능 화면과 달리 장식을 좀 더 넣어도 되는 곳. 하트(생명력
// UI)는 이 게임과 무관해서 제외했다. position: fixed로 뷰포트 전체에
// 퍼뜨려야 화면 가장자리까지 닿는다(globals.css .home-scene 참고 —
// 본문이 max-w-md라 absolute로 두면 좁은 영역 안에서만 퍼센트가 계산돼
// 가운데 근처에 몰려 보인다). 클릭을 가리면 안 되므로 pointer-events: none.
//
// 나무는 CSS 도형으로 여러 번 시도했지만(사각 블록, 계단형 실루엣, 겹친
// 원 등) 전부 어색하다는 피드백을 받아서, 결국 사용자가 준 픽셀아트
// 트레이스(SVG, 픽셀 단위 <rect> 22000여 개)를 그대로 PNG로 래스터라이즈
// 하고 하늘·잔디 배경만 제거해 실제 이미지 파일로 대체했다(public/
// tree-trace.png). 트리밍된 원본에 나무 두 그루가 붙어 있어, 좌우에
// 하나씩(오른쪽은 좌우 반전) 배치하는 것만으로 화면을 채운다.
export default function HomeDecoration() {
  return (
    <div className="home-scene" aria-hidden="true">
      <div className="home-ground" />

      <span className="home-star" style={{ top: "7%", right: "16%" }} />
      <span className="home-star" style={{ top: "22%", left: "10%", transform: "scale(0.8)" }} />
      <span className="home-star" style={{ top: "50%", right: "6%", transform: "scale(0.65)" }} />
      <span className="home-star" style={{ top: "62%", left: "5%", transform: "scale(0.55)" }} />

      <span className="home-spark" style={{ top: "10%", left: "22%" }} />
      <span className="home-spark home-spark--gold" style={{ top: "16%", right: "30%" }} />
      <span className="home-spark" style={{ top: "30%", right: "10%" }} />
      <span className="home-spark home-spark--gold" style={{ top: "40%", left: "6%" }} />
      <span className="home-spark" style={{ top: "56%", left: "28%" }} />
      <span className="home-spark home-spark--gold" style={{ top: "68%", right: "20%" }} />

      {/* next/image가 className만으로는 폭을 안 따라줘서(자체적으로
          인라인 스타일을 박음) width를 style에서 var()로 직접 지정 —
          이 변수는 globals.css의 모바일 미디어 쿼리에서 재정의된다. */}
      <Image
        src="/tree-trace.png"
        alt=""
        width={286}
        height={233}
        className="home-tree-img home-tree-img--left"
        style={{ width: "var(--tree-left-w)", height: "auto" }}
      />
      <Image
        src="/tree-trace.png"
        alt=""
        width={286}
        height={233}
        className="home-tree-img home-tree-img--right"
        style={{ width: "var(--tree-right-w)", height: "auto" }}
      />

      <span className="home-turf" style={{ left: "20%" }} />
      <span className="home-turf" style={{ left: "38%", transform: "scale(0.8)" }} />
      <span className="home-turf" style={{ right: "34%", transform: "scale(0.9)" }} />
      <span className="home-turf" style={{ right: "20%" }} />
    </div>
  );
}
