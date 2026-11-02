import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, asset, navigate, useSeo } from '../../utils/storeUtils';
import {
  Star,
  Heart,
  ChevronRight,
  ChevronLeft,
  Play,
  Package,
  Flower2
} from 'lucide-react';

// --- DATA ---
const fallbackBanners = [
  {
    title: <>Rudraksha<br />Mala & Beads</>,
    subtitle: 'Spiritual Essentials',
    description: 'Connect with your inner self.',
    className: 'bg-[#5D3A2E]',
  },
  {
    title: <>Traditional<br />Essentials</>,
    subtitle: 'Home & Kitchen',
    description: 'Pure. Authentic. Timeless.',
    className: 'bg-[#4A4E36]',
  },
  {
    title: <>Pyrite<br />Bracelets</>,
    subtitle: 'Energy & Abundance',
    description: 'Natural stones, thoughtfully chosen.',
    className: 'bg-[#2E3033]',
  },
  {
    title: <>Zodiac<br />Collection</>,
    subtitle: 'Gemstones',
    description: 'Find the stone made for your sign.',
    className: 'bg-[#22405E]',
  }
];

const categories = ['All', 'Rudraksha', 'Pyrite', 'Karugali', 'Zodiac'];

const faqs = [
  {
    question: 'What is the delivery time?',
    answer: 'Typically, orders are delivered within 3-7 business days depending on your location.'
  },
  {
    question: 'Do you ship outside India?',
    answer: 'Currently, we only ship within India. We are working on expanding our shipping zones.'
  },
  {
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you will receive a tracking link via email and SMS.'
  },
  {
    question: 'Are the products authentic?',
    answer: 'Yes, all our products are 100% authentic and sourced directly from trusted artisans.'
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 7 days of delivery for damaged or incorrect items.'
  },
  {
    question: 'How can I contact customer support?',
    answer: 'You can reach us at support@vedasankalpa.com or call us at +91 98765 43210.'
  }
];

