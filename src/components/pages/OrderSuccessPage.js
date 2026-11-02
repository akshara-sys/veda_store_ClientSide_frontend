import { useEffect, useState } from 'react';
import { api, asset, money, navigate, titleCase } from '../../utils/storeUtils';
import { OrderProductLink, invoiceRecord } from '../SharedComponents';

export default function OrderSuccess({ route }) {
  const params=new URLSearchParams(route.split('?')[1]||'');
  const number=params.get('order')||'';
  const saved=JSON.parse(localStorage.getItem('veda-last-order')||'null');
  const [order,setOrder]=useState(null);
  const [recommendations,setRecommendations]=useState([]);
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!number||!saved?.accessToken)return undefined;
    let active=true;let attempts=0;let timer;
    const loadOrder=async()=>{
      try{
        const result=await api(`/orders/${encodeURIComponent(number)}`,{headers:{'x-store-order-token':saved.accessToken}});
        if(!active)return;
        setOrder(result);
        if(result.status==='pending'&&saved.paymentMethod==='razorpay'&&attempts<5){attempts+=1;timer=window.setTimeout(loadOrder,2000);}
      }catch(cause){if(active)setError(cause.message);}
    };
    void loadOrder();
    return ()=>{active=false;if(timer)window.clearTimeout(timer);};
  },[number,saved?.accessToken,saved?.paymentMethod]);
  useEffect(()=>{let active=true;api('/products?page=1&limit=24&sort=popular').then(result=>{if(active)setRecommendations(result.items||[]);}).catch(()=>{});return()=>{active=false;};},[]);
  const waitingForPayment=saved?.paymentMethod==='razorpay'&&order?.status==='pending';
  const shipping=invoiceRecord(order?.shipping_address);
  const orderItems=Array.isArray(order?.items)?order.items:[];
  const purchasedIds=new Set(orderItems.map(item=>item.product_id).filter(Boolean));
  const journeyProducts=recommendations.filter(item=>!purchasedIds.has(item.id)).slice(0,3);
  const originalTotal=orderItems.reduce((sum,item)=>sum+Number(item.mrp_paise||0)*Number(item.quantity||0),0);
  const productTotal=orderItems.reduce((sum,item)=>sum+Number(item.unit_price_paise||0)*Number(item.quantity||0),0);
  const feeTotal=orderItems.reduce((sum,item)=>{const snapshot=invoiceRecord(item.product_snapshot);return sum+Number(snapshot.convenienceFeeTotalPaise??(Number(snapshot.convenienceFeePaise||0)*Number(item.quantity||0)));},0);
  return <section className="veda-section order-confirmation-page">
    <div className="order-confirmation-brand">VEDA SANKALPA</div>
    <header className="order-confirmation-hero"><span>{saved?.paymentMethod==='cod'?'ORDER RECEIVED':order?.status==='paid'?'PAYMENT CONFIRMED':'ORDER RECEIVED'}</span><h1>Order manifested</h1><p>Thank you for choosing Veda Sankalpa. Your order is being prepared with care.</p>{waitingForPayment&&<small role="status">Payment confirmation is processing. Please do not pay again.</small>}{error&&<small className="error-message" role="alert">{error}</small>}</header>
    {order&&<>
      <div className="order-confirmation-meta"><article><span>ORDER SUMMARY</span><dl><dt>Order number</dt><dd>{order.order_number}</dd><dt>Date</dt><dd>{new Date(order.created_at).toLocaleDateString('en-IN')}</dd><dt>Status</dt><dd>{titleCase(order.fulfillment_status)} · {titleCase(order.status)}</dd><dt>Payment</dt><dd>{order.payment_method==='cod'?'Cash on delivery':'Razorpay online'}</dd>{order.customer_email&&<><dt>Email</dt><dd>{order.customer_email}</dd></>}</dl></article><article><span>DELIVERY DETAILS</span><b>{order.customer_name}</b><p>{shipping.line1}{shipping.line2?`, ${shipping.line2}`:''}<br/>{shipping.city}, {shipping.state} {shipping.postalCode||shipping.postal_code}<br/>{shipping.country||'India'}<br/>{order.customer_phone}</p></article></div>
      <section className="order-confirmation-items"><h2>Items in your order</h2>{orderItems.map((item,index)=>{const quantity=Number(item.quantity||0),mrp=Number(item.mrp_paise||0),price=Number(item.unit_price_paise||0),line=Number(item.line_total_paise||0),snapshot=invoiceRecord(item.product_snapshot),fee=Number(snapshot.convenienceFeeTotalPaise??(Number(snapshot.convenienceFeePaise||0)*quantity)),coupon=Number(snapshot.couponDiscountPaise??Math.max(0,price*quantity+fee-line));return <article className="order-confirmation-item" key={`${item.sku}-${index}`}>{item.image_url&&<img src={asset(item.image_url)} alt=""/>}<div className="order-confirmation-item-copy"><OrderProductLink item={item}>{item.name}</OrderProductLink><small>{item.sku} · Qty {quantity}</small><div className="order-confirmation-prices"><del>{money(mrp*quantity)}</del><b>{money(price*quantity)}</b></div><small>Convenience fee: {fee?money(fee):'Free'}</small>{coupon>0&&<small>{order.coupon_code?`Coupon ${order.coupon_code}`:'Coupon applied'} · −{money(coupon)}</small>}</div><b className="order-confirmation-line-total">{money(line)}</b></article>;})}
        <div className="order-confirmation-totals"><p><span>Original MRP</span><del>{money(originalTotal)}</del></p><p><span>Selling price</span><b>{money(productTotal)}</b></p><p><span>Convenience fees</span><b>{feeTotal?money(feeTotal):'Free'}</b></p>{Number(order.discount_paise)>0&&<p><span>{order.coupon_code?`Coupon ${order.coupon_code}`:'Coupon discount'}</span><b>−{money(order.discount_paise)}</b></p>}<p className="order-confirmation-total"><span>Final amount · GST included</span><b>{money(order.total_paise)}</b></p></div>
      </section>
      <a className="order-confirmation-details-link" href={`/account/orders?order=${encodeURIComponent(number)}`} onClick={event=>{event.preventDefault();navigate(`/account/orders?order=${encodeURIComponent(number)}`);}}>View full order details and shipping updates</a>
    </>}
    <section className="order-journey"><div className="order-journey-heading"><div><span>MADE FOR YOUR NEXT MOMENT</span><h2>Continue your journey</h2></div><a href="/collections/all" onClick={event=>{event.preventDefault();navigate('/collections/all');}}>View collection</a></div>{journeyProducts.length?<div className="order-journey-grid">{journeyProducts.map(product=><article key={product.id}><a href={`/products/${product.slug}`} onClick={event=>{event.preventDefault();navigate(`/products/${product.slug}`);}}><img loading="lazy" src={asset(product.image_url)} alt={product.name}/></a><a className="order-journey-name" href={`/products/${product.slug}`} onClick={event=>{event.preventDefault();navigate(`/products/${product.slug}`);}}>{product.name}</a><div><b>{money(product.effective_price_paise||product.selling_price_paise)}</b>{Number(product.mrp_paise)>Number(product.effective_price_paise||product.selling_price_paise)&&<del>{money(product.mrp_paise)}</del>}</div></article>)}</div>:<p className="order-journey-empty">Explore the collection for more meaningful everyday pieces.</p>}</section>
    <button className="order-return-button" onClick={()=>navigate('/')}>Return to store</button>
  </section>;
}
