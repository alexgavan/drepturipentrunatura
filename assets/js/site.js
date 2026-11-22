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
    if (d && d.tagName === 'DETAILS') {
      d.open = true;
      for (var g = d.parentElement && d.parentElement.closest('details'); g; g = g.parentElement && g.parentElement.closest('details')) g.open = true; // v113: deschide și tema
      d.scrollIntoView();
    }
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
  var sel = '.section-head, .step, .right, .lesson, .pattern, .tl-item, .stat, .figure-line, .section-art, .doc, .ambassador, .note-card, .aside-card, .band-panel, .example-text, .toggle, .partner-card, .initiator, .quote-band blockquote, .quote-band .band-line, .closing-inner, .keeps li';  // v141: și fraza de la „Problema” (Alex: „textele de la fotografii inițial erau animate”)
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
  Array.prototype.forEach.call(document.querySelectorAll('.timeline, .steps'), function (el) { io2.observe(el); });

  // cifrele numără în sus
  function format(n, model) {
    var s = String(Math.round(n));
    if (/\d[   ]\d{3}/.test(model)) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return s;
  }
  function numara(el) {
    var final = el.textContent, m = final.match(/\d[\d   ]*\d|\d/);
    if (!m) return;
    var tinta = parseInt(m[0].replace(/\D/g, ''), 10), t0 = null, dur = 1400;
    var pas = function (t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), v = tinta * (1 - Math.pow(1 - k, 3));
      el.textContent = k < 1 ? final.replace(m[0], format(v, m[0])) : (el.getAttribute('data-final') || final);
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
  var io3 = new IntersectionObserver(function (intrari) {
    intrari.forEach(function (e) { if (!e.isIntersecting) return; io3.unobserve(e.target); numara(e.target); });
  }, { threshold: 0.6 });
  Array.prototype.forEach.call(document.querySelectorAll('.stat-num'), function (el) { io3.observe(el); });

  // v127 (D1): contorul pornește când ajungi la el și după ce s-au citit cifrele noi (data/contor.json):
  // cifrele cresc de la zero o singură dată, iar barele se umplu în același timp.
  var meters = document.querySelector('.meters');
  if (meters) {
    var pornit = false;
    var porneste = function () {
      if (pornit) return; pornit = true;
      meters.classList.add('is-in');
      Array.prototype.forEach.call(meters.querySelectorAll('.meter-num b'), numara);
    };
    var cand = function () {
      if (root.getAttribute('data-contor') === 'gata') return porneste();
      document.addEventListener('contor-gata', porneste);
      setTimeout(porneste, 2500); // dacă fișierul nu răspunde, pornesc cu cifrele din pagină
    };
    var io6 = new IntersectionObserver(function (intrari) {
      intrari.forEach(function (e) { if (e.isIntersecting) { io6.unobserve(meters); cand(); } });
    }, { threshold: 0.3 });
    io6.observe(meters);
  }

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
  var voce = document.getElementById('voce');
  if (voce) {
    var lv = document.createElement('a');
    lv.className = 'back-voice'; lv.href = '#voce';
    lv.addEventListener('click', function () { fasie.hidden = true; });
    lv.textContent = 'Tu a cui voce ești? Fă-ți imaginea „Sunt vocea…” →';
    fasie.insertBefore(lv, fasie.querySelector('.back-close'));
  }
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

// v77: navigare între secțiuni: pe calculator, o coloană de puncte în dreapta; pe telefon, butonul ☰ din bara de jos.
// v127 (N1): un singur meniu. Punctele și foaia de jos se fac din lista meniului de telefon (aceeași ca în antet și în
// subsol), deci au aceleași secțiuni, în aceeași ordine și cu aceleași nume; secțiunea curentă e marcată peste tot.
(function () {
  var sursa = document.querySelector('#meniu-mobil .nav-list');
  if (!sursa) return;
  var lista = Array.prototype.slice.call(sursa.querySelectorAll(':scope > li > a[data-sec]'))
    .map(function (a) { return [a.getAttribute('data-sec'), a.textContent]; })
    .filter(function (x) { return document.getElementById(x[0]); });
  if (!lista.length) return;
  // coloana de puncte
  var rail = document.createElement('nav'); rail.className = 'section-rail'; rail.setAttribute('aria-label', 'Secțiunile paginii, puncte');
  lista.forEach(function (x) {
    var a = document.createElement('a'); a.href = '#' + x[0]; a.className = 'rail-link'; a.setAttribute('data-sec', x[0]);
    a.innerHTML = '<span class="nav-dot" aria-hidden="true"></span><span class="nav-label"></span>';
    a.querySelector('.nav-label').textContent = x[1];
    rail.appendChild(a);
  });
  document.body.appendChild(rail);
  // foaia de pe telefon: aceeași listă ca meniul de sus
  var bar = document.getElementById('bara-semneaza');
  var sheet = document.createElement('div'); sheet.className = 'section-sheet'; sheet.id = 'foaie-sectiuni'; sheet.hidden = true;
  var nav = document.createElement('nav'); nav.setAttribute('aria-label', 'Secțiunile paginii, de jos');
  nav.innerHTML = '<p class="sheet-title">Mergi la</p>';
  nav.appendChild(sursa.cloneNode(true));
  sheet.appendChild(nav);
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
  // în antet, după o apăsare, lista de la „Oamenii” se închide (altfel rămâne deschisă cât timp linkul are focusul)
  Array.prototype.forEach.call(document.querySelectorAll('.nav a'), function (a) {
    a.addEventListener('click', function () { setTimeout(function () { a.blur(); }, 0); });
  });
  // secțiunea curentă, în toate listele
  var curent = null;
  function marcheaza() {
    var y = window.innerHeight * 0.35, gasit = lista[0][0];
    lista.forEach(function (x) { var el = document.getElementById(x[0]); if (el.getBoundingClientRect().top <= y) gasit = x[0]; });
    rail.classList.toggle('is-shown', window.scrollY > 300);
    if (gasit === curent) return;
    curent = gasit;
    Array.prototype.forEach.call(document.querySelectorAll('[data-sec]'), function (a) {
      var on = a.getAttribute('data-sec') === gasit;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  var t;
  window.addEventListener('scroll', function () { if (t) return; t = requestAnimationFrame(function () { t = null; marcheaza(); }); }, { passive: true });
  window.addEventListener('resize', marcheaza);
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
  var gata = function () {
    document.documentElement.setAttribute('data-contor', 'gata');
    try { document.dispatchEvent(new Event('contor-gata')); } catch (e) {}
  };
  // v127 (D1): „Actualizat azi la …”: ora la care cifrele noi au fost citite din registru (citit_la, în UTC),
  // arătată în ora vizitatorului
  var actualizat = function (iso) {
    var el = document.querySelector('.meter-update'), t = el && el.querySelector('.meter-update-text');
    var d = iso ? new Date(iso) : null;
    if (!t || !d || isNaN(d)) return;
    var zi = function (x) { return x.getFullYear() + '-' + x.getMonth() + '-' + x.getDate(); };
    var azi = new Date(), ieri = new Date(azi.getTime() - 864e5);
    var ora = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    var luni = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
    var cand = zi(d) === zi(azi) ? 'azi la ' + ora : zi(d) === zi(ieri) ? 'ieri la ' + ora : 'pe ' + d.getDate() + ' ' + luni[d.getMonth()] + ', la ' + ora;
    t.textContent = 'Actualizat ' + cand + ', din registrul Comisiei Europene.';
    el.hidden = false;
  };
  fetch(URL, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || typeof d.total !== 'number') return gata();
    actualizat(d.citit_la);
    try { document.dispatchEvent(new CustomEvent('contor-date', { detail: d })); } catch (e) {}
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
    gata();
  }).catch(gata);
})();

// v90: adresa de contact se compune aici, din bucăți inversate, ca să nu apară în HTML (fără link, Alex, 18.11.2026)
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.join-mail[data-u]'), function (el) {
    var r = function (s) { return s.split('').reverse().join(''); };
    el.textContent = r(el.getAttribute('data-u')) + String.fromCharCode(64) + r(el.getAttribute('data-d'));
  });
})();

