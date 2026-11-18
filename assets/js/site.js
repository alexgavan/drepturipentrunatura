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
    var limit = 40; // v65: antetul devine plin imediat ce se derulează, ca să nu acopere textul
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
    var cuPlus = lista.hasAttribute('data-un-rand-plus');
    btn.className = cuPlus ? 'plus-btn' : 'btn btn-outline btn-small';
    btn.setAttribute('aria-expanded', 'false');
    var textInchis = lista.getAttribute('data-un-rand-text') || 'Vezi toate';
    if (cuPlus) btn.setAttribute('aria-label', textInchis);
    var p = document.createElement('p');
    p.className = 'row-toggle';
    p.appendChild(btn);
    lista.parentNode.insertBefore(p, lista.nextSibling);
    var deschis = false;
    function aseaza() {
      var y = window.scrollY; // v81: recalcularea nu mișcă pagina
      items.forEach(function (li) { li.classList.remove('row-more'); });
      if (deschis) { p.hidden = false; return; }
      var sus = elementVizibil(items[0]).getBoundingClientRect().top;
      var ascunse = 0;
      items.forEach(function (li) {
        if (elementVizibil(li).getBoundingClientRect().top > sus + 4) { li.classList.add('row-more'); ascunse++; }
      });
      p.hidden = ascunse === 0;
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
    }
    btn.addEventListener('click', function () {
      deschis = !deschis;
      btn.setAttribute('aria-expanded', deschis ? 'true' : 'false');
      if (cuPlus) { btn.textContent = deschis ? '−' : '+'; btn.setAttribute('aria-label', deschis ? 'Arată mai puține' : textInchis); }
      else btn.textContent = deschis ? 'Arată mai puține' : textInchis;
      aseaza();
      if (!deschis) lista.scrollIntoView({ block: 'nearest' });
    });
    btn.textContent = cuPlus ? '+' : textInchis;
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

// v59–v61: „+” deschide textul suplimentar; clic pe titlu face același lucru; „Deschide toate” pe fiecare listă.
// Fără JavaScript se vede tot textul.
(function () {
  var n = 0;
  function seteaza(bloc, deschis) {
    bloc._plusCorpuri.forEach(function (el) { el.hidden = !deschis; });
    var b = bloc._plusBtn;
    b.setAttribute('aria-expanded', deschis ? 'true' : 'false');
    b.textContent = deschis ? '−' : '+';
    b.setAttribute('aria-label', (deschis ? 'Mai puțin: ' : 'Mai mult: ') + bloc._plusNume);
    if (bloc._plusGrup) actualizeazaGrup(bloc._plusGrup);
  }
  function actualizeazaGrup(grup) {
    if (!grup._plusTool) return;
    var toate = grup._plusBlocuri.every(function (b) { return b._plusBtn.getAttribute('aria-expanded') === 'true'; });
    grup._plusTool.textContent = toate ? 'Închide toate' : 'Deschide toate';
    grup._plusTool.setAttribute('aria-expanded', toate ? 'true' : 'false');
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-plus]'), function (bloc) {
    var corpuri = Array.prototype.filter.call(bloc.querySelectorAll('.plus-body'), function (el) { return el.closest('[data-plus]') === bloc; });
    if (!corpuri.length) return;
    var titlu = bloc.querySelector('.step-title, h3, .lesson-rule, .gain-title, .doc-title') || bloc.querySelector('.lead');
    bloc._plusNume = ((bloc.querySelector('h3, .lesson-rule, .gain-title, .doc-title') || {}).textContent || 'acest text').trim().replace(/:$/, '');
    bloc._plusCorpuri = corpuri;
    var ids = corpuri.map(function (el) { if (!el.id) el.id = 'plus-' + (++n); return el.id; });
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'plus-btn';
    b.setAttribute('aria-controls', ids.join(' '));
    bloc._plusBtn = b;
    if (titlu.classList.contains('step-title')) titlu.appendChild(b);
    else titlu.insertAdjacentElement('afterend', b);
    b.addEventListener('click', function (e) { e.stopPropagation(); seteaza(bloc, b.getAttribute('aria-expanded') !== 'true'); });
    if (titlu.tagName !== 'A' && !titlu.classList.contains('lead')) {
      titlu.classList.add('plus-titlu');
      titlu.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        seteaza(bloc, b.getAttribute('aria-expanded') !== 'true');
      });
    }
    var grup = bloc.parentElement && bloc.parentElement.closest('[data-plus-grup]');
    if (grup) { bloc._plusGrup = grup; (grup._plusBlocuri = grup._plusBlocuri || []).push(bloc); }
    seteaza(bloc, false);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-plus-grup]'), function (grup) {
    if (!grup._plusBlocuri || grup._plusBlocuri.length < 2) return;
    var p = document.createElement('p');
    p.className = 'plus-tools';
    var t = document.createElement('button');
    t.type = 'button';
    t.className = 'btn btn-outline btn-small';
    p.appendChild(t);
    grup.parentNode.insertBefore(p, grup);
    grup._plusTool = t;
    t.addEventListener('click', function () {
      var deschide = t.getAttribute('aria-expanded') !== 'true';
      grup._plusBlocuri.forEach(function (b) { seteaza(b, deschide); });
    });
    actualizeazaGrup(grup);
  });
})();


