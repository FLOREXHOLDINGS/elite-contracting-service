// Elite Contracting Service — multi-step request form.
// The form asks the questions for the service picked, and only those.
// On finish it writes the request out and hands it to the customer's own
// messages app (sms:) addressed to the company number. Nothing is faked.
(function () {
  var form = document.getElementById('svc-form');
  if (!form) return;

  var RULES = {
    wildlife: '<strong>The inspection rule.</strong> $149 when the animal is confirmed inside the structure or burrowing under one. Not confirmed, the call goes straight to a removal period — no inspection fee. Chipmunks confirmed inside the house: inspection free.',
    rodent: '<strong>Paid inspection first.</strong> Every rodent call starts with one; the amount is set when it\'s booked. Removal is priced at the inspection, never over the phone. No poison is used — ever.',
    bat: '<strong>One bat, residential: $349</strong>, paid before scheduling. If the bat is gone when we arrive, the $349 stands — it pays for the trip and the search. More than one bat, or signs of a colony, is priced by free estimate.',
    dead: '<strong>Paid before scheduling.</strong> Small $489 / medium $649 / large $889. Worse than described when we arrive: full refund and no job, or an added charge agreed on site before work starts.',
    bird: '<strong>Photos first.</strong> No vent job is scheduled until the three photos are in: the vent close up, a wide shot showing the height, and the ground and access below. Tiers: $349 no ladder / $449 one story / $549 above. Paid before scheduling.',
    insulation: '<strong>Priced by free estimate</strong> — in person, after the look. One number for the whole job.',
    exclusion: '<strong>Priced by free estimate</strong> — in person, after the look. The work is photographed before, during, and after.',
    repairs: '<strong>Priced by free estimate</strong> — in person, after the look. Minor plumbing and electrical only; nothing major that requires a license.',
    cleaning: '<strong>$74.75 per cleaner per hour.</strong> Minimum $224.25 a visit; deep and one-time minimum $448.50. Elite brings all supplies and equipment. Cleaning covers Yates, Ontario, Schuyler, and Steuben counties.',
    additions: '<strong>Priced by free estimate</strong> — in person, after the look. Single-story additions; permits handled.'
  };
  var NEXT = {
    wildlife: 'What happens next: we call you back, set the inspection or the removal period per the rule above, and give you the number plainly.',
    rodent: 'What happens next: we call you back and book the paid inspection. The removal price is set at that inspection — never over the phone.',
    bat: 'What happens next: we call you back to schedule. The $349 is paid before scheduling.',
    dead: 'What happens next: we call you back to schedule. The price for the size you picked is paid before scheduling.',
    bird: 'What happens next: we look at your three photos, confirm the tier, and call you back to schedule. Payment comes before scheduling.',
    insulation: 'What happens next: we call you back and set a free estimate visit.',
    exclusion: 'What happens next: we call you back and set a free estimate visit.',
    repairs: 'What happens next: we call you back and set a free estimate visit.',
    cleaning: 'What happens next: we call you back, confirm the crew size and the time, and give you the number.',
    additions: 'What happens next: we call you back and set a free estimate visit.'
  };

  function radio(name, legend, options) {
    var h = '<fieldset class="radio-group"><legend>' + legend + '</legend>';
    options.forEach(function (o) {
      h += '<label><input type="radio" name="' + name + '" value="' + o + '"> ' + o + '</label>';
    });
    return h + '</fieldset>';
  }
  function text(name, label, area) {
    return '<label>' + label + (area
      ? '<textarea name="' + name + '"></textarea></label>'
      : '<input type="text" name="' + name + '"></label>');
  }
  function photos() {
    return '<label>Photo 1 — the vent, close up<input type="file" name="photo1" accept="image/*"></label>' +
           '<label>Photo 2 — wide shot showing the height<input type="file" name="photo2" accept="image/*"></label>' +
           '<label>Photo 3 — the ground and access below<input type="file" name="photo3" accept="image/*"></label>' +
           '<p class="note">Photos are attached when you text the request in — keep them on this device.</p>';
  }

  var SERVICES = [
    { id: 'insulation', name: 'Insulation', fields: function () {
        return radio('scope', 'What do you need?', ['Removal', 'Installation', 'Both']) +
               radio('where', 'Where?', ['Attic', 'Crawlspace', 'Basement']) +
               text('size', 'Approximate size (square feet, if you know it)'); } },
    { id: 'rodent', name: 'Rodent Control', fields: function () {
        return text('signs', 'What signs have you seen?', true) +
               text('where', 'Where have you seen them?'); } },
    { id: 'wildlife', name: 'Wildlife Removal', fields: function () {
        return radio('animal', 'Which animal?', ['Raccoon', 'Skunk', 'Groundhog', 'Opossum', 'Squirrel', 'Chipmunk', 'Snake', 'Not sure']) +
               radio('confirmed', 'Where is it?', ['Confirmed inside the home', 'Burrowing under a structure (deck, porch, shed)', 'Outside only', 'Not sure']) +
               text('where', 'Where in the property?'); } },
    { id: 'bat', name: 'Bat Removal', fields: function () {
        return radio('howmany', 'What have you seen?', ['One bat inside', 'Signs of more than one / a colony']) +
               text('where', 'Where in the house?'); } },
    { id: 'dead', name: 'Dead Animal Removal', fields: function () {
        return radio('size', 'How big?', ['Small — rodent size', 'Medium — skunk, raccoon size', 'Large — deer size']) +
               text('where', 'Where is it?') + text('access', 'How is it reached?'); } },
    { id: 'bird', name: 'Bird Control & Vent Removal', fields: function () {
        return radio('height', 'How high is the vent?', ['Reachable without a ladder', 'One story', 'Above one story']) + photos(); } },
    { id: 'exclusion', name: 'Exclusion Repairs', fields: function () {
        return text('describe', 'Describe the opening or the damage', true); } },
    { id: 'repairs', name: 'Carpentry & Interior Repairs', fields: function () {
        return text('describe', 'Describe the work', true); } },
    { id: 'cleaning', name: 'Cleaning', fields: function () {
        return radio('kind', 'Which clean?', ['Regular / recurring', 'Deep clean', 'Move-in / move-out', 'Lake-home / rental turnover', 'One-time / spring']) +
               text('size', 'Home size (bedrooms / bathrooms)') +
               radio('often', 'How often?', ['One time', 'Weekly', 'Every two weeks', 'Monthly', 'Per rental turn']); } },
    { id: 'additions', name: 'Additions', fields: function () {
        return text('describe', 'Describe the addition you have in mind', true); } }
  ];

  var OUT_OF_AREA = ['buffalo', 'norwich'];
  var CLEANING_TOWNS_OK = null; // cleaning area is county-based; checked by the callback conversation

  var chosen = null;
  var cards = document.getElementById('svc-cards');
  var pickService = function () {}; // replaced after cards are built
  var steps = form.querySelectorAll('.form-step');
  var progress = document.getElementById('form-progress');

  var cardBtns = {};
  SERVICES.forEach(function (s) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'svc-card'; b.textContent = s.name;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { selectService(s, true); });
    cards.appendChild(b);
    cardBtns[s.id] = b;
  });
  function selectService(s, advance) {
    chosen = s;
    cards.querySelectorAll('.svc-card').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
    cardBtns[s.id].setAttribute('aria-pressed', 'true');
    document.getElementById('step2-title').textContent = s.name + ' — about the job';
    var rp = document.getElementById('rule-panel');
    rp.innerHTML = RULES[s.id]; rp.hidden = false;
    document.getElementById('step2-fields').innerHTML = s.fields();
    if (advance) goTo(2);
  }
  // Arriving from a service or city page: contact.html?service=wildlife preselects it.
  var pre = new URLSearchParams(window.location.search).get('service');
  if (pre) {
    var match = SERVICES.filter(function (s) { return s.id === pre; })[0];
    if (match) selectService(match, true);
  }

  function goTo(n) {
    steps.forEach(function (st) {
      st.hidden = st.getAttribute('data-step') !== String(n);
    });
    progress.textContent = n === 'done' ? 'Done' : 'Step ' + n + ' of 3';
    window.scrollTo({ top: form.offsetTop - 96, behavior: 'smooth' });
  }

  form.querySelectorAll('[data-back]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cur = form.querySelector('.form-step:not([hidden])').getAttribute('data-step');
      goTo(cur === '3' ? 2 : 1);
    });
  });
  form.querySelector('[data-next]').addEventListener('click', function () { goTo(3); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!chosen) { goTo(1); return; }
    var fd = new FormData(form);
    var name = (fd.get('name') || '').toString().trim();
    var phone = (fd.get('phone') || '').toString().trim();
    var town = (fd.get('town') || '').toString().trim();
    var warn = document.getElementById('area-warning');
    var bad = false;
    [['name', name], ['phone', phone], ['town', town]].forEach(function (pair) {
      var input = form.querySelector('[name="' + pair[0] + '"]');
      input.classList.toggle('field-error', !pair[1]);
      if (!pair[1]) bad = true;
    });
    if (bad) { warn.hidden = false; warn.textContent = 'Name, phone, and town are needed so we can reach you.'; return; }
    var townLow = town.toLowerCase();
    var out = OUT_OF_AREA.some(function (t) { return townLow.indexOf(t) !== -1; });
    if (out) {
      warn.hidden = false;
      warn.textContent = town + ' is outside the service area — the truck doesn\'t run there. If the property is somewhere else, change the town; otherwise call (315) 540-0137 and we\'ll tell you plainly.';
      return;
    }
    warn.hidden = true;

    var lines = ['Elite Contracting Service — service request', 'Service: ' + chosen.name];
    var seen = {};
    fd.forEach(function (v, k) {
      if (['name', 'phone', 'town', 'besttime'].indexOf(k) !== -1) return;
      if (v && typeof v === 'string' && v.trim()) { lines.push(k + ': ' + v.trim()); seen[k] = 1; }
      if (v && v.name) { lines.push(k + ': photo attached (' + v.name + ')'); }
    });
    lines.push('Name: ' + name, 'Phone: ' + phone, 'Town: ' + town,
               'Best time: ' + (fd.get('besttime') || ''));
    var summary = lines.join('\n');
    document.getElementById('summary').textContent = summary;
    document.getElementById('done-next').textContent = NEXT[chosen.id];
    document.getElementById('send-text').href =
      'sms:+13155400137?&body=' + encodeURIComponent(summary);
    goTo('done');
  });
})();