// --- DEMO PRODUCTS (shown only when the API returns no products; delete once real data appears) ---
function makeBeadImage(fill, shine, count = 16, radius = 11) {
  const beads = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const x = 100 + 60 * Math.cos(angle);
    const y = 100 + 60 * Math.sin(angle);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" fill="${fill}"/>` +
      `<circle cx="${(x - radius / 3).toFixed(1)}" cy="${(y - radius / 3).toFixed(1)}" r="${(radius / 3).toFixed(1)}" fill="${shine}" opacity="0.55"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F8F5EE"/>${beads}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const dummyProducts = [
  {
    id: 'demo-1', slug: 'demo-rudraksha-mala', name: 'Rudraksha Mala', category: 'Rudraksha',
    short_description: '5 Mukhi collection', sale_price: 1299, original_price: 1799,
    rating: 4.8, review_count: 124, image_url: makeBeadImage('#8B4A2B', '#E3B58A', 18, 10)
  },
  {
    id: 'demo-2', slug: 'demo-pyrite-bracelet', name: 'Pyrite Bracelet', category: 'Pyrite',
    short_description: 'Natural pyrite beads', sale_price: 899, original_price: 1299,
    rating: 4.7, review_count: 98, image_url: makeBeadImage('#B89B4A', '#FFF1B8', 14, 12)
  },
  {
    id: 'demo-3', slug: 'demo-karugali-bracelet', name: 'Karugali Bracelet', category: 'Karugali',
    short_description: 'Pure karugali wood', sale_price: 1499, original_price: 1999,
    rating: 4.9, review_count: 76, image_url: makeBeadImage('#1F1F1F', '#8A8A8A', 14, 12)
  },
  {
    id: 'demo-4', slug: 'demo-natural-rudraksha', name: 'Natural Rudraksha', category: 'Rudraksha',
    short_description: 'Original & certified', sale_price: 999, original_price: 1399,
    rating: 4.8, review_count: 112, image_url: makeBeadImage('#A5552F', '#F0C29B', 12, 14)
  },
  {
    id: 'demo-5', slug: 'demo-zodiac-bracelet', name: 'Zodiac Bracelet', category: 'Zodiac',
    short_description: 'Healing gemstones', sale_price: 1199, original_price: 1599,
    rating: 4.6, review_count: 64, image_url: makeBeadImage('#3F6E8C', '#CFE6F2', 15, 11)
  }
];

// Placeholder testimonials (replace with real customer reviews)
const testimonials = [
  { quote: 'The quality is amazing and the packaging was so neat. Really happy with my purchase!', name: 'Sravani Reddy', city: 'Hyderabad' },
  { quote: "Authentic products and very positive energy. I've been ordering for months now.", name: 'Anusha', city: 'Bengaluru' },
  { quote: 'Loved the Rudraksha mala. Feels very genuine and original. Thank you!', name: 'Priya', city: 'Chennai' },
  { quote: 'Delivery was quick and the pyrite bracelet looks exactly like the photos.', name: 'Kavya', city: 'Vijayawada' },
  { quote: 'Great packaging and clear product details. Will order again for the festival season.', name: 'Ramesh', city: 'Chennai' },
  { quote: 'Genuine products at a fair price. Customer support answered all my questions.', name: 'Lakshmi', city: 'Hyderabad' }
];

// --- HELPERS ---
function getImage(item) {
  return item?.image_url || item?.image || item?.thumbnail || item?.product_image || '';
}

function getProductName(item) {
  return item?.name || item?.title || item?.product_name || 'Product';
}

function getProductPrice(item) {
  return Number(item?.sale_price ?? item?.selling_price ?? item?.price ?? item?.amount ?? 0);
}

function getOriginalPrice(item) {
  return Number(item?.original_price ?? item?.mrp ?? item?.compare_at_price ?? 0);
}

function getCategory(item) {
  const category = item?.category_name || item?.category || item?.product_category || '';
  if (typeof category === 'object') return category?.name || '';
  return String(category);
}

function formatPrice(value) {
  if (!value) return 'Price unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

// --- COMPONENTS ---

function ProductImage({ src, alt }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="bg-[#F8F5EE] rounded-lg aspect-square flex items-center justify-center mb-3 overflow-hidden">
      {src && !imageFailed ? (
        <img 
          src={src} 
          alt={alt} 
          loading="lazy" 
          onError={() => setImageFailed(true)} 
          className="w-full h-full object-contain p-3 mix-blend-multiply transition-transform duration-300 hover:scale-105" 
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <span className="font-serif text-[#8D806A]">Veda Sankalpa</span>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd, index }) {
  const name = getProductName(product);
  const image = getImage(product);
  const price = getProductPrice(product);
  const originalPrice = getOriginalPrice(product);
  const discount = originalPrice > price && price > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  const rating = product?.rating || 4.8;
  const reviewCount = product?.review_count || 124;
  const topPick = product?.top_pick || 'Top pick';

  const bgColors = ['bg-[#5D3A2E]', 'bg-[#4A4E36]', 'bg-[#2E3033]', 'bg-[#22405E]'];
  const bgClass = bgColors[index % bgColors.length];

  return (
    <article className={`flex flex-col w-[240px] shrink-0 rounded-2xl overflow-hidden ${bgClass} text-white shadow-sm`}>
      <div className="flex flex-col p-4 pb-4">
        <h3 className="font-sans text-xl font-bold mb-1 leading-tight">{name}</h3>
        <p className="text-[#E0B96A] text-xs font-medium mb-4 truncate">
          {product?.short_description || getCategory(product) || 'Premium collection'}
        </p>
        
        <ProductImage src={image} alt={name} />

        <div className="bg-black/30 text-center py-2 rounded-md text-xs text-[#E6D5B8] mb-3">
          Rated {rating} ({reviewCount}) | {topPick}
        </div>

        <div className="flex justify-between items-center bg-white rounded-lg p-2 px-3 mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-vs-dark text-lg font-bold">{formatPrice(price)}</span>
            {originalPrice > price && (
              <span className="text-gray-400 text-xs line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
          {discount > 0 && (
            <span className="bg-[#FCE8E6] text-[#D9381E] text-[10px] font-bold px-2 py-1 rounded">
              {discount}% off
            </span>
          )}
        </div>

        <button 
          type="button" 
          onClick={() => onAdd && onAdd(product)} 
          className="w-full py-2.5 rounded-xl bg-[#FAF7F0] text-[#3D3A33] font-semibold text-sm hover:bg-white transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

// --- HERO CAROUSEL ---
function HeroPanel({ banner, fallback }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = banner?.image_url || banner?.image || '';
  const title = banner?.title || banner?.product_name || fallback.title;
  const subtitle = banner?.subtitle || fallback.subtitle;
  const description = banner?.description || fallback.description;
  const target = banner?.product_slug ? `/products/${banner.product_slug}` : '/collections/all';

  return (
    <div className={`relative min-h-[440px] flex items-center isolation-auto ${fallback.className}`}>
      {imageUrl && !imageFailed && (
        <img 
          src={asset(imageUrl)} 
          alt={fallback.alt} 
          className="absolute inset-0 w-full h-full object-cover z-0" 
          onError={() => setImageFailed(true)} 
        />
      )}
      
      {/* Dark overlay matching the mockup */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />
      
      <div className="relative z-20 p-8 md:p-12 max-w-[460px] text-white">
        <p className="text-[#F1DEB5] text-xs font-semibold tracking-[0.15em] uppercase mb-3">
          {subtitle}
        </p>
        <h2 className="font-serif text-[clamp(2.2rem,3.5vw,3rem)] leading-[1.1] font-semibold mb-4">
          {title}
        </h2>
        <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6">
          {description}
        </p>
        <button 
          type="button" 
          onClick={() => navigate(target)} 
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#1B4332] text-white rounded-full text-sm font-semibold hover:bg-[#24583F] transition-colors"
        >
          Shop Now <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function SpinnyHeroCarousel({ banners = [] }) {
  const slides = useMemo(() => {
    const source = banners.length > 0 ? banners : fallbackBanners;
    const pairs = [];
    for (let i = 0; i < source.length; i += 2) {
      pairs.push({
        left: source[i],
        right: source[i + 1] || source[i],
        leftF: fallbackBanners[i % 4],
        rightF: fallbackBanners[(i + 1) % 4]
      });
    }
    return pairs;
  }, [banners]);

  const [index, setIndex] = useState(0);
  const maxIndex = slides.length - 1;

  const move = (step) => {
    setIndex((current) => {
      const next = current + step;
      if (next > maxIndex) return 0;
      if (next < 0) return maxIndex;
      return next;
    });
  };

  return (
    <div className="relative rounded-2xl overflow-hidden group">
      <div 
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]" 
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div className="grid grid-cols-1 md:grid-cols-2 flex-[0_0_100%] w-full" key={i}>
            <HeroPanel banner={slide.left} fallback={slide.leftF} />
            <HeroPanel banner={slide.right} fallback={slide.rightF} />
          </div>
        ))}
      </div>
      
      {maxIndex > 0 && (
        <>
          <button 
            type="button" 
            onClick={() => move(-1)} 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md text-vs-green z-30 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            type="button" 
            onClick={() => move(1)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md text-vs-green z-30 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {slides.map((_, d) => (
              <button 
                key={d} 
                onClick={() => setIndex(d)} 
                className={`h-2 rounded-full border border-white transition-all ${d === index ? 'w-6 bg-white' : 'w-2 bg-transparent hover:bg-white/50'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// --- PRODUCT SCROLLER (no scrollbar, left/right arrows, dots below) ---
function ProductScroller({ resetKey, children }) {
  const ref = useRef(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const total = maxScroll > 4 ? Math.ceil(el.scrollWidth / el.clientWidth) : 1;
    setPages(total);
    setPage(total <= 1 ? 0 : Math.round((el.scrollLeft / maxScroll) * (total - 1)));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = 0;
    measure();
  }, [resetKey, measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const scrollByPage = (direction) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const goToPage = (i) => {
    const el = ref.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: pages <= 1 ? 0 : (maxScroll * i) / (pages - 1), behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={measure}
        className="flex gap-4 md:gap-5 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {pages > 1 && (
        <>
          <button
            type="button"
            aria-label="Scroll products left"
            onClick={() => scrollByPage(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Scroll products right"
            onClick={() => scrollByPage(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
          >
            <ChevronRight size={22} />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to page ${i + 1}`}
                onClick={() => goToPage(i)}
                className={`h-2 rounded-full transition-all ${i === page ? 'w-6 bg-[#1B4332]' : 'w-2 bg-[#1B4332]/25 hover:bg-[#1B4332]/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// --- BRAND MARQUEE (full width, keeps moving left) ---
function BrandMarquee() {
  // One group repeated enough to be wider than the screen; two identical groups make the loop seamless
  const group = Array.from({ length: 8 }, (_, i) => i);

  const renderGroup = (copy) => (
    <div className="flex shrink-0 items-center" aria-hidden={copy === 1}>
      {group.map(i => (
        <div key={`${copy}-${i}`} className="flex shrink-0 items-center gap-3 pl-10">
          <Flower2 size={20} strokeWidth={1.5} className="text-[#D9A93F]" />
          <span className="font-serif text-lg md:text-xl font-semibold tracking-[4px] text-[#1B4332] whitespace-nowrap">
            VEDA SANKALPA
          </span>
          <span className="text-[10px] tracking-[3px] uppercase text-[#8A8578] whitespace-nowrap">
            The Sacred Store
          </span>
          <span aria-hidden="true" className="pl-7 text-[8px] text-[#D9A93F]">◆</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="brand-marquee-wrap relative w-full overflow-hidden bg-[#F2EFE7] border-y border-[#E7E1D3] py-4">
      <style>{`
        @keyframes brand-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .brand-marquee-track { animation: brand-marquee 45s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .brand-marquee-track { animation: none; } }
      `}</style>

      <div className="brand-marquee-track flex w-max">
        {renderGroup(0)}
        {renderGroup(1)}
      </div>
    </div>
  );
}

// --- TESTIMONIAL CAROUSEL (auto-scrolls, with left/right buttons) ---
function useVisibleCount() {
  const query = '(min-width: 768px)';
  const read = () => (typeof window !== 'undefined' && window.matchMedia(query).matches ? 3 : 1);
  const [count, setCount] = useState(read);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setCount(media.matches ? 3 : 1);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return count;
}

function TestimonialCarousel() {
  const visible = useVisibleCount();
  const maxIndex = Math.max(0, testimonials.length - visible);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => { setIndex(i => Math.min(i, maxIndex)); }, [maxIndex]);

  useEffect(() => {
    if (paused || maxIndex === 0) return undefined;
    const timer = window.setInterval(() => setIndex(i => (i >= maxIndex ? 0 : i + 1)), 4000);
    return () => window.clearInterval(timer);
  }, [paused, maxIndex]);

  const prev = () => setIndex(i => (i <= 0 ? maxIndex : i - 1));
  const next = () => setIndex(i => (i >= maxIndex ? 0 : i + 1));

  return (
    <div
      className="relative px-10 md:px-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        aria-label="Previous testimonials"
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-[#E8E3D8] shadow-sm flex items-center justify-center text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors z-10"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * (100 / visible)}%)` }}
        >
          {testimonials.map(item => (
            <div key={item.name} className="shrink-0 px-2.5" style={{ width: `${100 / visible}%` }}>
              <article className="h-full bg-[#F8F6F0] p-6 rounded-xl border border-[#E8E3D8] relative flex flex-col">
                <Heart className="absolute top-6 right-6 text-gray-300" size={18} />
                <p className="italic text-gray-600 text-sm leading-relaxed mb-4 pr-6 min-h-[60px]">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={16} fill="#E5B040" color="#E5B040" />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-9 h-9 rounded-full bg-[#E5E0D4] flex items-center justify-center font-bold text-[#1B4332] text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] m-0">{item.name}</h4>
                    <p className="text-xs text-gray-500 m-0">{item.city}</p>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Next testimonials"
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-[#E8E3D8] shadow-sm flex items-center justify-center text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors z-10"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

// --- MAIN PAGE ---
export default function HomePage({ onAdd }) {
  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Veda Sankalpa - Sacred Store',
    description: 'Explore spiritual essentials, Rudraksha, Pyrite, Karugali and meaningful traditional products.'
  });

  useEffect(() => {
    let live = true;
    async function loadHomePage() {
      try {
        const [homeResponse, catalogResponse] = await Promise.all([
          api('/home'),
          api('/products?page=1&limit=100')
        ]);
        if (!live) return;

        const catalogItems = Array.isArray(catalogResponse?.items) ? catalogResponse.items : Array.isArray(catalogResponse?.products) ? catalogResponse.products : [];
        const productMap = new Map(catalogItems.map(item => [String(item.id), item]));

        const enrichProducts = (rows) => {
          if (!Array.isArray(rows)) return [];
          return rows.map(item => {
            const catalogProduct = productMap.get(String(item.id));
            return {
              ...(catalogProduct || {}),
              ...item,
              image_url: item?.image_url || catalogProduct?.image_url || catalogProduct?.image || ''
            };
          });
        };

        setData({
          ...homeResponse,
          featured: enrichProducts(homeResponse?.featured),
          new_launches: enrichProducts(homeResponse?.new_launches),
          best_sellers: enrichProducts(homeResponse?.best_sellers),
          catalog: catalogItems,
        });
      } catch (cause) {
        console.error(cause);
      } finally {
        if (live) setLoading(false);
      }
    }
    loadHomePage();
    return () => { live = false; };
  }, []);

  const allProducts = useMemo(() => {
    if (!data) return dummyProducts;
    const combined = [...(data.featured || []), ...(data.new_launches || []), ...(data.best_sellers || [])];
    const unique = new Map();
    combined.forEach((product, index) => {
      const key = product?.id ?? product?.slug ?? `${getProductName(product)}-${index}`;
      if (!unique.has(String(key))) unique.set(String(key), product);
    });
    const list = Array.from(unique.values());
    if (list.length) return list;
    return data.catalog?.length ? data.catalog : dummyProducts;
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return allProducts;
    return allProducts.filter(product => {
      const category = getCategory(product).toLowerCase();
      return category.includes(selectedCategory.toLowerCase()) || getProductName(product).toLowerCase().includes(selectedCategory.toLowerCase());
    });
  }, [allProducts, selectedCategory]);

  const banners = Array.isArray(data?.featured_banners) ? data.featured_banners : [];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-serif text-2xl text-[#1B4332]">
      Loading Veda Sankalpa...
    </div>
  );

  return (
    <main className="w-full overflow-hidden bg-[#FAF8F2] font-sans">
      
      {/* 1. HERO CAROUSEL */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 pt-4 pb-0">
        <SpinnyHeroCarousel banners={banners} />
      </section>

      {/* 2. BRAND MARQUEE (full width, keeps moving left) */}
      <section className="w-full my-8 md:my-12">
        <BrandMarquee />
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="max-w-[1300px] mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <span className="block text-[#9A793C] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2">
              Explore Our Collection
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1B4332] font-semibold">
              Featured Products
            </h2>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/collections/all')} 
            className="flex items-center gap-1 text-[#1B4332] font-semibold text-sm hover:text-[#9A793C] transition-colors"
          >
            View All Products <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button
              type="button"
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-colors border ${
                selectedCategory === category 
                  ? 'bg-[#1B4332] text-white border-[#1B4332]' 
                  : 'bg-transparent text-gray-600 border-[#E8E3D8] hover:border-[#1B4332]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <ProductScroller resetKey={`${selectedCategory}-${filteredProducts.length}`}>
          {filteredProducts.length > 0 ? (
            filteredProducts.slice(0, 8).map((product, index) => (
              <ProductCard 
                key={product.id || product.slug || index} 
                product={product} 
                onAdd={onAdd} 
                index={index} 
              />
            ))
          ) : (
            <div className="w-full py-12 text-center bg-[#F2EFE7] rounded-xl text-gray-500">
              No products found in {selectedCategory}.
            </div>
          )}
        </ProductScroller>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="max-w-[1300px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="font-serif text-3xl text-[#1B4332] font-semibold">What Our Customers Say</h2>
          <button 
            type="button" 
            onClick={() => navigate('/reviews')} 
            className="text-[#1B4332] font-semibold text-sm flex items-center gap-1 hover:text-[#9A793C]"
          >
            View All Reviews <ChevronRight size={16} />
          </button>
        </div>
        <TestimonialCarousel />
      </section>

      {/* 6. STATS & VIDEO ROW */}
      <section className="max-w-[1300px] mx-auto px-4 md:px-6 mb-12 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F8F6F0] p-6 rounded-xl border border-[#E8E3D8]">
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xl text-[#4285F4]">
              G
            </div>
            <div>
              <p className="text-sm text-gray-600 m-0">Google Reviews</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-[#2C2C2C]">4.8/5</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="#E5B040" color="#E5B040" />)}
                </div>
                <span className="text-xs text-gray-500">(1,250+ reviews)</span>
              </div>
              <button 
                type="button" 
                onClick={() => navigate('/reviews')} 
                className="text-[#1B4332] text-xs font-semibold mt-1 hover:underline"
              >
                View All Reviews →
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Package size={40} className="text-[#8B6E3F]" />
            <div>
              <h3 className="font-serif text-2xl text-[#1B4332] font-semibold m-0">25,000+</h3>
              <p className="text-sm font-semibold text-[#2C2C2C] m-0">Products Sold</p>
              <p className="text-xs text-gray-500 m-0">Trusted by thousands of happy customers</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row bg-[#F8F6F0] rounded-xl overflow-hidden border border-[#E8E3D8]">
          <div 
            className="w-full md:w-[45%] min-h-[240px] bg-[#332211] relative flex items-center justify-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601614345033-37633076e833?q=80&w=800&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
             <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center cursor-pointer backdrop-blur-sm hover:scale-110 hover:bg-white/30 transition-all">
               <Play size={24} fill="#fff" />
             </div>
          </div>
          <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col justify-center items-start">
            <h3 className="font-serif text-2xl text-[#1B4332] font-semibold m-0 mb-3">Watch Our Store Video</h3>
            <p className="text-gray-600 text-sm leading-relaxed m-0 mb-4">
              See how we bring tradition, purity and care into every product.
            </p>
            <button 
              type="button" 
              onClick={() => navigate('/video')} 
              className="px-6 py-2.5 bg-[#1B4332] text-white rounded-full text-sm font-semibold hover:bg-[#24583F] transition-colors flex items-center gap-1"
            >
              Watch Now <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="max-w-[1300px] mx-auto px-4 md:px-6 mb-16">
        <div className="mb-6">
          <span className="block text-[#9A793C] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2">
            Need Help?
          </span>
          <h2 className="font-serif text-3xl text-[#1B4332] font-semibold">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-sm mt-2">Find answers to some common questions about our store.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-white border border-[#E8E3D8] rounded-lg overflow-hidden group">
              <summary className="p-5 font-semibold text-sm text-[#1B4332] cursor-pointer flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span className="text-2xl text-[#9A793C] font-light leading-none group-open:hidden">+</span>
                <span className="text-2xl text-[#9A793C] font-light leading-none hidden group-open:block">−</span>
              </summary>
              <p className="px-5 pb-5 m-0 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

    </main>
  );
}