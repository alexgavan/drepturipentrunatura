(function () {
  'use strict';
  var header = document.getElementById('antet');
  var hero = document.getElementById('sus');
  var toggle = document.getElementById('buton-meniu');
  var menu = document.getElementById('meniu-mobil');
  if (!header) return;

  // Antetul: transparent peste imaginea de început, indigo după ea.
  // La coborâre antetul iese din ecran; la urcare reapare, micșorat.
  var lastY = window.scrollY;
  function setScrolled() {
    var y = window.scrollY;
    var limit = hero ? Math.max(120, hero.offsetHeight - 220) : 120;
    var scrolled = y > limit;
    header.classList.toggle('is-scrolled', scrolled);
    if (!scrolled || header.classList.contains('is-open')) header.classList.remove('is-hidden');
    else if (y > lastY + 4) header.classList.add('is-hidden');
    else if (y < lastY - 4) header.classList.remove('is-hidden');
    if (!scrolled) closeMenu();
    lastY = y;
  }
  function setPadding() {
    // antetul comprimat: banda de machetă (dacă există) plus rândul de meniu
    var strip = header.querySelector('.draft-strip');
    var row = window.innerWidth > 1040 ? 64 : 72;
    document.documentElement.style.scrollPaddingTop = ((strip ? strip.offsetHeight : 0) + row) + 'px';
  }
  // Înălțimea antetului de la începutul paginii (pe ecrane înguste secțiunile stau pe rânduri sub siglă),
  // ca titlul să înceapă sub el.
  function setHeaderHeight() {
    if (header.classList.contains('is-scrolled') || header.classList.contains('is-open')) return;
    document.documentElement.style.setProperty('--antet', header.offsetHeight + 'px');
  }
  setScrolled();
  setPadding();
  setHeaderHeight();
  window.addEventListener('load', setHeaderHeight);
  window.addEventListener('scroll', setScrolled, { passive: true });
  window.addEventListener('resize', function () { setScrolled(); setPadding(); setHeaderHeight(); });

  // Meniul pentru ecrane înguste.
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Deschide meniul');
    header.classList.remove('is-open');
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      if (menu.hidden) {
        menu.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Închide meniul');
        header.classList.add('is-open');
      } else {
        closeMenu();
      }
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1040) closeMenu();
    });
  }

  // Capitolul curent, subliniat în meniu.
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-spy]'));
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute('data-spy')); })
    .filter(Boolean);
  function spy() {
    var line = window.scrollY + window.innerHeight * 0.35;
    var current = null;
    sections.forEach(function (s) {
      var top = s.getBoundingClientRect().top + window.scrollY;
      if (top <= line) current = s.id;
    });
    var last = sections[sections.length - 1];
    if (last) {
      var end = document.getElementById('initiatori');
      if (end && end.getBoundingClientRect().top + window.scrollY <= line) current = null;
    }
    links.forEach(function (a) {
      if (a.getAttribute('data-spy') === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  if (sections.length) {
    spy();
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
  }

  // „Adu-ți organizația alături” (butonul a ieșit în v36; codul rămâne pentru o adresă nouă): deschide programul de e-mail fără să părăsească pagina;
  // dacă nu există unul, adresa rămâne scrisă pe buton și copiată.
  var org = document.getElementById('buton-organizatie');
  if (org) {
    org.addEventListener('click', function (e) {
      e.preventDefault();
      var href = org.getAttribute('href');
      var adresa = href.replace(/^mailto:/, '').split('?')[0];
      try {
        var f = document.createElement('iframe');
        f.style.display = 'none';
        f.src = href;
        document.body.appendChild(f);
        setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 2000);
      } catch (err) {}
      try { if (navigator.clipboard) navigator.clipboard.writeText(adresa).catch(function () {}); } catch (err) {}
      org.style.textTransform = 'none';
      org.textContent = adresa;
    });
  }


  // Pe telefon: bara „Semnează” apare după primul ecran și dispare lângă secțiunea de semnare.
  // Butonul „Sus” apare după al doilea ecran.
  var bara = document.getElementById('bara-semneaza');
  var sus = document.getElementById('buton-sus');
  var semneaza = document.getElementById('semneaza');
  function bare() {
    var y = window.scrollY, h = window.innerHeight;
    var langaSemnare = false;
    if (semneaza) { var r = semneaza.getBoundingClientRect(); langaSemnare = r.top < h && r.bottom > 0; }
    if (bara) {
      var vizibila = y > h * 0.9 && !langaSemnare;
      bara.classList.toggle('is-visible', vizibila);
      bara.setAttribute('aria-hidden', vizibila ? 'false' : 'true');
      var a = bara.querySelector('a'); if (a) a.tabIndex = vizibila ? 0 : -1;
      document.body.classList.toggle('has-sign-bar', vizibila);
    }
    if (sus) sus.hidden = y < h * 2;
  }
  bare();
  window.addEventListener('scroll', bare, { passive: true });
  window.addEventListener('resize', bare);

  // Listele pe rânduri (susținătorii pe grupe, lecțiile, ambasadorii): la început se vede doar primul rând;
  // restul, la „Vezi toate”. Primul rând se recalculează când se schimbă lățimea ecranului.
  function elementVizibil(li) { return li.firstElementChild && getComputedStyle(li).display === 'contents' ? li.firstElementChild : li; }
  Array.prototype.forEach.call(document.querySelectorAll('[data-un-rand]'), function (lista) {
    var items = Array.prototype.slice.call(lista.children);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline btn-small';
    btn.setAttribute('aria-expanded', 'false');
    var textInchis = lista.getAttribute('data-un-rand-text') || 'Vezi toate';
    var p = document.createElement('p');
    p.className = 'row-toggle';
    p.appendChild(btn);
    lista.parentNode.insertBefore(p, lista.nextSibling);
    var deschis = false;
    function aseaza() {
      items.forEach(function (li) { li.classList.remove('row-more'); });
      if (deschis) { p.hidden = false; return; }
      var sus = elementVizibil(items[0]).getBoundingClientRect().top;
      var ascunse = 0;
      items.forEach(function (li) {
        if (elementVizibil(li).getBoundingClientRect().top > sus + 4) { li.classList.add('row-more'); ascunse++; }
      });
      p.hidden = ascunse === 0;
    }
    btn.addEventListener('click', function () {
      deschis = !deschis;
      btn.setAttribute('aria-expanded', deschis ? 'true' : 'false');
      btn.textContent = deschis ? 'Arată mai puține' : textInchis;
      aseaza();
      if (!deschis) lista.scrollIntoView({ block: 'nearest' });
    });
    btn.textContent = textInchis;
    aseaza();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(aseaza, 120); });
    window.addEventListener('load', aseaza);
  });

  // Întrebările frecvente: „Deschide toate” și deschiderea întrebării din adresă (#intrebare-…).
  var intrebari = Array.prototype.slice.call(document.querySelectorAll('#intrebari details'));
  var toate = document.getElementById('deschide-intrebarile');
  if (toate) {
    toate.addEventListener('click', function () {
      var deschide = toate.getAttribute('aria-expanded') !== 'true';
      intrebari.forEach(function (d) { d.open = deschide; });
      toate.setAttribute('aria-expanded', deschide ? 'true' : 'false');
      toate.textContent = deschide ? 'Închide toate' : 'Deschide toate';
    });
  }
  function dinAdresa() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id) return;
    var d = document.getElementById(id);
    if (d && d.tagName === 'DETAILS') { d.open = true; d.scrollIntoView(); }
  }
  dinAdresa();
  window.addEventListener('hashchange', dinAdresa);
})();