// v63: mișcare (apariție, cifre, paralaxă, film, bara de citire, libelula). Nimic pentru „mișcare redusă”.
(function () {
  var redus = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  // bara de citire (și pentru mișcare redusă: nu e animație)
  var antet = document.getElementById('antet');
  if (antet) {
    var bara = document.createElement('div'); bara.className = 'read-progress'; bara.setAttribute('aria-hidden', 'true');
    antet.appendChild(bara);
    var citit = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bara.style.setProperty('--citit', h > 0 ? Math.min(1, scrollY / h) : 0);
    };
    addEventListener('scroll', citit, { passive: true }); addEventListener('resize', citit); citit();
  }
  if (redus || !('IntersectionObserver' in window)) return;
  root.classList.add('anim');

  // apariție la derulare
  var sel = '.section-head, .step, .right, .lesson, .pattern, .tl-item, .stat, .figure-line, .section-art, .doc, .ambassador, .note-card, .aside-card, .band-panel, .example-text, .toggle, .partner-card, .initiator, .quote-band blockquote, .closing-inner, .keeps li';
  var io = new IntersectionObserver(function (intrari) {
    intrari.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  Array.prototype.forEach.call(document.querySelectorAll(sel), function (el, i) {
    if (el.closest('.hero') || el.closest('[hidden]')) return;
    var r = el.getBoundingClientRect();
    if (r.top < innerHeight) return; // deja pe ecran: nu-l ascundem
    el.classList.add('reveal');
    el.style.transitionDelay = ((i % 5) * 0.06) + 's';
    io.observe(el);
  });

  // linia drumului și barele contorului
  var io2 = new IntersectionObserver(function (intrari) {
    intrari.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io2.unobserve(e.target); } });
  }, { threshold: 0.3 });
  Array.prototype.forEach.call(document.querySelectorAll('.timeline, .meters'), function (el) { io2.observe(el); });

  // cifrele numără în sus
  function format(n, model) {
    var s = String(Math.round(n));
    if (/\d[   ]\d{3}/.test(model)) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return s;
  }
  var io3 = new IntersectionObserver(function (intrari) {
    intrari.forEach(function (e) {
      if (!e.isIntersecting) return;
      io3.unobserve(e.target);
      var el = e.target, final = el.textContent, m = final.match(/\d[\d   ]*\d|\d/);
      if (!m) return;
      var tinta = parseInt(m[0].replace(/\D/g, ''), 10), t0 = null, dur = 1400;
      var pas = function (t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), v = tinta * (1 - Math.pow(1 - k, 3));
        el.textContent = k < 1 ? final.replace(m[0], format(v, m[0])) : (el.getAttribute('data-final') || final);
        if (k < 1) requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    });
  }, { threshold: 0.6 });
  Array.prototype.forEach.call(document.querySelectorAll('.stat-num, .meter-num b'), function (el) { io3.observe(el); });

  // paralaxă pe fundalurile benzilor (ecrane mari)
  var fundaluri = Array.prototype.slice.call(document.querySelectorAll('.band-art, .quote-art'));
  var paralaxa = function () {
    if (innerWidth <= 760) return;
    fundaluri.forEach(function (f) {
      var r = f.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      f.style.setProperty('--py', (k * -60).toFixed(1) + 'px');
    });
  };
  addEventListener('scroll', paralaxa, { passive: true }); addEventListener('resize', paralaxa); paralaxa();

  // filmul de la final pornește când ajunge pe ecran
  var film = document.querySelector('.quote-video');
  if (film) {
    var io4 = new IntersectionObserver(function (intrari) {
      intrari.forEach(function (e) {
        if (e.isIntersecting) {
          if (!film.getAttribute('src')) film.setAttribute('src', (innerWidth * (window.devicePixelRatio || 1) > 1400 && film.getAttribute('data-src-hd')) || film.getAttribute('data-src'));
          var pr = film.play(); if (pr && pr.catch) pr.catch(function () {});
        } else { film.pause(); }
      });
    }, { threshold: 0.15 });
    io4.observe(film.parentElement);
  }

  // libelula trece din când în când prin site (după prima pagină), la 35–70 de secunde
  var hero = document.querySelector('.hero'), sursa = document.querySelector('.hero-libelula');
  if (hero && sursa) {
    var trece = sursa.cloneNode(true);
    trece.className = 'libelula-trece libelula-aripi'; trece.setAttribute('aria-hidden', 'true');
    document.body.appendChild(trece);
    var invers = false;
    var urmatoarea = function () { setTimeout(zboara, 35000 + Math.random() * 35000); };
    var zboara = function () {
      if (!document.hidden && scrollY > hero.offsetHeight) {
        trece.classList.remove('zboara'); invers = !invers;
        trece.classList.toggle('invers', invers);
        trece.style.top = (18 + Math.random() * 55) + 'vh';
        void trece.offsetWidth; trece.classList.add('zboara');
      }
      urmatoarea();
    };
    urmatoarea();
  }

  // libelula din siglă bate din aripi când treci peste „Semnează”
  var brand = document.querySelector('.site-header .brand');
  if (brand) {
    Array.prototype.forEach.call(document.querySelectorAll('.btn-cta'), function (b) {
      b.addEventListener('mouseenter', function () {
        brand.classList.remove('zboara'); void brand.offsetWidth; brand.classList.add('zboara');
      });
    });
  }
})();

