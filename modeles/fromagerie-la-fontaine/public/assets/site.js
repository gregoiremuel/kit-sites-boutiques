/* Statut ouvert/fermé (heure de Paris), jour du jour, menu mobile, plan Google chargé au clic.
   H et INCONNUS sont injectés par build.js à partir de data/infos.json. */
(function () {
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function fmt(m) { var h = Math.floor(m / 60), r = m % 60; return h + 'h' + (r ? (r < 10 ? '0' : '') + r : ''); }

  function maintenant() {
    try {
      var o = {};
      new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { jour: WD[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { jour: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function etat(t) {
    if (INCONNUS.indexOf(t.jour) > -1) return null;
    var i, j, d, s;
    for (i = 0; i < H[t.jour].length; i++) {
      s = H[t.jour][i];
      if (t.min >= s[0] && t.min < s[1]) return { ouvert: true, txt: 'Ouvert en ce moment, jusqu’à ' + fmt(s[1]) + '.' };
    }
    for (i = 0; i < 8; i++) {
      d = (t.jour + i) % 7;
      if (INCONNUS.indexOf(d) > -1) return { ouvert: false, txt: 'Fermé en ce moment.' };
      for (j = 0; j < H[d].length; j++) {
        if (i === 0 && H[d][j][0] <= t.min) continue;
        var h = fmt(H[d][j][0]);
        if (i === 0) return { ouvert: false, txt: (j > 0 ? 'Fermé en ce moment, réouverture à ' : 'Ouvre aujourd’hui à ') + h + '.' };
        return { ouvert: false, txt: (H[t.jour].length ? 'Fermé en ce moment' : 'Fermé aujourd’hui') + ', ouvre ' + (i === 1 ? 'demain' : JOURS[d]) + ' à ' + h + '.' };
      }
    }
    return { ouvert: false, txt: 'Fermé en ce moment.' };
  }

  var t = maintenant(), e = etat(t);
  Array.prototype.forEach.call(document.querySelectorAll('[data-statut]'), function (el) {
    if (!e) return;
    el.querySelector('span').textContent = e.txt;
    el.classList.toggle('is-ferme', !e.ouvert);
    el.hidden = false;
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-jour="' + t.jour + '"]'), function (el) {
    el.classList.add('today');
  });

  /* Mouvement discret : le texte de l'accueil arrive, les parties apparaissent doucement au défilement.
     Rien si le visiteur demande moins d'animations, ni dans l'aperçu de l'espace boutique (classe « calme »). */
  (function () {
    var calme = document.body.classList.contains('calme') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (calme) return;
    document.documentElement.classList.add('anime');
    var els = [];
    Array.prototype.forEach.call(document.querySelectorAll('.sec > .wrap > *, .sec > .wrap > .grid > *'), function (el) {
      if (el.classList.contains('grid')) return;
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.classList.add('rev');
      el.style.transitionDelay = (Math.min(i, 2) * 110) + 'ms';
      els.push(el);
    });
    var montrer = function (el) { el.classList.add('vu'); };
    if (!('IntersectionObserver' in window)) { els.forEach(montrer); return; }
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { montrer(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    els.forEach(function (el) { io.observe(el); });
    /* Filet de sécurité : rien ne reste caché (liens vers #demande, #horaires…) */
    var filet = function () { els.forEach(function (el) { if (!el.classList.contains('vu') && el.getBoundingClientRect().top < innerHeight) montrer(el); }); };
    setTimeout(filet, 2500); window.addEventListener('hashchange', function () { setTimeout(filet, 400); });
  })();

  /* Liens vers une rubrique de la page (#produits…) : dans un aperçu (démonstration, espace de modification),
     la page est affichée dans un cadre et le navigateur comprendrait le lien comme une autre page.
     On fait alors défiler nous-mêmes jusqu'à la rubrique. Sur le site en ligne, le navigateur s'en charge. */
  if (location.protocol === 'about:') {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = decodeURIComponent(a.getAttribute('href').slice(1));
      var cible = id && document.getElementById(id);
      if (!cible) return;
      e.preventDefault();
      var doux = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      setTimeout(function () {
        cible.scrollIntoView({ behavior: doux ? 'smooth' : 'auto', block: 'start' });
        if (!cible.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(cible.tagName)) cible.setAttribute('tabindex', '-1');
        try { cible.focus({ preventScroll: true }); } catch (x) { /* rien */ }
      }, 0);
    });
  }

  var btn = document.getElementById('menu-btn'), sheet = document.getElementById('menu');
  if (btn && sheet) {
    var regler = function (ouvrir) {
      sheet.hidden = !ouvrir;
      btn.setAttribute('aria-expanded', String(ouvrir));
      document.documentElement.classList.toggle('menu-ouvert', ouvrir);
      if (ouvrir) { var a = sheet.querySelector('a,button'); if (a) a.focus(); } else { btn.focus(); }
    };
    btn.addEventListener('click', function () { regler(sheet.hidden); });
    sheet.addEventListener('click', function (ev) {
      if (ev.target.closest('a') || ev.target.closest('[data-fermer]')) regler(false);
    });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !sheet.hidden) regler(false); });
  }

  document.documentElement.classList.add('js');

  /* Vidéo de fond : pause au clic, et à l'arrêt si le visiteur a demandé moins d'animations */
  (function () {
    var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>', LECTURE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5l11 6.5-11 6.5z"/></svg>';
    Array.prototype.forEach.call(document.querySelectorAll('[data-video-fond]'), function (v) {
      var b = v.parentNode.querySelector('[data-video-pause]');
      var etat = function (pause) { if (!b) return; b.setAttribute('aria-pressed', String(pause)); b.setAttribute('aria-label', pause ? 'Lancer la vidéo' : 'Mettre la vidéo en pause'); b.innerHTML = pause ? LECTURE : PAUSE; };
      var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (calme) { v.removeAttribute('autoplay'); try { v.pause(); } catch (e) { /* rien */ } etat(true); }
      v.addEventListener('error', function () { setTimeout(function () { if (b && (v.error || v.networkState === 3)) b.hidden = true; }, 0); }, true);
      if (b) b.addEventListener('click', function () { if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); etat(false); } else { v.pause(); etat(true); } });
    });
  })();
  var bar = document.querySelector('.bar'), heroBtns = document.querySelector('.hero .actions');
  if (bar && heroBtns && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { bar.classList.toggle('on', !en[0].isIntersecting); }).observe(heroBtns);
  } else if (bar) { bar.classList.add('on'); }

  Array.prototype.forEach.call(document.images, function (im) {
    var cacher = function () { im.style.visibility = 'hidden'; };
    if (im.complete && im.naturalWidth === 0) cacher(); else im.addEventListener('error', cacher);
  });

  if (window.matchMedia && window.matchMedia('(min-width: 900px)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('details.famille'), function (d) { d.open = true; });
  }

  var plan = document.getElementById('plan-btn');
  if (plan) {
    plan.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = plan.getAttribute('data-src');
      f.title = 'Plan d’accès (Google Maps)';
      f.setAttribute('allowfullscreen', '');
      f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      var box = plan.closest('.carte-box');
      box.innerHTML = '';
      box.classList.add('carte-ouverte');
      box.appendChild(f);
    });
  }

  /* ---------- Demande en ligne : commande à retirer ou demande de devis ---------- */
  var cf = document.getElementById('cmd-form');
  if (CMD && cf) {
    var V = CMD.voc;
    var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var pers = document.getElementById('cmd-pers'), dateIn = document.getElementById('cmd-date'), heure = document.getElementById('cmd-heure');
    var infoJour = document.getElementById('cmd-jour'), estim = document.getElementById('cmd-estim');
    var erreur = document.getElementById('cmd-erreur'), okBox = document.getElementById('cmd-ok'), envoyer = cf.querySelector('.cmd-envoyer');
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var deIso = function (s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2], 12); };
    var joli = function (d) { return JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]; };
    var euros = function (n) { return (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0).replace('.', ',') + ' €'; };
    var escH = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

    var o = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    } catch (e) { var n0 = new Date(); o = { year: n0.getFullYear(), month: n0.getMonth() + 1, day: n0.getDate(), hour: n0.getHours() }; }
    var premier = new Date(+o.year, +o.month - 1, +o.day, 12);
    premier.setDate(premier.getDate() + Math.floor(((+o.hour % 24) + CMD.delai) / 24));
    var dernier = new Date(premier); dernier.setDate(dernier.getDate() + 180);
    dateIn.min = iso(premier); dateIn.max = iso(dernier);

    var creneauxDu = function (d) {
      var out = [];
      (H[d.getDay()] || []).forEach(function (s) { for (var m = s[0]; m <= s[1] - 30; m += 30) out.push(m); });
      return out;
    };
    var majHeures = function () {
      if (!heure) return;
      heure.innerHTML = ''; heure.disabled = true;
      if (!dateIn.value) { infoJour.textContent = ''; return; }
      var d = deIso(dateIn.value);
      if (dateIn.value < dateIn.min) { infoJour.textContent = 'Il faut au moins ' + CMD.delai + ' h d’avance : choisissez un jour à partir du ' + joli(premier) + '.'; return; }
      var c = creneauxDu(d);
      if (!c.length) { heure.innerHTML = '<option value="">Fermé</option>'; infoJour.textContent = 'Fermé le ' + JOURS[d.getDay()] + '. Choisissez un autre jour.'; return; }
      heure.innerHTML = c.map(function (m) { return '<option>' + fmt(m) + '</option>'; }).join('');
      heure.disabled = false;
      infoJour.textContent = V.jourPhrase + ' ' + joli(d) + '.';
    };
    if (heure) {
      var defaut = new Date(premier);
      for (var k = 0; k < 14 && !creneauxDu(defaut).length; k++) defaut.setDate(defaut.getDate() + 1);
      dateIn.value = iso(defaut);
      dateIn.addEventListener('change', majHeures);
      majHeures();
    }

    var choisi = function () { var r = cf.querySelector('input[name="offre"]:checked'); return r ? CMD.offres[+r.value] : null; };
    var majEstimation = function () {
      if (!pers || !estim) return;
      var p = choisi(), n = +pers.value;
      if (p && p.prixUnite && n) { estim.textContent = 'Estimation : ' + n + ' × ' + euros(p.prixUnite) + ' = ' + euros(n * p.prixUnite) + ', à confirmer avec ' + V.qui + '.'; estim.hidden = false; }
      else estim.hidden = true;
    };
    if (pers) {
      var borner = function () { var n = Math.round(+pers.value) || CMD.min; pers.value = Math.min(CMD.max, Math.max(CMD.min, n)); majEstimation(); };
      cf.addEventListener('click', function (e) { var b = e.target.closest('[data-pas]'); if (b) { pers.value = (+pers.value || CMD.min) + (+b.dataset.pas); borner(); } });
      pers.addEventListener('change', borner);
      pers.addEventListener('input', majEstimation);
    }
    cf.addEventListener('change', function (e) { if (e.target.name === 'offre') majEstimation(); });
    majEstimation();

    var montrerErreur = function (h) { erreur.innerHTML = h; erreur.hidden = false; };
    var telBoutique = '<a href="tel:' + CMD.telephone.replace(/[^\d+]/g, '').replace(/^0/, '+33') + '">' + escH(CMD.telephone) + '</a>';

    var envoyerDemande = function (e) {
      if (e) e.preventDefault();
      erreur.hidden = true;
      var p = choisi(), nom = cf.nom.value.trim(), tel = cf.telephone.value.trim(), mail = cf.email.value.trim(), msg = cf.message.value.trim();
      var manque = [];
      if (!p) manque.push('votre choix');
      if (!V.devis && (!dateIn.value || dateIn.value < dateIn.min || !heure || heure.disabled || !heure.value)) manque.push('un jour d’ouverture');
      if (V.devis && dateIn.value && (dateIn.value < dateIn.min || dateIn.value > dateIn.max)) manque.push('une date à partir du ' + joli(premier));
      if (V.devis && !msg) manque.push('la description de votre demande');
      if (!nom) manque.push('votre nom');
      if (tel.replace(/\D/g, '').length < 9) manque.push('un numéro de téléphone');
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) manque.push('une adresse e-mail valide (ou laissez le champ vide)');
      if (manque.length) { montrerErreur('Il manque ' + manque.join(', ') + '.'); return; }

      var n = pers ? +pers.value : null, d = dateIn.value ? deIso(dateIn.value) : null;
      var lignes = [[V.offre, p.nom]];
      if (n) lignes.push([V.quantite, String(n)]);
      if (d) lignes.push([V.date, joli(d) + ' ' + d.getFullYear() + (heure ? ', ' + heure.value : '')]);
      lignes.push([V.precisions, msg || '(rien de particulier)']);
      lignes.push(['Nom', nom], ['Téléphone', tel]);
      if (mail) lignes.push(['E-mail', mail]);
      if (n && p.prixUnite) lignes.push(['Estimation', euros(n * p.prixUnite)]);
      var sujet = V.sujet + ' : ' + p.nom + (n ? ', ' + n + (V.unite ? ' ' + V.unite : '') : '') + (d ? ', ' + joli(d) + (heure ? ' ' + heure.value : '') : '');
      var texte = lignes.map(function (l) { return l[0] + ' : ' + l[1]; }).join('\n');

      var fini = function (titre, m) {
        okBox.innerHTML = '<h3>' + titre + '</h3><p>' + escH(m) + '</p><dl class="recap">' +
          lignes.map(function (l) { return '<dt>' + escH(l[0]) + '</dt><dd>' + escH(l[1]) + '</dd>'; }).join('') +
          '</dl><div class="actions"><button class="btn btn-contour" type="button" id="cmd-autre">Faire une autre demande</button></div>';
        cf.hidden = true; okBox.hidden = false; okBox.focus();
        document.getElementById('cmd-autre').addEventListener('click', function () { okBox.hidden = true; cf.hidden = false; cf.message.value = ''; });
      };
      var secours = CMD.email ? ', ou <a href="mailto:' + escH(CMD.email) + '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(texte) + '">envoyez la demande depuis votre messagerie</a>' : '';

      if (cf.botcheck.checked) { fini('Demande envoyée', CMD.confirmation); return; }
      if (CMD.maquette) { fini('Aperçu de la demande', 'Démonstration : rien n’a été envoyé. Une fois le site en ligne, ' + V.qui + ' reçoit exactement ce message.'); return; }
      if (CMD.api || CMD.cle) {
        var envois = [];
        if (CMD.api) {
          envois.push(fetch(CMD.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sujet: sujet, lignes: lignes, nom: nom, telephone: tel, quantite: n }) })
            .then(function (r) { if (!r.ok) throw new Error('refus'); }));
        }
        if (CMD.cle) {
          var fd = new FormData();
          fd.append('access_key', CMD.cle);
          fd.append('subject', sujet);
          fd.append('from_name', 'Site ' + CMD.boutique);
          if (mail) fd.append('email', mail);
          lignes.forEach(function (l) { fd.append(l[0], l[1]); });
          envois.push(fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
            .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.success) throw new Error('refus'); }); }));
        }
        envoyer.disabled = true; envoyer.textContent = 'Envoi…';
        var reussi = false, restants = envois.length;
        envois.forEach(function (pr) {
          pr.then(function () { reussi = true; }, function () {}).then(function () {
            if (--restants) return;
            envoyer.disabled = false; envoyer.textContent = 'Envoyer la demande';
            if (reussi) fini('Demande envoyée', CMD.confirmation);
            else montrerErreur('L’envoi n’a pas abouti. Appelez au ' + telBoutique + secours + '.');
          });
        });
        return;
      }
      if (CMD.email) {
        location.href = 'mailto:' + CMD.email + '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(texte);
        fini('Dernière étape', 'Votre messagerie s’ouvre avec la demande déjà rédigée : envoyez-la pour la transmettre ' + V.a + '.');
        return;
      }
      montrerErreur('Les demandes en ligne ne sont pas encore ouvertes. Appelez au ' + telBoutique + '.');
    };
    /* bouton simple (pas « submit ») : fonctionne aussi dans les aperçus qui bloquent les formulaires */
    envoyer.addEventListener('click', envoyerDemande);
    cf.addEventListener('submit', envoyerDemande);
  }
})();
