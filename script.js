/**
 * 简历网站 - 核心渲染脚本
 * 从 config.json 读取所有内容，动态生成页面
 * 用户只需修改 config.json 即可更新整个网站
 */

// ============================================================
// 1. 加载配置
// ============================================================

async function loadConfig() {
  try {
    const response = await fetch('config.json');
    if (!response.ok) throw new Error('配置文件加载失败');
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('加载 config.json 出错：', error);
    return null;
  }
}

// ============================================================
// 2. 渲染各板块
// ============================================================

function renderHeader(profile) {
  const header = document.getElementById('header');
  const metaItems = [];
  if (profile.gender) metaItems.push(profile.gender);
  if (profile.age) metaItems.push(profile.age);
  if (profile.workYears) metaItems.push(`工作经验 ${profile.workYears}`);
  const metaText = metaItems.join(' ｜ ');

  header.innerHTML = `
    <div class="header-inner">
      <div class="avatar-wrapper">
        <img
          src="${profile.avatar}"
          alt="${profile.name} 的头像"
          class="avatar"
          onerror="this.src='data:image/svg+xml,${encodeURIComponent(generateAvatarPlaceholder(profile.name))}'"
        >
      </div>
      <div class="header-text">
        <h1 class="name">${profile.name}</h1>
        ${metaText ? `<p class="meta-info">${metaText}</p>` : ''}
        <p class="title">${profile.title}</p>
        ${profile.jobIntention ? `<p class="job-intention">求职意向：${profile.jobIntention} ｜ 期望薪资：${profile.expectedSalary || '面议'} ｜ 期望城市：${profile.expectedCity || '不限'}</p>` : ''}
        <p class="bio">${profile.bio}</p>
        <div class="contact-info">
          ${profile.contact.phone ? `<span class="contact-item" data-label="电话">${profile.contact.phone}</span>` : ''}
          ${profile.contact.email ? `<span class="contact-item" data-label="邮箱">${profile.contact.email}</span>` : ''}
          ${profile.contact.wechat ? `<span class="contact-item" data-label="微信">${profile.contact.wechat}</span>` : ''}
          ${profile.contact.location ? `<span class="contact-item" data-label="城市">${profile.contact.location}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderEducation(education) {
  const section = document.getElementById('education');
  if (!education || education.length === 0) {
    section.style.display = 'none';
    return;
  }

  const items = education.map(edu => `
    <div class="edu-item">
      <div class="item-header">
        <h3 class="item-title">${edu.school}</h3>
        <span class="item-date">${edu.start} - ${edu.end}</span>
      </div>
      <p class="item-subtitle">${edu.major} · ${edu.degree}</p>
    </div>
  `).join('');

  section.innerHTML = `
    <h2 class="section-title">教育背景</h2>
    <div class="section-content">${items}</div>
  `;
}

function renderHighlights(highlights) {
  const section = document.getElementById('highlights');
  if (!highlights || highlights.length === 0) {
    section.style.display = 'none';
    return;
  }

  const items = highlights.map(h => `<li class="highlight-item">${h}</li>`).join('');

  section.innerHTML = `
    <h2 class="section-title">个人优势</h2>
    <ul class="section-content highlights-list">${items}</ul>
  `;
}

function renderProjects(projects) {
  const section = document.getElementById('projects');
  if (!projects || projects.length === 0) {
    section.style.display = 'none';
    return;
  }

  const items = projects.map(proj => `
    <div class="exp-item">
      <div class="item-header">
        <h3 class="item-title">${proj.name}</h3>
        <span class="item-date">${proj.start} - ${proj.end}</span>
      </div>
      <p class="item-subtitle">${proj.role}</p>
      <p class="item-desc">${proj.description}</p>
      ${proj.achievement ? `<p class="item-achievement">🏆 ${proj.achievement}</p>` : ''}
    </div>
  `).join('');

  section.innerHTML = `
    <h2 class="section-title">项目经历</h2>
    <div class="section-content">${items}</div>
  `;
}

function renderExperience(experiences) {
  const section = document.getElementById('experience');
  if (!experiences || experiences.length === 0) {
    section.style.display = 'none';
    return;
  }

  const items = experiences.map(exp => `
    <div class="exp-item">
      <div class="item-header">
        <h3 class="item-title">${exp.company}</h3>
        <span class="item-date">${exp.start} - ${exp.end}</span>
      </div>
      <p class="item-subtitle">${exp.position}</p>
      <p class="item-desc">${exp.description}</p>
      ${exp.achievement ? `<p class="item-achievement">🏆 ${exp.achievement}</p>` : ''}
    </div>
  `).join('');

  section.innerHTML = `
    <h2 class="section-title">工作经历</h2>
    <div class="section-content">${items}</div>
  `;
}

function renderSkills(skills) {
  const section = document.getElementById('skills');
  if (!skills || skills.length === 0) {
    section.style.display = 'none';
    return;
  }

  const tags = skills.map(skill => `
    <span class="skill-tag">
      <span class="skill-name">${skill.name}</span>
      <span class="skill-level">${skill.level}</span>
    </span>
  `).join('');

  section.innerHTML = `
    <h2 class="section-title">技能特长</h2>
    <div class="section-content skills-list">${tags}</div>
  `;
}

function renderPortfolio(portfolio) {
  const section = document.getElementById('portfolio');

  // 支持分组格式 (categories) 和旧格式 (images)
  const categories = portfolio.categories || [];
  const flatImages = portfolio.images || [];

  if (categories.length > 0) {
    // 新格式：按分类渲染
    const allImages = [];
    const categoryBlocks = categories.map(cat => {
      const imgs = cat.images.map((img, i) => {
        const globalIndex = allImages.length;
        allImages.push(img);
        return `
          <div class="portfolio-item" data-index="${globalIndex}">
            <div class="portfolio-img-wrapper">
              <img
                src="${img.src}"
                alt="${cat.name}"
                class="portfolio-img"
                loading="lazy"
                onerror="this.parentElement.innerHTML='${generatePortfolioPlaceholder(globalIndex + 1, cat.name)}'"
              >
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="portfolio-category">
          <h3 class="portfolio-cat-title">${cat.name}</h3>
          <div class="portfolio-cat-grid">${imgs}</div>
        </div>
      `;
    }).join('');

    section.innerHTML = `
      <h2 class="section-title">${portfolio.title || '作品集'}</h2>
      ${portfolio.description ? `<p class="section-desc">${portfolio.description}</p>` : ''}
      <p class="portfolio-disclaimer">（修图作品仅供参考 · 不做商用 · 不可外泄）</p>
      <div class="portfolio-categories">${categoryBlocks}</div>
    `;

    // 绑定灯箱点击 - 全局索引
    const items = section.querySelectorAll('.portfolio-item');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        openLightbox(allImages, idx);
      });
    });

  } else if (flatImages.length > 0) {
    // 旧格式兼容
    const images = flatImages.map((img, index) => `
      <div class="portfolio-item" data-index="${index}">
        <div class="portfolio-img-wrapper">
          <img
            src="${img.src}"
            alt="${img.caption}"
            class="portfolio-img"
            loading="lazy"
            onerror="this.parentElement.innerHTML='${generatePortfolioPlaceholder(index + 1, img.caption)}'"
          >
        </div>
      </div>
    `).join('');

    section.innerHTML = `
      <h2 class="section-title">${portfolio.title || '作品集'}</h2>
      ${portfolio.description ? `<p class="section-desc">${portfolio.description}</p>` : ''}
      <p class="portfolio-disclaimer">（修图作品仅供参考 · 不做商用 · 不可外泄）</p>
      <div class="portfolio-grid">${images}</div>
    `;

    const items = section.querySelectorAll('.portfolio-item');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        openLightbox(flatImages, idx);
      });
    });
  } else {
    section.style.display = 'none';
  }
}

