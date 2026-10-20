document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     0. 暗紫色鼠標光點 (DARK PURPLE CURSOR DOT)
     ========================================================================== */
  const cursorDot = document.getElementById('cursorDot');
  let isCursorVisible = false;

  window.addEventListener('mousemove', (e) => {
    if (!isCursorVisible && cursorDot) {
      cursorDot.classList.add('visible');
      isCursorVisible = true;
    }

    if (cursorDot) {
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
    }
  });

  // 移出或移入視窗時顯示/隱藏
  document.addEventListener('mouseleave', () => {
    if (cursorDot) cursorDot.classList.remove('visible');
    isCursorVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    if (cursorDot) cursorDot.classList.add('visible');
    isCursorVisible = true;
  });

  // 懸停互動元素時光點輕微放大反饋
  const interactiveTargets = 'a, button, input, textarea, .skill-item, .carousel-slide, .journey-card, .perk-card';
  document.addEventListener('mouseover', (e) => {
    if (cursorDot && e.target.closest(interactiveTargets)) {
      cursorDot.classList.add('active');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (cursorDot && e.target.closest(interactiveTargets)) {
      cursorDot.classList.remove('active');
    }
  });

  /* ==========================================================================
     1. 導覽列平滑捲動 & 區塊滾動監聽 (NAV & SCROLL SPY)
     ========================================================================== */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const siteNav = document.getElementById('siteNav');

  // 點擊平滑捲動
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const navHeight = siteNav ? siteNav.offsetHeight : 80;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight + 2;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
      // 手機版選單自動收合
      document.body.classList.remove('mobile-nav-active');
      const mobileBtn = document.getElementById('mobileMenuBtn');
      if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // 捲動偵測當前區塊並更新高亮項目 (換色效果)
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -55% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  /* ==========================================================================
     2. 黑灰白主題配色切換 (THEME TOGGLE: DARK / ASH / PLATINUM)
     ========================================================================== */
  const themeBtn = document.getElementById('themeToggleBtn');
  const themes = ['default', 'ash', 'platinum'];
  const themeLabels = {
    'default': '黑階深邃 (Dark)',
    'ash': '霧灰碳調 (Ash)',
    'platinum': '皓白極簡 (Light)'
  };
  let currentThemeIndex = 0;

  if (themeBtn) {
    const labelEl = themeBtn.querySelector('.theme-label');
    themeBtn.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      const newTheme = themes[currentThemeIndex];
      
      if (newTheme === 'default') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', newTheme);
      }
      
      if (labelEl) {
        labelEl.textContent = themeLabels[newTheme];
      }

      // 切換主題時重置技能背景，避免舊漸層殘留
      const skillsBgDynamicEl = document.querySelector('.skills-bg-dynamic');
      const skillsSectionEl = document.getElementById('skills');
      if (skillsBgDynamicEl) skillsBgDynamicEl.style.background = '';
      if (skillsSectionEl) skillsSectionEl.classList.remove('has-active-skill');

      showToast(`已切換色彩主題為：${themeLabels[newTheme]}`);
    });
  }

  // 手機版漢堡選單切換
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      const isActive = document.body.classList.toggle('mobile-nav-active');
      mobileBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
  }

  /* ==========================================================================
     3. HERO 卡片互動 3D 傾斜效果 (3D TILT EFFECT)
     ========================================================================== */
  const heroCard = document.getElementById('heroInteractiveCard');
  if (heroCard) {
    heroCard.addEventListener('mousemove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / rect.height) * 12;
      const rotateY = (x / rect.width) * 12;
      heroCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  }

  /* ==========================================================================
     4. 專長技能 (SKILLS)：鼠標懸停字體放大 + 背景動態切換不同色彩 (支援黑/灰/白主題)
     ========================================================================== */
  const skillsSection = document.getElementById('skills');
  const skillsBgDynamic = document.querySelector('.skills-bg-dynamic');
  const skillItems = document.querySelectorAll('.skill-item');

  // 黑階深邃主題專屬漸層
  const skillBgThemesDark = [
    'radial-gradient(ellipse at 50% 50%, #202028 0%, #0d0d12 85%)',
    'radial-gradient(ellipse at 40% 60%, #2a2a34 0%, #111116 85%)',
    'radial-gradient(ellipse at 60% 40%, #1e222a 0%, #090b0e 85%)',
    'radial-gradient(ellipse at 50% 50%, #282830 0%, #101014 85%)',
    'radial-gradient(ellipse at 35% 50%, #1f1f24 0%, #08080a 85%)'
  ];

  // 霧灰碳調主題專屬漸層
  const skillBgThemesAsh = [
    'radial-gradient(ellipse at 50% 50%, #282832 0%, #17171c 85%)',
    'radial-gradient(ellipse at 40% 60%, #30303a 0%, #1a1a20 85%)',
    'radial-gradient(ellipse at 60% 40%, #242830 0%, #14171c 85%)',
    'radial-gradient(ellipse at 50% 50%, #32323a 0%, #191920 85%)',
    'radial-gradient(ellipse at 35% 50%, #28282e 0%, #15151a 85%)'
  ];

  // 皓白極簡主題專屬漸層 (乾淨輕透白銀/珍珠/微灰，絕不變黑)
  const skillBgThemesPlatinum = [
    'radial-gradient(ellipse at 50% 50%, #e6e6ed 0%, #f5f5f8 85%)',
    'radial-gradient(ellipse at 40% 60%, #ececf2 0%, #f8f8fb 85%)',
    'radial-gradient(ellipse at 60% 40%, #e4e7ee 0%, #f4f6f9 85%)',
    'radial-gradient(ellipse at 50% 50%, #eaeaf0 0%, #f6f6f9 85%)',
    'radial-gradient(ellipse at 35% 50%, #e5e5eb 0%, #f5f5f8 85%)'
  ];

  function getSkillGradient(index) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'platinum') {
      return skillBgThemesPlatinum[index] || skillBgThemesPlatinum[0];
    } else if (currentTheme === 'ash') {
      return skillBgThemesAsh[index] || skillBgThemesAsh[0];
    } else {
      return skillBgThemesDark[index] || skillBgThemesDark[0];
    }
  }

  skillItems.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      if (skillsSection && skillsBgDynamic) {
        skillsSection.classList.add('has-active-skill');
        skillsBgDynamic.style.background = getSkillGradient(index);
      }
    });

    item.addEventListener('mouseleave', () => {
      if (skillsSection && skillsBgDynamic) {
        skillsSection.classList.remove('has-active-skill');
        skillsBgDynamic.style.background = '';
      }
    });
  });

  /* ==========================================================================
     5. 精選作品：中央聚焦式輪播介面 (CENTERED CAROUSEL)
     ========================================================================== */
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const totalSlides = slides.length;
  const currentCountEl = document.getElementById('currentCount');
  const totalCountEl = document.getElementById('totalCount');
  const indicatorsContainer = document.getElementById('carouselIndicators');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const carouselStage = document.getElementById('carouselStage');
  const carouselPlayBtn = document.getElementById('carouselPlayBtn');

  let currentIndex = 0;
  let isAnimating = false;
  let autoPlayTimer = null;
  let isAutoPlaying = true;

  if (totalCountEl) {
    totalCountEl.textContent = String(totalSlides).padStart(2, '0');
  }

  // 作品詳細資料（供輪播與全螢幕燈箱預覽使用）
  const worksData = [
    {
      img: 'image/c.jpg',
      tag: '01 · 3D SCENE & LIGHTING',
      title: '模型製作',
      desc: '探索空間層次、環境光影漫射與氛圍營造，建構沉浸式的立體空間質感。掌握全域光照（GI）、體積霧與環境遮蔽等真實物理特性。'
    },
    {
      img: 'image/des.jpg',
      tag: '02 · SPATIAL & FORM DESIGN',
      title: '場景設計',
      desc: '結合幾何架構與當代造型語言，展現具結構張力的場景設計。嚴謹推敲線條張力與多邊形拓撲佈局。'
    },
    {
      img: 'image/ph.jpg',
      tag: '03 · CHARACTER & ENVIRONMENT',
      title: '生活感插畫',
      desc: '著重人物姿態與整體色溫的調和，傳遞具敘事張力的視覺氛圍。強化角色與環境光影的融合度與情緒層次。'
    },
    {
      img: 'image/wine.jpg',
      tag: '04 · CINEMATIC STILL LIFE',
      title: '靜物材質與電影感光影',
      desc: '精緻折射、金屬質感與鏡頭景深運算，體現對光學材質的嚴謹捕捉。精準調校次表面散射（SSS）與各向異性高光。'
    }
  ];

  // 生成指示條
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `indicator-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `跳至作品第 ${idx + 1} 項`);
      dot.addEventListener('click', () => {
        if (!isAnimating && idx !== currentIndex) {
          goToSlide(idx);
          resetAutoPlay();
        }
      });
      indicatorsContainer.appendChild(dot);
    });
  }

  // 核心更新函式：賦予中央、左側、右側與隱藏類別
  function updateCarousel() {
    slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');

      const diff = (idx - currentIndex + totalSlides) % totalSlides;

      if (diff === 0) {
        // 中央主物件：清晰最大、在畫面正中
        slide.classList.add('active');
        slide.setAttribute('aria-hidden', 'false');
      } else if (diff === totalSlides - 1) {
        // 左側物件：上一張，尺寸縮小只露出部分
        slide.classList.add('prev');
        slide.setAttribute('aria-hidden', 'true');
      } else if (diff === 1) {
        // 右側物件：下一張，尺寸縮小只露出部分
        slide.classList.add('next');
        slide.setAttribute('aria-hidden', 'true');
      } else {
        // 其他物件
        if (diff > 1 && diff <= Math.floor(totalSlides / 2)) {
          slide.classList.add('hidden-right');
        } else {
          slide.classList.add('hidden-left');
        }
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // 更新計數器 (例如 01, 02)
    if (currentCountEl) {
      currentCountEl.textContent = String(currentIndex + 1).padStart(2, '0');
    }

    // 更新指示條
    if (indicatorsContainer) {
      const dots = indicatorsContainer.querySelectorAll('.indicator-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    setTimeout(() => {
      isAnimating = false;
    }, 600);
  }

  function goToSlide(targetIndex) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = (targetIndex + totalSlides) % totalSlides;
    updateCarousel();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
  }

  // 點擊左側或右側卡片直接切換到該張
  slides.forEach((slide) => {
    slide.addEventListener('click', (e) => {
      // 若點擊的是全螢幕展開按鈕，則不觸發輪播跳轉
      if (e.target.closest('.expand-btn')) return;

      if (slide.classList.contains('prev')) {
        prevSlide();
        resetAutoPlay();
      } else if (slide.classList.contains('next')) {
        nextSlide();
        resetAutoPlay();
      } else if (slide.classList.contains('active')) {
        // 點擊中央卡片本身亦可開啟燈箱預覽
        openLightbox(currentIndex);
      }
    });
  });

  // 鍵盤方向鍵切換
  window.addEventListener('keydown', (e) => {
    if (!carouselStage) return;
    const rect = carouselStage.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoPlay();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoPlay();
    }
  });

  // 滑鼠拖曳 (Drag) & 手機滑動 (Swipe) 支援
  let startX = 0;
  let currentTranslateX = 0;
  let isDragging = false;

  function handleTouchStart(x) {
    startX = x;
    isDragging = true;
  }

  function handleTouchMove(x) {
    if (!isDragging) return;
    currentTranslateX = x - startX;
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    const threshold = 45; // 滑動門檻 45px
    if (currentTranslateX < -threshold) {
      nextSlide();
      resetAutoPlay();
    } else if (currentTranslateX > threshold) {
      prevSlide();
      resetAutoPlay();
    }
    currentTranslateX = 0;
  }

  if (carouselStage) {
    carouselStage.addEventListener('touchstart', (e) => {
      handleTouchStart(e.touches[0].clientX);
    }, { passive: true });

    carouselStage.addEventListener('touchmove', (e) => {
      handleTouchMove(e.touches[0].clientX);
    }, { passive: true });

    carouselStage.addEventListener('touchend', handleTouchEnd);

    carouselStage.addEventListener('mousedown', (e) => {
      handleTouchStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        handleTouchMove(e.clientX);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        handleTouchEnd();
      }
    });
  }

  // 自動播放控制
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      nextSlide();
    }, 4500);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function resetAutoPlay() {
    if (isAutoPlaying) {
      startAutoPlay();
    }
  }

  if (carouselPlayBtn) {
    const playIcon = carouselPlayBtn.querySelector('.play-icon');
    const playLabel = carouselPlayBtn.querySelector('.play-label');

    carouselPlayBtn.addEventListener('click', () => {
      isAutoPlaying = !isAutoPlaying;
      if (isAutoPlaying) {
        startAutoPlay();
        if (playIcon) playIcon.textContent = '⏸';
        if (playLabel) playLabel.textContent = 'AUTO PLAY';
        showToast('已開啟作品自動輪播');
      } else {
        stopAutoPlay();
        if (playIcon) playIcon.textContent = '▶';
        if (playLabel) playLabel.textContent = 'PAUSED';
        showToast('已暫停作品自動輪播');
      }
    });
  }

  // 滑鼠移入輪播舞台時暫時停止自動播放，移出後恢復
  if (carouselStage) {
    carouselStage.addEventListener('mouseenter', () => {
      if (isAutoPlaying) stopAutoPlay();
    });
    carouselStage.addEventListener('mouseleave', () => {
      if (isAutoPlaying) startAutoPlay();
    });
  }

  // 初始化輪播
  updateCarousel();
  startAutoPlay();

  /* ==========================================================================
     6. 全螢幕作品燈箱彈窗 (LIGHTBOX MODAL)
     ========================================================================== */
  const lightbox = document.getElementById('portfolioLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  let lightboxIndex = 0;

  function openLightbox(index) {
    lightboxIndex = (index + totalSlides) % totalSlides;
    const work = worksData[lightboxIndex];
    if (!work || !lightbox) return;

    if (lightboxImg) lightboxImg.src = work.img;
    if (lightboxTag) lightboxTag.textContent = work.tag;
    if (lightboxTitle) lightboxTitle.textContent = work.title;
    if (lightboxDesc) lightboxDesc.textContent = work.desc;

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    stopAutoPlay();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (isAutoPlaying) startAutoPlay();
  }

  // 全螢幕檢視按鈕監聽
  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-preview-index') || '0', 10);
      openLightbox(idx);
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', () => {
      openLightbox(lightboxIndex - 1);
    });
  }
  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', () => {
      openLightbox(lightboxIndex + 1);
    });
  }

  // 鍵盤操作燈箱
  window.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        openLightbox(lightboxIndex - 1);
      } else if (e.key === 'ArrowRight') {
        openLightbox(lightboxIndex + 1);
      }
    }
  });

  /* ==========================================================================
     7. TOAST 通知浮層提示函式
     ========================================================================== */
  const toastNotification = document.getElementById('toastNotification');
  const toastMessageEl = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastNotification) return;
    if (toastMessageEl) toastMessageEl.textContent = msg;

    toastNotification.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  /* ==========================================================================
     8. 聯絡資訊快速複製功能
     ========================================================================== */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'acsjlfdh@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('✓ 信箱 acsjlfdh@gmail.com 已複製到剪貼簿！');
        const btnText = copyEmailBtn.querySelector('.btn-text');
        if (btnText) {
          const original = btnText.textContent;
          btnText.textContent = '已複製！';
          setTimeout(() => {
            btnText.textContent = original;
          }, 2000);
        }
      }).catch(() => {
        showToast('信箱：acsjlfdh@gmail.com');
      });
    });
  }

  /* ==========================================================================
     9. 快速留言互動表單 (QUICK MESSAGE FORM)
     ========================================================================== */
  const quickMessageForm = document.getElementById('quickMessageForm');
  if (quickMessageForm) {
    quickMessageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('senderName').value;
      showToast(`✓ 感謝 ${senderName}！您的留言已送出，我將儘速回覆。`);
      quickMessageForm.reset();
    });
  }
});
