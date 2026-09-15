const products = [
  {id:'p1', name:'Tarta de fresa', category:'Tartas', desc:'Bizcocho suave, crema y fresas naturales.', price:48000, img:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=85'},
  {id:'p2', name:'Cheesecake clásico', category:'Tartas', desc:'Cremoso, con base de galleta dorada.', price:65000, img:'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=85'},
  {id:'p3', name:'Brownie intenso', category:'Brownies', desc:'Chocolate 70%, nueces y centro húmedo.', price:29000, img:'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=800&q=85'},
  {id:'p4', name:'Brownie con caramelo', category:'Brownies', desc:'Brownie tibio, caramelo salado y nueces.', price:34000, img:'https://images.unsplash.com/photo-1519869325930-281384150729?w=800&q=85'},
  {id:'p5', name:'Caja de cupcakes', category:'Cupcakes', desc:'Seis cupcakes decorados con crema de vainilla.', price:42000, img:'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800&q=85'},
  {id:'p6', name:'Cupcake red velvet', category:'Cupcakes', desc:'Bizcocho aterciopelado y frosting de queso.', price:12000, img:'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=800&q=85'},
  {id:'p7', name:'Galletas de chispas', category:'Galletas', desc:'Galletas horneadas con chocolate semiamargo.', price:18000, img:'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=85'},
  {id:'p8', name:'Alfajores de dulce', category:'Galletas', desc:'Masa suave, dulce de leche y coco.', price:22000, img:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=85'},
  {id:'p9', name:'Mousse de chocolate', category:'Postres fríos', desc:'Textura ligera y chocolate de origen.', price:26000, img:'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&q=85'},
  {id:'p10', name:'Vasito de maracuyá', category:'Postres fríos', desc:'Crema cítrica, galleta y pulpa fresca.', price:24000, img:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=85'}
];

const productGrid = document.getElementById('productGrid');
const cartToggle = document.getElementById('cartToggle');
const cartEl = document.getElementById('cart');
const cartItemsEl = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutSection = document.getElementById('how-it-works');
const checkoutSteps = document.getElementById('checkoutSteps');
const reviewCart = document.getElementById('reviewCart');
const summaryEl = document.getElementById('summary');
const yearEl = document.getElementById('year');
const brandToggle = document.getElementById('brandToggle');
const aboutAtamar = document.getElementById('aboutAtamar');
const searchInput = document.getElementById('productSearch');
const categoryTabs = document.getElementById('categoryTabs');
const productCount = document.getElementById('productCount');
const qrModal = document.getElementById('qrModal');

let cart = {};
let activeCategory = 'Todos';

brandToggle.addEventListener('click', ()=>{
  const isOpen = aboutAtamar.classList.toggle('hidden');
  brandToggle.setAttribute('aria-expanded', String(!isOpen));
  aboutAtamar.setAttribute('aria-hidden', String(isOpen));
  if(!isOpen) aboutAtamar.scrollIntoView({behavior:'smooth', block:'nearest'});
});

function formatPrice(v){
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(v);
}

function renderCategories(){
  const categories = ['Todos', ...new Set(products.map(product => product.category))];
  categoryTabs.innerHTML = categories.map(category => `<button class="category-tab ${category === activeCategory ? 'active' : ''}" type="button" data-category="${category}">${category}</button>`).join('');
  categoryTabs.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { activeCategory = button.dataset.category; renderCategories(); renderProducts(); }));
}

function renderProducts(){
  productGrid.innerHTML = '';
  const query = searchInput.value.trim().toLowerCase();
  const visibleProducts = products.filter(product => (activeCategory === 'Todos' || product.category === activeCategory) && `${product.name} ${product.desc} ${product.category}`.toLowerCase().includes(query));
  productCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'producto' : 'productos'}`;
  if (!visibleProducts.length) { productGrid.innerHTML = '<p class="no-results">No encontramos ese antojo. Prueba con otra búsqueda.</p>'; return; }
  for(const p of visibleProducts){
    const card = document.createElement('article'); card.className = 'card';
    const img = document.createElement('img'); img.src = p.img; img.alt = p.name;
    const category = document.createElement('span'); category.className = 'card-category'; category.textContent = p.category;
    const h = document.createElement('h4'); h.textContent = p.name;
    const d = document.createElement('p'); d.textContent = p.desc;
    const price = document.createElement('div'); price.className='price'; price.textContent = formatPrice(p.price);
    const btn = document.createElement('button'); btn.className = 'add-button'; btn.innerHTML = 'Agregar <span>+</span>';
    btn.addEventListener('click', ()=> addToCart(p.id));
    card.append(img,category,h,d,price,btn);
    productGrid.appendChild(card);
  }
}

function addToCart(id){
  if(!cart[id]) cart[id] = {qty:0};
  cart[id].qty++;
  cart[id].data = products.find(x=>x.id===id);
  renderCart();
}

function removeFromCart(id){
  delete cart[id];
  renderCart();
}

function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty <=0) removeFromCart(id);
  renderCart();
}

function renderCart(){
  cartItemsEl.innerHTML = '';
  let total = 0; let count=0;
  for(const id in cart){
    const item = cart[id];
    const row = document.createElement('div'); row.className='item';
    const img = document.createElement('img'); img.src = item.data.img; img.alt = item.data.name;
    const info = document.createElement('div');
    info.innerHTML = `<strong>${item.data.name}</strong><div>${formatPrice(item.data.price)} x ${item.qty} = ${formatPrice(item.data.price*item.qty)}</div>`;
    const controls = document.createElement('div'); controls.style.marginLeft='auto';
    const plus = document.createElement('button'); plus.textContent='+'; plus.addEventListener('click', ()=> changeQty(id,1));
    const minus = document.createElement('button'); minus.textContent='-'; minus.addEventListener('click', ()=> changeQty(id,-1));
    const del = document.createElement('button'); del.textContent='Eliminar'; del.addEventListener('click', ()=> removeFromCart(id));
    controls.append(plus,minus,del);
    row.append(img,info,controls);
    cartItemsEl.appendChild(row);
    total += item.data.price * item.qty; count += item.qty;
  }
  cartCount.textContent = count;
  // Apply discount if available (saved by the game)
  const discountStr = localStorage.getItem('dulceria_discount');
  const discountPercent = discountStr ? Number(discountStr) : 0;
  const discountInfoEl = document.getElementById('cartDiscountInfo');
  const cartTotalAfterEl = document.getElementById('cartTotalAfter');
  if(discountPercent && total > 0){
    const discountAmount = total * (discountPercent/100);
    const totalAfter = Math.max(0, total - discountAmount);
    cartTotalEl.textContent = formatPrice(total);
    cartTotalAfterEl.textContent = formatPrice(totalAfter);
    if(discountInfoEl) discountInfoEl.textContent = `Descuento aplicado: ${discountPercent}% (-${formatPrice(discountAmount)})`;
  } else {
    cartTotalEl.textContent = formatPrice(total);
    if(cartTotalAfterEl) cartTotalAfterEl.textContent = formatPrice(total);
    if(discountInfoEl) discountInfoEl.textContent = '';
  }
}

// Checkout flow (visual)
checkoutBtn.addEventListener('click', ()=>{
  checkoutSection.classList.remove('hidden');
  // populate review
  populateReview();
  // show first step
  showStep(1);
  window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
});

function populateReview(){
  reviewCart.innerHTML = '';
  let total = 0;
  for(const id in cart){
    const item = cart[id];
    const div = document.createElement('div');
    div.textContent = `${item.data.name} x ${item.qty} = ${formatPrice(item.data.price*item.qty)}`;
    reviewCart.appendChild(div);
    total += item.data.price * item.qty;
  }
  // Apply discount if present
  const discountStr = localStorage.getItem('dulceria_discount');
  const discountPercent = discountStr ? Number(discountStr) : 0;
  let html = '';
  if(discountPercent && total > 0){
    const discountAmount = total * (discountPercent/100);
    const totalAfter = Math.max(0, total - discountAmount);
    html += `<div style="margin-top:8px">Subtotal: <strong>${formatPrice(total)}</strong></div>`;
    html += `<div>Descuento ${discountPercent}%: -<strong>${formatPrice(discountAmount)}</strong></div>`;
    html += `<div><strong>Total con descuento: ${formatPrice(totalAfter)}</strong></div>`;
  } else {
    html += `<div style="margin-top:8px"><strong>Total: ${formatPrice(total)}</strong></div>`;
  }
  reviewCart.insertAdjacentHTML('beforeend', html);
  summaryEl.innerHTML = reviewCart.innerHTML;
}

// step buttons
document.addEventListener('click', (e)=>{
  if(e.target.matches('.next-step')){
    const current = checkoutSteps.querySelector('.step.active');
    const nextIndex = Number(current.dataset.step)+1;
    showStep(nextIndex);
  }
});

function showStep(n){
  const steps = checkoutSteps.querySelectorAll('.step');
  steps.forEach(s=> s.classList.toggle('active', Number(s.dataset.step)===n));
}

// confirm and close
document.getElementById('confirmOrder').addEventListener('click', ()=>{
  // Simulated confirmation: consume the discount so it can't be reused
  localStorage.removeItem('dulceria_discount');
  renderCart();
  showStep(5);
});
document.getElementById('closeCheckout').addEventListener('click', ()=> checkoutSection.classList.add('hidden'));

// cart toggle
cartToggle.addEventListener('click', ()=>{
  cartEl.classList.toggle('hidden');
});
document.getElementById('closeCart').addEventListener('click', ()=> cartEl.classList.add('hidden'));
searchInput.addEventListener('input', renderProducts);
document.getElementById('qrTrigger').addEventListener('click', ()=> qrModal.classList.remove('hidden'));
document.getElementById('closeQr').addEventListener('click', ()=> qrModal.classList.add('hidden'));
qrModal.addEventListener('click', event => { if(event.target === qrModal) qrModal.classList.add('hidden'); });
document.addEventListener('keydown', event => { if(event.key === 'Escape') qrModal.classList.add('hidden'); });

// initialize
renderCategories(); renderProducts(); renderCart(); yearEl.textContent = new Date().getFullYear();

// Notes for deployment: Replace QR image src data parameter with actual hosted URL for game.html.