// v104: „Fii vocea naturii”, pe site-ul nostru. Imaginea se desenează în browser, pe canvas;
// poza aleasă nu pleacă de pe dispozitiv. Ideea uneltei vine de la Pachamama România (voce.pachamamaromania.ro).
(function () {
  var sec = document.getElementById('voce'), cv = document.getElementById('voce-canvas');
  if (!sec || !cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var C = { indigo: '#2C367E', yellow: '#FFF278', orange: '#FF774A', paper: '#ffffff' };
  var FD = '"RFN Display", "Archivo", "Helvetica Neue", Arial, sans-serif';
  var FM = '"RFN Mono", "Space Mono", ui-monospace, Menlo, monospace';
  var SITE = 'drepturipentrunatura.ro';
  var st = { mod: 'profil', format: 'postare',
             poza: { profil: null, postare: null },
             ultima: { profil: null, postare: null },   // v115: poza scoasă cu „Fără poză”, ca să poată fi pusă la loc
             poz: { profil: { z: 1, x: 0, y: 0 }, postare: { z: 1, x: 0, y: 0 } } };
  var inLoc = document.getElementById('voce-loc'), inPoza = document.getElementById('voce-poza');
  var zoom = document.getElementById('voce-zoom'), zoomEt = document.getElementById('voce-zoom-et');
  var muta = document.getElementById('voce-muta'), fara = document.getElementById('voce-fara');
  var etPoza = document.getElementById('voce-et-poza'), pasFormat = document.getElementById('voce-pas-format');
  var txt = document.getElementById('voce-text');
  function img(src) { var i = new Image(); i.onload = desen; i.src = src; return i; }
  var sigla = img(sec.getAttribute('data-sigla')), libelula = img(sec.getAttribute('data-libelula'));
  // v114: la postare, până își alege omul poza, apare o fotografie de exemplu (Alex Găvan)
  var exemplu = sec.getAttribute('data-exemplu') ? img(sec.getAttribute('data-exemplu')) : null;
  if (exemplu) st.poza.postare = exemplu;
  function gata(i) { return i && i.complete && i.naturalWidth > 0; }

  function locul() {
    var v = (inLoc.value || '').replace(/\s+/g, ' ').trim();
    return v || 'naturii';
  }
  function mari(s) { try { return s.toLocaleUpperCase('ro-RO'); } catch (e) { return s.toUpperCase(); } }
  function dim() {
    if (st.mod === 'profil') return [1080, 1080];
    return st.format === 'story' ? [1080, 1920] : [1080, 1350];
  }

  // Poza, acoperind dreptunghiul dat, cu mărirea și mutarea alese (mutarea nu lasă margini goale).
  function poza(x, y, w, h) {
    var p = st.poza[st.mod], o = st.poz[st.mod];
    if (!gata(p)) return false;
    var s = Math.max(w / p.naturalWidth, h / p.naturalHeight) * o.z;
    var dw = p.naturalWidth * s, dh = p.naturalHeight * s;
    var mx = (dw - w) / 2, my = (dh - h) / 2;
    o.x = Math.max(-mx, Math.min(mx, o.x)); o.y = Math.max(-my, Math.min(my, o.y));
    ctx.drawImage(p, x + (w - dw) / 2 + o.x, y + (h - dh) / 2 + o.y, dw, dh);
    return true;
  }
  function libelulaFundal(cx, cy, w, alfa) {
    if (!gata(libelula)) return;
    var h = w * libelula.naturalHeight / libelula.naturalWidth;
    ctx.save(); ctx.globalAlpha = alfa; ctx.drawImage(libelula, cx - w / 2, cy - h / 2, w, h); ctx.restore();
  }

  // Text pe arc: sus se citește în sensul acelor de ceas, jos invers, ca literele să stea drepte.
  function arc(text, cx, cy, r, centru, font, culoare, jos, spatiere) {
    ctx.save(); ctx.font = font; ctx.fillStyle = culoare; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var ch = Array.from(text), lat = ch.map(function (c) { return ctx.measureText(c).width + spatiere; });
    var total = lat.reduce(function (a, b) { return a + b; }, 0) - spatiere, a = centru + (jos ? 1 : -1) * total / r / 2;
    ch.forEach(function (c, i) {
      var m = a + (jos ? -1 : 1) * (lat[i] - spatiere) / r / 2;
      ctx.save(); ctx.translate(cx + r * Math.cos(m), cy + r * Math.sin(m));
      ctx.rotate(m + (jos ? -1 : 1) * Math.PI / 2); ctx.fillText(c, 0, 0); ctx.restore();
      a += (jos ? -1 : 1) * lat[i] / r;
    });
    ctx.restore();
    return total;
  }
  function marimeArc(text, font, maxLat, start, min, spatiere) {
    var m = start;
    for (; m > min; m -= 2) {
      ctx.font = font.replace('{m}', m);
      var w = Array.from(text).reduce(function (a, c) { return a + ctx.measureText(c).width + spatiere; }, 0);
      if (w <= maxLat) break;
    }
    return m;
  }

  function profil() {
    var W = 1080, c = W / 2, inel = 132, rPoza = c - inel;
    ctx.fillStyle = C.indigo; ctx.fillRect(0, 0, W, W);
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, rPoza + 2, 0, Math.PI * 2); ctx.clip();
    if (!poza(c - rPoza, c - rPoza, rPoza * 2, rPoza * 2)) libelulaFundal(c, c, 640, .16);
    ctx.restore();
    var rText = c - inel / 2;
    ctx.save(); ctx.lineWidth = inel; ctx.strokeStyle = C.yellow; ctx.beginPath(); ctx.arc(c, c, rText, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    var sus = mari('Sunt vocea ' + locul()), spSus = 3;
    var mSus = marimeArc(sus, '700 {m}px ' + FD, rText * 4.1, 76, 34, spSus);
    var latSus = arc(sus, c, c, rText, -Math.PI / 2, '700 ' + mSus + 'px ' + FD, C.indigo, false, spSus);
    var jos = mari('Tu a cui voce ești?'), spJos = 4;
    var latJos = arc(jos, c, c, rText, Math.PI / 2, '700 40px ' + FM, C.indigo, true, spJos);
    // două puncte portocalii, la jumătatea distanței dintre cele două texte
    var capSus = latSus / rText / 2, capJos = latJos / rText / 2;
    var golDr = (Math.PI / 2 - capJos) - (-Math.PI / 2 + capSus);
    [(-Math.PI / 2 + capSus) + golDr / 2, (Math.PI * 1.5 - capSus) - golDr / 2].forEach(function (u) {
      if (golDr < 0.12) return;
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(c + rText * Math.cos(u), c + rText * Math.sin(u), 12, 0, Math.PI * 2); ctx.fill();
    });
  }

  function randuri(text, maxLat, marime) {
    ctx.font = '700 ' + marime + 'px ' + FD;
    var cuv = text.split(' '), r = [], cur = '';
    for (var i = 0; i < cuv.length; i++) {
      var t = cur ? cur + ' ' + cuv[i] : cuv[i];
      if (ctx.measureText(t).width <= maxLat || !cur) cur = t; else { r.push(cur); cur = cuv[i]; }
    }
    if (cur) r.push(cur);
    var lat = Math.max.apply(null, r.map(function (x) { return ctx.measureText(x).width; }));
    return { r: r, ok: lat <= maxLat };
  }

  function postare() {
    var d = dim(), W = d[0], H = d[1], m = 72, maxLat = W - 2 * m;
    // la story, aplicațiile acoperă susul și josul imaginii: textul și sigla stau mai înăuntru
    var sus = st.format === 'story' ? 190 : m, jos = st.format === 'story' ? 280 : m;
    ctx.fillStyle = C.indigo; ctx.fillRect(0, 0, W, H);
    var arePoza = poza(0, 0, W, H);
    if (!arePoza) libelulaFundal(W / 2, H * .38, 820, .14);
    else {
      var g = ctx.createLinearGradient(0, H * .4, 0, H);
      g.addColorStop(0, 'rgba(44,54,126,0)'); g.addColorStop(.55, 'rgba(44,54,126,.78)'); g.addColorStop(1, 'rgba(44,54,126,.95)');
      ctx.fillStyle = g; ctx.fillRect(0, H * .4, W, H * .6);
      var gs = ctx.createLinearGradient(0, 0, 0, 300);
      gs.addColorStop(0, 'rgba(17,21,24,.45)'); gs.addColorStop(1, 'rgba(17,21,24,0)');
      ctx.fillStyle = gs; ctx.fillRect(0, 0, W, 300);
    }
    if (gata(sigla)) { var sw = 230, sh = sw * sigla.naturalHeight / sigla.naturalWidth; ctx.drawImage(sigla, m, sus - 10, sw, sh); }
    // de jos în sus: adresa, linia, locul, „Sunt vocea”
    var y = H - jos;
    ctx.fillStyle = C.paper; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '700 30px ' + FM; ctx.fillText('Semnează pe ' + SITE, m, y);
    y -= 50; ctx.font = '600 46px ' + FD; ctx.fillText('Tu a cui voce ești?', m, y);
    y -= 50; ctx.fillStyle = C.yellow; ctx.fillRect(m, y, maxLat, 4);
    var loc = mari(locul()), mar = 190, rez;
    for (; mar >= 56; mar -= 4) { rez = randuri(loc, maxLat, mar); if (rez.ok && rez.r.length <= 3) break; }
    ctx.font = '700 ' + mar + 'px ' + FD; ctx.fillStyle = C.yellow;
    var lh = mar * .98; y -= 44;
    for (var i = rez.r.length - 1; i >= 0; i--) { ctx.fillText(rez.r[i], m - mar * .04, y); y -= lh; }
    y += lh - mar * .82 - 30;
    ctx.fillStyle = C.paper; ctx.font = '700 54px ' + FM;
    ctx.fillText(mari('Sunt vocea'), m, y);
  }

  function desen() {
    var d = dim();
    if (cv.width !== d[0]) cv.width = d[0];
    if (cv.height !== d[1]) cv.height = d[1];
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (st.mod === 'profil') profil(); else postare();
  }

  function textPostare() {
    return 'Sunt vocea ' + locul() + '.\n\n' +
      'Un râu nu poate spune ce i se întâmplă. Nici o pădure.\n\n' +
      'Am semnat inițiativa cetățenească europeană „Drepturi pentru Natură”, care cere o lege a Uniunii prin care natura să aibă drepturi și oameni care s-o apere.\n\n' +
      'Semnează și tu, durează cam un minut: ' + SITE + '\n\n' +
      'Tu a cui voce ești?';
  }

  function stare() {
    var arePoza = !!st.poza[st.mod];
    sec.querySelectorAll('[data-mod]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mod') === st.mod)); });
    sec.querySelectorAll('[data-format]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-format') === st.format)); });
    etPoza.textContent = st.mod === 'profil' ? '1. Alege o poză cu tine' : '1. Alege o poză cu locul tău';
    pasFormat.hidden = st.mod === 'profil';
    // v115: butonul nu mai dispare după „Fără poză”: devine „Pune la loc…”
    var ultima = st.ultima[st.mod];
    fara.hidden = !(st.mod === 'postare' && (arePoza || ultima));
    fara.textContent = arePoza ? 'Fără poză: fundalul albastru'
      : (ultima === exemplu ? 'Pune la loc fotografia de exemplu' : 'Pune la loc poza ta');
    muta.hidden = zoomEt.hidden = !arePoza;
    zoom.value = st.poz[st.mod].z;
    cv.classList.toggle('is-profil', st.mod === 'profil');
    txt.value = textPostare();
    desen();
  }

  sec.querySelectorAll('[data-mod]').forEach(function (b) {
    b.addEventListener('click', function () { st.mod = b.getAttribute('data-mod'); stare(); });
  });
  sec.querySelectorAll('[data-format]').forEach(function (b) {
    b.addEventListener('click', function () { st.format = b.getAttribute('data-format'); stare(); });
  });
  inLoc.addEventListener('input', stare);
  inPoza.addEventListener('change', function () {
    var f = inPoza.files && inPoza.files[0]; if (!f) return;
    var mod = st.mod, i = new Image(), url = URL.createObjectURL(f);
    i.onload = function () { st.poza[mod] = i; st.ultima[mod] = null; st.poz[mod] = { z: 1, x: 0, y: 0 }; stare(); };
    i.onerror = function () { URL.revokeObjectURL(url); };
    i.src = url; inPoza.value = '';
  });
  fara.addEventListener('click', function () {
    if (st.poza[st.mod]) { st.ultima[st.mod] = st.poza[st.mod]; st.poza[st.mod] = null; }
    else if (st.ultima[st.mod]) { st.poza[st.mod] = st.ultima[st.mod]; st.ultima[st.mod] = null; }
    stare();
  });
  zoom.addEventListener('input', function () { st.poz[st.mod].z = +zoom.value; desen(); });

  // mutarea pozei: cu degetul sau mouse-ul, și cu săgețile
  var trag = null;
  cv.addEventListener('pointerdown', function (e) {
    if (!st.poza[st.mod]) return;
    trag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); e.preventDefault();
  });
  cv.addEventListener('pointermove', function (e) {
    if (!trag) return;
    var k = cv.width / cv.getBoundingClientRect().width, o = st.poz[st.mod];
    o.x += (e.clientX - trag.x) * k; o.y += (e.clientY - trag.y) * k; trag = { x: e.clientX, y: e.clientY }; desen();
  });
  ['pointerup', 'pointercancel'].forEach(function (t) { cv.addEventListener(t, function () { trag = null; }); });
  cv.addEventListener('keydown', function (e) {
    var p = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!p || !st.poza[st.mod]) return;
    var pas = e.shiftKey ? 80 : 20, o = st.poz[st.mod];
    o.x += p[0] * pas; o.y += p[1] * pas; desen(); e.preventDefault();
  });

  function numeFisier() {
    var s = locul().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'sunt-vocea-' + (s || 'naturii') + (st.mod === 'profil' ? '-profil' : '-' + st.format) + '.png';
  }
  document.getElementById('voce-descarca').addEventListener('click', function () {
    desen();
    cv.toBlob(function (b) {
      if (!b) return;
      var a = document.createElement('a'), u = URL.createObjectURL(b);
      a.href = u; a.download = numeFisier(); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    }, 'image/png');
  });
  var cop = document.getElementById('voce-copiaza');
  cop.addEventListener('click', function () {
    function ok() { var t = cop.textContent; cop.textContent = 'Text copiat'; setTimeout(function () { cop.textContent = t; }, 2000); }
    if (navigator.clipboard) navigator.clipboard.writeText(txt.value).then(ok, function () { txt.select(); });
    else { txt.select(); try { document.execCommand('copy'); ok(); } catch (e) {} }
  });

  stare();
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('700 80px ' + FD), document.fonts.load('700 40px ' + FM)]).then(desen, desen);
  }
})();

