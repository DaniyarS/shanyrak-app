/**
 * Category Visual Utility
 * Generates category-specific visual identifiers with relevant icons and colors
 */

/**
 * Get category visual data (icon, gradient colors)
 * @param {string} categoryName - Name of the category
 * @returns {Object} Object with icon and gradient colors
 */
export const getCategoryVisual = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';

  // Construction and building
  if (name.includes('строит') || name.includes('build') || name.includes('құрылыс')) {
    return {
      icon: '🏗️',
      gradient: ['#FF6B6B', '#FF8E53'],
      bgColor: '#FFF5F5',
    };
  }

  // Plumbing
  if (name.includes('сантехник') || name.includes('plumb') || name.includes('су')) {
    return {
      icon: '🚰',
      gradient: ['#4ECDC4', '#44A08D'],
      bgColor: '#F0FFFE',
    };
  }

  // Electrical
  if (name.includes('электри') || name.includes('electric') || name.includes('электр')) {
    return {
      icon: '⚡',
      gradient: ['#F7B733', '#FC4A1A'],
      bgColor: '#FFFBF0',
    };
  }

  // Painting
  if (name.includes('покрас') || name.includes('paint') || name.includes('бояу')) {
    return {
      icon: '🎨',
      gradient: ['#A8EDEA', '#FED6E3'],
      bgColor: '#F0FDFF',
    };
  }

  // Roofing
  if (name.includes('кровл') || name.includes('крыш') || name.includes('roof') || name.includes('шатыр')) {
    return {
      icon: '🏠',
      gradient: ['#667EEA', '#764BA2'],
      bgColor: '#F5F7FF',
    };
  }

  // Flooring
  if (name.includes('пол') || name.includes('floor') || name.includes('еден')) {
    return {
      icon: '📐',
      gradient: ['#D38312', '#A83279'],
      bgColor: '#FFF5F0',
    };
  }

  // Carpentry / Woodwork
  if (name.includes('столяр') || name.includes('дерев') || name.includes('carpenter') || name.includes('wood') || name.includes('ағаш')) {
    return {
      icon: '🪚',
      gradient: ['#8E6C3E', '#D4A574'],
      bgColor: '#FFF9F0',
    };
  }

  // HVAC / Heating / Cooling
  if (name.includes('отопл') || name.includes('кондицион') || name.includes('hvac') || name.includes('heating') || name.includes('жылыту')) {
    return {
      icon: '🌡️',
      gradient: ['#FF512F', '#DD2476'],
      bgColor: '#FFF0F5',
    };
  }

  // Landscaping / Garden
  if (name.includes('ландшафт') || name.includes('сад') || name.includes('garden') || name.includes('landscape') || name.includes('бау')) {
    return {
      icon: '🌿',
      gradient: ['#56AB2F', '#A8E063'],
      bgColor: '#F0FFF4',
    };
  }

  // Cleaning
  if (name.includes('уборк') || name.includes('clean') || name.includes('тазалау')) {
    return {
      icon: '✨',
      gradient: ['#00C9FF', '#92FE9D'],
      bgColor: '#F0FFFF',
    };
  }

  // Renovation / Remodeling
  if (name.includes('ремонт') || name.includes('renovation') || name.includes('remodel') || name.includes('жөндеу')) {
    return {
      icon: '🔨',
      gradient: ['#FF5F6D', '#FFC371'],
      bgColor: '#FFF5F0',
    };
  }

  // Windows / Doors
  if (name.includes('окн') || name.includes('двер') || name.includes('window') || name.includes('door') || name.includes('терезе')) {
    return {
      icon: '🚪',
      gradient: ['#36D1DC', '#5B86E5'],
      bgColor: '#F0F9FF',
    };
  }

  // Ceiling
  if (name.includes('потолок') || name.includes('ceiling') || name.includes('төбе')) {
    return {
      icon: '⬜',
      gradient: ['#E0C3FC', '#8EC5FC'],
      bgColor: '#F5F0FF',
    };
  }

  // Walls
  if (name.includes('стен') || name.includes('wall') || name.includes('қабырға')) {
    return {
      icon: '🧱',
      gradient: ['#FA709A', '#FEE140'],
      bgColor: '#FFF5F8',
    };
  }

  // Tiling
  if (name.includes('плитк') || name.includes('tile') || name.includes('кафель')) {
    return {
      icon: '▪️',
      gradient: ['#30CFD0', '#330867'],
      bgColor: '#F0FAFF',
    };
  }

  // Design / Interior
  if (name.includes('дизайн') || name.includes('интерьер') || name.includes('design') || name.includes('interior')) {
    return {
      icon: '🎯',
      gradient: ['#F093FB', '#F5576C'],
      bgColor: '#FFF0F9',
    };
  }

  // Welding / Metalwork
  if (name.includes('сварк') || name.includes('weld') || name.includes('металл') || name.includes('metal')) {
    return {
      icon: '⚙️',
      gradient: ['#C33764', '#1D2671'],
      bgColor: '#F5F0FF',
    };
  }

  // Masonry
  if (name.includes('камен') || name.includes('кирпич') || name.includes('mason') || name.includes('brick')) {
    return {
      icon: '🧱',
      gradient: ['#B79891', '#94716B'],
      bgColor: '#FFF9F5',
    };
  }

  // Glass work
  if (name.includes('стекл') || name.includes('glass') || name.includes('әйнек')) {
    return {
      icon: '🪟',
      gradient: ['#89F7FE', '#66A6FF'],
      bgColor: '#F0FAFF',
    };
  }

  // Furniture
  if (name.includes('мебел') || name.includes('furniture') || name.includes('жиһаз')) {
    return {
      icon: '🛋️',
      gradient: ['#FFB75E', '#ED8F03'],
      bgColor: '#FFF8F0',
    };
  }

  // Default: general home improvement
  return {
    icon: '🏡',
    gradient: ['#667EEA', '#764BA2'],
    bgColor: '#F5F7FF',
  };
};

/**
 * Preload image to avoid flickering
 * @param {string} url - Image URL to preload
 * @returns {Promise} Promise that resolves when image is loaded
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
};
