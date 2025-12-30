/**
 * Home View Module - Landing page with hero banner and featured categories
 */

import { navigate } from "../core/router.js";
// import {
//   getHeroBannerPlaceholder,
//   getCategoryPlaceholder,
//   getPlaceholderImage,
// } from "../utils/placeholder.js";
import {
  getAPI,
  fetchProducts,
  fetchCategories,
  fetchTrendingProducts,
  fetchBestSellingProducts,
} from "../core/api.js";
import { formatPrice } from "../utils/format.js";
import {
  setupProductEvents,
  setCurrentProducts,
} from "../components/ProductEvents.js";
import { setupBannerSlider } from "../components/BannerSlider.js";
import { setupProductSlider } from "../components/ProductSlider.js";
import { setupCategoryProductSliders } from "../components/CategoryProductSlider.js";

// Store original products for each category
let categoryProductsCache = {
  tops: [],
  bottoms: [],
  accessories: [],
};

// Store slider instances
let categorySliders = {};

/**
 * Get subcategories for a specific parent category
 * @param {Array} allCategories - All categories from API
 * @param {string} parentSlug - Parent category slug (tops, bottoms, accessories)
 * @returns {Array} Subcategories
 */
function getSubcategoriesByParent(allCategories, parentSlug) {
  const parentCategory = allCategories.find((cat) => cat.slug === parentSlug);
  if (!parentCategory) return [];

  // Find all subcategories that belong to this parent
  const subcategories = [];

  // Find intermediate categories (e.g., tops-winter, tops-summer for tops)
  const intermediates = allCategories.filter(
    (cat) => cat.parentId === parentCategory.id
  );

  intermediates.forEach((intermediate) => {
    // Find leaf categories (e.g., sweatshirt, sweater under tops-winter)
    const leaves = allCategories.filter(
      (cat) => cat.parentId === intermediate.id
    );
    subcategories.push(...leaves);
  });

  return subcategories;
}

/**
 * Render products for a category section - ALL PRODUCTS
 * @param {Array} products - Products to display
 * @returns {string} HTML string
 */
function renderCategoryProducts(products) {
  if (products.length === 0) {
    return `
      <div style="text-align: center; padding: var(--spacing-2xl); color: var(--color-text-secondary);">
        <p>Không tìm thấy sản phẩm nào</p>
      </div>
    `;
  }

  // Render ALL products for carousel
  return products
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.images?.[0]}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h4 class="product-name">${product.name}</h4>
        <p class="product-price">${formatPrice(product.price)}</p>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * Render product grid for trending/best-selling sections
 * @param {Array} products - Products to display
 * @param {string} salesType - Type of sales data to display ('year' or 'month')
 * @returns {string} HTML string
 */
function renderProductGrid(products, salesType = 'month') {
  if (products.length === 0) {
    return '<p class="empty-message">Không có sản phẩm nào.</p>';
  }

  const salesField = salesType === 'year' ? 'salesThisYear' : 'salesThisMonth';
  const salesLabel = salesType === 'year' ? 'Đã bán' : 'Đã bán';

  return `
    <div class="product-grid">
      ${products
        .map(
          (product) => `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-image">
            <img src="${product.images?.[0]}" alt="${product.name}">
            ${
              product.tags?.includes("new")
                ? '<span class="product-badge badge-new">Mới</span>'
                : ""
            }
            ${
              product.tags?.includes("sale")
                ? '<span class="product-badge badge-sale">Giảm giá</span>'
                : ""
            }
            ${
              product.tags?.includes("sold-out")
                ? '<span class="product-badge badge-sold-out">Hết hàng</span>'
                : ""
            }
          </div>
          <div class="product-info">
            <h4 class="product-name">${product.name}</h4>
            <p class="product-price">
              ${formatPrice(product.price)}
              ${
                product.originalPrice
                  ? `<span class="original-price">${formatPrice(
                      product.originalPrice
                    )}</span>`
                  : ""
              }
            </p>
            <div class="product-stats">
              <span class="sales-count">🔥 ${salesLabel}: ${
                product[salesField] || 0
              }</span>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

/**
 * Setup subcategory filter handlers for a category section
 * @param {string} category - Category name (tops, bottoms, accessories)
 * @param {Array} allProducts - All products for this category
 */
function setupSubcategoryFilters(category, allProducts) {
  const sectionElement = document.querySelector(
    `.category-section[data-category="${category}"]`
  );
  if (!sectionElement) return;

  const subcategoryButtons =
    sectionElement.querySelectorAll(".subcategory-btn");
  const productsContainer = sectionElement.querySelector(".category-products");

  subcategoryButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetSubcategory = e.currentTarget.dataset.subcategory;

      // Update active state
      subcategoryButtons.forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");

      // Sort products: prioritize selected subcategory, keep others after
      let sortedProducts;
      if (targetSubcategory === "all") {
        // Show all products in original order
        sortedProducts = allProducts;
      } else {
        // Prioritize matching subcategory, then show others
        const matchingProducts = allProducts.filter(
          (p) => p.subCategory === targetSubcategory
        );
        const otherProducts = allProducts.filter(
          (p) => p.subCategory !== targetSubcategory
        );
        sortedProducts = [...matchingProducts, ...otherProducts];
      }

      // Update slider with sorted products
      if (categorySliders[category]) {
        categorySliders[category].setProducts(sortedProducts);
      }

      console.log(
        `[HomeView] Sorted ${category} by subcategory: ${targetSubcategory}`,
        `(${
          sortedProducts.filter((p) => p.subCategory === targetSubcategory)
            .length
        } prioritized + ${
          sortedProducts.filter((p) => p.subCategory !== targetSubcategory)
            .length
        } others)`
      );
    });
  });

  // Listen to renderAllProducts event from slider
  sectionElement.addEventListener("renderAllProducts", (e) => {
    const allProducts = e.detail.products;
    productsContainer.innerHTML = renderCategoryProducts(allProducts);
    setupProductEvents();
  });

  // Listen to productsChange event (kept for backward compatibility)
  sectionElement.addEventListener("productsChange", (e) => {
    const products = e.detail.products;
    productsContainer.innerHTML = renderCategoryProducts(products);
    setupProductEvents();
  });
}

