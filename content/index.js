(() => {
  'use strict';

  const SELECTORS = [
    '#readme img',
    '.markdown-body img',
    '.wiki-body .markdown-body img',
    '#wiki-body img',
  ];
  const MIN_SIZE = 40;
  const MIN_SCALE = 0.25;
  const MAX_SCALE = 8;
  const ZOOM_STEP = 0.25;

  let overlay = null;
  let imgEl = null;
  let counterEl = null;
  let zoomInfoEl = null;
  let prevBtn = null;
  let nextBtn = null;
  let images = [];
  let currentIndex = 0;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartTranslateX = 0;
  let dragStartTranslateY = 0;
  let debounceTimer = null;

  function resolveSrc(img) {
    const src = img.src || img.getAttribute('data-src') || '';
    if (!src) return '';
    try {
      return new URL(src, location.href).href;
    } catch {
      return '';
    }
  }

  function isEligible(img) {
    if (img.src && img.src.endsWith('.svg')) return false;
    if (img.closest('svg')) return false;
    const w = img.naturalWidth || img.width || 0;
    const h = img.naturalHeight || img.height || 0;
    if (w > 0 && w < MIN_SIZE && h > 0 && h < MIN_SIZE) return false;
    if (img.classList.contains('emoji')) return false;
    if (img.closest('.emoji')) return false;
    if (!resolveSrc(img)) return false;
    return true;
  }

  function collectImages() {
    const selector = SELECTORS.join(', ');
    const allImgs = document.querySelectorAll(selector);
    return Array.from(allImgs).filter(isEligible);
  }

  function getImageSrc(img) {
    return resolveSrc(img);
  }

  function applyTransform() {
    imgEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    zoomInfoEl.textContent = `${Math.round(scale * 100)}%`;
  }

  function resetTransform() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function updateUI() {
    counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === images.length - 1;
  }

  function showImage() {
    const img = images[currentIndex];
    imgEl.src = getImageSrc(img);
    resetTransform();
    updateUI();
  }

  function navigate(dir) {
    const newIndex = currentIndex + dir;
    if (newIndex < 0 || newIndex >= images.length) return;
    currentIndex = newIndex;
    showImage();
  }

  function onOverlayClick(e) {
    if (e.target === overlay || e.target.classList.contains('gip-image-container')) close();
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
    const rect = overlay.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    const ratio = newScale / scale;
    translateX = cx - ratio * (cx - translateX);
    translateY = cy - ratio * (cy - translateY);
    scale = newScale;
    applyTransform();
  }

  function onMouseDown(e) {
    if (e.button !== 0 || scale <= 1) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartTranslateX = translateX;
    dragStartTranslateY = translateY;
    imgEl.classList.add('gip-dragging');
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    translateX = dragStartTranslateX + (e.clientX - dragStartX);
    translateY = dragStartTranslateY + (e.clientY - dragStartY);
    applyTransform();
  }

  function onMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    imgEl.classList.remove('gip-dragging');
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowLeft') {
      navigate(-1);
    } else if (e.key === 'ArrowRight') {
      navigate(1);
    } else if (e.key === '+' || e.key === '=') {
      scale = Math.min(MAX_SCALE, scale + ZOOM_STEP);
      applyTransform();
    } else if (e.key === '-') {
      scale = Math.max(MIN_SCALE, scale - ZOOM_STEP);
      applyTransform();
    } else if (e.key === '0') {
      resetTransform();
    }
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'gip-overlay';

    const container = document.createElement('div');
    container.className = 'gip-image-container';

    imgEl = document.createElement('img');
    imgEl.className = 'gip-image';
    imgEl.draggable = false;
    container.appendChild(imgEl);
    overlay.appendChild(container);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'gip-close';
    closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.title = 'Close (Esc)';
    closeBtn.addEventListener('click', close);
    overlay.appendChild(closeBtn);

    prevBtn = document.createElement('button');
    prevBtn.className = 'gip-nav-btn gip-prev';
    prevBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    prevBtn.title = 'Previous';
    prevBtn.addEventListener('click', () => navigate(-1));
    overlay.appendChild(prevBtn);

    nextBtn = document.createElement('button');
    nextBtn.className = 'gip-nav-btn gip-next';
    nextBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    nextBtn.title = 'Next';
    nextBtn.addEventListener('click', () => navigate(1));
    overlay.appendChild(nextBtn);

    counterEl = document.createElement('div');
    counterEl.className = 'gip-counter';
    overlay.appendChild(counterEl);

    zoomInfoEl = document.createElement('div');
    zoomInfoEl.className = 'gip-zoom-info';
    overlay.appendChild(zoomInfoEl);

    overlay.addEventListener('click', onOverlayClick);
    overlay.addEventListener('wheel', onWheel, { passive: false });
    imgEl.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    document.body.appendChild(overlay);
  }

  function open(imageList, startIndex) {
    images = imageList;
    currentIndex = startIndex;
    if (!overlay) createOverlay();
    overlay.style.display = 'flex';
    showImage();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (overlay) overlay.style.display = 'none';
    document.removeEventListener('keydown', onKeyDown);
    document.body.style.overflow = '';
    resetTransform();
    imgEl.src = '';
  }

  function onImageClick(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const imgs = collectImages();
    const idx = imgs.indexOf(e.currentTarget);
    if (idx === -1) return;
    open(imgs, idx);
  }

  function bindImages() {
    const imgs = collectImages();
    imgs.forEach((img) => {
      if (img.dataset.gipBound) return;
      img.dataset.gipBound = '1';
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', onImageClick);
    });
  }

  function observeDOM() {
    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(bindImages, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function handleNavigation() {
    document.addEventListener('turbo:load', () => setTimeout(bindImages, 500));
    document.addEventListener('turbo:render', () => setTimeout(bindImages, 500));
    document.addEventListener('pjax:end', () => setTimeout(bindImages, 500));
  }

  function init() {
    bindImages();
    observeDOM();
    handleNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
