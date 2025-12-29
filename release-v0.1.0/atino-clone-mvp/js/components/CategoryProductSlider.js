/**
 * Category Product Carousel Component
 * Infinite carousel slider with auto-play for category products
 */

export class CategoryProductSlider {
  constructor(categoryElement) {
    this.categoryElement = categoryElement;
    this.category = categoryElement.dataset.category;
    this.productsContainer =
      categoryElement.querySelector(".category-products");
    this.products = [];
    this.currentIndex = 0;
    this.isAnimating = false;
    this.direction = "next";
    this.autoPlayInterval = null;
    this.autoPlayDelay = 2000; // 2 seconds
    this.isMobile = window.innerWidth < 768;

    // Responsive items per view
    this.itemsPerView = this.getItemsPerView();

    // Touch/Swipe detection
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.touchStartY = 0;
    this.touchEndY = 0;

    this.init();
  }

  /**
   * Get items per view based on screen width
   */
  getItemsPerView() {
    const width = window.innerWidth;
    if (width >= 768) return 3; // Desktop & Tablet: 3 items
    return 1; // Mobile: 1 item
  }

  /**
   * Initialize slider
   */
  init() {
    console.log(`[CategoryProductSlider] Initialized for ${this.category}`);

    // Create navigation controls
    this.createControls();

    // Setup event listeners
    this.setupEventListeners();

    // Setup touch/swipe listeners
    this.setupSwipeListeners();

    // Handle window resize
    window.addEventListener("resize", () => {
      const newItemsPerView = this.getItemsPerView();
      const newIsMobile = window.innerWidth < 768;

      if (
        newItemsPerView !== this.itemsPerView ||
        newIsMobile !== this.isMobile
      ) {
        this.itemsPerView = newItemsPerView;
        this.isMobile = newIsMobile;
        this.currentIndex = 0;
        this.updateDisplay();
        this.updateControls();
      }
    });
  }

  /**
   * Set products data
   * @param {Array} products - Products to display
   */
  setProducts(products) {
    this.products = products;
    this.currentIndex = 0;
    this.direction = "next";

    // Stop any existing auto-play
    this.stopAutoPlay();

    // Render all products
    this.renderAllProducts();

    // Update controls
    this.updateControls();

    // Start auto-play
    if (this.products.length > this.itemsPerView) {
      this.startAutoPlay();
    }
  }

  /**
   * Render all products in the carousel
   */
  renderAllProducts() {
    // Dispatch event to render all products
    const event = new CustomEvent("renderAllProducts", {
      detail: { products: this.products },
    });
    this.categoryElement.dispatchEvent(event);
  }