/**
 * Render home view
 */
export async function render() {
  const homeSection = document.getElementById("home-view");

  // Fetch all products and categories
  let allProducts = [];
  let allCategories = [];

  let trendingProducts = [];
  let bestSellingProducts = [];

  try {
    [trendingProducts, bestSellingProducts] = await Promise.all([
      fetchTrendingProducts(),
      fetchBestSellingProducts(),
    ]);
    console.log(
      "[HomeView] Loaded trending products:",
      trendingProducts.length
    );
    console.log(
      "[HomeView] Loaded best-selling products:",
      bestSellingProducts.length
    );
  } catch (error) {
    console.error(
      "[HomeView] Error loading trending/best-selling products:",
      error
    );
  }

  try {
    [allProducts, allCategories] = await Promise.all([
      getAPI("/products"),
      getAPI("/categories"),
    ]);
    console.log("[HomeView] All products loaded:", allProducts.length);
    console.log("[HomeView] All categories loaded:", allCategories.length);
  } catch (error) {
    console.error("[HomeView] Error fetching data:", error);
  }

  // Filter products by category and cache them
  categoryProductsCache.tops = allProducts.filter((p) => p.category === "tops");
  categoryProductsCache.bottoms = allProducts.filter(
    (p) => p.category === "bottoms"
  );
  categoryProductsCache.accessories = allProducts.filter(
    (p) => p.category === "accessories"
  );

  // Get subcategories for each main category
  const topsSubcategories = getSubcategoriesByParent(allCategories, "tops");
  const bottomsSubcategories = getSubcategoriesByParent(
    allCategories,
    "bottoms"
  );
  const accessoriesSubcategories = getSubcategoriesByParent(
    allCategories,
    "accessories"
  );

  // Mix products from 3 categories for featured slider (2 from each)
  const sliderProducts = [
    ...categoryProductsCache.tops.slice(0, 2),
    ...categoryProductsCache.bottoms.slice(0, 2),
    ...categoryProductsCache.accessories.slice(0, 2),
  ];

  const banners = [
    "assets/images/banner/banner-1.jpeg",
    "assets/images/banner/banner-2.jpeg",
    "assets/images/banner/banner-3.jpeg",
  ];

  const html = `
    <!-- Hero Banner Slider Section -->
    <section class="hero-section">
      <div class="hero-slider" id="heroSlider">
        ${banners
          .map(
            (banner, index) => `
          <div class="slide ${
            index === 0 ? "active" : ""
          }" style="background-image: url('${banner}');">
            <div class="slide-overlay"></div>
          </div>
        `
          )
          .join("")}
      </div>
      
      <!-- Hero Content Overlay -->
      <div class="hero-content">
        <h1 class="hero-title">Khám Phá Thế Giới Thời Trang Nam</h1>
        <p class="hero-subtitle">Chọn từ những bộ sưu tập độc quyền và phong cách nhất</p>
        <a href="#/shop" class="btn btn-primary hero-cta">Khám Phá Ngay</a>
      </div>

      <!-- Slider Controls -->
      <div class="slider-controls">
        ${banners
          .map(
            (_, index) => `
          <button class="slider-dot ${
            index === 0 ? "active" : ""
          }" data-slide="${index}" aria-label="Slide ${index + 1}"></button>
        `
          )
          .join("")}
      </div>
    </section>

   

    <!-- Featured Categories Section - 3 Columns -->
    <section class="featured-categories">
      <div class="container">
        <h2 class="section-title">DANH MỤC NỔI BẬT</h2>
        <div class="categories-wrapper">
          
          <!-- Category 1: Áo (Tops) -->
          <div class="category-section" data-category="tops">
            <div class="category-header">
              <h3 class="category-title">Áo</h3>
              <div class="category-subcategories">
                <button class="subcategory-btn all active" data-subcategory="all">Tất cả</button>
                ${topsSubcategories
                  .map(
                    (sub) => `
                  <button class="subcategory-btn" data-subcategory="${sub.slug}">${sub.name}</button>
                `
                  )
                  .join("")}
              </div>
            </div>
            <div class="category-products">
              ${renderCategoryProducts(categoryProductsCache.tops)}
            </div>
            <!-- Slider controls will be inserted here -->
            <button class="btn btn-secondary category-view-more" data-category="tops">Xem Thêm</button>
          </div>
          
          <!-- Category 2: Quần (Bottoms) -->
          <div class="category-section" data-category="bottoms">
            <div class="category-header">
              <h3 class="category-title">Quần</h3>
              <div class="category-subcategories">
                <button class="subcategory-btn all active" data-subcategory="all">Tất cả</button>
                ${bottomsSubcategories
                  .map(
                    (sub) => `
                  <button class="subcategory-btn" data-subcategory="${sub.slug}">${sub.name}</button>
                `
                  )
                  .join("")}
              </div>
            </div>
            <div class="category-products">
              ${renderCategoryProducts(categoryProductsCache.bottoms)}
            </div>
            <!-- Slider controls will be inserted here -->
            <button class="btn btn-secondary category-view-more" data-category="bottoms">Xem Thêm</button>
          </div>
          
          <!-- Category 3: Phụ Kiện (Accessories) -->
          <div class="category-section" data-category="accessories">
            <div class="category-header">
              <h3 class="category-title">Phụ Kiện</h3>
              <div class="category-subcategories">
                <button class="subcategory-btn all active" data-subcategory="all">Tất cả</button>
                ${accessoriesSubcategories
                  .map(
                    (sub) => `
                  <button class="subcategory-btn" data-subcategory="${sub.slug}">${sub.name}</button>
                `
                  )
                  .join("")}
              </div>
            </div>
            <div class="category-products">
              ${renderCategoryProducts(categoryProductsCache.accessories)}
            </div>
            <!-- Slider controls will be inserted here -->
            <button class="btn btn-secondary category-view-more" data-category="accessories">Xem Thêm</button>
          </div>
          
        </div>
      </div>
    </section>

     <!-- Trending Products Section -->
    <section class="trending-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">🔥 Sản Phẩm Thịnh Hành Năm Nay</h2>
          <p class="section-subtitle">Top 10 sản phẩm bán chạy nhất trong năm</p>
        </div>
      ${renderProductGrid(trendingProducts, 'year')}
      </div>
    </section>

    <!-- Best Selling Products Section -->
    <section class="best-selling-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">⭐ Bán Chạy Nhất Tháng Này</h2>
          <p class="section-subtitle">Top 10 sản phẩm được yêu thích nhất tháng này</p>
        </div>
        ${renderProductGrid(bestSellingProducts, 'month')}
      </div>
    </section>

    <!-- Featured Products Slider Section -->
    <section class="featured-products">
      <div class="container">
        <h2 class="section-title">Sản Phẩm Nổi Bật</h2>
        <div class="featured-slider-wrapper">
          <div class="featured-slider" id="featuredSlider">
            ${sliderProducts
              .map(
                (product, index) => `
              <div class="featured-slide ${
                index === 0 ? "active" : ""
              }" data-product-id="${product.id}">
                <div class="featured-product-card">
                  <div class="featured-product-image">
                    <img src="${product.images?.[0]}" alt="${product.name}">
                  </div>
                  <div class="featured-product-info">
                    <h4 class="featured-product-name">${product.name}</h4>
                    <p class="featured-product-category">${product.category}</p>
                    <p class="featured-product-price">${formatPrice(
                      product.price
                    )}</p>
                    <button class="btn btn-primary btn-sm" data-action="quick-view" data-product-id="${
                      product.id
                    }">Xem Chi Tiết</button>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          <!-- Featured Slider Controls -->
          <div class="featured-slider-controls">
            ${sliderProducts
              .map(
                (_, index) => `
              <button class="featured-slider-dot ${
                index === 0 ? "active" : ""
              }" data-slide="${index}" aria-label="Sản phẩm ${
                  index + 1
                }"></button>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Hơn 1000+ Sản Phẩm Chính Hãng</h2>
        <p>Tất cả đều được chứng thực và bảo hành chất lượng</p>
        <a href="#/shop" class="btn btn-primary">Bắt Đầu Mua Sắm</a>
      </div>
    </section>
  `;

  homeSection.innerHTML = html;

  // Setup banner slider
  setupBannerSlider();

  // Setup product slider
  setupProductSlider();

  // Setup product events
  setCurrentProducts(allProducts);
  setupProductEvents();

  // Setup category product sliders
  categorySliders = setupCategoryProductSliders(categoryProductsCache);

  // Setup subcategory filters for each category
  setupSubcategoryFilters("tops", categoryProductsCache.tops);
  setupSubcategoryFilters("bottoms", categoryProductsCache.bottoms);
  setupSubcategoryFilters("accessories", categoryProductsCache.accessories);

  // Setup category "Xem Thêm" button handlers
  document.querySelectorAll(".category-view-more").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const category = e.currentTarget.dataset.category;
      navigate(`/shop?category=${category}`);
    });
  });

  console.log("[HomeView] Rendered");
}

export default {
  render,
};
