/* Agence : menu et demande de contact. Sans bibliothèque. */
(function () {
  'use strict';
  var A = window.AGENCE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  document.documentElement.classList.add('js');

  /* Photos manquantes : on les cache */
  $$('img').forEach(function (im) { im.addEventListener('error', function () { im.style.visibility = 'hidden'; }); });

  /* Aperçu (espace de modification, démonstration) : les liens internes changent la page affichée par le parent */
  if (A.apercu) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var h = a.getAttribute('href');
      if (h && h.charAt(0) === '/') { e.preventDefault(); try { parent.postMessage({ agence: 'aller', chemin: h }, '*'); } catch (x) { /* rien */ } }
    }, true);
  }

  /* Menu (téléphone) */
  var btn = $('#menu-btn'), volet = $('#menu');
  if (btn && volet) {
    var ouvrir = function (o) {
      volet.hidden = !o; btn.setAttribute('aria-expanded', String(o));
      document.documentElement.classList.toggle('menu-ouvert', o);
      if (o) { var a = $('a', volet); if (a) a.focus(); } else btn.focus();
    };
    btn.addEventListener('click', function () { ouvrir(volet.hidden); });
    volet.addEventListener('click', function (e) { if (e.target.closest('[data-fermer]') || e.target.closest('a')) ouvrir(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !volet.hidden) ouvrir(false); });
  }

  /* Demande de contact */
  var form = $('#demande');
  if (!form) return;
  var erreur = $('.demande-erreur', form), bouton = $('[data-envoyer]', form), okBox = $('.demande-ok');
  var val = function (n) { var f = form.elements[n]; return f ? String(f.value || '').trim() : ''; };
  var montrer = function (h) { erreur.innerHTML = h; erreur.hidden = false; };
  var envoyer = function (e) {
    if (e) e.preventDefault();
    erreur.hidden = true;
    var d = { nom: val('nom'), societe: val('societe'), email: val('email'), telephone: val('telephone'), type: val('type'), surface: val('surface'), ville: val('ville'), message: val('message') };
    var manque = [];
    if (!d.nom) manque.push('votre nom');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) manque.push('une adresse e-mail valide');
    if (d.telephone.replace(/\D/g, '').length < 6) manque.push('un numéro de téléphone');
    if (manque.length) { montrer('Il manque ' + manque.join(', ') + '.'); return; }
    var recap = [['Nom', d.nom], ['Société', d.societe], ['E-mail', d.email], ['Téléphone', d.telephone], ['Type de locaux', d.type], ['Surface', d.surface], ['Ville du projet', d.ville], ['Projet', d.message]].filter(function (l) { return l[1]; });
    var sujet = 'Demande de projet' + (d.type ? ' : ' + d.type : '') + (d.societe ? ' (' + d.societe + ')' : '');
    var fini = function (titre, texte) {
      okBox.innerHTML = '<h2>' + esc(titre) + '</h2><p>' + esc(texte) + '</p><dl>' + recap.map(function (l) { return '<dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd>'; }).join('') + '</dl>';
      form.hidden = true; okBox.hidden = false; okBox.focus();
    };
    if (form.elements.botcheck && form.elements.botcheck.checked) { fini('Demande envoyée', A.confirmation); return; }
    if (A.maquette) { fini('Aperçu de la demande', 'Démonstration : rien n’a été envoyé. Une fois le site en ligne, l’agence reçoit exactement ce message.'); return; }
    var envois = [];
    if (A.api) envois.push(fetch(A.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(function (r) { if (!r.ok) throw new Error('refus'); }));
    if (A.cle) {
      var fd = new FormData();
      fd.append('access_key', A.cle); fd.append('subject', sujet); fd.append('from_name', 'Site ' + A.nom); fd.append('email', d.email);
      recap.forEach(function (l) { fd.append(l[0], l[1]); });
      envois.push(fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: fd }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.success) throw new Error('refus'); }); }));
    }
    if (!envois.length) {
      if (A.email) { location.href = 'mailto:' + A.email + '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(recap.map(function (l) { return l[0] + ' : ' + l[1]; }).join('\n')); fini('Dernière étape', 'Votre messagerie s’ouvre avec la demande déjà rédigée : envoyez-la.'); return; }
      montrer('Le formulaire n’est pas encore ouvert.'); return;
    }
    bouton.disabled = true; bouton.textContent = 'Envoi…';
    var ok = false, restants = envois.length;
    envois.forEach(function (pr) {
      pr.then(function () { ok = true; }, function () {}).then(function () {
        if (--restants) return;
        bouton.disabled = false; bouton.textContent = 'Envoyer la demande';
        if (ok) fini('Demande envoyée', A.confirmation);
        else montrer('L’envoi n’a pas abouti. Réessayez dans un instant' + (A.email ? ', ou écrivez à <a href="mailto:' + esc(A.email) + '">' + esc(A.email) + '</a>' : '') + '.');
      });
    });
  };
  bouton.addEventListener('click', envoyer);
  form.addEventListener('submit', envoyer);
})();
