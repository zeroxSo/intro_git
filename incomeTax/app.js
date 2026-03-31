// 簡易 所得税計算ロジック (JavaScript)
(function(){
  const ids = {
    interest: 'income-interest',
    dividend: 'income-dividend',
    realEstate: 'income-real-estate',
    business: 'income-business',
    salary: 'income-salary',
    retirement: 'income-retirement',
    forestry: 'income-forestry',
    capital: 'income-capital',
    temporary: 'income-temporary',
    misc: 'income-misc',
    deductions: 'deductions',
    credits: 'tax-credits'
  };

  const fmt = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });

  function el(id){ return document.getElementById(id); }

  function num(id){
    const v = parseFloat(el(id).value);
    return Number.isFinite(v) ? v : 0;
  }

  function sumIncomes(){
    return num(ids.interest)
      + num(ids.dividend)
      + num(ids.realEstate)
      + num(ids.business)
      + num(ids.salary)
      + num(ids.retirement)
      + num(ids.forestry)
      + num(ids.capital)
      + num(ids.temporary)
      + num(ids.misc);
  }

  // 日本の所得税（簡易・説明用）: 概算で累進課税を適用する関数
  const TAX_BRACKETS = [
    { up: 1950000, rate: 0.05 },
    { up: 3300000, rate: 0.10 },
    { up: 6950000, rate: 0.20 },
    { up: 9000000, rate: 0.23 },
    { up: 18000000, rate: 0.33 },
    { up: 40000000, rate: 0.40 },
    { up: Infinity, rate: 0.45 }
  ];

  function computeTax(taxable){
    if (taxable <= 0) return 0;
    let remaining = taxable;
    let prev = 0;
    let tax = 0;
    for (const b of TAX_BRACKETS){
      const slice = Math.min(remaining, b.up - prev);
      if (slice > 0){
        tax += slice * b.rate;
        remaining -= slice;
      }
      prev = b.up;
      if (remaining <= 0) break;
    }
    return tax;
  }

  function calculate(){
    const totalIncome = sumIncomes();
    const deductions = Math.max(0, num(ids.deductions));
    const credits = Math.max(0, num(ids.credits));

    const taxableStandard = Math.max(0, totalIncome); // 課税標準（ここでは総所得金額）
    const taxableIncome = Math.max(0, taxableStandard - deductions);

    const taxBeforeCredits = computeTax(taxableIncome);
    const finalTax = Math.max(0, taxBeforeCredits - credits);

    return {
      totalIncome,
      deductions,
      credits,
      taxableStandard,
      taxableIncome,
      taxBeforeCredits,
      finalTax
    };
  }

  function renderResults(r){
    const results = el('results');
    const cont = el('results-content');
    cont.innerHTML = '';
    const rows = [
      ['総所得金額（合計）', fmt.format(Math.round(r.totalIncome))],
      ['課税標準（総所得）', fmt.format(Math.round(r.taxableStandard))],
      ['所得控除 合計', fmt.format(Math.round(r.deductions))],
      ['課税所得金額', fmt.format(Math.round(r.taxableIncome))],
      ['所得税（控除前）', fmt.format(Math.round(r.taxBeforeCredits))],
      ['税額控除 合計', fmt.format(Math.round(r.credits))],
      ['申告納税額（概算）', fmt.format(Math.round(r.finalTax))]
    ];
    for (const [k,v] of rows){
      const d = document.createElement('div');
      d.className = 'row';
      d.innerHTML = `<strong style="width:240px">${k}</strong><div>${v}</div>`;
      cont.appendChild(d);
    }
    results.hidden = false;
  }

  function resetForm(){
    document.getElementById('tax-form').reset();
    el('results').hidden = true;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = el('calculate');
    const rst = el('reset');
    btn.addEventListener('click', () => {
      const res = calculate();
      renderResults(res);
    });
    rst.addEventListener('click', resetForm);
  });

})();