// v112: animația de pe primul ecran. Se încarcă după pagină, în mărimea potrivită ecranului; se oprește când primul
// ecran nu se vede; nu pornește deloc pentru cine a cerut mai puțină mișcare în sistem.
(function () {
  var v = document.querySelector('.hero-video');
  if (!v || !v.play) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function porneste() {
    var art = v.parentElement, r = art.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    var lat = innerWidth <= 760 ? r.height * 0.48 * 1.5 : Math.max(r.width, r.height * 1.5);
    var px = lat * dpr;
    var mobil = innerWidth <= 760; // pe telefon, cel mult 1920 px (date mobile)
    v.src = px > 2000 && !mobil ? v.getAttribute('data-src-hd') : px > 1300 ? v.getAttribute('data-src-md') : v.getAttribute('data-src');
    v.addEventListener('playing', function () { v.classList.add('is-playing'); }, { once: true });
    var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } else v.pause();
      }, { threshold: 0.05 }).observe(art);
    }
  }
  if (document.readyState === 'complete') setTimeout(porneste, 300);
  else addEventListener('load', function () { setTimeout(porneste, 300); });
})();

// v124: fotografiile din benzi se încarcă doar când banda se apropie de ecran
(function () {
  var benzi = Array.prototype.slice.call(document.querySelectorAll('.quote-band-foto, .banda-foto'));
  if (!benzi.length) return;
  if (!('IntersectionObserver' in window)) { benzi.forEach(function (b) { b.classList.add('vede'); }); return; }
  var io5 = new IntersectionObserver(function (intrari) {
    intrari.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vede'); io5.unobserve(e.target); } });
  }, { rootMargin: '900px 0px' });
  benzi.forEach(function (b) { io5.observe(b); });
})();
// v124: în machetă, formularul de abonare nu trimite nimic până există contul de newsletter
(function () {
  var f = document.querySelector('.newsletter-form[data-ciorna]');
  if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = f.querySelector('.nl-ciorna'); if (n) { n.textContent = 'În machetă: abonarea nu este încă activă. Formularul se activează după ce Fundația Centura Verde creează contul de newsletter.'; }
  });
})();