  /**
   * Create navigation controls - Side by side with products
   */
  createControls() {
    // Create wrapper for products + controls
    const wrapper = document.createElement("div");
    wrapper.className = "category-carousel-wrapper";

    // Wrap the products container
    this.productsContainer.parentNode.insertBefore(
      wrapper,
      this.productsContainer
    );

    // Create prev button
    const prevBtn = document.createElement("button");
    prevBtn.className = "category-slider-btn prev";
    prevBtn.setAttribute("aria-label", "Previous");
    prevBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    `;

    // Create next button
    const nextBtn = document.createElement("button");
    nextBtn.className = "category-slider-btn next";
    nextBtn.setAttribute("aria-label", "Next");
    nextBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;

    // Append elements: prev -> products -> next
    wrapper.appendChild(prevBtn);
    wrapper.appendChild(this.productsContainer);
    wrapper.appendChild(nextBtn);

    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.wrapperElement = wrapper;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.prevBtn.addEventListener("click", () => {
      this.stopAutoPlay();
      this.prevSlide();
      this.startAutoPlay();
    });

    this.nextBtn.addEventListener("click", () => {
      this.stopAutoPlay();
      this.nextSlide();
      this.startAutoPlay();
    });

    // Pause on hover (desktop only)
    if (!this.isMobile) {
      this.wrapperElement.addEventListener("mouseenter", () => {
        this.pauseAutoPlay();
      });

      this.wrapperElement.addEventListener("mouseleave", () => {
        this.resumeAutoPlay();
      });
    }
  }

  /**
   * Setup swipe/touch listeners for mobile
   */
  setupSwipeListeners() {
    this.productsContainer.addEventListener(
      "touchstart",
      (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
        this.pauseAutoPlay();
      },
      { passive: true }
    );

    this.productsContainer.addEventListener(
      "touchend",
      (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleSwipe();
        this.resumeAutoPlay();
      },
      { passive: true }
    );

    // Mouse drag (desktop only)
    if (!this.isMobile) {
      let isDragging = false;
      let startX = 0;

      this.productsContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.pageX;
        this.productsContainer.style.cursor = "grabbing";
        this.pauseAutoPlay();
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
      });

      document.addEventListener("mouseup", (e) => {
        if (!isDragging) return;
        isDragging = false;
        this.productsContainer.style.cursor = "grab";

        const endX = e.pageX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.nextSlide();
          } else {
            this.prevSlide();
          }
        }
        this.resumeAutoPlay();
      });
    }
  }

  /**
   * Handle swipe gesture
   */
  handleSwipe() {
    const diffX = this.touchStartX - this.touchEndX;
    const diffY = Math.abs(this.touchStartY - this.touchEndY);

    if (Math.abs(diffX) > 50 && diffY < 100) {
      if (diffX > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }

  /**
   * Go to previous slide (with infinite loop)
   */
  prevSlide() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.direction = "prev";

    // Infinite loop: wrap to end
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.products.length - 1;
    }

    this.updateDisplay();
    this.updateControls();

    setTimeout(() => {
      this.isAnimating = false;
    }, 600);
  }

  /**
   * Go to next slide (with infinite loop)
   */
  nextSlide() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.direction = "next";

    // Infinite loop: wrap to start
    this.currentIndex++;
    if (this.currentIndex >= this.products.length) {
      this.currentIndex = 0;
    }

    this.updateDisplay();
    this.updateControls();

    setTimeout(() => {
      this.isAnimating = false;
    }, 600);
  }

  /**
   * Update display - scroll to current index
   */
  updateDisplay() {
    const productCards =
      this.productsContainer.querySelectorAll(".product-card");
    if (productCards.length === 0) return;

    const cardWidth = productCards[0].offsetWidth;
    const gap = parseInt(getComputedStyle(this.productsContainer).gap) || 0;
    const scrollAmount = this.currentIndex * (cardWidth + gap);

    // Smooth scroll
    this.productsContainer.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });

    // Add animation class
    this.productsContainer.classList.add(`slide-${this.direction}`);

    setTimeout(() => {
      this.productsContainer.classList.remove("slide-prev", "slide-next");
    }, 600);
  }

  /**
   * Update controls state
   */
  updateControls() {
    // Always enable buttons for infinite loop
    this.prevBtn.disabled = false;
    this.nextBtn.disabled = false;

    // Hide controls if not enough products
    if (this.products.length <= this.itemsPerView) {
      this.prevBtn.style.display = "none";
      this.nextBtn.style.display = "none";
    } else {
      this.prevBtn.style.display = "flex";
      this.nextBtn.style.display = "flex";
    }
  }

  /**
   * Start auto-play
   */
  startAutoPlay() {
    if (this.autoPlayInterval) return;
    if (this.products.length <= this.itemsPerView) return;

    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);

    console.log(
      `[CategoryProductSlider] Auto-play started for ${this.category} (${this.autoPlayDelay}ms)`
    );
  }

  /**
   * Stop auto-play completely
   */
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  /**
   * Pause auto-play temporarily
   */
  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  /**
   * Resume auto-play
   */
  resumeAutoPlay() {
    if (!this.autoPlayInterval && this.products.length > this.itemsPerView) {
      this.startAutoPlay();
    }
  }

  /**
   * Cleanup - stop auto-play when destroyed
   */
  destroy() {
    this.stopAutoPlay();
  }
}

/**
 * Setup category product sliders for all category sections
 * @param {Object} categoryProductsCache - Cache of products by category
 * @returns {Object} Slider instances by category
 */
export function setupCategoryProductSliders(categoryProductsCache) {
  const sliders = {};

  ["tops", "bottoms", "accessories"].forEach((category) => {
    const categoryElement = document.querySelector(
      `.category-section[data-category="${category}"]`
    );

    if (categoryElement) {
      const slider = new CategoryProductSlider(categoryElement);
      slider.setProducts(categoryProductsCache[category]);
      sliders[category] = slider;
    }
  });

  return sliders;
}
