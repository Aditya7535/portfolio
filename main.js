/* ==========================================================================
   ADITYA WAGH — EDITORIAL PORTFOLIO ENGINE (GSAP & SCROLLTRIGGER)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Remove no-js flag
  document.documentElement.classList.remove('no-js');

  /* ------------------------------------------------------------------------
     1. LENIS SMOOTH SCROLL INITIALIZATION
     ------------------------------------------------------------------------ */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ------------------------------------------------------------------------
     2. CUSTOM MINIMAL RED CURSOR
     ------------------------------------------------------------------------ */
  const cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let hasMoved = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        currentX = mouseX;
        currentY = mouseY;
        cursor.style.opacity = '1';
      }
    });

    window.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });

    window.addEventListener('mouseenter', () => {
      if (hasMoved) cursor.style.opacity = '1';
    });

    const updateCursor = () => {
      if (hasMoved) {
        currentX += (mouseX - currentX) * 0.2;
        currentY += (mouseY - currentY) * 0.2;
        cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
      requestAnimationFrame(updateCursor);
    };
    requestAnimationFrame(updateCursor);

    // Interactive Hover States
    const interactiveElements = document.querySelectorAll('a, button, .role-item, .brand-link, .void-scroll-indicator');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ------------------------------------------------------------------------
     3. WORLD NAVIGATION STATE CONTROLLER & SHORTCUT SYSTEM
     ------------------------------------------------------------------------ */
  const worldNum = document.getElementById('worldNum');
  const worldName = document.getElementById('worldName');
  const worldCounterBtn = document.getElementById('worldCounter');
  const navJumpDrawer = document.getElementById('navJumpDrawer');
  const shortcutLinks = document.querySelectorAll('.shortcut-link');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  const updateWorldNav = (number, name, theme) => {
    if (worldNum && worldName) {
      if (worldName.textContent !== name) {
        gsap.to([worldNum, worldName], {
          opacity: 0,
          y: -4,
          duration: 0.2,
          onComplete: () => {
            worldNum.textContent = number;
            worldName.textContent = name;
            gsap.to([worldNum, worldName], {
              opacity: 1,
              y: 0,
              duration: 0.25,
            });
          }
        });
      }
    }
    document.body.setAttribute('data-world', theme);

    // Update active state on header shortcut links
    shortcutLinks.forEach(link => {
      if (link.getAttribute('data-target') === number) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update active state on drawer links
    drawerLinks.forEach(link => {
      if (link.getAttribute('data-target') === number) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  // Close drawer helper
  const closeDrawer = () => {
    if (navJumpDrawer && navJumpDrawer.classList.contains('open')) {
      navJumpDrawer.classList.remove('open');
      navJumpDrawer.setAttribute('aria-hidden', 'true');
      if (worldCounterBtn) worldCounterBtn.setAttribute('aria-expanded', 'false');
    }
  };

  // Navigation router: Handles both same-page scrolling and multi-page routing
  const navigateTo = (href) => {
    closeDrawer();
    if (!href) return;

    // Internal hash on current page
    if (href.startsWith('#')) {
      const targetEl = document.querySelector(href);
      if (targetEl) {
        if (lenis) {
          lenis.scrollTo(targetEl, { duration: 1.2, offset: 0 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }

    // Multi-page destination check
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const targetFile = href.split('#')[0];
    const targetHash = href.includes('#') ? '#' + href.split('#')[1] : null;

    const isCurrentPage = (targetFile === currentPath) || 
                          ((currentPath === '' || currentPath === '/') && targetFile === 'index.html');

    if (isCurrentPage) {
      if (targetHash) {
        const el = document.querySelector(targetHash);
        if (el) {
          if (lenis) lenis.scrollTo(el, { duration: 1.2, offset: 0 });
          else el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
  };

  // Toggle quick jump drawer
  if (worldCounterBtn && navJumpDrawer) {
    worldCounterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navJumpDrawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        navJumpDrawer.classList.add('open');
        navJumpDrawer.setAttribute('aria-hidden', 'false');
        worldCounterBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navJumpDrawer.contains(e.target) && !worldCounterBtn.contains(e.target)) {
        closeDrawer();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    });
  }

  // Wire up all shortcut links (center bar + drawer)
  const allNavLinks = [...shortcutLinks, ...drawerLinks];
  allNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href) {
        e.preventDefault();
        navigateTo(href);
      }
    });
  });

  // Wire brand link to index.html / top
  const brandLink = document.getElementById('brandLink');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('index.html');
    });
  }

  // Wire Return to Top buttons
  const returnTopBtns = document.querySelectorAll('.return-top-btn, #returnTopBtn');
  returnTopBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Global Keyboard Shortcuts: Keys 1 to 5 to jump between worlds
  const keyToPageMap = {
    '1': 'index.html',
    '2': 'human.html',
    '3': 'engine.html',
    '4': 'cut.html',
    '5': 'creator.html'
  };

  window.addEventListener('keydown', (e) => {
    const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    if (keyToPageMap[e.key]) {
      navigateTo(keyToPageMap[e.key]);
    }
  });

  /* ------------------------------------------------------------------------
     4. GSAP & SCROLLTRIGGER CHOREOGRAPHY
     ------------------------------------------------------------------------ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Update ScrollTrigger when Lenis scrolls
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    /* ----------------------------------------------------------------------
       SECTION 01: THE VOID (PINNED TIMELINE)
       ---------------------------------------------------------------------- */
    const voidPinContainer = document.getElementById('voidPinContainer');
    const rowAditya = document.getElementById('rowAditya');
    const rowWagh = document.getElementById('rowWagh');
    const trackAditya = document.getElementById('trackAditya');
    const charsAditya = rowAditya ? rowAditya.querySelectorAll('.char') : [];
    const charsWagh = rowWagh ? rowWagh.querySelectorAll('.char') : [];
    const lettersAD = rowAditya ? rowAditya.querySelectorAll('.letter-a1, .letter-d') : [];
    const lettersITYA = rowAditya ? rowAditya.querySelectorAll('.letter-i, .letter-t, .letter-y, .letter-a2') : [];

    const voidRedAccent = document.getElementById('voidRedAccent');
    const voidCaptionStamp = document.getElementById('voidCaptionStamp');
    const voidHeroMessage = document.getElementById('voidHeroMessage');
    const lineBuild = document.getElementById('lineBuild');
    const lineEdit = document.getElementById('lineEdit');
    const lineCreate = document.getElementById('lineCreate');
    const voidDescriptors = document.getElementById('voidDescriptors');
    const voidScrollIndicator = document.getElementById('voidScrollIndicator');

    if (document.getElementById('world-void') && voidPinContainer) {
      const voidTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#world-void',
        start: 'top top',
        end: '+=260%',
        pin: voidPinContainer,
        scrub: 1,
        anticipatePin: 1,
        onEnter: () => updateWorldNav('01', 'THE VOID', 'void'),
        onEnterBack: () => updateWorldNav('01', 'THE VOID', 'void'),
      }
    });

    const isMobile = window.innerWidth <= 768;

    // Void Stage 1: Initial Crop -> ADITYA enters horizontally & letter-spacing stretches: A D I T Y A
    voidTimeline
      .to(voidScrollIndicator, {
        opacity: 0,
        y: 15,
        duration: 0.5,
      }, 0)
      .to(rowAditya, {
        x: '0vw',
        y: '0vh',
        ease: 'power2.out',
        duration: 1.8,
      }, 0)
      .to(charsAditya, {
        letterSpacing: isMobile ? '-0.01em' : '0.04em',
        ease: 'power1.out',
        duration: 1.6,
      }, 0.2)

      // Void Stage 2: Stagger split -> AD shifts UP, ITYA shifts DOWN, WAGH enters vertically from below
      .to(lettersAD, {
        y: isMobile ? '-20px' : '-35px',
        ease: 'power2.inOut',
        duration: 1.2,
      }, 1.6)
      .to(lettersITYA, {
        y: isMobile ? '20px' : '35px',
        ease: 'power2.inOut',
        duration: 1.2,
      }, 1.6)
      .to(rowWagh, {
        y: isMobile ? '6vh' : '8vh',
        opacity: 1,
        ease: 'power2.out',
        duration: 1.5,
      }, 1.6)

      // Void Stage 3: Resolves into unified monumental composition: ADITYA WAGH
      .to(rowAditya, {
        y: isMobile ? '-4vh' : '-5vh',
        ease: 'power2.out',
        duration: 1.2,
      }, 2.8)
      .to([lettersAD, lettersITYA], {
        y: '0px',
        letterSpacing: isMobile ? '-0.03em' : '-0.04em',
        ease: 'power2.out',
        duration: 1.2,
      }, 2.8)
      .to(rowWagh, {
        x: '0vw',
        y: isMobile ? '4vh' : '5vh',
        ease: 'power2.out',
        duration: 1.2,
      }, 2.8)
      .to(voidRedAccent, {
        width: isMobile ? '90px' : '160px',
        ease: 'power2.out',
        duration: 1.0,
      }, 3.0)
      .to(voidCaptionStamp, {
        opacity: 1,
        y: 0,
        ease: 'power1.out',
        duration: 0.8,
      }, 3.2)

      // Void Stage 4: Fragmentation! Letters disperse outward into the void with blur
      .to(charsAditya, {
        x: (i) => (i % 2 === 0 ? -140 * (i + 1) : 120 * (i + 1)),
        y: (i) => (i % 2 === 0 ? -100 : 100),
        rotation: (i) => (i - 2.5) * 20,
        opacity: 0,
        filter: 'blur(10px)',
        stagger: 0.03,
        ease: 'power3.in',
        duration: 1.6,
      }, 4.2)
      .to(charsWagh, {
        x: (i) => (i % 2 === 0 ? 150 * (i + 1) : -130 * (i + 1)),
        y: (i) => (i % 2 === 0 ? 110 : -110),
        rotation: (i) => (i - 1.5) * -25,
        opacity: 0,
        filter: 'blur(10px)',
        stagger: 0.03,
        ease: 'power3.in',
        duration: 1.6,
      }, 4.3)
      .to([voidRedAccent, voidCaptionStamp], {
        opacity: 0,
        duration: 0.6,
      }, 4.3)

      // Void Stage 5: Hero Message sequence — I BUILD. I EDIT. I CREATE.
      .to(voidHeroMessage, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.4,
      }, 5.6)
      .to(lineBuild, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        duration: 0.9,
      }, 5.8)
      .to(lineEdit, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        duration: 0.9,
      }, 6.3)
      .to(lineCreate, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        duration: 0.9,
      }, 6.8)
      .to(voidDescriptors, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        duration: 1.0,
      }, 7.4)

      // Void Stage 6: Fade out creed as we descend into World 02
      .to(voidHeroMessage, {
        opacity: 0,
        y: -30,
        duration: 1.0,
        ease: 'power2.in',
      }, 8.6)
      .to({}, { duration: 0.8 });
    }

    /* ----------------------------------------------------------------------
       SECTION 02: THE HUMAN (MAGAZINE SPREAD & EDITORIAL REVEALS)
       ---------------------------------------------------------------------- */
    if (document.getElementById('world-human')) {
    ScrollTrigger.create({
      trigger: '#world-human',
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => updateWorldNav('02', 'THE HUMAN', 'human'),
      onEnterBack: () => updateWorldNav('02', 'THE HUMAN', 'human'),
    });

    // Massive Editorial Staggered Statement Parallax
    const wordNot = document.getElementById('wordNot');
    const wordEverything = document.getElementById('wordEverything');
    const wordIBuild = document.getElementById('wordIBuild');
    const wordIsCode = document.getElementById('wordIsCode');

    if (wordNot && wordEverything && wordIBuild && wordIsCode) {
      gsap.from(wordNot, {
        scrollTrigger: {
          trigger: '.editorial-spread-statement',
          start: 'top 85%',
          end: 'top 30%',
          scrub: 1,
        },
        x: -80,
        opacity: 0.2,
        ease: 'power1.out'
      });

      gsap.from(wordEverything, {
        scrollTrigger: {
          trigger: '.editorial-spread-statement',
          start: 'top 75%',
          end: 'top 20%',
          scrub: 1,
        },
        x: 100,
        letterSpacing: '0.15em',
        ease: 'power1.out'
      });

      gsap.from(wordIBuild, {
        scrollTrigger: {
          trigger: '.editorial-spread-statement',
          start: 'top 65%',
          end: 'center 40%',
          scrub: 1,
        },
        x: -60,
        opacity: 0.3,
        ease: 'power1.out'
      });

      gsap.from(wordIsCode, {
        scrollTrigger: {
          trigger: '.editorial-spread-statement',
          start: 'top 55%',
          end: 'bottom 50%',
          scrub: 1,
        },
        x: 80,
        color: '#0E0E0E',
        ease: 'power1.out'
      });
    }

    // Role list items stagger in on scroll
    gsap.from('.role-item', {
      scrollTrigger: {
        trigger: '.roles-editorial-list',
        start: 'top 80%',
      },
      y: 40,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      ease: 'power2.out',
    });

    // Editorial prose and spec sheet entrance
    gsap.from(['.editorial-spec-sheet', '.editorial-prose p', '.human-stamp-cluster'], {
      scrollTrigger: {
        trigger: '.human-narrative-column',
        start: 'top 80%',
      },
      y: 35,
      opacity: 0,
      stagger: 0.12,
      duration: 1,
      ease: 'power2.out',
    });
    }

    /* ----------------------------------------------------------------------
       SECTION 03 PREVIEW: THE ENGINE (ACCELERATION & DARKENING TRANSITION)
       ---------------------------------------------------------------------- */
    if (document.getElementById('world-engine') && document.getElementById('engineTransitionStage')) {
    const stackWords = [
      document.getElementById('stackCode'),
      document.getElementById('stackAi'),
      document.getElementById('stackSystems'),
      document.getElementById('stackRag'),
      document.getElementById('stackCloud')
    ].filter(Boolean);

    const stackWrapper = document.querySelector('.stack-track-wrapper');
    const engineStage = document.getElementById('engineTransitionStage');

    const engineTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#world-engine',
        start: 'top top',
        end: '+=180%',
        pin: engineStage,
        scrub: 1,
        anticipatePin: 1,
        onEnter: () => updateWorldNav('03', 'THE ENGINE', 'engine'),
        onEnterBack: () => updateWorldNav('03', 'THE ENGINE', 'engine'),
      }
    });

    // Accelerating kinetic words stack: illuminate sequentially with clean pulse, zero overlapping Y shifts
    stackWords.forEach((word, idx) => {
      engineTimeline.to(word, {
        opacity: 1,
        scale: 1.04,
        color: '#C1121F',
        duration: 0.8,
        ease: 'power2.out',
      }, idx * 0.3);
    });

    // Darken overlay sweeps across the entire pinned viewport
    engineTimeline.to(darkenOverlay, {
      opacity: 1,
      duration: 2.2,
      ease: 'power2.inOut',
    }, 1.2);

    // Fade out stacking words so ENGINE takes total command
    if (stackWrapper) {
      engineTimeline.to(stackWrapper, {
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1.5,
        ease: 'power2.in',
      }, 1.6);
    }

    // Monolithic "ENGINE" title ascends from depth into center stage
    engineTimeline.to(engineMonolith, {
      opacity: 1,
      scale: 1,
      pointerEvents: 'auto',
      duration: 2.2,
      ease: 'power3.out',
    }, 2.2)
    .to({}, { duration: 1.0 });
    }

    /* ----------------------------------------------------------------------
       WORLD 03: THE ENGINE (FULL WORLD CHOREOGRAPHY & INTERACTIONS)
       ---------------------------------------------------------------------- */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (document.getElementById('world-engine-full')) {
    // World Nav Controller Observer for World 03
    ScrollTrigger.create({
      trigger: '#world-engine-full',
      start: 'top 40%',
      end: 'bottom 60%',
      onEnter: () => updateWorldNav('03', 'THE ENGINE', 'engine'),
      onEnterBack: () => updateWorldNav('03', 'THE ENGINE', 'engine'),
    });

    // SCENE 01: Enter the Engine — Upward typography drift & blueprint lines
    const sceneEnterTitle = document.querySelector('.scene-enter-title');
    const sceneEnterContent = document.querySelector('.scene-enter-content');
    if (sceneEnterTitle && !prefersReducedMotion) {
      gsap.to(sceneEnterTitle, {
        scrollTrigger: {
          trigger: '#scene-enter-engine',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        y: isMobile ? -30 : -80,
        opacity: 0.4,
        ease: 'none',
      });
    }

    // SCENE 02: The Engineer — "I DON'T JUST WRITE CODE." transforms into "I DESIGN SYSTEMS."
    const sceneEngineer = document.getElementById('scene-the-engineer');
    const phaseCode = document.getElementById('phaseCode');
    const phaseSystems = document.getElementById('phaseSystems');
    const manifestoCard = document.querySelector('.engineer-manifesto-card');

    if (sceneEngineer && phaseCode && phaseSystems) {
      const engineerTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sceneEngineer,
          start: 'top 70%',
          end: 'center 40%',
          scrub: prefersReducedMotion ? false : 1,
        }
      });

      if (!prefersReducedMotion) {
        engineerTimeline
          // Fragment / fade out "I DON'T JUST WRITE CODE."
          .to(phaseCode, {
            y: -40,
            opacity: 0,
            filter: 'blur(8px)',
            duration: 1.5,
            ease: 'power2.in',
          }, 0)
          // Lock "I DESIGN SYSTEMS." firmly into place
          .to(phaseSystems, {
            y: 0,
            opacity: 1,
            pointerEvents: 'auto',
            duration: 1.5,
            ease: 'power2.out',
          }, 0.8);
      } else {
        phaseSystems.style.opacity = '1';
        phaseSystems.style.position = 'static';
        phaseSystems.style.transform = 'none';
      }

      // Supporting manifesto card reveal
      if (manifestoCard) {
        gsap.from(manifestoCard, {
          scrollTrigger: {
            trigger: manifestoCard,
            start: 'top 85%',
          },
          y: 35,
          opacity: 0,
          duration: 1.0,
          ease: 'power2.out',
        });
      }
    }

    // SCENE 03: System Architecture — Sequentially draw nodes along the pipelines
    const pipelineNodes = document.querySelectorAll('.blueprint-pipeline-container .blueprint-node');
    if (pipelineNodes.length > 0) {
      gsap.from(pipelineNodes, {
        scrollTrigger: {
          trigger: '#scene-architecture',
          start: 'top 75%',
        },
        y: isMobile ? 15 : 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power2.out',
      });
    }

    // SCENE 04: The Stack — Typographic field subtle velocity drift & philosophy break
    const stackChips = document.querySelectorAll('.stack-chip');
    if (stackChips.length > 0 && !prefersReducedMotion) {
      gsap.from(stackChips, {
        scrollTrigger: {
          trigger: '#scene-stack',
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        stagger: {
          amount: 0.6,
          from: 'random',
        },
        duration: 0.9,
        ease: 'power2.out',
      });

      // Subtle horizontal velocity drift while scrolling through the stack
      const heroChips = document.querySelectorAll('.chip-hero');
      const midChips = document.querySelectorAll('.chip-mid');
      gsap.to(heroChips, {
        scrollTrigger: {
          trigger: '.stack-typographic-field',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
        x: isMobile ? 10 : 25,
        ease: 'none',
      });
      gsap.to(midChips, {
        scrollTrigger: {
          trigger: '.stack-typographic-field',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
        x: isMobile ? -8 : -20,
        ease: 'none',
      });
    }

    // Stack Philosophy Break Reveal
    const philosophyCols = document.querySelectorAll('.stack-philosophy-break .philosophy-column');
    if (philosophyCols.length > 0) {
      gsap.from(philosophyCols, {
        scrollTrigger: {
          trigger: '.stack-philosophy-break',
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.25,
        duration: 1.1,
        ease: 'power2.out',
      });
    }

    // SCENES 05 - 08: Projects 01 - 04 (Editorial Case Study Moments)
    const projectScenes = document.querySelectorAll('.scene-project');
    projectScenes.forEach((scene) => {
      const serial = scene.querySelector('.project-serial');
      const title = scene.querySelector('.project-title');
      const narrative = scene.querySelector('.project-narrative-col');
      const canvas = scene.querySelector('.project-schematic-canvas');
      const steps = scene.querySelectorAll('.schematic-steps-row .s-step');

      const pTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top 75%',
        }
      });

      pTimeline
        .from([serial, title], {
          y: 35,
          opacity: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: 'power2.out',
        })
        .from([narrative, canvas], {
          y: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 1.0,
          ease: 'power2.out',
        }, '-=0.5');

      if (steps.length > 0) {
        pTimeline.from(steps, {
          opacity: 0.2,
          y: 5,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power1.out',
        }, '-=0.4');
      }
    });

    // SCENE 09: Project Index (Master Directory) — Desktop Hover & Mobile Tap Accordion
    const indexItems = document.querySelectorAll('.project-index-list .index-item');
    indexItems.forEach((item) => {
      // Mobile tap expand / collapse without hover dependence
      item.addEventListener('click', () => {
        const isExpanded = item.classList.contains('expanded');
        indexItems.forEach((other) => other.classList.remove('expanded'));
        if (!isExpanded) {
          item.classList.add('expanded');
        }
      });

      // Keyboard accessibility
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });

    // SCENE 10: The Engineer's Philosophy — Staggered Emotional Pause
    const philosophyPhrases = document.querySelectorAll('.scene-philosophy .philosophy-phrase');
    if (philosophyPhrases.length > 0) {
      gsap.from(philosophyPhrases, {
        scrollTrigger: {
          trigger: '#scene-philosophy',
          start: 'top 70%',
        },
        y: 45,
        opacity: 0,
        stagger: 0.35,
        duration: 1.2,
        ease: 'power2.out',
      });
    }

    // SCENE 11: Exit the Engine — Monolith Collapse Transition to World 04
    const exitMonolith = document.getElementById('exitMonolithContainer');
    const exitEngineWord = document.getElementById('exitEngineWord');
    const nextPreview = document.querySelector('.exit-transition-next');

    if (exitMonolith && exitEngineWord) {
      const exitTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#scene-exit-engine',
          start: 'top 70%',
        }
      });

      exitTimeline
        .from('.exit-status-pill', {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        })
        .from(exitEngineWord, {
          scale: 0.85,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
        }, '-=0.4')
        .from(nextPreview, {
          y: 30,
          opacity: 0,
          duration: 1.0,
          ease: 'power2.out',
        }, '-=0.3');
    }
    }

    /* ----------------------------------------------------------------------
       WORLD 04: THE CUT (FULL WORLD CHOREOGRAPHY & INTERACTIONS)
       ---------------------------------------------------------------------- */
    if (document.getElementById('world-cut')) {
    // World Nav Controller Observer for World 04
    ScrollTrigger.create({
      trigger: '#world-cut',
      start: 'top 40%',
      end: 'bottom 60%',
      onEnter: () => updateWorldNav('04', 'THE CUT', 'cut'),
      onEnterBack: () => updateWorldNav('04', 'THE CUT', 'cut'),
    });

    // SCENE 01: Enter The Cut — Horizontal Split Mask Typography
    const cutTitleThe = document.getElementById('cutTitleThe');
    const cutTitleCut = document.getElementById('cutTitleCut');
    if (cutTitleThe && cutTitleCut && !prefersReducedMotion) {
      const enterCutTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#scene-enter-cut',
          start: 'top 75%',
          end: 'center 40%',
          scrub: 1,
        }
      });

      enterCutTimeline
        .from(cutTitleThe, {
          x: isMobile ? -60 : -140,
          opacity: 0.1,
          ease: 'power2.out',
        }, 0)
        .from(cutTitleCut, {
          x: isMobile ? 60 : 140,
          opacity: 0.1,
          ease: 'power2.out',
        }, 0.2);
    }

    // SCENE 02: The Manifesto — Film Cuts in Typography
    const manifestoItems = [
      document.getElementById('cManifesto1'),
      document.getElementById('cManifesto2'),
      document.getElementById('cManifesto3'),
      document.getElementById('cManifesto4')
    ].filter(Boolean);

    if (manifestoItems.length === 4) {
      ScrollTrigger.create({
        trigger: '#scene-cut-manifesto',
        start: 'top 65%',
        end: 'bottom 35%',
        scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(Math.floor(self.progress * 4), 3);
          manifestoItems.forEach((item, i) => {
            if (i === idx) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }
      });
    }

    // SCENE 03: The Timeline — Scrubbing Horizontal Playhead via Vertical Scroll
    const playheadTrack = document.getElementById('timelinePlayheadTrack');
    const playheadTc = document.getElementById('playheadTc');
    const timelineScrubberOuter = document.getElementById('timelineScrubberOuter');

    if (playheadTrack && timelineScrubberOuter) {
      ScrollTrigger.create({
        trigger: '#scene-cut-timeline',
        start: 'top 75%',
        end: 'bottom 30%',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const leftPct = 12 + progress * 76; // keep within ruler bounds
          playheadTrack.style.left = `${leftPct}%`;

          // Format simulated timecode 00:00:00:00 to 00:01:15:00
          if (playheadTc) {
            const totalFrames = Math.floor(progress * 1800); // 75 seconds * 24 fps
            const mins = String(Math.floor(totalFrames / (60 * 24))).padStart(2, '0');
            const secs = String(Math.floor((totalFrames % (60 * 24)) / 24)).padStart(2, '0');
            const frames = String(totalFrames % 24).padStart(2, '0');
            playheadTc.textContent = `00:${mins}:${secs}:${frames}`;
          }
        }
      });
    }

    // Mobile Timeline: Highlight Active Node on Scroll
    const mobileNodes = document.querySelectorAll('.mobile-timeline-nodes .m-node');
    if (mobileNodes.length > 0) {
      ScrollTrigger.create({
        trigger: '.timeline-mobile-view',
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: true,
        onUpdate: (self) => {
          const activeIdx = Math.min(Math.floor(self.progress * mobileNodes.length), mobileNodes.length - 1);
          mobileNodes.forEach((node, i) => {
            if (i <= activeIdx) {
              node.classList.add('active');
            } else {
              node.classList.remove('active');
            }
          });
        }
      });
    }

    // SCENE 04: Frame by Frame — Stagger Reveal
    const frameCards = document.querySelectorAll('.frames-grid .frame-card');
    if (frameCards.length > 0) {
      gsap.from(frameCards, {
        scrollTrigger: {
          trigger: '#scene-frame-by-frame',
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.18,
        duration: 1.0,
        ease: 'power2.out',
      });
    }

    // SCENE 05: The Editor — Rhythmic Words Stagger
    const rhythmWords = [
      document.getElementById('rwCut'),
      document.getElementById('rwMove'),
      document.getElementById('rwPause'),
      document.getElementById('rwRepeat')
    ].filter(Boolean);

    if (rhythmWords.length > 0 && !prefersReducedMotion) {
      gsap.from(rhythmWords, {
        scrollTrigger: {
          trigger: '#scene-the-editor',
          start: 'top 70%',
        },
        y: 60,
        opacity: 0,
        stagger: 0.25,
        duration: 1.0,
        ease: 'power3.out',
      });
    }

    // SCENE 06: Editing Language — Kinetic Velocity Drift
    const langWords = document.querySelectorAll('.lang-word');
    if (langWords.length > 0 && !prefersReducedMotion) {
      gsap.from(langWords, {
        scrollTrigger: {
          trigger: '#scene-editing-language',
          start: 'top 80%',
        },
        y: 35,
        opacity: 0,
        stagger: {
          amount: 0.6,
          from: 'random',
        },
        duration: 0.9,
        ease: 'power2.out',
      });

      const langHeroWords = document.querySelectorAll('.lang-hero');
      gsap.to(langHeroWords, {
        scrollTrigger: {
          trigger: '.language-words-field',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
        x: isMobile ? 8 : 20,
        ease: 'none',
      });
    }

    // SCENE 07: Showreel Items Reveal
    const showreelItems = document.querySelectorAll('.showreel-items-list .showreel-item');
    if (showreelItems.length > 0) {
      showreelItems.forEach((item) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
          },
          y: 45,
          opacity: 0,
          duration: 1.0,
          ease: 'power2.out',
        });
      });
    }

    // SCENE 08: Before / After Interactive Slider
    const baContainer = document.getElementById('beforeAfterContainer');
    const baFinalLayer = document.getElementById('baFinalLayer');
    const baDivider = document.getElementById('baDivider');

    if (baContainer && baFinalLayer && baDivider) {
      let isDraggingBa = false;

      const updateBaPosition = (clientX) => {
        const rect = baContainer.getBoundingClientRect();
        let x = clientX - rect.left;
        let pct = (x / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        baFinalLayer.style.width = `${pct}%`;
        baDivider.style.left = `${pct}%`;
      };

      baContainer.addEventListener('mousedown', (e) => {
        isDraggingBa = true;
        updateBaPosition(e.clientX);
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingBa) return;
        updateBaPosition(e.clientX);
      });

      window.addEventListener('mouseup', () => {
        isDraggingBa = false;
      });

      // Touch events for mobile
      baContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          updateBaPosition(e.touches[0].clientX);
        }
      }, { passive: true });

      baContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          updateBaPosition(e.touches[0].clientX);
        }
      }, { passive: true });
    }

    // SCENE 09: The Editorial Statement Reveal
    const cutEditorialCard = document.querySelector('.cut-editorial-card');
    if (cutEditorialCard) {
      gsap.from(cutEditorialCard, {
        scrollTrigger: {
          trigger: '#scene-cut-editorial',
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'power2.out',
      });
    }

    // SCENE 10: Creative Bridge Stream Reveal
    const bridgeWords = document.querySelectorAll('.bridge-stream .bridge-word');
    if (bridgeWords.length > 0) {
      gsap.from(bridgeWords, {
        scrollTrigger: {
          trigger: '#scene-creative-bridge',
          start: 'top 75%',
        },
        y: 30,
        opacity: 0.1,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power2.out',
      });
    }

    // SCENE 11: Exit The Cut Monolith
    const exitCutMonolith = document.getElementById('exitCutMonolith');
    const exitCutWord = document.getElementById('exitCutWord');
    if (exitCutMonolith && exitCutWord) {
      gsap.from(exitCutWord, {
        scrollTrigger: {
          trigger: '#scene-exit-cut',
          start: 'top 70%',
        },
        scale: 0.85,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });
    }
    }

    /* ----------------------------------------------------------------------
       WORLD 05: THE CREATOR (FULL WORLD CHOREOGRAPHY & INTERACTIONS)
       ---------------------------------------------------------------------- */
    if (document.getElementById('world-creator')) {
    // World Nav Controller Observer for World 05
    ScrollTrigger.create({
      trigger: '#world-creator',
      start: 'top 40%',
      end: 'bottom 60%',
      onEnter: () => updateWorldNav('05', 'THE CREATOR', 'creator'),
      onEnterBack: () => updateWorldNav('05', 'THE CREATOR', 'creator'),
    });

    // SCENE 01: Enter The Creator — Typography & Axis Intro
    const creatorTitle = document.getElementById('creatorTitle');
    if (creatorTitle && !prefersReducedMotion) {
      gsap.from(creatorTitle, {
        scrollTrigger: {
          trigger: '#scene-enter-creator',
          start: 'top 75%',
        },
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });

      const enterCaptionPills = document.querySelectorAll('.creator-enter-caption span');
      if (enterCaptionPills.length > 0) {
        gsap.from(enterCaptionPills, {
          scrollTrigger: {
            trigger: '.creator-enter-caption',
            start: 'top 85%',
          },
          opacity: 0,
          y: 15,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power2.out',
        });
      }
    }

    // SCENE 02: One Person, Many Mediums — Kinetic Satellites Orbit & Settle
    const mediumsTitle = document.getElementById('mediumsTitle');
    const satPills = document.querySelectorAll('.orbit-satellites-cluster .satellite-pill');

    if (mediumsTitle && satPills.length > 0 && !prefersReducedMotion) {
      const mediumsTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#scene-creator-mediums',
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: 0.8,
        }
      });

      // Initially rigid, satellites disperse outward in orbit around the statement, then settle cleanly
      mediumsTimeline
        .from(satPills[0], { x: -80, y: -40, rotation: -12, scale: 0.8, opacity: 0.2, ease: 'power2.out' }, 0) // CODE
        .from(satPills[1], { x: 90, y: -30, rotation: 10, scale: 0.8, opacity: 0.2, ease: 'power2.out' }, 0.1) // VIDEO
        .from(satPills[2], { x: -60, y: 50, rotation: -8, scale: 0.8, opacity: 0.2, ease: 'power2.out' }, 0.2) // DESIGN
        .from(satPills[3], { x: 70, y: 60, rotation: 15, scale: 0.8, opacity: 0.2, ease: 'power2.out' }, 0.3) // AI
        .to(satPills, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, stagger: 0.05, ease: 'power1.inOut' }, 0.6);
    }

    // SCENE 03: The Idea — Visual Expansion Sequence (Point -> Vector -> Form -> Grid -> Interface)
    const ideaDiagramSteps = document.querySelectorAll('.idea-expansion-diagram .diagram-step');
    const ideaConnectors = document.querySelectorAll('.idea-expansion-diagram .diagram-connector-line');

    if (ideaDiagramSteps.length > 0 && !prefersReducedMotion) {
      const ideaTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#scene-the-idea',
          start: 'top 65%',
          end: 'bottom 35%',
          scrub: 0.6,
        }
      });

      ideaDiagramSteps.forEach((step, idx) => {
        ideaTimeline.from(step, {
          scale: 0.75,
          opacity: 0.15,
          y: 20,
          duration: 0.4,
          ease: 'power2.out',
        }, idx * 0.2);

        if (ideaConnectors[idx]) {
          ideaTimeline.from(ideaConnectors[idx], {
            scaleX: 0,
            transformOrigin: 'left center',
            opacity: 0,
            duration: 0.2,
          }, idx * 0.2 + 0.1);
        }
      });
    }

    // SCENE 04: From Thought to Thing — Sequential Stage Transformations
    const transformationStages = document.querySelectorAll('.transformation-stages-flow .t-stage');
    if (transformationStages.length > 0) {
      gsap.from(transformationStages, {
        scrollTrigger: {
          trigger: '#scene-thought-to-thing',
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power2.out',
      });
    }

    // SCENE 05: The Creative Stack — Vertical Verb Assembly into CREATE.
    const verbLines = document.querySelectorAll('.creative-verbs-assembly .verb-line');
    const equalsAnchor = document.querySelector('.creative-verbs-assembly .equals-anchor');
    const vCreateWord = document.getElementById('vCreate');

    if (verbLines.length > 0 && vCreateWord && !prefersReducedMotion) {
      const stackTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#scene-creative-stack',
          start: 'top 70%',
          end: 'center 40%',
          scrub: 0.6,
        }
      });

      stackTimeline
        .from(verbLines, {
          x: (i) => (i % 2 === 0 ? -40 : 40),
          opacity: 0.3,
          stagger: 0.1,
          ease: 'power2.out',
        }, 0)
        .from(equalsAnchor, {
          scale: 0.4,
          opacity: 0,
          ease: 'back.out(1.5)',
          duration: 0.4,
        }, 0.3)
        .from(vCreateWord, {
          scale: 0.85,
          color: '#101010',
          opacity: 0.2,
          ease: 'power3.out',
          duration: 0.6,
        }, 0.4);
    }

    // SCENE 06: Multimedia Canvas — Studio Pinboard Fragments
    const canvasFragments = document.querySelectorAll('.multimedia-pinboard-grid .canvas-fragment');
    if (canvasFragments.length > 0) {
      gsap.from(canvasFragments, {
        scrollTrigger: {
          trigger: '#scene-multimedia-canvas',
          start: 'top 75%',
        },
        y: 35,
        rotation: (i) => (i % 2 === 0 ? -1.5 : 1.5),
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power2.out',
      });
    }

    // SCENE 07: Project Constellation — Satellites Drift & Core Connection
    const constellationSatellites = document.querySelectorAll('.constellation-satellites-grid .c-node');
    const coreNode = document.getElementById('constellationCoreNode');

    if (constellationSatellites.length > 0) {
      gsap.from(constellationSatellites, {
        scrollTrigger: {
          trigger: '#scene-project-constellation',
          start: 'top 75%',
        },
        scale: 0.92,
        y: 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power2.out',
      });

      if (coreNode && !prefersReducedMotion) {
        gsap.from(coreNode, {
          scrollTrigger: {
            trigger: '#scene-project-constellation',
            start: 'top 70%',
          },
          scale: 0.85,
          opacity: 0,
          duration: 1.1,
          ease: 'back.out(1.4)',
        });
      }
    }

    // SCENE 08: The Experiment — What If Sequence & Build It Punch
    const expWhatIf = document.getElementById('expWhatIf');
    const expQuestions = document.querySelectorAll('.exp-questions-sequence .exp-q-row');
    const buildItCallout = document.querySelector('.build-it-callout');

    if (expWhatIf && expQuestions.length > 0) {
      gsap.from(expWhatIf, {
        scrollTrigger: {
          trigger: '#scene-the-experiment',
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });

      gsap.from(expQuestions, {
        scrollTrigger: {
          trigger: '.exp-questions-sequence',
          start: 'top 80%',
        },
        x: -30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
      });

      if (buildItCallout) {
        gsap.from(buildItCallout, {
          scrollTrigger: {
            trigger: buildItCallout,
            start: 'top 85%',
          },
          scale: 0.8,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
        });
      }
    }

    // SCENE 09: Creative Process — Continuous Methodology Track Reveal
    const processCards = document.querySelectorAll('.process-continuous-track .process-step-card');
    const processDividers = document.querySelectorAll('.process-continuous-track .process-step-divider');

    if (processCards.length > 0) {
      gsap.from(processCards, {
        scrollTrigger: {
          trigger: '#scene-creative-process',
          start: 'top 75%',
        },
        y: 35,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
      });

      if (processDividers.length > 0) {
        gsap.from(processDividers, {
          scrollTrigger: {
            trigger: '#scene-creative-process',
            start: 'top 75%',
          },
          opacity: 0,
          scale: 0.5,
          stagger: 0.1,
          duration: 0.6,
          delay: 0.2,
          ease: 'power2.out',
        });
      }
    }

    // SCENE 10: The Creator's Statement — Emotional Climax Stillness
    const statementRows = document.querySelectorAll('.statement-monolith-wrapper .statement-phrase-row');
    if (statementRows.length > 0) {
      gsap.from(statementRows, {
        scrollTrigger: {
          trigger: '#scene-creator-statement',
          start: 'top 70%',
        },
        y: 45,
        opacity: 0,
        stagger: 0.3,
        duration: 1.2,
        ease: 'power3.out',
      });
    }

    // SCENE 11: The Identity — Four Strands Converging into ADITYA WAGH
    const idStrands = document.querySelectorAll('.id-strands-wrapper .id-strand');
    const idAuthorName = document.querySelector('.id-author-name');
    const idTitleFinal = document.querySelector('.id-title-final');

    if (idStrands.length > 0 && idAuthorName && !prefersReducedMotion) {
      const idTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#scene-creator-identity',
          start: 'top 70%',
        }
      });

      idTimeline
        .from(idStrands, {
          y: 25,
          opacity: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: 'power2.out',
        }, 0)
        .from(idAuthorName, {
          scale: 0.9,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
        }, 0.4)
        .from(idTitleFinal, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        }, 0.7);
    }

    // SCENE 12: Exit The Creator Monolith & Preview
    const exitCreatorWord = document.getElementById('exitCreatorWord');
    if (exitCreatorWord) {
      gsap.from(exitCreatorWord, {
        scrollTrigger: {
          trigger: '#scene-exit-creator',
          start: 'top 70%',
        },
        scale: 0.85,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });
    }
    }

  } else {
    // Graceful fallback if CDN scripts are slow or unavailable
    console.warn('GSAP or ScrollTrigger not detected; falling back to native CSS presentation.');
    const voidHero = document.getElementById('voidHeroMessage');
    if (voidHero) {
      voidHero.style.opacity = '1';
      voidHero.style.pointerEvents = 'auto';
    }
  }


  /* ------------------------------------------------------------------------
     5. SMOOTH RETURN TO TOP
     ------------------------------------------------------------------------ */
  const returnTopBtn = document.getElementById('returnTopBtn');
  if (returnTopBtn) {
    returnTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
});
