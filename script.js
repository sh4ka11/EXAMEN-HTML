// Datos de ejemplo - reemplace las imágenes por fotografías reales en assets/
const products = [
  {id: 'p1', name: 'Tarta de fresa', desc: 'Tarta casera con fresas naturales', price: 48000, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrvsBbvOr_r5Q6ZiKfJ_ol1nkrvKuG7Y6iQAozy2E3O3wDv1CitG6VmU34&s=10'},
  
  {id: 'p2', name: 'Cheesecake', desc: 'Cheesecake cremoso con base de galleta', price: 65000, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXAOoygrFjXi2kBOta0EM_qWw8OUsvqdti48_uWmiQq_V6iR8aRgHGi-r6&s=10'},
  
  {id: 'p3', name: 'Brownie', desc: 'Brownie de chocolate con textura húmeda', price: 29000, img: 'https://happyvegannie.com/wp-content/uploads/2023/07/los-mejores-brownies-fudgy-10-copy.jpg'}
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

let cart = {};

function formatPrice(v){
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(v);
}

function renderProducts(){
  productGrid.innerHTML = '';
  for(const p of products){
    const card = document.createElement('div'); card.className = 'card';
    const img = document.createElement('img'); img.src = p.img; img.alt = p.name;
    const h = document.createElement('h4'); h.textContent = p.name;
    const d = document.createElement('p'); d.textContent = p.desc;
    const price = document.createElement('div'); price.className='price'; price.textContent = formatPrice(p.price);
    const btn = document.createElement('button'); btn.textContent = 'Agregar al carrito';
    btn.addEventListener('click', ()=> addToCart(p.id));
    card.append(img,h,d,price,btn);
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
  cart.classList.toggle('hidden');
});

// initialize
renderProducts(); renderCart(); yearEl.textContent = new Date().getFullYear();

// Notes for deployment: Replace QR image src data parameter with actual hosted URL for game.html.