// v126: pe telefon, exemplele (Vâlsan, Roșia Montană) arată primul paragraf, iar restul se deschide cu „+”
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('#valsan .example, #rosia .example'), function (ex) {
    var b = ex.querySelector('.ex-plus-rand .plus-btn');
    if (!b) return;
    var nume = (b.getAttribute('aria-label') || '').replace(/^Mai mult: /, '');
    ex.classList.add('ex-plus-activ');
    b.addEventListener('click', function () {
      var d = ex.classList.toggle('ex-deschis');
      b.setAttribute('aria-expanded', d ? 'true' : 'false');
      b.textContent = d ? '\u2212' : '+';
      b.setAttribute('aria-label', (d ? 'Mai puțin: ' : 'Mai mult: ') + nume);
    });
  });
})();

// v127 (N4, aprobată de Alex): „Copiază linkul” sub fiecare răspuns. (N3, căutarea, a ieșit în v132: „scoate caută o întrebare”.)
(function () {
  var faq = document.querySelector('#intrebari .faq');
  if (!faq) return;
  var intrebari = Array.prototype.slice.call(faq.querySelectorAll('details.toggle[id]'));
  if (!intrebari.length) return;

  // N4: butonul „Copiază linkul” a ieșit în v143 (Alex: „scoate copiază linkul”); linkurile întrebărilor funcționează în continuare
  if (false) intrebari.forEach(function (d) {
    var corp = d.querySelector('.toggle-body');
    if (!corp) return;
    var p = document.createElement('p'); p.className = 'faq-link';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'faq-copy'; b.textContent = 'Copiază linkul';
    var titlu = (d.querySelector('summary') || {}).textContent || '';
    b.setAttribute('aria-label', 'Copiază linkul întrebării: ' + titlu.trim());
    p.appendChild(b); corp.appendChild(p);
    b.addEventListener('click', function () {
      var url = location.origin + location.pathname + '#' + d.id;
      var spune = function (t) { b.textContent = t; clearTimeout(b._t); b._t = setTimeout(function () { b.textContent = 'Copiază linkul'; }, 2500); };
      var rezerva = function () {
        try { history.replaceState(null, '', '#' + d.id); } catch (e) {}
        spune('Linkul e în bara de adrese');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { spune('Linkul a fost copiat'); }, rezerva);
      else rezerva();
    });
  });

  // linkul unei întrebări: după ce scripturile au adăugat butoanele, întrebarea se aduce din nou sub antet
  // (fără animație, ca imaginile încărcate între timp să nu mute ținta; nu se mai corectează după ce omul derulează singur)
  var miscat = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, function () { miscat = true; }, { passive: true, once: true }); });
  var reia = function () {
    if (miscat) return;
    var id = decodeURIComponent((location.hash || '').slice(1)), el = id && document.getElementById(id);
    if (el && el.tagName === 'DETAILS' && faq.contains(el)) el.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  setTimeout(reia, 0);
  window.addEventListener('load', function () { reia(); setTimeout(reia, 700); });
})();

