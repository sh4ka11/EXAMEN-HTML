// Juego de memoria: reglas implementadas según la especificación
const boardEl = document.getElementById('board');
const startBtn = document.getElementById('startBtn');
const errorsEl = document.getElementById('errors');
const foundEl = document.getElementById('found');
const resultEl = document.getElementById('result');

let symbols = ['🍰','🍩','🧁','🍮','🍪','🍫']; // 6 símbolos => 12 cartas (6 parejas)
let deck = [];
let flipped = [];
let matchedCount = 0;
let errors = 0;
let busy = false;

function initDeck(){
  deck = [];
  symbols.forEach(s=>{
    deck.push({sym:s,id:cryptoRandomId()});
    deck.push({sym:s,id:cryptoRandomId()});
  });
  shuffle(deck);
}

function cryptoRandomId(){return Math.random().toString(36).slice(2,9)}

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
}

function renderBoard(){
  boardEl.innerHTML = '';
  deck.forEach((cardObj, idx)=>{
    const c = document.createElement('div'); c.className='card'; c.dataset.index = idx;
    c.innerHTML = '<span class="face">?</span>';
    c.addEventListener('click', ()=> onCardClick(idx));
    boardEl.appendChild(c);
  });
}

function revealAllTemporarily(){
  const cards = boardEl.querySelectorAll('.card');
  cards.forEach((c,i)=>{
    c.classList.add('flipped');
    c.textContent = deck[i].sym;
  });
  setTimeout(()=>{
    cards.forEach((c,i)=>{
      c.classList.remove('flipped');
      c.textContent = '?';
    });
    busy = false;
  }, 5000); // 5 segundos de observación
}

function onCardClick(idx){
  if(busy) return;
  const cardEl = boardEl.querySelector(`.card[data-index="${idx}"]`);
  if(!cardEl || cardEl.classList.contains('matched') || flipped.includes(idx)) return;

  // flip
  flipCard(cardEl, idx);
  flipped.push(idx);
  if(flipped.length===2){
    busy = true;
    checkMatch(flipped[0], flipped[1]);
  }
}

function flipCard(cardEl, idx){
  cardEl.classList.add('flipped');
  cardEl.textContent = deck[idx].sym;
}

function unflip(cardEl, idx){
  cardEl.classList.remove('flipped');
  cardEl.textContent = '?';
}

function checkMatch(i1,i2){
  const c1 = deck[i1], c2 = deck[i2];
  const el1 = boardEl.querySelector(`.card[data-index="${i1}"]`);
  const el2 = boardEl.querySelector(`.card[data-index="${i2}"]`);
  if(c1.sym === c2.sym){
    // matched
    el1.classList.add('matched'); el2.classList.add('matched');
    matchedCount++;
    foundEl.textContent = `Parejas encontradas: ${matchedCount}`;
    flipped = [];
    busy = false;
    // victory condition
    if(matchedCount === symbols.length){
      endGame(false);
    }
  } else {
    // incorrect
    errors++;
    errorsEl.textContent = `Errores: ${errors} / 3`;
    setTimeout(()=>{
      unflip(el1,i1); unflip(el2,i2);
      flipped = [];
      busy = false;
      if(errors > 3){
        endGame(true);
      }
    }, 800);
  }
}

function endGame(byErrors){
  busy = true;
  // determine discount by number of pairs found
  const pairsFound = matchedCount; // 0..6
  const discount = computeDiscount(pairsFound, errors);
  // persist discount so the main page can apply it to the cart
  try{
    localStorage.setItem('dulceria_discount', String(discount));
  }catch(e){
    console.warn('No se pudo guardar el descuento en localStorage:', e);
  }
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = `\n    <h3>${ byErrors ? 'Juego terminado por exceso de errores' : 'Juego completado' }</h3>\n    <p>Parejas encontradas: <strong>${pairsFound}</strong></p>\n    <p>Errores cometidos: <strong>${errors}</strong></p>\n    <p class="big">¡Has obtenido un <strong>${discount}%</strong> de descuento!</p>\n    <p>El descuento se ha guardado y podrá aplicarse en la tienda. (simulado)</p>\n    <div style="display:flex;gap:.5rem;margin-top:.6rem">\n      <button id="playAgain">Jugar de nuevo</button>\n      <button id="goStore">Volver a la tienda</button>\n    </div>\n  `;
  document.getElementById('playAgain').addEventListener('click', ()=> startGame());
  document.getElementById('goStore').addEventListener('click', ()=>{
    // navigate back to main page so user can see discount applied
    window.location.href = 'index.html';
  });
}

function computeDiscount(pairs, errors){
  // Discount ranges as requested. Map pairs to a meaningful discount.
  // pairs: 0..6
  if(pairs <= 1) return 5;
  if(pairs <= 2) return 10;
  if(pairs <= 3) return 20;
  if(pairs <= 4) return 30;
  if(pairs <= 5) return 40;
  // pairs == 6 and few errors -> best
  if(pairs === 6 && errors <= 1) return 50;
  return 40;
}

function startGame(){
  // reset
  initDeck(); shuffle(deck); renderBoard(); matchedCount=0; errors=0; flipped=[]; busy=true; resultEl.classList.add('hidden');
  errorsEl.textContent = `Errores: ${errors} / 3`;
  foundEl.textContent = `Parejas encontradas: ${matchedCount}`;
  // reveal all for 5 seconds
  revealAllTemporarily();
}

startBtn.addEventListener('click', ()=> startGame());

// auto-start when loaded if desired
// startGame();

// Ensure responsive behavior: card sizes adapt via CSS grid rules.