// v71: file (tabs) pentru „Exemple din România” și „Oamenii”. Fără JavaScript se văd toate panourile, unul sub altul.
(function () {
  var n = 0;
  var grupuri = [];
  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (box) {
    var panouri = Array.prototype.filter.call(box.children, function (c) { return c.hasAttribute('data-tab'); });
    if (panouri.length < 2) return;
    var lista = document.createElement('div');
    lista.className = 'tab-list';
    lista.setAttribute('role', 'tablist');
    var butoane = panouri.map(function (p, i) {
      n++;
      if (!p.id) p.id = 'fila-' + n;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab-btn';
      b.id = 'fila-btn-' + n;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', p.id);
      b.textContent = p.getAttribute('data-tab');
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', b.id);
      b.addEventListener('click', function () { arata(i, true); });
      b.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); var j = (i + k + panouri.length) % panouri.length; arata(j, true); butoane[j].focus(); }
      });
      lista.appendChild(b);
      return b;
    });
    box.insertBefore(lista, box.firstChild);
    var hint = box.getAttribute('data-tabs-hint');
    if (hint) { var h = document.createElement('p'); h.className = 'tab-hint'; h.textContent = hint; box.insertBefore(h, lista); }
    var urm = box.getAttribute('data-tabs-next');
    if (urm) panouri.forEach(function (p, i) {
      var j = (i + 1) % panouri.length;
      var nb = document.createElement('button');
      nb.type = 'button'; nb.className = 'tab-next';
      nb.textContent = urm + ': ' + panouri[j].getAttribute('data-tab') + ' →';
      nb.addEventListener('click', function () { arata(j, true); box.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      p.appendChild(nb);
    });
    box.classList.add('tabs-on');
    var activ = 0;
    function arata(i, dinClic) {
      // v80: trecerea între file: panoul nou intră glisând din partea în care merge utilizatorul
      var dir = i > activ ? 1 : (i < activ ? -1 : 0);
      // v81: bara cu file rămâne pe loc pe ecran (fără salt de pagină la schimbarea panoului)
      var sus0 = dinClic ? lista.getBoundingClientRect().top : null;
      panouri.forEach(function (p, j) {
        p.hidden = j !== i;
        p.classList.remove('intra-dr', 'intra-st');
        if (j === i && dinClic && dir) { void p.offsetWidth; p.classList.add(dir > 0 ? 'intra-dr' : 'intra-st'); }
      });
      activ = i;
      if (sus0 !== null) { var d = lista.getBoundingClientRect().top - sus0; if (Math.abs(d) > 1) window.scrollBy(0, d); }
      box.style.setProperty('--fila', i);
      box.style.setProperty('--file', panouri.length);
      butoane.forEach(function (b, j) {
        b.setAttribute('aria-selected', j === i ? 'true' : 'false');
        b.tabIndex = j === i ? 0 : -1;
      });
      // listele „pe un rând” își recalculează rândurile după ce panoul devine vizibil
    }
    arata(0, false);
    // pe telefon: glisare la stânga / la dreapta
    var x0 = null, y0 = null;
    box.addEventListener('touchstart', function (e) { var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        var j = Math.max(0, Math.min(panouri.length - 1, activ + (dx < 0 ? 1 : -1)));
        if (j !== activ) arata(j, true);
      }
    }, { passive: true });
    grupuri.push({ panouri: panouri, arata: arata });
  });
  // Legăturile din meniu (#parteneri, #rosia...) deschid fila care conține ținta.
  function deschideFila(id) {
    var t = id && document.getElementById(id);
    if (!t) return false;
    var gasit = false;
    grupuri.forEach(function (g) {
      g.panouri.forEach(function (p, i) { if (p === t || p.contains(t)) { g.arata(i, true); gasit = true; } });
    });
    return gasit;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (deschideFila(id)) {
      var t = document.getElementById(id);
      var box = t.closest('[data-tabs]');
      setTimeout(function () { (box || t).scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0);
      e.preventDefault();
      history.replaceState(null, '', '#' + id);
    }
  });
  if (location.hash) deschideFila(decodeURIComponent(location.hash.slice(1)));
})();