// v59: „+” deschide textul suplimentar (pașii, drepturile, problema); fără JavaScript se vede tot
(function () {
  var n = 0;
  Array.prototype.forEach.call(document.querySelectorAll('[data-plus]'), function (bloc) {
    var corpuri = Array.prototype.filter.call(bloc.querySelectorAll('.plus-body'), function (el) { return el.closest('[data-plus]') === bloc; });
    if (!corpuri.length) return;
    var titlu = bloc.querySelector('.step-title, h3, .lesson-rule') || bloc.querySelector('.lead');
    var nume = (bloc.querySelector('h3, .lesson-rule') || {}).textContent || 'acest text';
    var ids = corpuri.map(function (el) { if (!el.id) el.id = 'plus-' + (++n); el.hidden = true; return el.id; });
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'plus-btn';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', ids.join(' '));
    b.setAttribute('aria-label', 'Mai mult: ' + nume.trim());
    b.textContent = '+';
    if (titlu.classList && titlu.classList.contains('step-title')) titlu.appendChild(b);
    else titlu.insertAdjacentElement('afterend', b);
    b.addEventListener('click', function () {
      var deschis = b.getAttribute('aria-expanded') === 'true';
      corpuri.forEach(function (el) { el.hidden = deschis; });
      b.setAttribute('aria-expanded', deschis ? 'false' : 'true');
      b.textContent = deschis ? '+' : '−';
    });
  });
})();