function renderFooter(profile) {
  const footer = document.getElementById('footer');
  footer.innerHTML = `
    <p>&copy; ${new Date().getFullYear()} ${profile.name}. All rights reserved.</p>
  `;
}

// ============================================================
// 3. 占位图生成（图片加载失败时的备选方案）
// ============================================================

function generateAvatarPlaceholder(name) {
  const initial = name ? name.charAt(0) : '?';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
    <rect width="150" height="150" fill="#d4a574"/>
    <text x="75" y="75" text-anchor="middle" dy=".35em" fill="#fff" font-family="sans-serif" font-size="60">${initial}</text>
  </svg>`;
}

function generatePortfolioPlaceholder(index, caption) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#12121f"/>
    <rect width="800" height="600" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
    <text x="400" y="280" text-anchor="middle" fill="rgba(255,255,255,0.25)" font-family="sans-serif" font-size="28">作品 ${index}</text>
    <text x="400" y="320" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-family="sans-serif" font-size="16">${caption}</text>
  </svg>`;
}

// ============================================================
// 4. 灯箱 - 点击放大 / 滚轮缩放 / 拖拽 / 导航
// ============================================================

let lightboxState = {
  images: [],
  currentIndex: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  startTranslateX: 0,
  startTranslateY: 0,
};