// v87: după semnare. Linkul de semnare se deschide în altă filă; când omul revine pe pagina noastră,
// îi arătăm o fâșie cu butoanele de distribuire. Nu știm dacă a semnat cu adevărat, de aceea textul e o întrebare.
(function () {
  var CHEIE = 'rfn-semneaza-clic', share = document.querySelector('#semneaza .share');
  if (!share) return;
  function citeste() { try { return +sessionStorage.getItem(CHEIE) || 0; } catch (e) { return 0; } }
  function scrie(v) { try { if (v) sessionStorage.setItem(CHEIE, String(v)); else sessionStorage.removeItem(CHEIE); } catch (e) {} }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="eci.ec.europa.eu"]');
    if (a) scrie(Date.now());
  });
  var fasie = document.createElement('div');
  fasie.className = 'back-strip'; fasie.setAttribute('role', 'status'); fasie.hidden = true;
  fasie.innerHTML = '<p class="back-text"><strong>Ai semnat? Mulțumim!</strong> Acum adu încă un om:</p>' +
    '<button type="button" class="back-close" aria-label="Închide">×</button>';
  var copie = share.cloneNode(true), et = copie.querySelector('.share-label');
  if (et) et.remove();
  fasie.insertBefore(copie, fasie.querySelector('.back-close'));
  document.body.appendChild(fasie);
  fasie.querySelector('.back-close').addEventListener('click', function () { fasie.hidden = true; });
  function verifica() {
    var t = citeste();
    if (document.visibilityState === 'visible' && t && Date.now() - t > 8000) { scrie(0); fasie.hidden = false; }
  }
  document.addEventListener('visibilitychange', verifica);
  window.addEventListener('focus', verifica);
  window.addEventListener('pageshow', verifica);
})();

// v71: „Copiază linkul” și, pe telefoane, meniul de distribuire al sistemului.
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.share'), function (box) {
    var url = box.getAttribute('data-share-url'), text = box.getAttribute('data-share-text');
    var copy = box.querySelector('.share-copy'), nat = box.querySelector('.share-native');
    if (copy && navigator.clipboard) {
      copy.hidden = false;
      copy.addEventListener('click', function () {
        navigator.clipboard.writeText(url).then(function () {
          var t = copy.textContent; copy.textContent = 'Link copiat'; setTimeout(function () { copy.textContent = t; }, 2000);
        }).catch(function () {});
      });
    }
    // numai pe telefoane și tablete: pe calculator, meniul sistemului e neclar (Alex, 18.11.2026)
    if (nat && navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      nat.hidden = false;
      nat.addEventListener('click', function () { navigator.share({ title: 'Drepturi pentru Natură', text: text, url: url }).catch(function () {}); });
    }
  });
})();