// v129: creditul fotografiilor (aparatul foto și numele) apare treptat la derulare, ca pe centuraverde.ro
(function () {
  var cr = Array.prototype.slice.call(document.querySelectorAll('.foto-credit-banda'));
  if (!cr.length || !document.documentElement.classList.contains('anim')) return;
  var t = null;
  var f = function () {
    t = null;
    var vh = window.innerHeight;
    cr.forEach(function (c) {
      var top = c.getBoundingClientRect().top;
      var o = Math.max(0, Math.min(1, (vh * 0.95 - top) / (vh * 0.45)));
      c.style.setProperty('--credit-o', o.toFixed(3));
    });
  };
  window.addEventListener('scroll', function () { if (!t) t = requestAnimationFrame(f); }, { passive: true });
  window.addEventListener('resize', f);
  f();
})();

// v129 (M1): rândurile glisante de pe telefon au puncte (sau o bară) și „1 / 5”; prima dată se mișcă puțin
(function () {
  var mq = window.matchMedia('(max-width: 760px)');
  var redus = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('.rights, .keeps-cards, .steps.steps-4, .lessons, .docs-strip .docs, #drumul .timeline, .sign-steps, .faq-group > .toggles, .patterns'), function (r) {
    var items = Array.prototype.slice.call(r.children);
    if (items.length < 2) return;
    var nav = document.createElement('div'); nav.className = 'swipe-nav'; nav.setAttribute('aria-hidden', 'true');
    var dots = [], bar = null;
    if (items.length <= 8) items.forEach(function () { var d = document.createElement('span'); d.className = 'swipe-dot'; nav.appendChild(d); dots.push(d); });
    else { bar = document.createElement('span'); bar.className = 'swipe-bar'; bar.appendChild(document.createElement('span')); nav.appendChild(bar); }
    var cnt = document.createElement('span'); cnt.className = 'swipe-count'; nav.appendChild(cnt);
    r.parentNode.insertBefore(nav, r.nextSibling);
    var curent = -1;
    function update() {
      if (!mq.matches) return;
      var pas = items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
      var i = pas > 0 ? Math.round(r.scrollLeft / pas) : 0;
      if (r.scrollLeft + r.clientWidth >= r.scrollWidth - 2) i = items.length - 1;
      i = Math.max(0, Math.min(items.length - 1, i));
      if (i === curent) return;
      curent = i;
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
      if (bar) bar.firstChild.style.width = ((i + 1) / items.length * 100) + '%';
      cnt.textContent = (i + 1) + ' / ' + items.length;
    }
    var raf = null;
    r.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = null; update(); }); }, { passive: true });
    window.addEventListener('resize', function () { curent = -1; update(); });
    update();
    if (!redus && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting || !mq.matches) return;
        io.disconnect();
        if (r.scrollLeft > 4) return;
        r.classList.add('swipe-hint');
        setTimeout(function () { r.classList.remove('swipe-hint'); }, 1700);
      }, { threshold: 0.7 });
      io.observe(r);
    }
  });
})();

