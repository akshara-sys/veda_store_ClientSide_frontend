/* --- FONTS & COLORS --- */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap');

:root {
  --vs-cream: #FAF8F2;
  --vs-green: #1B4332;
  --vs-dark: #2C2C2C;
  --vs-muted: #7A7A7A;
  --vs-red: #D9381E;
  --vs-gold: #E5B040;
  
  --card-brown: #5D3A2E;
  --card-olive: #4A4E36;
  --card-charcoal: #2E3033;
  --card-rust: #7C3B24;

  --font-serif: 'Playfair Display', serif;
  --font-sans: 'Inter', sans-serif;
}

body {
  background-color: var(--vs-cream);
  color: var(--vs-dark);
  font-family: var(--font-sans);
  margin: 0;
}

/* --- TYPOGRAPHY --- */
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-size: 1.5rem;
  color: var(--vs-green);
}

.section-title {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  color: var(--vs-green);
  margin: 0;
}

.section-subtitle {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--vs-muted);
  margin-bottom: 0.5rem;
  display: block;
}

/* --- HERO SECTION --- */
.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 16px 8px;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .hero-grid { grid-template-columns: 1fr 1fr; }
}
.hero-banner {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  height: 350px;
}
@media (min-width: 768px) {
  .hero-banner { height: 400px; }
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}
.hero-banner:hover .hero-img { transform: scale(1.05); }
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent);
}
.hero-content {
  position: absolute;
  inset: 0;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  width: 75%;
}
@media (min-width: 768px) {
  .hero-content { padding: 48px; }
}
.hero-subtitle {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #e5e5e5;
  margin-bottom: 8px;
}
.hero-title {
  font-family: var(--font-serif);
  font-size: 2.2rem;
  line-height: 1.1;
  margin: 0 0 12px;
}
@media (min-width: 768px) {
  .hero-title { font-size: 2.8rem; }
}
.hero-desc {
  font-size: 0.9rem;
  color: #e5e5e5;
  margin-bottom: 24px;
}
.btn-primary {
  background-color: var(--vs-green);
  color: white;
  padding: 10px 24px;
  border-radius: 999px;
  border: none;
  font-weight: 500;
  width: fit-content;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.9; }

/* --- OUR STORY SECTION --- */
.story-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 16px;
}
.story-container {
  background-color: #F6F3EB;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}
@media (min-width: 768px) {
  .story-container { flex-direction: row; }
}
.story-text {
  padding: 32px;
  z-index: 10;
}
@media (min-width: 768px) {
  .story-text { padding: 64px; width: 50%; }
}
.story-desc {
  color: var(--vs-muted);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 16px 0 24px;
}
.link-btn {
  background: none;
  border: none;
  color: var(--vs-green);
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}
.link-btn:hover { text-decoration: underline; }
.story-image-wrapper {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 50%;
  display: none;
  opacity: 0.2;
}
@media (min-width: 768px) {
  .story-image-wrapper { display: block; }
}
.story-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- FEATURED PRODUCTS --- */
.featured-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
}
.featured-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}
@media (min-width: 768px) {
  .featured-header { flex-direction: row; justify-content: space-between; align-items: center; }
}
.filter-buttons { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; }
.filter-btn {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid #ccc;
  background: white;
  color: var(--vs-muted);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
}
.filter-btn.active {
  background-color: var(--vs-green);
  color: white;
  border-color: var(--vs-green);
}
.product-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}
.product-card {
  min-width: 260px;
  border-radius: 16px;
  padding: 16px;
  color: white;
  display: flex;
  flex-direction: column;
}
.product-card.bg-brown { background-color: var(--card-brown); }
.product-card.bg-olive { background-color: var(--card-olive); }
.product-card.bg-charcoal { background-color: var(--card-charcoal); }
.product-card.bg-rust { background-color: var(--card-rust); }

.product-title { font-family: var(--font-serif); font-size: 1.25rem; margin: 0 0 4px; }
.product-subtitle { font-size: 0.7rem; color: #ccc; margin: 0 0 16px; }
.product-image-box {
  background-color: var(--vs-cream);
  border-radius: 12px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  margin-bottom: 16px;
}
.product-image-box img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; }
.product-rating { font-size: 0.7rem; color: var(--vs-gold); display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
.product-rating span { color: #ccc; }
.product-price-row { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.price-group { display: flex; align-items: flex-end; gap: 8px; }
.current-price { font-size: 1.1rem; font-weight: bold; }
.original-price { font-size: 0.8rem; text-decoration: line-through; color: #aaa; margin-bottom: 2px; }
.discount-badge { background-color: var(--vs-red); color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
.add-to-cart-btn {
  margin-top: 16px;
  width: 100%;
  padding: 8px;
  border-radius: 999px;
  border: none;
  background: white;
  color: var(--vs-dark);
  font-weight: 500;
  cursor: pointer;
}
.add-to-cart-btn:hover { background: #f0f0f0; }

/* --- TESTIMONIALS --- */
.testimonial-section { background-color: #F6F3EB; padding: 64px 16px; margin-top: 40px; }
.testimonial-header { max-width: 1400px; margin: 0 auto 32px; display: flex; justify-content: space-between; align-items: center; }
.testimonial-grid { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 24px; }
@media (min-width: 768px) { .testimonial-grid { grid-template-columns: repeat(3, 1fr); } }
.testimonial-card { background: white; padding: 24px; border-radius: 16px; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.stars { color: var(--vs-gold); display: flex; gap: 2px; margin-bottom: 12px; }
.review-text { font-style: italic; color: #444; font-size: 0.9rem; margin-bottom: 24px; }
.reviewer-info { display: flex; align-items: center; gap: 12px; }
.reviewer-info img { width: 40px; height: 40px; border-radius: 50%; }
.reviewer-info h4 { margin: 0; font-size: 0.9rem; }
.reviewer-info p { margin: 0; font-size: 0.75rem; color: var(--vs-muted); }
.heart-btn { position: absolute; top: 24px; right: 24px; background: none; border: none; color: #ccc; cursor: pointer; }
.heart-btn:hover { color: var(--vs-red); }