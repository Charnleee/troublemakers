// =============================================
// TROUBLEMAKERS MMA — MAIN JS v3.0
// No custom cursor. Clean. Fast. Smooth.
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- LOADER ---- */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 300));
    setTimeout(() => loader && loader.classList.add('hidden'), 2500);
  }

  /* ---- NAVBAR SCROLL (throttled) ---- */
  const nav = document.getElementById('mainNav');
  if (nav) {
    let t = false;
    window.addEventListener('scroll', () => {
      if (!t) {
        requestAnimationFrame(() => { nav.classList.toggle('scrolled', window.scrollY > 60); t = false; });
        t = true;
      }
    }, { passive: true });
  }

  /* ---- ACTIVE NAV LINK ---- */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0];
    if (href === page) link.classList.add('active');
  });

  /* ---- HERO SLIDER ---- */
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.dot');
  if (slides.length) {
    let cur = 0, timer;
    const go = n => {
      slides[cur].classList.remove('active'); dots[cur]?.classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active'); dots[cur]?.classList.add('active');
    };
    const start = () => { timer = setInterval(() => go(cur + 1), 5000); };
    const stop  = () => clearInterval(timer);
    start();
    dots.forEach((d, i) => d.addEventListener('click', () => { stop(); go(i); start(); }));
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  }

  /* ---- COUNT UP ANIMATION ---- */
  const counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || (target >= 100 ? '+' : '');
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / 1800, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---- SCROLL REVEAL (single observer) ---- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Trigger count-up for any data-count inside revealed element
        entry.target.querySelectorAll('[data-count]').forEach(animateCount);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Auto-tag common grid children
  const autoSel = [
    '.class-card','.mini-day','.membership-card','.product-card',
    '.contact-info-card','.coach-card','.training-benefit',
    '.schedule-day-block','.value-card','.highlight-card',
    '.record-cell','.title-item','.review-card','.coach-level-card',
    '.milestone-item','.champ-record-cell','.promo-badge',
  ].join(',');
  document.querySelectorAll(autoSel).forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 5) * 0.07 + 's';
      io.observe(el);
    }
  });

  /* ---- COUNT-UP trigger for hero stats & record grids ---- */
  const triggerEls = document.querySelectorAll('.hero-stats, .champ-record-grid, .community-stats, .coaching-stat-strip');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(animateCount);
        countIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  triggerEls.forEach(el => countIO.observe(el));
  // Also fire for loose counters not inside a tracked container
  if (!document.querySelector('.hero-stats, .champ-record-grid')) {
    counters.forEach(animateCount);
  }

  /* ---- TICKER HOVER PAUSE ---- */
  document.querySelectorAll('.ticker-wrap, .record-ticker, .promotions-strip').forEach(wrap => {
    const inner = wrap.querySelector('.ticker, .record-ticker-inner, .promo-scroll');
    if (!inner) return;
    wrap.addEventListener('mouseenter', () => inner.style.animationPlayState = 'paused', { passive: true });
    wrap.addEventListener('mouseleave', () => inner.style.animationPlayState = 'running', { passive: true });
  });

  /* ---- PARALLAX (desktop only, throttled) ---- */
  if (window.innerWidth > 768) {
    const pEls = document.querySelectorAll('.slide-bg, .page-hero-bg, .cta-bg');
    if (pEls.length) {
      let pt = false;
      window.addEventListener('scroll', () => {
        if (!pt) {
          requestAnimationFrame(() => {
            const y = window.scrollY;
            pEls.forEach(el => { el.style.transform = `translateY(${y * 0.14}px)`; });
            pt = false;
          });
          pt = true;
        }
      }, { passive: true });
    }
  }

  /* ---- MERCH FILTER ---- */
  const filterBtns  = document.querySelectorAll('.merch-filter-btn');
  const productCards = document.querySelectorAll('.product-card[data-category]');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        productCards.forEach(c => {
          const show = f === 'all' || c.dataset.category === f;
          if (show) {
            c.style.display = 'block';
            requestAnimationFrame(() => { c.style.opacity = '1'; c.style.transform = 'translateY(0)'; });
          } else {
            c.style.opacity = '0'; c.style.transform = 'translateY(8px)';
            setTimeout(() => { c.style.display = 'none'; }, 280);
          }
        });
      });
    });
  }

  /* ---- GALLERY LIGHTBOX ---- */
  if (document.querySelector('.ig-grid, .gallery-masonry')) {
    let lb = document.getElementById('galleryLightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'galleryLightbox';
      lb.className = 'gallery-lightbox';
      lb.innerHTML = `
        <div class="lb-content">
          <button class="lb-close" aria-label="Close">&times;</button>
          <img id="lbImage" src="" alt="Gallery"/>
        </div>
        <button class="lb-nav-btn lb-prev"><i class="fas fa-chevron-left"></i></button>
        <button class="lb-nav-btn lb-next"><i class="fas fa-chevron-right"></i></button>`;
      document.body.appendChild(lb);
    }
    const lbImg = document.getElementById('lbImage');
    let imgs = [], idx = 0;
    const open  = src => { imgs = Array.from(document.querySelectorAll('.gm-item img,.vg-item img,.ig-item img')).map(i=>i.src); idx=imgs.indexOf(src); if(idx<0)idx=0; lb.classList.add('open'); document.body.style.overflow='hidden'; lbImg.src=imgs[idx]; };
    const close = ()  => { lb.classList.remove('open'); document.body.style.overflow=''; };
    const nav   = d  => { idx=(idx+d+imgs.length)%imgs.length; lbImg.src=imgs[idx]; };
    document.addEventListener('click', e => { const it=e.target.closest('.gm-item,.vg-item,.ig-item'); if(it){const img=it.querySelector('img');if(img)open(img.src);} });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', () => nav(-1));
    lb.querySelector('.lb-next').addEventListener('click', () => nav(1));
    lb.addEventListener('click', e => { if(e.target===lb) close(); });
    document.addEventListener('keydown', e => { if(!lb.classList.contains('open'))return; if(e.key==='Escape')close(); if(e.key==='ArrowLeft')nav(-1); if(e.key==='ArrowRight')nav(1); });
    let tx=0;
    lb.addEventListener('touchstart', e=>{tx=e.touches[0].clientX;},{passive:true});
    lb.addEventListener('touchend',   e=>{const d=tx-e.changedTouches[0].clientX;if(Math.abs(d)>45)nav(d>0?1:-1);},{passive:true});
  }

  /* ---- WHATSAPP FLOAT ---- */
  const wa = document.createElement('a');
  wa.href='https://wa.me/27767962742'; wa.target='_blank'; wa.rel='noopener noreferrer';
  wa.className='wa-float'; wa.setAttribute('aria-label','Chat on WhatsApp');
  wa.innerHTML='<i class="fab fa-whatsapp"></i>';
  document.body.appendChild(wa);

  /* ---- CONTACT FORM ---- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const orig = btn.textContent;
      btn.textContent = 'SENDING...'; btn.disabled = true;
      const name    = form.querySelector('[name=from_name]')?.value  || '';
      const phone   = form.querySelector('[name=phone]')?.value       || '';
      const interest= form.querySelector('[name=interest]')?.value   || '';
      const message = form.querySelector('[name=message]')?.value    || '';
      const msg = `Hi Troublemakers! 👊\nName: ${name}\nPhone: ${phone}\nInterest: ${interest}\n${message}`;
      window.open(`https://wa.me/27767962742?text=${encodeURIComponent(msg)}`, '_blank');
      btn.textContent = 'SENT ✓'; btn.style.background = '#25D366'; btn.style.color = '#fff';
      form.reset();
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = btn.style.color = ''; }, 4000);
    });
  }

  /* ---- FREE TRIAL POPUP (homepage only, once per session) ---- */
  const isHome = ['','/','/index.html','index.html'].some(p => window.location.pathname.endsWith(p));
  if (isHome && !sessionStorage.getItem('trialShown')) {
    setTimeout(() => {
      const ov = document.createElement('div'); ov.id = 'trialPopupOverlay';
      ov.innerHTML = `<div id="trialPopup">
        <button id="trialPopupClose" aria-label="Close">&times;</button>
        <div class="tp-badge">LIMITED OFFER</div>
        <div class="tp-icon"><i class="fas fa-fist-raised"></i></div>
        <h2 class="tp-title">YOUR FIRST SESSION IS <span>FREE</span></h2>
        <p class="tp-sub">No commitment. No pressure. Trained by a 3× EFC World Champion — Palmstead, Cape Town.</p>
        <div class="tp-features">
          <div class="tp-feat"><i class="fas fa-check"></i> All levels — beginner to pro</div>
          <div class="tp-feat"><i class="fas fa-check"></i> MMA · Boxing · Kickboxing · HIIT · Kids</div>
          <div class="tp-feat"><i class="fas fa-check"></i> 3× EFC World Champion coaching staff</div>
        </div>
        <a href="https://wa.me/27767962742?text=Hi%2C%20I%20want%20to%20book%20my%20free%20trial!" target="_blank" class="tp-btn"><i class="fab fa-whatsapp"></i>&nbsp; BOOK MY FREE TRIAL</a>
        <a href="contact.html" class="tp-link">Or use the contact form &rarr;</a>
      </div>`;
      document.body.appendChild(ov);
      sessionStorage.setItem('trialShown', '1');
      ov.style.opacity = '0'; ov.style.transition = 'opacity 0.4s';
      requestAnimationFrame(() => { ov.style.opacity = '1'; });
      const closePopup = () => { ov.style.opacity='0'; setTimeout(()=>ov.remove(),400); };
      document.getElementById('trialPopupClose').addEventListener('click', closePopup);
      ov.addEventListener('click', e => { if(e.target===ov) closePopup(); });
      document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){closePopup();document.removeEventListener('keydown',esc);} });
    }, 10000);
  }

  /* ---- COOKIE BANNER ---- */
  if (!localStorage.getItem('tmCookies')) {
    setTimeout(() => {
      const b = document.createElement('div'); b.id = 'cookieBanner';
      b.innerHTML = `<div class="cb-inner"><span class="cb-text"><i class="fas fa-cookie-bite"></i>&nbsp; We use cookies to improve your experience. By continuing you agree to our cookie policy.</span><div class="cb-btns"><button id="cbAccept">ACCEPT ALL</button><button id="cbDecline">DECLINE</button></div></div>`;
      document.body.appendChild(b);
      requestAnimationFrame(() => { b.style.transform = 'translateY(0)'; });
      const dismiss = v => { localStorage.setItem('tmCookies',v); b.style.transform='translateY(120%)'; setTimeout(()=>b.remove(),500); };
      document.getElementById('cbAccept').addEventListener('click', ()=>dismiss('accepted'));
      document.getElementById('cbDecline').addEventListener('click', ()=>dismiss('declined'));
    }, 1500);
  }

  /* ---- SMOOTH SCROLL for anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

});

/* ---- REVIEWS CAROUSEL ---- */
(function initReviewsCarousel() {
  const track    = document.getElementById('reviewsTrack');
  const prevBtn  = document.getElementById('revPrev');
  const nextBtn  = document.getElementById('revNext');
  const dotsWrap = document.getElementById('revDots');
  if (!track) return;
  const cards = Array.from(track.querySelectorAll('.review-card'));
  if (!cards.length) return;
  let current = 0, autoTimer, animating = false;
  const visible  = () => window.innerWidth >= 992 ? 3 : window.innerWidth >= 576 ? 2 : 1;
  const maxIdx   = () => Math.max(0, cards.length - visible());
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIdx(); i++) {
      const d = document.createElement('button');
      d.className = 'rev-dot' + (i===0?' active':'');
      d.addEventListener('click', ()=>{ stop(); goTo(i); start(); });
      dotsWrap.appendChild(d);
    }
  }
  function goTo(n, instant) {
    if (animating && !instant) return; animating = true;
    current = Math.max(0, Math.min(n, maxIdx()));
    const gap = parseInt(getComputedStyle(track).gap)||24;
    track.style.transition = instant ? 'none' : 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)';
    track.style.transform = `translateX(-${current*(cards[0].offsetWidth+gap)}px)`;
    dotsWrap?.querySelectorAll('.rev-dot').forEach((d,i)=>d.classList.toggle('active',i===current));
    if (prevBtn) prevBtn.style.opacity = current===0?'0.35':'1';
    if (nextBtn) nextBtn.style.opacity = current>=maxIdx()?'0.35':'1';
    setTimeout(()=>{ animating=false; }, 600);
  }
  function start() { stop(); autoTimer=setInterval(()=>goTo(current>=maxIdx()?0:current+1),4500); }
  function stop()  { clearInterval(autoTimer); }
  prevBtn?.addEventListener('click', ()=>{ stop(); goTo(current-1); start(); });
  nextBtn?.addEventListener('click', ()=>{ stop(); goTo(current+1); start(); });
  let tx=0;
  track.addEventListener('touchstart', e=>{tx=e.touches[0].clientX;stop();},{passive:true});
  track.addEventListener('touchend',   e=>{const d=tx-e.changedTouches[0].clientX;if(Math.abs(d)>45)goTo(d>0?current+1:current-1);start();},{passive:true});
  track.addEventListener('mouseenter', stop,  {passive:true});
  track.addEventListener('mouseleave', start, {passive:true});
  let rt; window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{buildDots();goTo(0,true);},200);},{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  buildDots(); goTo(0,true); start();
})();

