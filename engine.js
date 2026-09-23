/* SecondSpin engine - pure resale-math, shared by app.html and node tests. */
(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SecondSpinEngine = factory();
})(typeof self !== 'undefined' ? self : this, function(){

  /* annual depreciation rate by category (fraction of remaining value lost per year) */
  var RATES = {
    phone: 0.40,
    laptop: 0.35,
    tablet: 0.35,
    camera: 0.28,
    electronics: 0.30,
    ebike: 0.25,
    bike: 0.20,
    appliance: 0.18,
    furniture: 0.20,
    instrument: 0.12,
    clothing: 0.45,
    other: 0.25
  };

  var CONDITION = {
    'like new': 0.92,
    'good': 0.75,
    'fair': 0.55,
    'poor': 0.30
  };

  var FLOOR = 0.05; /* never worth less than 5% of original */

  function yearsOwned(purchaseISO, todayISO){
    var a = purchaseISO.split('-'), b = todayISO.split('-');
    var da = Date.UTC(+a[0], +a[1] - 1, +a[2]);
    var db = Date.UTC(+b[0], +b[1] - 1, +b[2]);
    var ms = db - da;
    if (ms < 0) return 0;
    return ms / (365.25 * 86400000);
  }

  function rateFor(category){
    return RATES.hasOwnProperty(category) ? RATES[category] : RATES.other;
  }

  /* raw depreciated value before condition and floor */
  function depreciatedValue(original, category, years){
    var r = rateFor(category);
    return original * Math.pow(1 - r, years);
  }

  /* resale estimate in whole currency units */
  function estimate(original, category, purchaseISO, condition, todayISO){
    var years = yearsOwned(purchaseISO, todayISO);
    var dep = depreciatedValue(original, category, years);
    var cond = CONDITION.hasOwnProperty(condition) ? CONDITION[condition] : CONDITION.good;
    var v = dep * cond;
    var floor = original * FLOOR;
    if (v < floor) v = floor;
    return Math.round(v);
  }

  /* value N months from now (same condition) */
  function estimateInMonths(original, category, purchaseISO, condition, todayISO, months){
    var a = todayISO.split('-');
    var d = new Date(Date.UTC(+a[0], +a[1] - 1, +a[2]));
    d.setUTCMonth(d.getUTCMonth() + months);
    var future = d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);
    return estimate(original, category, purchaseISO, condition, future);
  }

  /* verdict from the curve shape */
  function verdict(original, category, purchaseISO, condition, todayISO){
    var now = estimate(original, category, purchaseISO, condition, todayISO);
    var in6 = estimateInMonths(original, category, purchaseISO, condition, todayISO, 6);
    if (now <= original * 0.15) return { action: 'donate', now: now, in6: in6, reason: 'past the resale floor - selling costs more effort than it returns' };
    if (now > 0 && (now - in6) / now >= 0.15) return { action: 'sell soon', now: now, in6: in6, reason: 'losing ' + Math.round((now - in6) / now * 100) + '% of its remaining value in the next 6 months' };
    return { action: 'keep', now: now, in6: in6, reason: 'holding value fine - no rush' };
  }

  function fmtMoney(n){
    var s = String(Math.round(n));
    var out = '';
    while (s.length > 3){ out = ',' + s.slice(-3) + out; s = s.slice(0, -3); }
    return '$' + s + out;
  }

  function pctOfOriginal(original, est){
    if (original <= 0) return 0;
    return Math.round(est / original * 100);
  }

  return {
    RATES: RATES,
    yearsOwned: yearsOwned,
    rateFor: rateFor,
    depreciatedValue: depreciatedValue,
    estimate: estimate,
    estimateInMonths: estimateInMonths,
    verdict: verdict,
    fmtMoney: fmtMoney,
    pctOfOriginal: pctOfOriginal
  };
});
