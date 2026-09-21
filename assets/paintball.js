/* ==========================================================================
   STREFA ZERO - rozbryzg farby po kliknięciu w przycisk akcji.
   Klik w przycisk = trafienie kulką: plama w miejscu kursora + odpryski.
   Bezpieczniki: przy prefers-reduced-motion efekt nie gra, a każdy link
   działa normalnie także wtedy, gdy cokolwiek w tym pliku zawiedzie.
   ========================================================================== */
(function(){
  'use strict';
  var wolneRuchy = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (wolneRuchy) return;

  var KOLORY = ['#FF6A1A','#BCD72F','#FFC61A','#E23B2E','#27B8E8','#F04FA0'];
  var CELE = '.btn, .sr-book, .sr-call, .op-google, .gateway';
  var OPOZNIENIE = 240;          /* ile trwa pokaz, zanim przeglądarka przejdzie dalej */
  var warstwa = null;

  function dajWarstwe(){
    if (!warstwa || !warstwa.isConnected){
      warstwa = document.createElement('div');
      warstwa.className = 'farba-warstwa';
      warstwa.setAttribute('aria-hidden','true');
      document.body.appendChild(warstwa);
    }
    return warstwa;
  }

  /* --- kleks: losowe promienie wokół okręgu spięte krzywą Catmulla-Roma --- */
  function sciezkaKleksa(ile, promien){
    var p = [], i, kat, r;
    for (i = 0; i < ile; i++){
      kat = (i / ile) * Math.PI * 2;
      r = promien * (0.70 + Math.random() * 0.42);
      if (Math.random() < 0.24) r = promien * (1.18 + Math.random() * 0.46); /* wypustka farby */
      p.push([100 + Math.cos(kat) * r, 100 + Math.sin(kat) * r]);
    }
    var d = 'M' + p[0][0].toFixed(1) + ',' + p[0][1].toFixed(1);
    for (i = 0; i < p.length; i++){
      var p0 = p[(i - 1 + p.length) % p.length],
          p1 = p[i],
          p2 = p[(i + 1) % p.length],
          p3 = p[(i + 2) % p.length];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' +
                 c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' +
                 p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d + 'Z';
  }

  function plama(x, y, kolor, rozmiar){
    var el = document.createElement('span');
    el.className = 'farba';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = rozmiar + 'px';
    el.style.height = rozmiar + 'px';
    el.style.setProperty('--rot', Math.round(Math.random() * 360) + 'deg');
    var svg = '<svg viewBox="0 0 200 200" aria-hidden="true">' +
              '<path d="' + sciezkaKleksa(13, 62) + '" fill="' + kolor + '"/>';
    /* satelity - drobne odpryski dookoła głównej plamy */
    for (var i = 0; i < 5; i++){
      var kat = Math.random() * Math.PI * 2,
          odl = 66 + Math.random() * 30,
          r   = 3 + Math.random() * 7;
      svg += '<circle cx="' + (100 + Math.cos(kat) * odl).toFixed(1) +
             '" cy="' + (100 + Math.sin(kat) * odl).toFixed(1) +
             '" r="' + r.toFixed(1) + '" fill="' + kolor + '"/>';
    }
    el.innerHTML = svg + '</svg>';
    return el;
  }

  function kropla(x, y, kolor){
    var el = document.createElement('span'),
        kat = Math.random() * Math.PI * 2,
        odl = 40 + Math.random() * 120,
        r = 4 + Math.random() * 9;
    el.className = 'kropla';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = r + 'px';
    el.style.height = (r * (0.8 + Math.random() * 0.6)) + 'px';
    el.style.background = kolor;
    el.style.setProperty('--dx', Math.round(Math.cos(kat) * odl) + 'px');
    el.style.setProperty('--dy', Math.round(Math.sin(kat) * odl) + 'px');
    el.style.animationDelay = Math.round(Math.random() * 60) + 'ms';
    return el;
  }

  function strzal(x, y){
    var w = dajWarstwe();
    var kolor = KOLORY[Math.floor(Math.random() * KOLORY.length)];
    var rozmiar = 118 + Math.random() * 74;
    var elementy = [plama(x, y, kolor, rozmiar)];
    var ile = 5 + Math.floor(Math.random() * 4);
    for (var i = 0; i < ile; i++){
      elementy.push(kropla(x, y, Math.random() < 0.25
        ? KOLORY[Math.floor(Math.random() * KOLORY.length)] : kolor));
    }
    elementy.forEach(function(el){ w.appendChild(el); });
    setTimeout(function(){
      elementy.forEach(function(el){ if (el.parentNode) el.parentNode.removeChild(el); });
    }, 1150);
  }
  window.strefaZeroStrzal = strzal;   /* używa tego także ekran powitalny */

  /* --- wpięcie w przyciski ------------------------------------------------ */
  function wlasnaStrona(a){
    if (!a || !a.getAttribute) return false;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#') return false;
    if (/^(tel:|mailto:|javascript:)/i.test(href)) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    return a.host === window.location.host;
  }

  document.addEventListener('click', function(e){
    var cel = e.target.closest ? e.target.closest(CELE) : null;
    if (!cel) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var r = cel.getBoundingClientRect();
    var x = (e.clientX || (r.left + r.width / 2));
    var y = (e.clientY || (r.top + r.height / 2));
    strzal(x, y);

    /* przejście na inną podstronę przytrzymujemy o chwilę, żeby plask było widać;
       telefon, mail i linki zewnętrzne zostawiamy natychmiastowe */
    if (wlasnaStrona(cel)){
      e.preventDefault();
      var adres = cel.href;
      setTimeout(function(){ window.location.href = adres; }, OPOZNIENIE);
    }
  }, true);
})();
