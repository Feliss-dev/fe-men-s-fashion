# 📖 Hướng Dẫn Học HTML/CSS Từ Static Version

## 🎯 Mục tiêu học tập

Phiên bản static này giúp bạn:

1. Hiểu cấu trúc HTML semantic
2. Học cách sử dụng CSS Grid/Flexbox
3. Hiểu responsive design
4. Nắm vững CSS Variables (Design Tokens)

---

## 📐 1. Cấu trúc HTML Semantic

### Header Section

```html
<header>
  <div class="container">
    <a href="index.html" class="logo">...</a>
    <nav id="mainNav">...</nav>
    <div class="header-actions">...</div>
  </div>
</header>
```

**Giải thích:**

- `<header>`: Thẻ semantic cho phần đầu trang
- `.container`: Class wrapper giới hạn max-width
- `<nav>`: Thẻ semantic cho navigation
- `.logo`: BEM naming convention

### Product Card Structure

```html
<div class="product-card">
  <div class="product-image">
    <img src="..." alt="..." />
    <span class="product-card-badge">-20%</span>
  </div>
  <div class="product-info">
    <h4 class="product-name">...</h4>
    <div class="product-price">
      <span class="price-current">159.000 ₫</span>
      <span class="price-original">199.000 ₫</span>
    </div>
  </div>
</div>
```

**Giải thích:**

- `.product-card`: Container chính
- `.product-image`: Wrapper cho ảnh + badge
- `.product-info`: Wrapper cho thông tin text
- BEM naming: `block__element--modifier`

---

## 🎨 2. CSS Layout Techniques

### Flexbox cho Header

```css
header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-2xl);
}
```

**Giải thích:**

- `display: flex`: Kích hoạt flexbox
- `justify-content: space-between`: Đẩy logo sang trái, actions sang phải
- `align-items: center`: Căn giữa theo trục dọc
- `gap`: Khoảng cách giữa các flex items

### CSS Grid cho Product Grid

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}
```

**Giải thích:**

- `display: grid`: Kích hoạt CSS Grid
- `repeat(auto-fill, ...)`: Tự động tạo cột mới khi đủ chỗ
- `minmax(200px, 1fr)`: Mỗi cột tối thiểu 200px, tối đa 1 phần không gian còn lại
- `gap`: Khoảng cách giữa các grid items

### Grid cho Shop Layout

```css
.shop-wrapper {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: var(--spacing-2xl);
}
```

**Giải thích:**

- Sidebar cố định 250px
- Main content chiếm phần còn lại (`1fr`)

---

## 📱 3. Responsive Design

### Mobile-First Approach

```css
/* Base styles (mobile) */
.product-grid {
  grid-template-columns: repeat(2, 1fr); /* 2 cột trên mobile */
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 cột trên tablet */
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 cột trên desktop */
  }
}
```

**Breakpoints:**

- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: >= 1024px

---

## 🎨 4. CSS Variables (Design Tokens)

### variables.css

```css
:root {
  /* Colors */
  --color-primary: #000;
  --color-secondary: #666;
  --color-background: #fff;

  /* Spacing */
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;

  /* Typography */
  --font-size-base: 1rem;
  --font-weight-bold: 700;
}
```

**Sử dụng:**

```css
.btn-primary {
  background-color: var(--color-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  font-weight: var(--font-weight-bold);
}
```

**Lợi ích:**

- Dễ dàng thay đổi theme
- Consistency trong design
- Giảm lặp code

---

## 🧩 5. Component Patterns

### Button Component

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: transparent;
  border: 2px solid var(--color-primary);
}
```

**Modifier Classes:**

- `.btn-sm`: Kích thước nhỏ
- `.btn-lg`: Kích thước lớn
- `.btn-primary`: Style chính
- `.btn-secondary`: Style phụ

---

## 📋 Bài tập thực hành

### Level 1: Cơ bản

1. Thay đổi màu primary từ đen sang xanh
2. Thêm 3 product cards mới vào shop.html
3. Thay đổi font-size của product-name

### Level 2: Trung bình

1. Tạo thêm 1 category section mới trên trang chủ
2. Tạo layout 2 cột cho about page
3. Thêm hover effects cho product cards

### Level 3: Nâng cao

1. Tạo responsive navigation với hamburger menu
2. Tạo filter dropdown với checkbox
3. Tạo product modal popup

---

## 🔍 Debugging Tips

### Chrome DevTools

1. **Inspect Element** (F12): Xem HTML structure
2. **Styles Panel**: Xem CSS applied
3. **Computed Tab**: Xem giá trị cuối cùng sau khi tính toán
4. **Toggle Device Toolbar** (Ctrl+Shift+M): Test responsive

### Common Issues

1. **Layout bị vỡ:**

   - Check `display: flex` hoặc `display: grid`
   - Check `width`, `max-width`, `overflow`

2. **Spacing không đều:**

   - Sử dụng `gap` thay vì `margin`
   - Dùng CSS variables cho consistency

3. **Responsive không hoạt động:**
   - Check thứ tự media queries
   - Đảm bảo có `<meta name="viewport"...>` trong `<head>`

---

## 📚 Tài liệu tham khảo

1. **MDN Web Docs**: https://developer.mozilla.org
2. **CSS-Tricks**: https://css-tricks.com
3. **A Complete Guide to Flexbox**: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
4. **A Complete Guide to Grid**: https://css-tricks.com/snippets/css/complete-guide-grid/

---

## ✅ Checklist kiểm tra

- [ ] HTML validate (https://validator.w3.org/)
- [ ] CSS validate (https://jigsaw.w3.org/css-validator/)
- [ ] Test trên Chrome, Firefox, Safari
- [ ] Test responsive trên mobile, tablet, desktop
- [ ] Check accessibility (ARIA labels, alt text)
