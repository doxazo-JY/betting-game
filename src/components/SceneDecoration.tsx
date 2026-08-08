import Image from "next/image";

// 배경 장식(땅·나무·잔디·별·반짝임) — 원래 홈 화면 전용이었다가 1팀/2팀/
// 중계 화면에도 적용해달라는 요청으로 공용 컴포넌트가 됨(진행자 화면은
// 제외 — 진행자 본인 작업 화면이라 장식보다 기능이 우선). 하트(생명력
// UI)는 이 게임과 무관해서 제외했다. position: fixed로 뷰포트 전체에
// 퍼뜨려야 화면 가장자리까지 닿는다(globals.css .home-scene 참고 —
// 본문이 max-w 제한 폭이라 absolute로 두면 그 좁은 영역 안에서만
// 퍼센트가 계산돼 가운데 근처에 몰려 보인다). 사용하는 페이지에서는
// 이 컴포넌트 뒤에 오는 실제 콘텐츠를 `relative z-10`으로 감싸야
// 장식 위로 올라온다(.home-scene이 z-index:0인 positioned 요소라,
// 안 감싸면 static 콘텐츠가 오히려 뒤로 깔린다). 클릭을 가리면 안
// 되므로 pointer-events: none.
//
// CSS 클래스 이름은 아직 `.home-*`로 남아있음(리네임은 안 함, 위험 대비
// 이득이 적어서) — 하지만 이제 홈 전용이 아니라 공용 장식이라는 점 유의.
//
// 나무는 CSS 도형으로 여러 번 시도했지만(사각 블록, 계단형 실루엣, 겹친
// 원 등) 전부 어색하다는 피드백을 받아서, 결국 사용자가 준 픽셀아트
// 트레이스(SVG, 픽셀 단위 <rect> 22000여 개)를 그대로 PNG로 래스터라이즈
// 하고 하늘·잔디 배경만 제거해 실제 이미지 파일로 대체했다(public/
// tree-trace.png). 트리밍된 원본에 나무 두 그루가 붙어 있어, 좌우에
// 하나씩(오른쪽은 좌우 반전) 배치하는 것만으로 화면을 채운다.
export default function SceneDecoration() {
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