// v77: navigare între secțiuni: pe calculator, o coloană de puncte în dreapta; pe telefon, butonul „Secțiuni”
// din bara de jos deschide lista secțiunilor. Secțiunea curentă e marcată în ambele.
(function () {
  var SECTIUNI = [['sus', 'Început'], ['problema', 'Problema'], ['precedente', 'Precedente'], ['propunerea', 'Ce propunem'],
    ['castig', 'Ce câștigăm'], ['exemple', 'Exemple din România'], ['drumul', 'Drumul până la lege'],
    ['intrebari', 'Întrebări frecvente'], ['oamenii', 'Oamenii'], ['semneaza', 'Semnează']];
  var lista = SECTIUNI.filter(function (x) { return document.getElementById(x[0]); });
  if (!lista.length) return;
  function link(x, cls) {
    var a = document.createElement('a'); a.href = '#' + x[0]; a.className = cls; a.setAttribute('data-sec', x[0]);
    a.innerHTML = '<span class="nav-dot" aria-hidden="true"></span><span class="nav-label"></span>';
    a.querySelector('.nav-label').textContent = x[1];
    return a;
  }
  // coloana de puncte
  var rail = document.createElement('nav'); rail.className = 'section-rail'; rail.setAttribute('aria-label', 'Secțiunile paginii');
  lista.forEach(function (x) { rail.appendChild(link(x, 'rail-link')); });
  document.body.appendChild(rail);
  // foaia de pe telefon
  var bar = document.getElementById('bara-semneaza');
  var sheet = document.createElement('div'); sheet.className = 'section-sheet'; sheet.id = 'foaie-sectiuni'; sheet.hidden = true;
  sheet.innerHTML = '<p class="sheet-title">Mergi la</p>';
  var grid = document.createElement('nav'); grid.className = 'sheet-links'; grid.setAttribute('aria-label', 'Secțiunile paginii');
  lista.forEach(function (x) { grid.appendChild(link(x, 'sheet-link')); });
  sheet.appendChild(grid);
  document.body.appendChild(sheet);
  if (bar) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sheet-toggle';
    b.setAttribute('aria-controls', 'foaie-sectiuni'); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<span aria-hidden="true">☰</span>'; b.setAttribute('aria-label', 'Secțiunile paginii'); b.title = 'Secțiunile paginii';
    bar.insertBefore(b, bar.firstChild);
    var inchide = function () { sheet.hidden = true; b.setAttribute('aria-expanded', 'false'); };
    b.addEventListener('click', function () { var d = sheet.hidden; sheet.hidden = !d; b.setAttribute('aria-expanded', d ? 'true' : 'false'); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) inchide(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') inchide(); });
    document.addEventListener('click', function (e) { if (!sheet.hidden && !sheet.contains(e.target) && !b.contains(e.target)) inchide(); });
  }
  // secțiunea curentă
  var curent = null;
  function marcheaza() {
    var y = window.innerHeight * 0.35, gasit = lista[0][0];
    lista.forEach(function (x) { var el = document.getElementById(x[0]); if (el.getBoundingClientRect().top <= y) gasit = x[0]; });
    if (gasit === curent) return;
    curent = gasit;
    Array.prototype.forEach.call(document.querySelectorAll('[data-sec]'), function (a) {
      var on = a.getAttribute('data-sec') === gasit;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    rail.classList.toggle('is-shown', window.scrollY > 300);
  }
  var t;
  window.addEventListener('scroll', function () { if (t) return; t = requestAnimationFrame(function () { t = null; marcheaza(); }); }, { passive: true });
  marcheaza();
})();


// v78: contorul se actualizează singur. O acțiune GitHub citește registrul Comisiei la fiecare 3 ore și scrie
// data/contor.json în depozit; pagina îl citește de acolo (cifrele din pagină rămân dacă fișierul nu se poate citi).
(function () {
  var URL = 'https://raw.githubusercontent.com/alexgavan/drepturipentrunatura/main/data/contor.json';
  if (!window.fetch) return;
  var nr = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); };
  var pct = function (a, b) { return (a / b * 100).toFixed(1).replace('.', ',') + '\u00a0%'; };
  var num = function (t) { return parseInt(String(t).replace(/\D/g, ''), 10); };
  fetch(URL, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || typeof d.total !== 'number') return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-contor]'), function (m) {
      var v = d[m.getAttribute('data-contor')], din = num(m.getAttribute('data-din'));
      if (typeof v !== 'number' || !din) return;
      var b = m.querySelector('.meter-num b'), fill = m.querySelector('.meter-fill'), nota = m.querySelector('.meter-note'), tr = m.querySelector('.meter-track');
      if (b) { b.setAttribute('data-final', nr(v)); b.textContent = nr(v); }
      if (fill) fill.style.setProperty('--p', Math.min(100, v / din * 100).toFixed(2) + '%');
      if (nota) nota.textContent = pct(v, din) + ' ' + m.getAttribute('data-nota');
      if (tr) tr.setAttribute('aria-label', m.getAttribute('data-nume') + ': ' + nr(v) + ' de semnături din ' + m.getAttribute('data-aria') + nr(din) + ', adică ' + pct(v, din));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-contor-nr]'), function (el) {
      var v = d[el.getAttribute('data-contor-nr')]; if (typeof v === 'number') el.textContent = nr(v);
    });
  }).catch(function () {});
})();
