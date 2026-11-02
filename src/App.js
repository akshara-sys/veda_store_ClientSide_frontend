import { useCallback, useEffect, useState } from 'react';
import { Flower2, Search, Heart, User, ShoppingCart, Coins, Menu, X } from 'lucide-react';
import { api, navigate, useStoreCategories } from './utils/storeUtils';
import { Footer, CartDrawer } from './components/SharedComponents';
import Home from './components/pages/HomePage';
import Listing from './components/pages/ListingPage';
import ProductPage from './components/pages/ProductPage';
import CartPage from './components/pages/CartPage';
import Checkout from './components/pages/CheckoutPage';
import OrderSuccess from './components/pages/OrderSuccessPage';
import Wishlist from './components/pages/WishlistPage';
import AccountPage from './components/pages/AccountPage';

function currentRoute() { return `${window.location.pathname}${window.location.search}`; }
function useRoute() {
  const [route, setRoute] = useState(currentRoute());
  useEffect(() => { const update = () => setRoute(currentRoute()); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update); }, []);
  return route;
}

function App() {
  const categories = useStoreCategories();
  const route = useRoute();
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(''), 3000); return () => window.clearTimeout(timer); }, [toast]);
  const loadCart = useCallback(async () => { try { setCart(await api('/cart')); } catch (error) { setToast(error.message); } }, []);
  useEffect(() => { loadCart(); }, [loadCart]);
  useEffect(() => { window.addEventListener('popstate', loadCart); return () => window.removeEventListener('popstate', loadCart); }, [loadCart]);

  const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = cart.reduce((sum, item) => sum + Number(item.effective_price_paise || item.selling_price_paise) * Number(item.quantity), 0);

  const addToCart = async (product, variant, quantity = 1) => {
    if (!variant?.id) { setToast('Choose an available variant to add this product.'); return; }
    try { await api('/cart/items', { method: 'POST', body: JSON.stringify({ variantId: variant.id, quantity }) }); await loadCart(); setToast('Added to your bag'); setCartOpen(true); }
    catch (error) { setToast(error.message); }
  };
  const updateCart = async (itemId, quantity) => {
    try {
      if (quantity <= 0) await api(`/cart/items/${itemId}`, { method: 'DELETE' });
      else await api(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
      await loadCart();
    } catch (error) { setToast(error.message); }
  };
  const checkout = () => { setCartOpen(false); navigate('/checkout'); };
  const buyNow = async (product, variant) => {
    if (!variant?.id) return;
    try { await api('/cart/items', { method: 'POST', body: JSON.stringify({ variantId: variant.id, quantity: 1 }) }); await loadCart(); setCartOpen(false); navigate('/cart'); }
    catch (error) { setToast(error.message); }
  };

  const page = route.split('?')[0];

  const navLinks = [
    { name: 'Home', path: '/', active: page === '/' },
    { name: 'Shop', path: '/collections/all', active: page.startsWith('/collections/') || page === '/search' },
    { name: 'Categories', path: '/categories', active: page === '/categories' },
    { name: 'About Us', path: '/about', active: page === '/about' }
  ];

  const go = path => event => { event.preventDefault(); setMenuOpen(false); navigate(path); };

  const onSearch = event => {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get('q') || '').trim();
    setMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="w-full bg-vs-cream min-h-screen text-vs-dark font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#F8F6EF] border-b border-[#E8E3D8]">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 h-[68px] flex items-center justify-between gap-4">
          
          {/* LOGO */}
          <a href="/" onClick={go('/')} className="flex items-center gap-2.5 shrink-0">
            <Flower2 size={34} strokeWidth={1.4} className="text-[#C58B20]" />
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[18px] font-semibold tracking-[3px] text-[#1B4332]">
                VEDA <span className="text-[#B8862B]">SANKALPA</span>
              </span>
              <span className="mt-1 text-[7px] tracking-[3px] uppercase text-[#6F786B]">
                The Sacred Store
              </span>
            </div>
          </a>

          {/* CENTER NAV */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.path} 
                onClick={go(link.path)} 
                className={`text-[13px] pb-1 border-b-2 transition-colors ${link.active ? 'text-[#1B4332] border-[#1B4332]' : 'text-[#555B53] border-transparent hover:text-[#1B4332]'}`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 lg:gap-4">
            
            <form onSubmit={onSearch} className="hidden lg:flex items-center w-[240px] h-[38px] rounded-full border border-[#E3DED1] bg-white overflow-hidden">
              <input 
                name="q" 
                type="text" 
                placeholder="Search the collection" 
                aria-label="Search the collection" 
                className="w-full min-w-0 px-4 text-[11px] bg-transparent outline-none placeholder:text-[#9AA096]" 
              />
              <button type="submit" aria-label="Submit search" className="h-full px-4 bg-[#1B4332] text-white hover:bg-[#143225] transition-colors">
                <Search size={15} />
              </button>
            </form>

            <a 
              href="/wishlist" 
              onClick={go('/wishlist')} 
              aria-label="Wishlist" 
              className="w-9 h-9 rounded-full border border-red-500 bg-white flex items-center justify-center text-red-500 hover:bg-red-50"
            >
              <Heart size={18} strokeWidth={1.6} />
            </a>

            <a 
              href="/login" 
              onClick={go('/login')} 
              aria-label="Account" 
              className="text-[#1B4332] hover:text-[#C58B20] transition-colors"
            >
              <User size={21} strokeWidth={1.5} />
            </a>

            <button 
              type="button" 
              onClick={() => setCartOpen(true)} 
              aria-label={`Shopping bag, ${count} items`} 
              className="relative text-[#1B4332] hover:text-[#C58B20] transition-colors"
            >
              <ShoppingCart size={21} strokeWidth={1.5} />
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center">
                {count}
              </span>
            </button>

            <span aria-label="Reward points" className="flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-full bg-[#F3D27A] flex items-center justify-center text-[#9A6B0A]">
                <Coins size={15} />
              </span>
              <span className="text-[12px] font-medium text-[#1B4332]">0</span>
            </span>

            <button 
              type="button" 
              onClick={() => setMenuOpen(open => !open)} 
              aria-label="Menu" 
              className="md:hidden text-[#1B4332]"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#E8E3D8] bg-[#F8F6EF] px-4 py-3">
            <form onSubmit={onSearch} className="flex h-[38px] mb-3 rounded-full border border-[#E3DED1] bg-white overflow-hidden">
              <input 
                name="q" 
                type="text" 
                placeholder="Search the collection" 
                aria-label="Search the collection" 
                className="w-full px-4 text-[12px] bg-transparent outline-none" 
              />
              <button type="submit" aria-label="Submit search" className="px-4 bg-[#1B4332] text-white">
                <Search size={15} />
              </button>
            </form>
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.path} 
                onClick={go(link.path)} 
                className={`block py-2.5 text-[14px] ${link.active ? 'text-[#1B4332] font-medium' : 'text-[#555B53]'}`}
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main id="main-content">
        {page === '/' ? (
          <Home onAdd={addToCart} />
        ) : page.startsWith('/products/') ? (
          <ProductPage slug={decodeURIComponent(page.slice('/products/'.length))} onAdd={addToCart} onBuy={buyNow} notify={setToast} />
        ) : page.startsWith('/collections/') || page === '/search' ? (
          <Listing route={route} onAdd={addToCart} />
        ) : page === '/cart' ? (
          <CartPage cart={cart} update={updateCart} checkout={checkout} />
        ) : page === '/checkout' ? (
          <Checkout cart={cart} total={total} busy={busy} setBusy={setBusy} notify={setToast} />
        ) : page === '/success' ? (
          <OrderSuccess route={route} />
        ) : page === '/wishlist' ? (
          <Wishlist notify={setToast} />
        ) : page === '/login' ? (
          <AccountPage kind="login" />
        ) : page === '/account/orders' ? (
          <AccountPage kind="orders" route={route} />
        ) : (
          <Home onAdd={addToCart} />
        )}
      </main>

      {/* FOOTER */}
      <Footer categories={categories} />

      {/* CART DRAWER & TOAST */}
      {cartOpen && (
        <CartDrawer cart={cart} update={updateCart} total={total} close={() => setCartOpen(false)} checkout={checkout} />
      )}
      
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1B4332] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-4" role="status">
          <span className="veda-toast-timer" aria-hidden="true" />
          {toast}
          <button onClick={() => setToast('')} aria-label="Dismiss message" className="text-white/70 hover:text-white">×</button>
        </div>
      )}
    </div>
  );
}

export default App;