// v129 (M9): pe telefon, paragraful despre proiectul rezoluției se deschide cu „+”
(function () {
  var card = document.querySelector('#drumul .aside-card'), b = card && card.querySelector('.comisia-plus-rand .plus-btn');
  if (!b) return;
  b.addEventListener('click', function () {
    var d = !card.classList.contains('comisia-deschis');
    card.classList.toggle('comisia-deschis', d);
    b.setAttribute('aria-expanded', d ? 'true' : 'false');
    b.textContent = d ? '−' : '+';
    b.setAttribute('aria-label', (d ? 'Mai puțin' : 'Mai mult') + ': proiectul rezoluției');
  });
})();

// v129 (D2): progresul pe țări. Ordinea, după cât din prag a atins fiecare țară; România rămâne mereu la vedere.
// Cifrele noi vin din data/contor.json (evenimentul „contor-date”); pragurile, din registrul Comisiei.
(function () {
  var box = document.querySelector('.tari');
  if (!box) return;
  var lista = box.querySelector('.tari-lista'), sumEl = box.querySelector('[data-tari-atinse]');
  var VIZIBILE = 6;
  var nr = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var de = function (n) { return n >= 20 && (n % 100 === 0 || n % 100 >= 20) ? 'de ' : ''; };
  var pScurt = function (p) { return (p >= 10 ? String(Math.round(p)) : p.toFixed(1).replace('.', ',')) + ' %'; };
  function aseaza() {
    var li = Array.prototype.slice.call(lista.children);
    li.sort(function (a, b) { return (b.dataset.semn / b.dataset.prag) - (a.dataset.semn / a.dataset.prag); });
    var atinse = 0;
    li.forEach(function (x, i) {
      lista.appendChild(x);
      var s = +x.dataset.semn, pr = +x.dataset.prag, p = s / pr * 100;
      if (s >= pr) atinse++;
      x.querySelector('.tara-fill').style.setProperty('--p', Math.min(100, p).toFixed(2) + '%');
      x.querySelector('.tara-pct').textContent = pScurt(p);
      x.querySelector('.sr-only').textContent = ', ' + nr(s) + ' ' + de(s) + 'semnături din pragul de ' + nr(pr);
      x.classList.toggle('tara-ascunsa', i >= VIZIBILE && !x.classList.contains('tara-ro'));
    });
    if (sumEl) sumEl.textContent = atinse;
  }
  var n = lista.children.length;
  box.classList.add('tari-scurt');
  var p = document.createElement('p'); p.className = 'tari-more';
  var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-outline btn-small'; b.setAttribute('aria-expanded', 'false');
  var text = 'Vezi toate cele ' + n + ' de țări';
  b.textContent = text;
  p.appendChild(b); box.appendChild(p);
  b.addEventListener('click', function () {
    var d = !box.classList.contains('tari-toate');
    box.classList.toggle('tari-toate', d);
    b.setAttribute('aria-expanded', d ? 'true' : 'false');
    b.textContent = d ? 'Arată mai puține' : text;
  });
  aseaza();
  document.addEventListener('contor-date', function (e) {
    var t = e.detail && e.detail.tari;
    if (!t) return;
    Array.prototype.forEach.call(lista.children, function (x) { var v = t[x.dataset.cod]; if (typeof v === 'number') x.dataset.semn = v; });
    aseaza();
  });
})();

