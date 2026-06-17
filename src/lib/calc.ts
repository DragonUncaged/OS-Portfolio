export function evaluate(input: string): number | null {
  const src = input.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  if (!src || !/^[\d.+\-*/%^()]+$/.test(src)) return null;
  let i = 0;

  const number = (): number | null => {
    const m = /^\d*\.?\d+(?:e[+-]?\d+)?/.exec(src.slice(i)) ?? /^\d+\./.exec(src.slice(i));
    if (!m) return null;
    i += m[0].length;
    return parseFloat(m[0]);
  };

  const atom = (): number | null => {
    if (src[i] === "-") {
      i++;
      const v = atom();
      return v === null ? null : -v;
    }
    if (src[i] === "+") {
      i++;
      return atom();
    }
    if (src[i] === "(") {
      i++;
      const v = sum();
      if (src[i] !== ")") return null;
      i++;
      return percent(v);
    }
    return percent(number());
  };

  const percent = (v: number | null): number | null => {
    while (v !== null && src[i] === "%") {
      i++;
      v = v / 100;
    }
    return v;
  };

  const power = (): number | null => {
    const base = atom();
    if (base === null) return null;
    if (src[i] === "^") {
      i++;
      const exp = power();
      return exp === null ? null : Math.pow(base, exp);
    }
    return base;
  };

  const product = (): number | null => {
    let v = power();
    while (v !== null && (src[i] === "*" || src[i] === "/")) {
      const op = src[i++];
      const r = power();
      if (r === null) return null;
      v = op === "*" ? v * r : v / r;
    }
    return v;
  };

  function sum(): number | null {
    let v = product();
    while (v !== null && (src[i] === "+" || src[i] === "-")) {
      const op = src[i++];
      const r = product();
      if (r === null) return null;
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  const result = sum();
  if (result === null || i !== src.length || !Number.isFinite(result)) return null;
  return result;
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-7)) return n.toExponential(6).replace(/\.?0+e/, "e");
  const rounded = Number(n.toPrecision(12));
  const [int, frac] = String(rounded).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}
