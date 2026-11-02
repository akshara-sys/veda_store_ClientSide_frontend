import { useEffect, useState } from 'react';
import { api, asset, money, navigate, titleCase } from '../utils/storeUtils';
import Footer from './pages/Footer';

/* ------------------------------------------------------------------ */
/* Brand tokens (reuse these for consistency)                          */
/*   forest : bg-[#1B4332]                                             */
/*   gold   : text-[#D9A93F] / border-[#D9A93F]                        */
/*   goldHi : text-[#E3B84F] (hover)                                   */
/*   cream  : bg-[#FAF7F0]                                             */
/* ------------------------------------------------------------------ */

/* NOTE: Footer now lives in ./pages/Footer.js and is re-exported below. */

/* ========================= SKELETON GRID ========================== */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6" aria-label="Loading products">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="rounded-2xl border border-[#E7E1D3] bg-[#FAF7F0] overflow-hidden animate-pulse">
          <div className="aspect-square bg-[#E7E1D3]" />
          <div className="p-4 space-y-3">
            <i className="block h-2.5 w-1/3 bg-[#E7E1D3] rounded" />
            <b className="block h-4 w-3/4 bg-[#E7E1D3] rounded" />
            <div className="h-8 w-full bg-[#E7E1D3] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========================== PRODUCT CARD ========================== */
function ProductCard({ product, onAdd }) {
  const variant = product.variants?.find(item => (item.is_default === true || Number(item.is_default) === 1) && Number(item.available_quantity) > 0)
    || product.variants?.find(item => Number(item.available_quantity) > 0)
    || (product.default_variant_id ? { id: product.default_variant_id, available_quantity: product.default_variant_available, effective_price_paise: product.effective_price_paise, mrp_paise: product.mrp_paise } : null);
  const image = product.images?.[0]?.url || product.image_url;
  const price = variant?.effective_price_paise ?? product.effective_price_paise ?? product.selling_price_paise;
  const stock = Number(product.available_quantity ?? product.default_variant_available ?? 0);
  const out = stock <= 0 || !variant;

  return (
    <article className="group flex flex-col rounded-2xl border border-[#E7E1D3] bg-white overflow-hidden transition-shadow duration-300 hover:shadow-[0_10px_30px_-15px_rgba(27,67,50,0.35)]">
      <a
        href={`/products/${product.slug}`}
        onClick={event => { event.preventDefault(); navigate(`/products/${product.slug}`); }}
        className="relative block aspect-square overflow-hidden bg-[#FAF7F0]"
      >
        <img
          loading="lazy"
          src={asset(image)}
          alt={product.name}
          onError={event => { event.currentTarget.hidden = true; }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.computed_badge && (
          <span className="absolute top-3 left-3 rounded-full bg-[#1B4332] text-[#D9A93F] text-[10px] font-semibold tracking-[1.5px] uppercase px-3 py-1">
            {product.computed_badge}
          </span>
        )}
      </a>

      <div className="flex flex-col gap-2 p-4">
        <small className="text-[10px] font-semibold tracking-[2px] uppercase text-[#8A8578]">
          {product.category || product.rashi || 'VEDA COLLECTION'}
        </small>
        <a
          href={`/products/${product.slug}`}
          onClick={event => { event.preventDefault(); navigate(`/products/${product.slug}`); }}
          className="no-underline"
        >
          <h3 className="font-serif text-[17px] leading-snug text-[#1B4332] line-clamp-2">{product.name}</h3>
        </a>

        <div className="flex items-baseline flex-wrap gap-2">
          <b className="text-[#1B4332] text-base">{money(price)}</b>
          <del className="text-[#9C978A] text-xs">{money(variant?.mrp_paise || product.mrp_paise)}</del>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
            {Number(product.discount_percent || 0).toFixed(0)}% off
          </span>
        </div>

        <div className="text-[11px] text-[#8A8578]">
          {Number(product.avg_rating || 0) > 0
            ? `★ ${Number(product.avg_rating).toFixed(1)} · ${product.review_count || 0} reviews`
            : 'New in the collection'}
        </div>

        <button
          disabled={out}
          onClick={() => onAdd(product, variant)}
          className="mt-1 w-full rounded-full bg-[#1B4332] text-white text-sm font-medium py-2.5 transition-colors hover:bg-[#2A5C45] disabled:bg-[#D7D2C7] disabled:text-[#8A8578] disabled:cursor-not-allowed"
        >
          {out ? 'Out of Stock' : 'Add to bag'}
        </button>
      </div>
    </article>
  );
}

/* ========================== PRODUCT RAIL ========================== */
function ProductRail({ title, products = [], onAdd, action }) {
  if (!products.length) return null;
  return (
    <section className="max-w-[1300px] mx-auto px-6 md:px-12 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-[10px] font-semibold tracking-[3px] uppercase text-[#8A8578]">VEDA SANKALPA</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1B4332] mt-1">{title}</h2>
        </div>
        {action}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
        {products.slice(0, 8).map(product => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}
      </div>
    </section>
  );
}

/* ==================== FEATURED BANNER CAROUSEL ==================== */
function FeaturedBannerCarousel({ banners = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => { setActiveIndex(index => banners.length ? index % banners.length : 0); }, [banners.length]);
  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveIndex(index => (index + 1) % banners.length), 5500);
    return () => window.clearInterval(timer);
  }, [banners.length]);
  if (!banners.length) return null;
  const banner = banners[activeIndex];
  const change = amount => setActiveIndex(index => (index + amount + banners.length) % banners.length);

  return (
    <section className="relative max-w-[1300px] mx-auto px-6 md:px-12 py-8" aria-label="Featured products">
      <a
        href={`/products/${banner.product_slug}`}
        onClick={event => { event.preventDefault(); navigate(`/products/${banner.product_slug}`); }}
        className="relative block overflow-hidden rounded-3xl min-h-[340px] md:min-h-[440px] no-underline"
      >
        <img src={asset(banner.image_url)} alt={banner.alt_text || banner.product_name} className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <span className="relative z-10 flex flex-col justify-end h-full p-8 md:p-14 max-w-xl text-white">
          <small className="text-[10px] font-semibold tracking-[3px] uppercase text-[#D9A93F] mb-3">
            VEDA SANKALPA · FEATURED PRODUCT
          </small>
          <strong className="font-serif text-3xl md:text-4xl font-semibold leading-tight mb-4">{banner.product_name}</strong>
          <em className="not-italic text-sm text-white/90 inline-flex items-center gap-2">
            Discover this piece <b aria-hidden="true">→</b>
          </em>
        </span>
      </a>

      {banners.length > 1 && (
        <>
          <button type="button" aria-label="Previous featured product" onClick={() => change(-1)}
                  className="absolute left-8 md:left-14 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-[#1B4332] text-2xl leading-none transition">‹</button>
          <button type="button" aria-label="Next featured product" onClick={() => change(1)}
                  className="absolute right-8 md:right-14 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-[#1B4332] text-2xl leading-none transition">›</button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((item, index) => (
              <button key={item.id} type="button" aria-label={`Show banner ${index + 1}`} onClick={() => setActiveIndex(index)}
                      className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-[#D9A93F]' : 'w-2 bg-white/60 hover:bg-white'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ========================== REVIEW SECTION ======================== */
function ReviewSection({ reviews, summary }) {
  const stars = summary?.stars || {};
  const total = Number(summary?.count || 0);
  const average = Number(summary?.average || 0);
  return (
    <div className="max-w-[1300px] mx-auto px-6 md:px-12 py-14">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-semibold tracking-[3px] uppercase text-[#8A8578]">OUR RATINGS</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1B4332] mt-1">Reviews &amp; ratings</h2>
          <p className="text-sm text-[#8A8578] mt-1">Ratings published by the Veda Sankalpa team.</p>
        </div>
        <span className="self-start md:self-auto rounded-full bg-[#F1EDE3] text-[#1B4332] text-xs font-medium px-4 py-1.5">
          {total} {total === 1 ? 'published review' : 'published reviews'}
        </span>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-2xl border border-[#E7E1D3] bg-[#FAF7F0] p-6 md:p-8 mb-10" aria-label="Review rating summary">
        <div className="text-center md:text-left">
          <span className="block text-[10px] font-semibold tracking-[2px] uppercase text-[#8A8578] mb-2">Overall rating</span>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <strong className="font-serif text-5xl text-[#1B4332] leading-none">{average.toFixed(1)}</strong>
            <span className="text-[#D9A93F] text-xl tracking-wider" aria-label={`${average.toFixed(1)} out of 5 stars`}>
              {'★'.repeat(Math.round(average))}{'☆'.repeat(5 - Math.round(average))}
            </span>
          </div>
          <p className="text-xs text-[#8A8578] mt-3">Average of {total} approved {total === 1 ? 'rating' : 'ratings'} entered by our team.</p>
        </div>

        <div className="flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map(number => {
            const amount = Number(stars[number] || 0);
            const percent = total ? amount * 100 / total : 0;
            return (
              <div className="flex items-center gap-3 text-xs text-[#5A5548]" key={number}>
                <span className="w-8 shrink-0">{number} <b className="text-[#D9A93F]" aria-hidden="true">★</b></span>
                <div className="flex-1 h-1.5 rounded-full bg-[#E7E1D3] overflow-hidden">
                  <i className="block h-full bg-[#D9A93F] rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <small className="w-6 text-right tabular-nums">{amount}</small>
              </div>
            );
          })}
        </div>
      </section>

      {reviews.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map(review => (
            <article className="rounded-2xl border border-[#E7E1D3] bg-white p-6" key={review.id}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#D9A93F] text-sm tracking-wider" aria-label={`${review.rating} out of 5 stars`}>
                  {'★'.repeat(Number(review.rating) || 0)}{'☆'.repeat(Math.max(0, 5 - (Number(review.rating) || 0)))}
                </span>
                <time className="text-xs text-[#8A8578]">{new Date(review.review_date).toLocaleDateString('en-IN')}</time>
              </div>
              <span className="inline-block text-[9px] font-semibold tracking-[2px] uppercase text-[#1B4332] bg-[#F1EDE3] rounded-full px-2.5 py-1 mb-3">
                STORE-PUBLISHED REVIEW
              </span>
              <h3 className="font-serif text-lg text-[#1B4332] mb-2">{review.title}</h3>
              <p className="text-sm text-[#5A5548] leading-relaxed mb-3">{review.body}</p>
              <small className="text-[11px] text-[#8A8578]">Published by Veda Sankalpa</small>
              {Array.isArray(review.images) && review.images.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {review.images.map(image => (
                    <img key={image} loading="lazy" src={asset(image)} alt="Product review"
                         className="h-20 w-20 rounded-lg object-cover border border-[#E7E1D3]" />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-2xl border border-dashed border-[#D7D2C7] bg-[#FAF7F0] py-16 px-6">
          <span aria-hidden="true" className="text-[#D9A93F] text-4xl">☆</span>
          <h3 className="font-serif text-xl text-[#1B4332] mt-3 mb-1">No published ratings yet</h3>
          <p className="text-sm text-[#8A8578]">Our team will add product ratings and reviews here.</p>
        </div>
      )}
    </div>
  );
}

/* =========================== CART DRAWER ========================== */
function CartDrawer({ cart, update, total, close, checkout }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#FAF7F0] shadow-2xl flex flex-col" aria-label="Shopping bag">
        <header className="flex items-center justify-between px-6 py-5 border-b border-[#E7E1D3]">
          <h2 className="font-serif text-xl text-[#1B4332]">
            Your bag <small className="text-xs font-sans text-[#8A8578] ml-1">({cart.reduce((sum, item) => sum + Number(item.quantity), 0)} items)</small>
          </h2>
          <button onClick={close} aria-label="Close bag"
                  className="h-9 w-9 rounded-full hover:bg-[#F1EDE3] text-2xl leading-none text-[#1B4332] transition">×</button>
        </header>

        {cart.length ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.map(item => (
                <article key={item.item_id} className="flex gap-3 rounded-xl border border-[#E7E1D3] bg-white p-3">
                  <img loading="lazy" src={asset(item.image_url)} alt="" className="h-20 w-20 rounded-lg object-cover bg-[#F1EDE3]" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm text-[#1B4332] truncate">{item.name}</h3>
                    <small className="text-[10px] text-[#8A8578]">{item.sku}</small>
                    <b className="block text-sm text-[#1B4332] mt-0.5">{money(item.effective_price_paise)}</b>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => update(item.item_id, Number(item.quantity) - 1)}
                              className="h-7 w-7 rounded-full border border-[#D7D2C7] text-[#1B4332] leading-none hover:bg-[#F1EDE3] transition">−</button>
                      <span className="text-sm w-5 text-center tabular-nums">{item.quantity}</span>
                      <button onClick={() => update(item.item_id, Number(item.quantity) + 1)}
                              className="h-7 w-7 rounded-full border border-[#D7D2C7] text-[#1B4332] leading-none hover:bg-[#F1EDE3] transition">+</button>
                      <button onClick={() => update(item.item_id, 0)}
                              className="ml-auto text-[11px] text-[#8A8578] hover:text-red-600 underline">Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="border-t border-[#E7E1D3] px-6 py-5 space-y-3 bg-[#FAF7F0]">
              <span className="flex items-center justify-between text-sm text-[#1B4332]">
                Subtotal <b className="text-base">{money(total)}</b>
              </span>
              <small className="block text-[11px] text-[#8A8578]">Inclusive of GST. Shipping shown at checkout.</small>
              <button onClick={checkout}
                      className="w-full rounded-full bg-[#1B4332] text-white text-sm font-medium py-3 hover:bg-[#2A5C45] transition">
                Continue to checkout
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <span className="text-4xl text-[#D9A93F]">♡</span>
            <h3 className="font-serif text-xl text-[#1B4332] mt-4 mb-1">Your bag is waiting</h3>
            <p className="text-sm text-[#8A8578] mb-6">Browse the collection and find something meaningful.</p>
            <button onClick={close}
                    className="rounded-full bg-[#1B4332] text-white text-sm font-medium px-6 py-2.5 hover:bg-[#2A5C45] transition">
              Explore products
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ========================= INVOICE HELPERS ======================== */
function invoiceRecord(value) {
  if (typeof value === 'string') { try { return JSON.parse(value) || {}; } catch { return {}; } }
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function OrderProductLink({ item, children }) {
  const snapshot = invoiceRecord(item.product_snapshot);
  const slug = String(item.slug || snapshot.slug || '').trim();
  if (!slug) return <span>{children}</span>;
  const href = `/products/${encodeURIComponent(slug)}`;
  return (
    <a className="text-[#1B4332] underline decoration-[#D9A93F] decoration-1 underline-offset-2 hover:text-[#D9A93F] transition-colors"
       href={href}
       onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(href); }}>
      {children}
    </a>
  );
}

/* =========================== ORDER INVOICE ======================== */
function OrderInvoice({ order, shipping }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const seller = invoiceRecord(order.seller_details);
  const mrpTotal = items.reduce((total, item) => total + Number(item.mrp_paise || 0) * Number(item.quantity || 0), 0);
  const convenienceFees = items.reduce((total, item) => {
    const snapshot = invoiceRecord(item.product_snapshot);
    return total + Number(snapshot.convenienceFeeTotalPaise ?? (Number(snapshot.convenienceFeePaise || 0) * Number(item.quantity || 0)));
  }, 0);
  const sellingTotal = Math.max(0, Number(order.subtotal_paise || 0) - convenienceFees);
  const productSavings = Math.max(0, mrpTotal - sellingTotal);
  const couponSavings = Number(order.discount_paise || 0);
  const invoiceIssued = Boolean(order.invoice_number);

  return (
    <section className="max-w-[1000px] mx-auto px-4 md:px-8 py-8">
      <div className="flex justify-end mb-4 print:hidden">
        <button onClick={() => window.print()}
                className="rounded-full bg-[#1B4332] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#2A5C45] transition">
          {invoiceIssued ? 'Print / Save invoice' : 'Print / Save order summary'}
        </button>
      </div>

      <div className="rounded-2xl border border-[#E7E1D3] bg-white p-6 md:p-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between gap-4 pb-6 border-b border-[#E7E1D3]">
          <div>
            <span className="text-[10px] font-semibold tracking-[3px] uppercase text-[#D9A93F]">
              {invoiceIssued ? 'INVOICE' : 'ORDER PRICE SUMMARY'}
            </span>
            <h2 className="font-serif text-2xl text-[#1B4332] mt-1">{seller.name || 'Veda Sankalpa'}</h2>
            {seller.address && <p className="text-xs text-[#8A8578] mt-1">{seller.address}{seller.state ? `, ${seller.state}` : ''}</p>}
          </div>
          <div className="text-xs text-[#8A8578] md:text-right space-y-1">
            <b className="block text-sm text-[#1B4332]">{invoiceIssued ? order.invoice_number : `Order ${order.order_number}`}</b>
            <p>{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
            <p>{order.payment_method === 'cod' ? 'Cash on delivery' : 'Razorpay online'}</p>
          </div>
        </header>

        <h3 className="font-serif text-lg text-[#1B4332] mt-6 mb-3">Items and price breakdown</h3>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[720px] text-xs text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[1.5px] text-[#8A8578] border-b border-[#E7E1D3]">
                <th className="py-2 pr-3 font-semibold">Product</th>
                <th className="py-2 px-2 font-semibold">Qty</th>
                <th className="py-2 px-2 font-semibold">MRP</th>
                <th className="py-2 px-2 font-semibold">Selling price</th>
                <th className="py-2 px-2 font-semibold">Convenience fee</th>
                <th className="py-2 px-2 font-semibold">Coupon savings</th>
                <th className="py-2 pl-2 font-semibold text-right">Final amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const quantity = Number(item.quantity || 0), mrp = Number(item.mrp_paise || 0), price = Number(item.unit_price_paise || 0), line = Number(item.line_total_paise || 0);
                const snapshot = invoiceRecord(item.product_snapshot);
                const fee = Number(snapshot.convenienceFeeTotalPaise ?? (Number(snapshot.convenienceFeePaise || 0) * quantity));
                const coupon = Math.max(0, price * quantity + fee - line);
                return (
                  <tr key={`${item.sku}-${index}`} className="border-b border-[#F1EDE3] text-[#5A5548]">
                    <td className="py-3 pr-3"><OrderProductLink item={item}>{item.name}</OrderProductLink></td>
                    <td className="py-3 px-2 tabular-nums">{quantity}</td>
                    <td className="py-3 px-2 tabular-nums">{money(mrp * quantity)}</td>
                    <td className="py-3 px-2 tabular-nums">{money(price * quantity)}</td>
                    <td className="py-3 px-2 tabular-nums">{fee ? money(fee) : 'Free'}</td>
                    <td className="py-3 px-2 tabular-nums">{coupon ? `−${money(coupon)}` : money(0)}</td>
                    <td className="py-3 pl-2 text-right font-semibold text-[#1B4332] tabular-nums">{money(line)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex flex-col items-end gap-1 text-sm text-[#5A5548]">
          <p className="flex justify-between w-full max-w-xs"><span>Original MRP total</span><b className="tabular-nums">{money(mrpTotal)}</b></p>
          <p className="flex justify-between w-full max-w-xs"><span>Product discounts</span><b className="tabular-nums">−{money(productSavings)}</b></p>
          <p className="flex justify-between w-full max-w-xs"><span>Product selling price</span><b className="tabular-nums">{money(sellingTotal)}</b></p>
          <p className="flex justify-between w-full max-w-xs"><span>Convenience fees</span><b className="tabular-nums">{convenienceFees ? money(convenienceFees) : 'Free'}</b></p>
          <p className="flex justify-between w-full max-w-xs"><span>{order.coupon_code ? `Coupon ${order.coupon_code}` : 'Coupon discount'}</span><b className="tabular-nums">−{money(couponSavings)}</b></p>
          <p className="flex justify-between w-full max-w-xs mt-2 pt-3 border-t border-[#E7E1D3] text-[#1B4332]">
            <span className="font-medium">{order.status === 'paid' ? 'Amount paid' : 'Amount payable'}</span>
            <b className="font-serif text-lg tabular-nums">{money(order.total_paise)}</b>
          </p>
        </div>

        {/* Shipping */}
        <div className="mt-8 pt-6 border-t border-[#E7E1D3]">
          <h3 className="font-serif text-lg text-[#1B4332] mb-2">Ship to</h3>
          <p className="text-sm text-[#5A5548] leading-relaxed">
            {order.customer_name}<br />
            {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ''}<br />
            {shipping.city}, {shipping.state} {shipping.postalCode || shipping.postal_code}<br />
            {shipping.country || 'India'}<br />
            {order.customer_phone}
          </p>
        </div>

        <small className="block mt-6 text-[11px] text-[#8A8578] leading-relaxed">
          GST is included in the MRP and selling prices. Any convenience fee is shown separately and includes GST.
        </small>
      </div>
    </section>
  );
}

/* ======================= CUSTOMER ORDER DETAILS =================== */
function CustomerOrderDetails({ order, shipping, onBack }) {
  const [recommendations, setRecommendations] = useState([]);
  useEffect(() => {
    let active = true;
    api('/products?page=1&limit=24&sort=popular')
      .then(result => { if (active) setRecommendations(result.items || []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const items = Array.isArray(order.items) ? order.items : [];
  const bought = new Set(items.map(item => item.product_id).filter(Boolean));
  const journey = recommendations.filter(item => !bought.has(item.id)).slice(0, 3);
  const mrp = items.reduce((sum, item) => sum + Number(item.mrp_paise || 0) * Number(item.quantity || 0), 0);
  const selling = items.reduce((sum, item) => sum + Number(item.unit_price_paise || 0) * Number(item.quantity || 0), 0);
  const fees = items.reduce((sum, item) => {
    const snapshot = invoiceRecord(item.product_snapshot);
    return sum + Number(snapshot.convenienceFeeTotalPaise ?? (Number(snapshot.convenienceFeePaise || 0) * Number(item.quantity || 0)));
  }, 0);

  return (
    <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-10">
      <button onClick={onBack}
              className="inline-flex items-center gap-1 text-sm text-[#8A8578] hover:text-[#1B4332] transition mb-6">
        ← Back to orders
      </button>

      <div className="text-[10px] font-semibold tracking-[4px] uppercase text-[#D9A93F] mb-2">VEDA SANKALPA</div>

      <header className="mb-8">
        <span className="text-[10px] font-semibold tracking-[3px] uppercase text-[#8A8578]">ORDER DETAILS</span>
        <h1 className="font-serif text-3xl md:text-4xl text-[#1B4332] mt-1">Order manifested</h1>
        <p className="text-sm text-[#8A8578] mt-1">Your order details and delivery information.</p>
      </header>

      {/* Meta cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <article className="rounded-2xl border border-[#E7E1D3] bg-[#FAF7F0] p-6">
          <span className="text-[10px] font-semibold tracking-[2px] uppercase text-[#D9A93F]">ORDER SUMMARY</span>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-[#8A8578]">Order number</dt><dd className="text-[#1B4332] font-medium">{order.order_number}</dd>
            <dt className="text-[#8A8578]">Date</dt><dd className="text-[#1B4332]">{new Date(order.created_at).toLocaleDateString('en-IN')}</dd>
            <dt className="text-[#8A8578]">Status</dt><dd className="text-[#1B4332]">{titleCase(order.fulfillment_status)} · {titleCase(order.status)}</dd>
            <dt className="text-[#8A8578]">Payment</dt><dd className="text-[#1B4332]">{order.payment_method === 'cod' ? 'Cash on delivery' : 'Razorpay online'}</dd>
          </dl>
        </article>

        <article className="rounded-2xl border border-[#E7E1D3] bg-[#FAF7F0] p-6">
          <span className="text-[10px] font-semibold tracking-[2px] uppercase text-[#D9A93F]">DELIVERY DETAILS</span>
          <b className="block mt-3 text-[#1B4332]">{order.customer_name}</b>
          <p className="text-sm text-[#5A5548] leading-relaxed mt-1">
            {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ''}<br />
            {shipping.city}, {shipping.state} {shipping.postalCode || shipping.postal_code}<br />
            {shipping.country || 'India'}<br />
            {order.customer_phone}
          </p>
        </article>
      </div>

      {/* Items */}
      <section className="rounded-2xl border border-[#E7E1D3] bg-white p-6 md:p-8 mb-10">
        <h2 className="font-serif text-xl text-[#1B4332] mb-5">Items in your order</h2>

        <div className="divide-y divide-[#F1EDE3]">
          {items.map((item, index) => {
            const quantity = Number(item.quantity || 0);
            const feeSnapshot = invoiceRecord(item.product_snapshot);
            const fee = Number(feeSnapshot.convenienceFeeTotalPaise ?? (Number(feeSnapshot.convenienceFeePaise || 0) * quantity));
            const coupon = Number(feeSnapshot.couponDiscountPaise ?? Math.max(0, Number(item.unit_price_paise || 0) * quantity + fee - Number(item.line_total_paise || 0)));
            return (
              <article className="flex gap-4 py-4 first:pt-0 last:pb-0" key={`${item.sku}-${index}`}>
                {item.image_url && (
                  <img src={asset(item.image_url)} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover bg-[#F1EDE3]" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#1B4332]"><OrderProductLink item={item}>{item.name}</OrderProductLink></div>
                  <small className="block text-[11px] text-[#8A8578] mt-0.5">{item.sku} · Qty {quantity}</small>
                  <div className="flex items-baseline gap-2 mt-1">
                    <del className="text-xs text-[#9C978A]">{money(Number(item.mrp_paise || 0) * quantity)}</del>
                    <b className="text-sm text-[#1B4332]">{money(Number(item.unit_price_paise || 0) * quantity)}</b>
                  </div>
                  <small className="block text-[11px] text-[#8A8578] mt-0.5">Convenience fee: {fee ? money(fee) : 'Free'}</small>
                  {coupon > 0 && (
                    <small className="block text-[11px] text-emerald-700 mt-0.5">
                      {order.coupon_code ? `Coupon ${order.coupon_code}` : 'Coupon applied'} · −{money(coupon)}
                    </small>
                  )}
                </div>
                <b className="self-center text-sm text-[#1B4332] tabular-nums">{money(item.line_total_paise)}</b>
              </article>
            );
          })}
        </div>

        {/* Totals */}
        <div className="mt-6 pt-5 border-t border-[#E7E1D3] flex flex-col items-end gap-1 text-sm text-[#5A5548]">
          <p className="flex justify-between w-full max-w-xs"><span>Original MRP</span><del className="tabular-nums">{money(mrp)}</del></p>
          <p className="flex justify-between w-full max-w-xs"><span>Selling price</span><b className="tabular-nums">{money(selling)}</b></p>
          <p className="flex justify-between w-full max-w-xs"><span>Convenience fees</span><b className="tabular-nums">{fees ? money(fees) : 'Free'}</b></p>
          {Number(order.discount_paise) > 0 && (
            <p className="flex justify-between w-full max-w-xs">
              <span>{order.coupon_code ? `Coupon ${order.coupon_code}` : 'Coupon discount'}</span>
              <b className="tabular-nums text-emerald-700">−{money(order.discount_paise)}</b>
            </p>
          )}
          <p className="flex justify-between w-full max-w-xs mt-2 pt-3 border-t border-[#E7E1D3] text-[#1B4332]">
            <span className="font-medium">Final amount · GST included</span>
            <b className="font-serif text-lg tabular-nums">{money(order.total_paise)}</b>
          </p>
        </div>
      </section>

      {/* Journey recommendations */}
      <section className="mb-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <span className="text-[10px] font-semibold tracking-[3px] uppercase text-[#8A8578]">MADE FOR YOUR NEXT MOMENT</span>
            <h2 className="font-serif text-2xl text-[#1B4332] mt-1">Continue your journey</h2>
          </div>
          <a href="/collections/all" onClick={event => { event.preventDefault(); navigate('/collections/all'); }}
             className="text-sm font-medium text-[#1B4332] underline decoration-[#D9A93F] decoration-2 underline-offset-4 hover:text-[#D9A93F] transition">
            View collection
          </a>
        </div>

        {journey.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {journey.map(product => {
              const price = product.effective_price_paise || product.selling_price_paise;
              return (
                <article key={product.id} className="group rounded-2xl border border-[#E7E1D3] bg-white overflow-hidden">
                  <a href={`/products/${product.slug}`} onClick={event => { event.preventDefault(); navigate(`/products/${product.slug}`); }}
                     className="block aspect-square overflow-hidden bg-[#FAF7F0]">
                    <img loading="lazy" src={asset(product.image_url)} alt={product.name}
                         className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </a>
                  <div className="p-4">
                    <a className="block font-serif text-sm text-[#1B4332] truncate no-underline hover:text-[#D9A93F] transition"
                       href={`/products/${product.slug}`}
                       onClick={event => { event.preventDefault(); navigate(`/products/${product.slug}`); }}>
                      {product.name}
                    </a>
                    <div className="flex items-baseline gap-2 mt-1">
                      <b className="text-sm text-[#1B4332]">{money(price)}</b>
                      {Number(product.mrp_paise) > Number(price) && (
                        <del className="text-xs text-[#9C978A]">{money(product.mrp_paise)}</del>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#8A8578] rounded-2xl border border-dashed border-[#D7D2C7] bg-[#FAF7F0] px-6 py-10 text-center">
            Explore the collection for more meaningful everyday pieces.
          </p>
        )}
      </section>

      <button onClick={() => navigate('/')}
              className="mx-auto block rounded-full border border-[#1B4332] text-[#1B4332] text-sm font-medium px-6 py-2.5 hover:bg-[#1B4332] hover:text-white transition">
        Return to store
      </button>
    </section>
  );
}

export { Footer, SkeletonGrid, ProductCard, ProductRail, FeaturedBannerCarousel, ReviewSection, CartDrawer, invoiceRecord, OrderProductLink, OrderInvoice, CustomerOrderDetails };