// v136: „+” numai pe telefon (Alex, 22.11.2026): „Tu a cui voce ești?”, după primul paragraf, și notele de la „Semnează inițiativa”
(function () {
  var n = 0;
  Array.prototype.forEach.call(document.querySelectorAll('[data-plus-tel]'), function (bl) {
    var dupa = bl.querySelector('[data-plus-tel-dupa]'), corpuri = bl.querySelectorAll('.plus-tel-body');
    if (!dupa || !corpuri.length) return;
    var nume = bl.getAttribute('data-plus-tel-nume') || dupa.textContent.trim();
    var ids = Array.prototype.map.call(corpuri, function (c) { if (!c.id) c.id = 'plus-tel-' + (++n); return c.id; });
    var p = document.createElement('p'); p.className = 'plus-tel-rand';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'plus-btn';
    b.setAttribute('aria-controls', ids.join(' '));
    p.appendChild(b); dupa.insertAdjacentElement('afterend', p);
    function seteaza(d) {
      bl.classList.toggle('plus-tel-deschis', d);
      b.setAttribute('aria-expanded', d ? 'true' : 'false');
      b.textContent = d ? '\u2212' : '+';
      b.setAttribute('aria-label', (d ? 'Mai puțin: ' : 'Mai mult: ') + nume);
    }
    bl._plusTel = seteaza;
    seteaza(false);
    b.addEventListener('click', function () { seteaza(!bl.classList.contains('plus-tel-deschis')); });
    if (dupa.tagName === 'H3') dupa.addEventListener('click', function () { if (window.matchMedia('(max-width: 760px)').matches) seteaza(!bl.classList.contains('plus-tel-deschis')); });
  });
  // linkurile spre „Tu a cui voce ești?” deschid unealta
  var voce = document.querySelector('#voce [data-plus-tel]');
  function deschideVoce() { if (voce && voce._plusTel && (location.hash === '#voce' || location.hash.indexOf('#voce-') === 0)) voce._plusTel(true); }
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href="#voce"]'); if (a && voce && voce._plusTel) voce._plusTel(true); });
  window.addEventListener('hashchange', deschideVoce);
  deschideVoce();
})();

// v136: pe telefon, răspunsurile la întrebări stau pe cartonașe care se trag cu degetul, deschise
(function () {
  var mq = window.matchMedia('(max-width: 760px)');
  var toate = document.querySelectorAll('.faq-group > .toggles > details.toggle');
  function aplica() { if (mq.matches) Array.prototype.forEach.call(toate, function (d) { d.open = true; }); }
  if (mq.addEventListener) mq.addEventListener('change', aplica);
  aplica();
  // linkul unei întrebări: rândul se derulează la cartonașul ei
  function laIntrebare() {
    if (!mq.matches || !location.hash) return;
    var d = document.getElementById(location.hash.slice(1));
    if (!d || !d.matches('.faq-group > .toggles > details.toggle')) return;
    var r = d.parentElement; r.scrollLeft = d.offsetLeft - r.offsetLeft - parseFloat(getComputedStyle(r).paddingLeft || 0);
  }
  window.addEventListener('hashchange', laIntrebare);
  window.addEventListener('load', laIntrebare);
})();

