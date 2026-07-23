'use strict';
(() => {
  if (document.querySelector('[data-editor-raj-universe-launcher]')) return;

  const style = document.createElement('style');
  style.textContent = `
  .eru-launcher-section{
    position:relative;z-index:3;padding:95px 0;
    overflow:hidden;
  }
  .eru-launcher{
    position:relative;min-height:390px;border:1px solid var(--line,rgba(255,255,255,.12));
    border-radius:34px;overflow:hidden;padding:42px;
    display:grid;grid-template-columns:1.15fr .85fr;align-items:center;gap:30px;
    background:
      radial-gradient(circle at 82% 30%,rgba(86,219,255,.22),transparent 30%),
      radial-gradient(circle at 15% 75%,rgba(255,61,205,.2),transparent 35%),
      linear-gradient(145deg,rgba(12,12,24,.95),rgba(5,6,14,.94));
    box-shadow:0 30px 100px rgba(0,0,0,.38);
  }
  .eru-launcher:before{
    content:"";position:absolute;inset:0;pointer-events:none;opacity:.38;
    background-image:
      radial-gradient(circle at 10% 20%,#fff 0 1px,transparent 1.5px),
      radial-gradient(circle at 70% 15%,#a99cff 0 1px,transparent 1.5px),
      radial-gradient(circle at 30% 80%,#61e2ff 0 1px,transparent 1.5px);
    background-size:110px 110px,160px 160px,210px 210px;
    animation:eruStars 18s linear infinite;
  }
  @keyframes eruStars{to{background-position:110px 220px,160px 320px,210px 420px}}
  .eru-copy{position:relative;z-index:2}
  .eru-copy small{font-size:10px;letter-spacing:.22em;font-weight:800;color:#6ee6ff}
  .eru-copy h2{font-size:clamp(38px,5vw,68px);line-height:1.02;letter-spacing:-3px;margin:13px 0}
  .eru-copy p{max-width:600px;color:var(--muted,#aaa);line-height:1.8}
  .eru-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
  .eru-enter{
    display:inline-flex;align-items:center;gap:10px;padding:14px 20px;border-radius:999px;
    background:linear-gradient(135deg,#ff3dcd,#7658ff);color:white!important;
    font-weight:800;box-shadow:0 14px 40px rgba(110,70,255,.35)
  }
  .eru-about{
    display:inline-flex;align-items:center;padding:14px 20px;border-radius:999px;
    border:1px solid var(--line,rgba(255,255,255,.12));background:rgba(255,255,255,.05);
    color:inherit;font-weight:800
  }
  .eru-orbit{position:relative;z-index:2;min-height:280px;display:grid;place-items:center}
  .eru-core{
    width:150px;height:150px;border-radius:50%;
    background:radial-gradient(circle at 35% 28%,#fff,#b4a6ff 16%,#6546ff 42%,#100a31 70%);
    box-shadow:0 0 70px rgba(111,76,255,.75);animation:eruPulse 2.7s ease-in-out infinite
  }
  .eru-ring{position:absolute;border:1px solid rgba(103,222,255,.35);border-radius:50%;animation:eruSpin 12s linear infinite}
  .eru-ring.r1{width:220px;height:220px}.eru-ring.r2{width:285px;height:285px;animation-direction:reverse;animation-duration:18s}
  .eru-ring:after{content:"";position:absolute;width:9px;height:9px;border-radius:50%;background:#65e5ff;left:50%;top:-5px;box-shadow:0 0 18px #65e5ff}
  @keyframes eruSpin{to{transform:rotate(360deg)}}@keyframes eruPulse{50%{transform:scale(1.06);box-shadow:0 0 105px rgba(70,210,255,.64)}}
  .eru-float{
    position:fixed;right:16px;bottom:92px;z-index:85;width:52px;height:52px;border-radius:50%;
    display:grid;place-items:center;background:linear-gradient(135deg,#ff3dcd,#7658ff);color:#fff!important;
    box-shadow:0 15px 45px rgba(102,65,255,.45);font-size:20px
  }
  @media(max-width:760px){
    .eru-launcher{grid-template-columns:1fr;padding:27px;min-height:auto}
    .eru-orbit{min-height:260px}.eru-copy h2{letter-spacing:-2px}
  }`;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'eru-launcher-section';
  section.dataset.editorRajUniverseLauncher = 'true';
  section.innerHTML = `
    <div class="container">
      <article class="eru-launcher reveal">
        <div class="eru-copy">
          <small>EDITOR RAJ Ω ENGINE</small>
          <h2>Beyond the website.<br>Enter the universe.</h2>
          <p>The complete music website stays here. The cinematic 3D creator world opens as a separate experience.</p>
          <div class="eru-actions">
            <a class="eru-enter" href="universe/"><i class="fa-solid fa-rocket"></i> Enter Creator Universe</a>
            <a class="eru-about" href="#latest">Explore music first</a>
          </div>
        </div>
        <div class="eru-orbit" aria-hidden="true">
          <div class="eru-ring r1"></div><div class="eru-ring r2"></div><div class="eru-core"></div>
        </div>
      </article>
    </div>`;

  const cta = document.querySelector('.cta');
  const links = document.querySelector('#links');
  const main = document.querySelector('main');
  if (cta?.parentNode) cta.parentNode.insertBefore(section, cta);
  else if (links?.parentNode) links.parentNode.insertBefore(section, links.nextSibling);
  else main?.appendChild(section);

  const floating = document.createElement('a');
  floating.className = 'eru-float';
  floating.href = 'universe/';
  floating.title = 'Enter Creator Universe';
  floating.setAttribute('aria-label','Enter Creator Universe');
  floating.innerHTML = '<i class="fa-solid fa-rocket"></i>';
  document.body.appendChild(floating);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('show'));
    }, {threshold:.12});
    observer.observe(section.querySelector('.reveal'));
  } else {
    section.querySelector('.reveal')?.classList.add('show');
  }
})();