/* ---- INJECTED RUNTIME STYLES ---- */
(function(){
  const s = document.createElement('style');
  s.textContent = `
    .wa-float{position:fixed;bottom:2rem;right:2rem;width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#fff;z-index:9998;box-shadow:0 4px 20px rgba(37,211,102,0.5);text-decoration:none;animation:waPulse 2.5s ease infinite;transition:transform .3s,box-shadow .3s}
    .wa-float:hover{transform:scale(1.12);box-shadow:0 6px 30px rgba(37,211,102,0.7)}
    @keyframes waPulse{0%,100%{box-shadow:0 4px 20px rgba(37,211,102,0.5)}50%{box-shadow:0 4px 38px rgba(37,211,102,0.85)}}
    .merch-filter-btn{background:transparent;border:1px solid rgba(255,215,0,0.3);color:rgba(255,255,255,0.7);font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:2px;padding:.6rem 1.2rem;cursor:pointer;transition:background .25s,color .25s,border-color .25s;text-transform:uppercase}
    .merch-filter-btn:hover,.merch-filter-btn.active{background:var(--gold);color:var(--black);border-color:var(--gold)}
    .gallery-lightbox{position:fixed;inset:0;background:rgba(0,0,0,0.97);z-index:999999;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s}
    .gallery-lightbox.open{opacity:1;pointer-events:all}
    .lb-content{position:relative;max-width:90vw;max-height:90vh}
    .lb-content img{max-width:90vw;max-height:85vh;object-fit:contain;border:1px solid rgba(255,215,0,0.2);display:block}
    .lb-close{position:absolute;top:-3rem;right:0;background:none;border:1px solid rgba(255,215,0,0.4);color:var(--gold);font-size:1.2rem;width:40px;height:40px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .lb-close:hover{background:var(--gold);color:#000}
    .lb-nav-btn{position:fixed;top:50%;transform:translateY(-50%);background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.25);color:var(--gold);font-size:1.4rem;width:50px;height:80px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s;z-index:10}
    .lb-nav-btn:hover{background:rgba(255,215,0,0.18)}
    .lb-prev{left:1rem}.lb-next{right:1rem}
    #cookieBanner{position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#111;border-top:1px solid rgba(255,215,0,0.2);transform:translateY(120%);transition:transform .5s cubic-bezier(.34,1.1,.64,1);padding:.9rem 0}
    .cb-inner{max-width:1200px;margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap}
    .cb-text{color:rgba(255,255,255,0.75);font-size:.83rem;flex:1;min-width:200px}
    .cb-text i{color:var(--gold);margin-right:.4rem}
    .cb-btns{display:flex;gap:.7rem;flex-shrink:0}
    #cbAccept,#cbDecline{font-family:'Orbitron',sans-serif;font-size:.52rem;letter-spacing:2px;font-weight:700;padding:.55rem 1.2rem;border:none;cursor:pointer;transition:all .25s;text-transform:uppercase}
    #cbAccept{background:var(--gold);color:#000;clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}
    #cbDecline{background:transparent;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.15)}
    #trialPopupOverlay{position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(5px)}
    #trialPopup{background:#111;border:1px solid var(--gold);box-shadow:0 0 80px rgba(255,215,0,0.2);padding:2.8rem 2.3rem;max-width:460px;width:100%;position:relative;text-align:center;animation:popupIn .5s cubic-bezier(.34,1.56,.64,1) both}
    @keyframes popupIn{from{transform:scale(.82) translateY(24px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
    #trialPopupClose{position:absolute;top:1rem;right:1rem;background:none;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.5);font-size:1.3rem;width:34px;height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;line-height:1}
    #trialPopupClose:hover{border-color:var(--gold);color:var(--gold)}
    .tp-badge{display:inline-block;background:var(--gold);color:#000;font-family:'Orbitron',sans-serif;font-size:.5rem;letter-spacing:3px;padding:.25rem .9rem;margin-bottom:1rem}
    .tp-icon{font-size:2.5rem;color:var(--gold);margin-bottom:.8rem;animation:bounce 2s ease-in-out infinite}
    .tp-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.6rem,4vw,2.4rem);letter-spacing:2px;color:#fff;line-height:1.1;margin-bottom:.8rem}
    .tp-title span{color:var(--gold)}
    .tp-sub{color:rgba(255,255,255,0.75);font-size:.88rem;line-height:1.7;margin-bottom:1.1rem}
    .tp-features{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1.4rem;text-align:left}
    .tp-feat{display:flex;align-items:center;gap:.6rem;font-size:.87rem;color:rgba(255,255,255,0.8);font-weight:600}
    .tp-feat i{color:var(--gold);font-size:.7rem}
    .tp-btn{display:block;background:#25D366;color:#fff;font-family:'Orbitron',sans-serif;font-size:.65rem;letter-spacing:2px;font-weight:700;padding:.9rem 2rem;text-decoration:none;margin-bottom:.8rem;transition:all .3s;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
    .tp-btn:hover{background:#1da84e;transform:translateY(-2px);color:#fff}
    .tp-link{display:block;font-family:'Orbitron',sans-serif;font-size:.52rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .3s}
    .tp-link:hover{color:var(--gold)}
  `;
  document.head.appendChild(s);
})();