// v139: pe telefon, întrebările frecvente au deasupra un rând cu cele 5 teme; tema aleasă își arată imediat
// răspunsurile, pe cartonașe care se trag cu degetul (Alex, 22.11.2026: „Răspunsuri la întrebările frecvente – tot cu glisare”)
(function () {
  var faq = document.querySelector('#intrebari .faq');
  if (!faq) return;
  var grupuri = Array.prototype.slice.call(faq.querySelectorAll(':scope > details.faq-group'));
  if (grupuri.length < 2) return;
  var mq = window.matchMedia('(max-width: 760px)');
  var bara = document.createElement('div'); bara.className = 'faq-teme'; bara.setAttribute('role', 'tablist'); bara.setAttribute('aria-label', 'Temele întrebărilor');
  var butoane = grupuri.map(function (g) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'faq-tema'; b.setAttribute('role', 'tab');
    var t = g.querySelector('.faq-group-title'), c = g.querySelector('.faq-count');
    b.innerHTML = '<span></span><small></small>';
    b.firstChild.textContent = t ? t.textContent.trim() : '';
    b.lastChild.textContent = c ? c.textContent.trim() : '';
    b.setAttribute('aria-controls', g.id);
    b.addEventListener('click', function () { alege(g, true); });
    bara.appendChild(b); return b;
  });
  faq.parentNode.insertBefore(bara, faq);
  // v143: semnul că rândul se trage cu degetul
  var nota = document.createElement('p'); nota.className = 'faq-teme-nota'; nota.setAttribute('aria-hidden', 'true'); nota.textContent = 'Glisează pentru celelalte teme \u2192';
  faq.parentNode.insertBefore(nota, faq);
  bara.addEventListener('scroll', function () {
    var capat = bara.scrollLeft + bara.clientWidth >= bara.scrollWidth - 4;
    bara.classList.toggle('la-capat', capat);
    if (bara.scrollLeft > 10) nota.style.visibility = 'hidden';
  }, { passive: true });
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ioT = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting || !mq.matches) return;
      ioT.disconnect();
      bara.classList.add('swipe-hint'); setTimeout(function () { bara.classList.remove('swipe-hint'); }, 1700);
    }, { threshold: 0.8 });
    ioT.observe(bara);
  }
  var activ = grupuri[0];
  function alege(g, deLaOm) {
    activ = g;
    grupuri.forEach(function (x, k) {
      var da = x === g;
      x.classList.toggle('faq-activ', da);
      butoane[k].classList.toggle('is-on', da);
      butoane[k].setAttribute('aria-selected', da ? 'true' : 'false');
      if (da && mq.matches) x.open = true;
    });
    if (deLaOm) { var r = g.querySelector('.toggles'); if (r) r.scrollLeft = 0; var bi = butoane[grupuri.indexOf(g)]; bara.scrollTo({ left: bi.offsetLeft - 16, behavior: 'smooth' }); }
  }
  function mod() { faq.classList.toggle('faq-tab', mq.matches); if (mq.matches) alege(activ, false); }
  if (mq.addEventListener) mq.addEventListener('change', mod);
  // linkul unei teme sau al unei întrebări alege tema ei
  function dinAdresa() {
    if (!location.hash) return;
    var t = document.getElementById(location.hash.slice(1)); if (!t) return;
    var g = t.closest ? t.closest('details.faq-group') : null;
    if (g && grupuri.indexOf(g) >= 0) alege(g, false);
    var r = t.parentElement;
    if (mq.matches && t.matches('.faq-group > .toggles > details.toggle')) {
      var muta = function () { r.scrollLeft += t.getBoundingClientRect().left - r.getBoundingClientRect().left - parseFloat(getComputedStyle(r).paddingLeft || 0); };
      muta(); setTimeout(muta, 400); window.addEventListener('load', function () { setTimeout(muta, 300); });
    }
  }
  window.addEventListener('hashchange', function () { dinAdresa(); });
  dinAdresa();
  mod();
})();

// v140: fotografiile de sub citate: zoom lent când banda intră pe ecran; pe calculator, și paralaxă ușoară
(function () {
  if (!document.documentElement.classList.contains('anim')) return;
  var benzi = Array.prototype.slice.call(document.querySelectorAll('.quote-band .quote-art-foto')).map(function (f) { return f.parentElement; });
  if (!benzi.length) return;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (e) {
      e.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('foto-zoom'); io.unobserve(x.target); } });
    }, { threshold: 0.3 });
    benzi.forEach(function (b) { io.observe(b); });
  } else benzi.forEach(function (b) { b.classList.add('foto-zoom'); });
  var raf = null;
  function paralaxa() {
    raf = null;
    benzi.forEach(function (b) {
      var f = b.querySelector('.quote-art-foto');
      if (innerWidth <= 760) { f.style.removeProperty('--pyf'); return; }
      var r = b.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;   // -0,5 … 0,5 cât timp banda e pe ecran
      var max = r.height * 0.02;                                           // jumătate din cei 4 % în plus
      var y = Math.max(-max, Math.min(max, k * -2 * max));
      f.style.setProperty('--pyf', y.toFixed(1) + 'px');
    });
  }
  // v143: mișcarea o face acum blocul de mai jos, după derulare (paralaxa de aici nu mai pornește)
  void paralaxa;
})();

// v143: fotografiile de sub citate: zoomul (108 % → 118 %) și mișcarea (cel mult 3,5 % din înălțime) urmează derularea, pe toate ecranele
(function () {
  if (!document.documentElement.classList.contains('anim')) return;
  var benzi = Array.prototype.slice.call(document.querySelectorAll('.quote-band .quote-art-foto')).map(function (f) { return f.parentElement; });
  if (!benzi.length) return;
  var raf = null;
  function misca() {
    raf = null;
    benzi.forEach(function (b) {
      var f = b.querySelector('.quote-art-foto'), r = b.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50) return;
      var p = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));   // 0 când intră jos, 1 când iese sus
      var s = 1.08 + 0.1 * p, max = r.height * Math.min(0.035, (s - 1) / 2 - 0.005);
      f.style.setProperty('--zs', s.toFixed(4));
      f.style.setProperty('--pyf', ((0.5 - p) * 2 * max).toFixed(1) + 'px');
    });
  }
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(misca); }, { passive: true });
  addEventListener('resize', misca);
  misca();
})();