function createLightbox() {
  // 只创建一次
  if (document.getElementById('lightbox')) return;

  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lightbox-close" title="关闭 (Esc)">&times;</button>
    <img class="lightbox-img" src="" alt="" draggable="false">
    <p class="lightbox-caption"></p>
    <div class="lightbox-controls">
      <button class="lightbox-zoom-btn" data-action="out" title="缩小">−</button>
      <button class="lightbox-zoom-btn" data-action="in" title="放大">+</button>
      <button class="lightbox-zoom-btn" data-action="reset" title="重置">1:1</button>
    </div>
    <button class="lightbox-prev" title="上一张">&lsaquo;</button>
    <button class="lightbox-next" title="下一张">&rsaquo;</button>
  `;
  document.body.appendChild(lb);

  const img = lb.querySelector('.lightbox-img');
  const caption = lb.querySelector('.lightbox-caption');

  // 关闭
  lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  // 缩放按钮
  lb.querySelector('[data-action="in"]').addEventListener('click', (e) => { e.stopPropagation(); zoomLightbox(0.25); });
  lb.querySelector('[data-action="out"]').addEventListener('click', (e) => { e.stopPropagation(); zoomLightbox(-0.25); });
  lb.querySelector('[data-action="reset"]').addEventListener('click', (e) => { e.stopPropagation(); resetZoom(); });

  // 导航
  lb.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
  lb.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

  // 滚轮缩放
  img.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomLightbox(delta);
  }, { passive: false });

  // 拖拽移动
  img.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);

  // 键盘
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === '+') zoomLightbox(0.25);
    if (e.key === '-') zoomLightbox(-0.25);
    if (e.key === '0') resetZoom();
  });

  // 触摸支持
  let touchStartDist = 0;
  let touchStartScale = 1;
  img.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartScale = lightboxState.scale;
    }
  }, { passive: false });

  img.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(5, Math.max(0.5, touchStartScale * (dist / touchStartDist)));
      lightboxState.scale = newScale;
      applyImageTransform();
    }
  }, { passive: false });
}

function openLightbox(images, index) {
  createLightbox();
  lightboxState.images = images;
  lightboxState.currentIndex = index;
  showCurrentImage();
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
  resetZoom();
}

function showCurrentImage() {
  const img = document.querySelector('.lightbox-img');
  const caption = document.querySelector('.lightbox-caption');
  const data = lightboxState.images[lightboxState.currentIndex];
  img.src = data.src;
  img.alt = data.caption;
  caption.textContent = data.caption;
  resetZoom();
}

function navigateLightbox(direction) {
  const len = lightboxState.images.length;
  lightboxState.currentIndex = (lightboxState.currentIndex + direction + len) % len;
  showCurrentImage();
}

function zoomLightbox(delta) {
  const newScale = Math.min(5, Math.max(0.5, lightboxState.scale + delta));
  lightboxState.scale = newScale;
  if (newScale <= 1) {
    lightboxState.translateX = 0;
    lightboxState.translateY = 0;
  }
  applyImageTransform();
}

function resetZoom() {
  lightboxState.scale = 1;
  lightboxState.translateX = 0;
  lightboxState.translateY = 0;
  applyImageTransform();
}

function applyImageTransform() {
  const img = document.querySelector('.lightbox-img');
  if (!img) return;
  const { scale, translateX, translateY } = lightboxState;
  img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
}

function startDrag(e) {
  if (lightboxState.scale <= 1) return;
  e.preventDefault();
  lightboxState.isDragging = true;
  lightboxState.dragStartX = e.clientX;
  lightboxState.dragStartY = e.clientY;
  lightboxState.startTranslateX = lightboxState.translateX;
  lightboxState.startTranslateY = lightboxState.translateY;
}

function onDrag(e) {
  if (!lightboxState.isDragging) return;
  lightboxState.translateX = lightboxState.startTranslateX + (e.clientX - lightboxState.dragStartX);
  lightboxState.translateY = lightboxState.startTranslateY + (e.clientY - lightboxState.dragStartY);
  applyImageTransform();
}

function stopDrag() {
  lightboxState.isDragging = false;
}

// ============================================================
// 5. 编辑模式 + 头像更换
// ============================================================

const STORAGE_KEY = 'resume_edits';
const AVATAR_KEY = 'resume_avatar';
let isEditMode = false;

function initEditMode() {
  // 创建编辑按钮
  const btn = document.createElement('button');
  btn.id = 'edit-toggle';
  btn.textContent = '✎ 编辑';
  btn.title = '开启编辑模式，点击文字即可修改';
  document.body.appendChild(btn);

  // 创建隐藏的文件选择器（换头像用）
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  fileInput.id = 'avatar-input';
  document.body.appendChild(fileInput);

  // 编辑按钮点击
  btn.addEventListener('click', () => {
    isEditMode = !isEditMode;
    if (isEditMode) {
      enterEditMode();
      btn.textContent = '✓ 完成';
      btn.classList.add('active');
    } else {
      exitEditMode();
      btn.textContent = '✎ 编辑';
      btn.classList.remove('active');
    }
  });

  // 头像更换
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const avatar = document.querySelector('.avatar');
      if (avatar) {
        avatar.src = ev.target.result;
        localStorage.setItem(AVATAR_KEY, ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  });

  // 恢复保存的头像
  restoreAvatar();
  // 恢复保存的文字编辑
  restoreEdits();
}

function enterEditMode() {
  // 让主要文字元素可编辑
  const editable = document.querySelectorAll(
    'h1, .title, .bio, .job-intention, .highlight-item, .item-title, .item-subtitle, .item-desc, .item-achievement, .contact-item, .skill-name, .skill-level, .meta-info, .edu-item, .section-desc, footer p'
  );
  editable.forEach(el => {
    el.contentEditable = 'true';
    el.classList.add('editing');
    el.addEventListener('blur', saveEdits);
  });

  // 头像可点击
  const avatar = document.querySelector('.avatar');
  if (avatar) {
    avatar.style.cursor = 'pointer';
    avatar.title = '点击更换头像';
    avatar.addEventListener('click', onAvatarClick);
  }

  // 显示提示
  showToast('点击任意文字即可编辑，点击头像可换图');
}

function exitEditMode() {
  const editable = document.querySelectorAll('[contenteditable="true"]');
  editable.forEach(el => {
    el.contentEditable = 'false';
    el.classList.remove('editing');
    el.removeEventListener('blur', saveEdits);
  });

  const avatar = document.querySelector('.avatar');
  if (avatar) {
    avatar.style.cursor = '';
    avatar.title = '';
    avatar.removeEventListener('click', onAvatarClick);
  }

  saveEdits();
  showToast('修改已自动保存 ✓');
}

function onAvatarClick(e) {
  e.stopPropagation();
  document.getElementById('avatar-input').click();
}

function saveEdits() {
  const edits = {};
  const editable = document.querySelectorAll('[contenteditable="true"]');
  editable.forEach((el, i) => {
    // 用元素的唯一路径作为 key
    const path = getElementPath(el);
    if (path) {
      edits[path] = el.textContent.trim();
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
}

function restoreEdits() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const edits = JSON.parse(saved);
    // 延迟恢复，等渲染完成
    setTimeout(() => {
      Object.entries(edits).forEach(([path, text]) => {
        const el = findElementByPath(path);
        if (el) {
          el.textContent = text;
        }
      });
    }, 200);
  } catch (e) {
    // 忽略恢复错误
  }
}

function getElementPath(el) {
  // 生成一个尽量稳定的路径：标签 + 类名 + 在同类中的索引
  const tag = el.tagName.toLowerCase();
  const cls = el.className.replace('editing', '').trim();
  const selector = cls ? `${tag}.${cls.split(' ')[0]}` : tag;
  const all = document.querySelectorAll(selector);
  for (let i = 0; i < all.length; i++) {
    if (all[i] === el) return `${selector}:${i}`;
  }
  return null;
}

function findElementByPath(path) {
  const [selector, index] = path.split(':');
  if (!selector || index === undefined) return null;
  const all = document.querySelectorAll(selector);
  return all[parseInt(index)] || null;
}

function restoreAvatar() {
  const saved = localStorage.getItem(AVATAR_KEY);
  if (saved) {
    const tryRestore = () => {
      const avatar = document.querySelector('.avatar');
      if (avatar) {
        avatar.src = saved;
      } else {
        setTimeout(tryRestore, 100);
      }
    };
    tryRestore();
  }
}

// Toast 提示
function showToast(msg) {
  let toast = document.getElementById('edit-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'edit-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ============================================================
// 6. 初始化
// ============================================================

async function init() {
  const config = await loadConfig();
  if (!config) {
    document.body.innerHTML = '<div class="error"><p>⚠️ 加载配置文件失败，请检查 config.json 是否存在。</p></div>';
    return;
  }

  // 更新页面标题
  document.title = `个人简历 - ${config.profile.name}`;

  // 按顺序渲染各板块
  renderHeader(config.profile);
  renderHighlights(config.highlights);
  renderExperience(config.experience);
  renderProjects(config.projects);
  renderEducation(config.education);
  renderSkills(config.skills);
  renderPortfolio(config.portfolio);
  renderFooter(config.profile);

  // 初始化编辑模式
  initEditMode();
}

// 启动
init();
