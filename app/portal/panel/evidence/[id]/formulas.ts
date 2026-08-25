// import type { CriterionHeader } from "@/types/new/evidence-panel";

// export const DEFAULT_ROUND = 4;
// export const FORMULA_FUNCTIONS = [
//   "min", "max", "abs", "round", "sqrt", "floor", "ceil",
//   "pow", "log", "log10", "exp", "sum", "iif",
// ];

// class FormulaError extends Error {}

// /* ── tokenizer ─────────────────────────────── */
// type Tok =
//   | { t: "num"; v: number } | { t: "str"; v: string }
//   | { t: "id"; v: string } | { t: "op"; v: string } | { t: "punc"; v: string };

// function tokenize(src: string): Tok[] {
//   const toks: Tok[] = [];
//   const two = ["==", "!=", "<=", ">=", "&&", "||"];
//   let i = 0;
//   while (i < src.length) {
//     const c = src[i];
//     if (c === " " || c === "\t" || c === "\n" || c === "\r") { i++; continue; }
//     if (c === '"' || c === "'") {
//       let j = i + 1, s = "";
//       while (j < src.length && src[j] !== c) { s += src[j]; j++; }
//       if (j >= src.length) throw new FormulaError("unterminated string");
//       toks.push({ t: "str", v: s }); i = j + 1; continue;
//     }
//     if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
//       let j = i, s = "";
//       while (j < src.length && /[0-9.]/.test(src[j])) { s += src[j]; j++; }
//       // exponent notation: 1e-5, 2.3E+4, 6e9
//       if ((src[j] === "e" || src[j] === "E") &&
//           (/[0-9]/.test(src[j + 1] ?? "") ||
//            ((src[j + 1] === "+" || src[j + 1] === "-") && /[0-9]/.test(src[j + 2] ?? "")))) {
//         s += src[j]; j++;
//         if (src[j] === "+" || src[j] === "-") { s += src[j]; j++; }
//         while (j < src.length && /[0-9]/.test(src[j])) { s += src[j]; j++; }
//       }
//       // digit-led identifier (e.g. 5_year_projections): a name char follows the
//       // numeric run → treat the whole token as an identifier, not a number.
//       if (/[A-Za-z_]/.test(src[j] ?? "")) {
//         let k = i, id = "";
//         while (k < src.length && /[A-Za-z0-9_]/.test(src[k])) { id += src[k]; k++; }
//         toks.push({ t: "id", v: id }); i = k; continue;
//       }
//       const n = Number(s);
//       if (Number.isNaN(n)) throw new FormulaError(`invalid number "${s}"`);
//       toks.push({ t: "num", v: n }); i = j; continue;
//     }
//     if (/[A-Za-z_]/.test(c)) {
//       let j = i, s = "";
//       while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) { s += src[j]; j++; }
//       toks.push({ t: "id", v: s }); i = j; continue;
//     }
//     const pair = src.slice(i, i + 2);
//     if (two.includes(pair)) { toks.push({ t: "op", v: pair }); i += 2; continue; }
//     if ("+-*/%^<>".includes(c)) { toks.push({ t: "op", v: c }); i++; continue; }
//     if ("(),?:".includes(c)) { toks.push({ t: "punc", v: c }); i++; continue; }
//     throw new FormulaError(`unexpected character "${c}"`);
//   }
//   return toks;
// }

// /* ── parser (precedence climbing) ──────────── */
// type Node =
//   | { type: "num"; value: number } | { type: "str"; value: string }
//   | { type: "name"; name: string }
//   | { type: "un"; op: string; operand: Node }
//   | { type: "bin"; op: string; left: Node; right: Node }
//   | { type: "if"; cond: Node; a: Node; b: Node }
//   | { type: "call"; name: string; args: Node[] };

// const BP: Record<string, [number, number]> = {
//   "||": [1, 2], "&&": [3, 4],
//   "==": [5, 6], "!=": [5, 6], "<": [5, 6], "<=": [5, 6], ">": [5, 6], ">=": [5, 6],
//   "+": [7, 8], "-": [7, 8], "*": [9, 10], "/": [9, 10], "%": [9, 10], "^": [12, 11],
// };

// class Parser {
//   private toks: Tok[]; private pos = 0;
//   constructor(src: string) { this.toks = tokenize(src); }
//   private peek() { return this.toks[this.pos]; }
//   private next() { const t = this.toks[this.pos]; if (!t) throw new FormulaError("unexpected end"); this.pos++; return t; }
//   private expect(v: string) { const t = this.next(); if (t.t !== "punc" || t.v !== v) throw new FormulaError(`expected "${v}"`); }

//   parse(): Node {
//     const n = this.ternary();
//     if (this.pos !== this.toks.length) throw new FormulaError("trailing input");
//     return n;
//   }
//   private ternary(): Node {
//     const cond = this.binary(0);
//     const t = this.peek();
//     if (t && t.t === "punc" && t.v === "?") {
//       this.next();
//       const a = this.ternary(); this.expect(":"); const b = this.ternary();
//       return { type: "if", cond, a, b };
//     }
//     return cond;
//   }
//   private binary(minbp: number): Node {
//     let left = this.unary();
//     for (;;) {
//       const t = this.peek();
//       if (!t || t.t !== "op") break;
//       const bp = BP[t.v];
//       if (!bp || bp[0] < minbp) break;
//       this.next();
//       left = { type: "bin", op: t.v, left, right: this.binary(bp[1]) };
//     }
//     return left;
//   }
//   private unary(): Node {
//     const t = this.peek();
//     if (t && t.t === "op" && (t.v === "-" || t.v === "+"))
//       { this.next(); return { type: "un", op: t.v, operand: this.unary() }; }
//     return this.atom();
//   }
//   private atom(): Node {
//     const t = this.next();
//     if (t.t === "num") return { type: "num", value: t.v };
//     if (t.t === "str") return { type: "str", value: t.v };
//     if (t.t === "punc" && t.v === "(") { const e = this.ternary(); this.expect(")"); return e; }
//     if (t.t === "id") {
//       const nx = this.peek();
//       if (nx && nx.t === "punc" && nx.v === "(") {
//         this.next();
//         const args: Node[] = [];
//         if (!(this.peek()?.t === "punc" && this.peek()?.v === ")")) {
//           for (;;) {
//             args.push(this.ternary());
//             const p = this.peek();
//             if (p && p.t === "punc" && p.v === ",") { this.next(); continue; }
//             break;
//           }
//         }
//         this.expect(")");
//         return { type: "call", name: t.v, args };
//       }
//       return { type: "name", name: t.v };
//     }
//     throw new FormulaError("unexpected token");
//   }
// }

// /* ── evaluate ──────────────────────────────── */
// const FUNCS: Record<string, (...a: number[]) => number> = {
//   min: (...a) => Math.min(...a), max: (...a) => Math.max(...a),
//   abs: Math.abs, sqrt: Math.sqrt, floor: Math.floor, ceil: Math.ceil,
//   round: (x, n = 0) => { const p = 10 ** n; return Math.round(x * p) / p; },
//   pow: (a, b) => a ** b, log: (x, b) => (b === undefined ? Math.log(x) : Math.log(x) / Math.log(b)),
//   log10: (x) => Math.log10(x), exp: Math.exp,
//   sum: (...a) => a.reduce((s, x) => s + x, 0),
//   iif: (c, a, b) => (c ? a : b),
// };

// function toNum(v: unknown): number {
//   if (typeof v === "number") return v;
//   if (typeof v === "boolean") return v ? 1 : 0;
//   if (v == null) throw new FormulaError("value is empty");
//   const s = String(v).trim().replace(/,/g, "");
//   if (s === "") throw new FormulaError("value is empty");
//   const n = Number(s);
//   if (Number.isNaN(n)) throw new FormulaError(`"${v}" is not a number`);
//   return n;
// }

// type Ctx = { resolve: (n: string) => number; ref: (name: string, key: string, def?: number) => number };

// function evalNode(n: Node, ctx: Ctx): number | string {
//   switch (n.type) {
//     case "num": return n.value;
//     case "str": return n.value;
//     case "name": return ctx.resolve(n.name);
//     case "un": { const v = evalNode(n.operand, ctx) as number; return n.op === "-" ? -v : +v; }
//     case "bin": {
//       const a = evalNode(n.left, ctx) as number, b = evalNode(n.right, ctx) as number;
//       switch (n.op) {
//         case "+": return a + b; case "-": return a - b; case "*": return a * b;
//         case "/": if (b === 0) throw new FormulaError("division by zero"); return a / b;
//         case "%": return a % b; case "^": return a ** b;
//         case "==": return a === b ? 1 : 0; case "!=": return a !== b ? 1 : 0;
//         case "<": return a < b ? 1 : 0; case "<=": return a <= b ? 1 : 0;
//         case ">": return a > b ? 1 : 0; case ">=": return a >= b ? 1 : 0;
//         case "&&": return a && b ? 1 : 0; case "||": return a || b ? 1 : 0;
//       }
//       throw new FormulaError("bad operator");
//     }
//     case "if": return (evalNode(n.cond, ctx) as number) ? evalNode(n.a, ctx) : evalNode(n.b, ctx);
//     case "call": {
//       if (n.name === "ref") {
//         const a = n.args.map((x) => evalNode(x, ctx));
//         return ctx.ref(String(a[0] ?? ""), String(a[1] ?? ""), a[2] === undefined ? 0 : Number(a[2]));
//       }
//       const fn = FUNCS[n.name];
//       if (!fn) throw new FormulaError(`unknown function "${n.name}"`);
//       return fn(...n.args.map((x) => evalNode(x, ctx) as number));
//     }
//   }
//   throw new FormulaError("bad node");
// }

// /* ── ref extraction / helpers ──────────────── */
// function walk(n: Node, fn: (x: Node) => void) {
//   fn(n);
//   if (n.type === "un") walk(n.operand, fn);
//   else if (n.type === "bin") { walk(n.left, fn); walk(n.right, fn); }
//   else if (n.type === "if") { walk(n.cond, fn); walk(n.a, fn); walk(n.b, fn); }
//   else if (n.type === "call") n.args.forEach((a) => walk(a, fn));
// }

// export function isFormula(h: CriterionHeader): boolean {
//   return typeof h.formula === "string" && h.formula.trim() !== "";
// }

// export function fieldRefs(expr: string): string[] {
//   try {
//     const ast = new Parser(expr).parse(); const out = new Set<string>();
//     walk(ast, (n) => { if (n.type === "name") out.add(n.name); });
//     return [...out];
//   } catch { return []; }
// }

// export function criterionRefs(expr: string): string[] {
//   try {
//     const ast = new Parser(expr).parse(); const out = new Set<string>();
//     walk(ast, (n) => {
//       if (n.type === "call" && n.name === "ref" && n.args[0]?.type === "str")
//         out.add((n.args[0] as { value: string }).value);
//     });
//     return [...out];
//   } catch { return []; }
// }

// /** ref("Criterion","key") pairs referenced in an expression. */
// export function refPairs(expr: string): { name: string; key: string }[] {
//   try {
//     const ast = new Parser(expr).parse();
//     const out: { name: string; key: string }[] = [];
//     walk(ast, (n) => {
//       if (
//         n.type === "call" && n.name === "ref" &&
//         n.args[0]?.type === "str" && n.args[1]?.type === "str"
//       ) {
//         out.push({
//           name: (n.args[0] as { value: string }).value,
//           key: (n.args[1] as { value: string }).value,
//         });
//       }
//     });
//     return out;
//   } catch {
//     return [];
//   }
// }

// export function validateFormula(
//   expr: string,
//   opts?: { fieldKeys?: string[]; criteriaNames?: string[] },
// ): { ok: boolean; error?: string; localRefs: string[]; crossRefs: string[] } {
//   const trimmed = (expr ?? "").trim();
//   if (!trimmed) return { ok: false, error: "empty formula", localRefs: [], crossRefs: [] };

//   let localRefs: string[] = [];
//   let crossRefs: string[] = [];
//   try {
//     new Parser(trimmed).parse();
//     localRefs = fieldRefs(trimmed);
//     crossRefs = criterionRefs(trimmed);
//   } catch (e) {
//     const msg = e instanceof FormulaError ? e.message : "parse error";
//     return {
//       ok: false,
//       error: msg === "trailing input" ? "unexpected symbol — check operators and parentheses" : msg,
//       localRefs: [],
//       crossRefs: [],
//     };
//   }

//   if (opts?.fieldKeys) {
//     const known = new Set(opts.fieldKeys);
//     const bad = localRefs.filter((r) => !known.has(r));
//     if (bad.length) return { ok: false, error: `unknown field(s): ${bad.join(", ")}`, localRefs, crossRefs };
//   }

//   if (opts?.criteriaNames) {
//     const known = new Set(opts.criteriaNames.map((c) => c.trim().toLowerCase()));
//     const bad = crossRefs.filter((r) => !known.has(r.trim().toLowerCase()));
//     if (bad.length) return { ok: false, error: `unknown criterion ref(s): ${bad.join(", ")}`, localRefs, crossRefs };
//   }

//   return { ok: true, localRefs, crossRefs };
// }

// function toposort(deps: Map<string, Set<string>>) {
//   const order: string[] = [], temp = new Set<string>(), perm = new Set<string>(), cyclic = new Set<string>();
//   const visit = (n: string) => {
//     if (perm.has(n)) return;
//     if (temp.has(n)) { cyclic.add(n); return; }
//     temp.add(n);
//     for (const m of deps.get(n) ?? []) if (deps.has(m)) visit(m);
//     temp.delete(n); perm.add(n); order.push(n);
//   };
//   for (const n of deps.keys()) visit(n);
//   return { order, cyclic };
// }

// /** Compute all formula fields on one row. `cross(nameLower, key)` supplies
//  *  other criteria's values for the same target (optional — defaults to 0).
//  *
//  *  No-data discipline: an empty input or a non-finite (NaN / ±Inf) result is
//  *  preserved as no-data (null → "—"), never coerced to 0. A field that fails
//  *  writes null into its slot, so any dependent field reads no-data and stays
//  *  dashed too — it is never silently read from a stale raw value. A genuine 0
//  *  stays 0. Mirrors the backend compute_row.
//  *
//  *  A formula that references its OWN key reads the row's raw input, not the
//  *  computed slot, so self-derived fields (e.g. coverage → coverage%) work
//  *  without being treated as a circular reference. */
// export function evaluateRow(
//   headers: CriterionHeader[],
//   data: Record<string, unknown>,
//   cross?: (criterionNameLower: string, key: string) => number | undefined,
// ): { values: Record<string, number | null>; errors: Record<string, string> } {
//   const fheaders = headers.filter(isFormula);
//   const fkeys = new Set(fheaders.map((h) => h.key));
//   const deps = new Map<string, Set<string>>();
//   for (const h of fheaders)
//     deps.set(h.key, new Set(fieldRefs(h.formula!).filter((k) => fkeys.has(k) && k !== h.key)));

//   const { order, cyclic } = toposort(deps);
//   const byKey = new Map(fheaders.map((h) => [h.key, h] as const));

//   // frozen pre-compute snapshot (for self-references) + a live slot map that
//   // starts from the same data and is overwritten as each formula field settles.
//   const original = { ...(data ?? {}) };
//   const slot: Record<string, unknown> = { ...(data ?? {}) };
//   const values: Record<string, number | null> = {};
//   const errors: Record<string, string> = {};

//   const ref = (name: string, key: string, def = 0): number => {
//     const v = cross?.(name.trim().toLowerCase(), key);
//     return v === undefined || Number.isNaN(v) ? def : v;
//   };

//   for (const key of order) {
//     if (cyclic.has(key)) {
//       errors[key] = "circular reference";
//       values[key] = null;
//       slot[key] = null;                 // a cycle is no-data → dependents go dash too
//       continue;
//     }
//     const h = byKey.get(key)!;
//     const resolve = (name: string): number => {
//       if (name === key) return toNum(original?.[name]);   // own key ← raw input; empty → dash
//       return toNum(slot[name]);                           // raw field OR settled formula field; null/empty → throws → dash
//     };
//     try {
//       const out = evalNode(new Parser(h.formula!).parse(), { resolve, ref });
//       const num = typeof out === "number" ? out : Number(out);
//       if (!Number.isFinite(num)) throw new FormulaError("not a number");   // NaN / ±Inf → dash, never 0
//       const rnd = h.round == null ? DEFAULT_ROUND : h.round;
//       const p = 10 ** rnd;
//       const val = Math.round(num * p) / p;
//       values[key] = val;
//       slot[key] = val;                  // settled → dependents read this
//     } catch (e) {
//       errors[key] = e instanceof FormulaError ? e.message : "formula error";
//       values[key] = null;
//       slot[key] = null;               
//     }
//   }
//   return { values, errors };
// }


import type { CriterionHeader } from "@/types/new/evidence-panel";

export const DEFAULT_ROUND = 4;
export const FORMULA_FUNCTIONS = [
  "min", "max", "abs", "round", "sqrt", "floor", "ceil",
  "pow", "log", "log10", "exp", "sum", "iif", "nz",
];

// nz / coalesce / ifnull are special forms (lazy args), not FUNCS entries.
const SPECIAL = new Set(["nz", "coalesce", "ifnull"]);

class FormulaError extends Error {}
/** No-data sentinel. Subclass so ordinary handling still dashes an empty input,
 *  but nz()/coalesce()/ifnull() can catch ONLY this and let real errors dash. */
class EmptyValue extends FormulaError {}

/* ── tokenizer ─────────────────────────────── */
type Tok =
  | { t: "num"; v: number } | { t: "str"; v: string }
  | { t: "id"; v: string } | { t: "op"; v: string } | { t: "punc"; v: string };

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  const two = ["==", "!=", "<=", ">=", "&&", "||"];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") { i++; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1, s = "";
      while (j < src.length && src[j] !== c) { s += src[j]; j++; }
      if (j >= src.length) throw new FormulaError("unterminated string");
      toks.push({ t: "str", v: s }); i = j + 1; continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i, s = "";
      while (j < src.length && /[0-9.]/.test(src[j])) { s += src[j]; j++; }
      // exponent notation: 1e-5, 2.3E+4, 6e9
      if ((src[j] === "e" || src[j] === "E") &&
          (/[0-9]/.test(src[j + 1] ?? "") ||
           ((src[j + 1] === "+" || src[j + 1] === "-") && /[0-9]/.test(src[j + 2] ?? "")))) {
        s += src[j]; j++;
        if (src[j] === "+" || src[j] === "-") { s += src[j]; j++; }
        while (j < src.length && /[0-9]/.test(src[j])) { s += src[j]; j++; }
      }
      // digit-led identifier (e.g. 5_year_projections): a name char follows the
      // numeric run → treat the whole token as an identifier, not a number.
      if (/[A-Za-z_]/.test(src[j] ?? "")) {
        let k = i, id = "";
        while (k < src.length && /[A-Za-z0-9_]/.test(src[k])) { id += src[k]; k++; }
        toks.push({ t: "id", v: id }); i = k; continue;
      }
      const n = Number(s);
      if (Number.isNaN(n)) throw new FormulaError(`invalid number "${s}"`);
      toks.push({ t: "num", v: n }); i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i, s = "";
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) { s += src[j]; j++; }
      toks.push({ t: "id", v: s }); i = j; continue;
    }
    const pair = src.slice(i, i + 2);
    if (two.includes(pair)) { toks.push({ t: "op", v: pair }); i += 2; continue; }
    if ("+-*/%^<>".includes(c)) { toks.push({ t: "op", v: c }); i++; continue; }
    if ("(),?:".includes(c)) { toks.push({ t: "punc", v: c }); i++; continue; }
    throw new FormulaError(`unexpected character "${c}"`);
  }
  return toks;
}

/* ── parser (precedence climbing) ──────────── */
type Node =
  | { type: "num"; value: number } | { type: "str"; value: string }
  | { type: "name"; name: string }
  | { type: "un"; op: string; operand: Node }
  | { type: "bin"; op: string; left: Node; right: Node }
  | { type: "if"; cond: Node; a: Node; b: Node }
  | { type: "call"; name: string; args: Node[] };

const BP: Record<string, [number, number]> = {
  "||": [1, 2], "&&": [3, 4],
  "==": [5, 6], "!=": [5, 6], "<": [5, 6], "<=": [5, 6], ">": [5, 6], ">=": [5, 6],
  "+": [7, 8], "-": [7, 8], "*": [9, 10], "/": [9, 10], "%": [9, 10], "^": [12, 11],
};

class Parser {
  private toks: Tok[]; private pos = 0;
  constructor(src: string) { this.toks = tokenize(src); }
  private peek() { return this.toks[this.pos]; }
  private next() { const t = this.toks[this.pos]; if (!t) throw new FormulaError("unexpected end"); this.pos++; return t; }
  private expect(v: string) { const t = this.next(); if (t.t !== "punc" || t.v !== v) throw new FormulaError(`expected "${v}"`); }

  parse(): Node {
    const n = this.ternary();
    if (this.pos !== this.toks.length) throw new FormulaError("trailing input");
    return n;
  }
  private ternary(): Node {
    const cond = this.binary(0);
    const t = this.peek();
    if (t && t.t === "punc" && t.v === "?") {
      this.next();
      const a = this.ternary(); this.expect(":"); const b = this.ternary();
      return { type: "if", cond, a, b };
    }
    return cond;
  }
  private binary(minbp: number): Node {
    let left = this.unary();
    for (;;) {
      const t = this.peek();
      if (!t || t.t !== "op") break;
      const bp = BP[t.v];
      if (!bp || bp[0] < minbp) break;
      this.next();
      left = { type: "bin", op: t.v, left, right: this.binary(bp[1]) };
    }
    return left;
  }
  private unary(): Node {
    const t = this.peek();
    if (t && t.t === "op" && (t.v === "-" || t.v === "+"))
      { this.next(); return { type: "un", op: t.v, operand: this.unary() }; }
    return this.atom();
  }
  private atom(): Node {
    const t = this.next();
    if (t.t === "num") return { type: "num", value: t.v };
    if (t.t === "str") return { type: "str", value: t.v };
    if (t.t === "punc" && t.v === "(") { const e = this.ternary(); this.expect(")"); return e; }
    if (t.t === "id") {
      const nx = this.peek();
      if (nx && nx.t === "punc" && nx.v === "(") {
        this.next();
        const args: Node[] = [];
        if (!(this.peek()?.t === "punc" && this.peek()?.v === ")")) {
          for (;;) {
            args.push(this.ternary());
            const p = this.peek();
            if (p && p.t === "punc" && p.v === ",") { this.next(); continue; }
            break;
          }
        }
        this.expect(")");
        return { type: "call", name: t.v, args };
      }
      return { type: "name", name: t.v };
    }
    throw new FormulaError("unexpected token");
  }
}

/* ── evaluate ──────────────────────────────── */
const FUNCS: Record<string, (...a: number[]) => number> = {
  min: (...a) => Math.min(...a), max: (...a) => Math.max(...a),
  abs: Math.abs, sqrt: Math.sqrt, floor: Math.floor, ceil: Math.ceil,
  round: (x, n = 0) => { const p = 10 ** n; return Math.round(x * p) / p; },
  pow: (a, b) => a ** b, log: (x, b) => (b === undefined ? Math.log(x) : Math.log(x) / Math.log(b)),
  log10: (x) => Math.log10(x), exp: Math.exp,
  sum: (...a) => a.reduce((s, x) => s + x, 0),
  iif: (c, a, b) => (c ? a : b),
};

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v == null) throw new EmptyValue("value is empty");
  const s = String(v).trim().replace(/,/g, "");
  if (s === "") throw new EmptyValue("value is empty");
  const n = Number(s);
  if (Number.isNaN(n)) throw new FormulaError(`"${v}" is not a number`);
  return n;
}

type Ctx = { resolve: (n: string) => number; ref: (name: string, key: string, def?: number) => number };

function evalNode(n: Node, ctx: Ctx): number | string {
  switch (n.type) {
    case "num": return n.value;
    case "str": return n.value;
    case "name": return ctx.resolve(n.name);
    case "un": { const v = evalNode(n.operand, ctx) as number; return n.op === "-" ? -v : +v; }
    case "bin": {
      const a = evalNode(n.left, ctx) as number, b = evalNode(n.right, ctx) as number;
      switch (n.op) {
        case "+": return a + b; case "-": return a - b; case "*": return a * b;
        case "/": if (b === 0) throw new FormulaError("division by zero"); return a / b;
        case "%": return a % b; case "^": return a ** b;
        case "==": return a === b ? 1 : 0; case "!=": return a !== b ? 1 : 0;
        case "<": return a < b ? 1 : 0; case "<=": return a <= b ? 1 : 0;
        case ">": return a > b ? 1 : 0; case ">=": return a >= b ? 1 : 0;
        case "&&": return a && b ? 1 : 0; case "||": return a || b ? 1 : 0;
      }
      throw new FormulaError("bad operator");
    }
    case "if": return (evalNode(n.cond, ctx) as number) ? evalNode(n.a, ctx) : evalNode(n.b, ctx);
    case "call": {
      // nz / coalesce / ifnull — special form mirroring the backend: evaluate
      // args LAZILY, swallow an EMPTY operand (→ next arg, else 0). Real errors
      // still propagate. Kept out of FUNCS so the empty isn't thrown before it runs.
      if (SPECIAL.has(n.name)) {
        if (n.args.length === 0) throw new FormulaError("nz() needs a value");
        for (const a of n.args) {
          try { return evalNode(a, ctx); }
          catch (e) { if (e instanceof EmptyValue) continue; throw e; }
        }
        return 0;
      }
      if (n.name === "ref") {
        const a = n.args.map((x) => evalNode(x, ctx));
        return ctx.ref(String(a[0] ?? ""), String(a[1] ?? ""), a[2] === undefined ? 0 : Number(a[2]));
      }
      const fn = FUNCS[n.name];
      if (!fn) throw new FormulaError(`unknown function "${n.name}"`);
      return fn(...n.args.map((x) => evalNode(x, ctx) as number));
    }
  }
  throw new FormulaError("bad node");
}

/* ── ref extraction / helpers ──────────────── */
function walk(n: Node, fn: (x: Node) => void) {
  fn(n);
  if (n.type === "un") walk(n.operand, fn);
  else if (n.type === "bin") { walk(n.left, fn); walk(n.right, fn); }
  else if (n.type === "if") { walk(n.cond, fn); walk(n.a, fn); walk(n.b, fn); }
  else if (n.type === "call") n.args.forEach((a) => walk(a, fn));
}

export function isFormula(h: CriterionHeader): boolean {
  return typeof h.formula === "string" && h.formula.trim() !== "";
}

export function fieldRefs(expr: string): string[] {
  try {
    const ast = new Parser(expr).parse(); const out = new Set<string>();
    walk(ast, (n) => { if (n.type === "name") out.add(n.name); });
    return [...out];
  } catch { return []; }
}

export function criterionRefs(expr: string): string[] {
  try {
    const ast = new Parser(expr).parse(); const out = new Set<string>();
    walk(ast, (n) => {
      if (n.type === "call" && n.name === "ref" && n.args[0]?.type === "str")
        out.add((n.args[0] as { value: string }).value);
    });
    return [...out];
  } catch { return []; }
}

/** ref("Criterion","key") pairs referenced in an expression. */
export function refPairs(expr: string): { name: string; key: string }[] {
  try {
    const ast = new Parser(expr).parse();
    const out: { name: string; key: string }[] = [];
    walk(ast, (n) => {
      if (
        n.type === "call" && n.name === "ref" &&
        n.args[0]?.type === "str" && n.args[1]?.type === "str"
      ) {
        out.push({
          name: (n.args[0] as { value: string }).value,
          key: (n.args[1] as { value: string }).value,
        });
      }
    });
    return out;
  } catch {
    return [];
  }
}

export function validateFormula(
  expr: string,
  opts?: { fieldKeys?: string[]; criteriaNames?: string[] },
): { ok: boolean; error?: string; localRefs: string[]; crossRefs: string[] } {
  const trimmed = (expr ?? "").trim();
  if (!trimmed) return { ok: false, error: "empty formula", localRefs: [], crossRefs: [] };

  let localRefs: string[] = [];
  let crossRefs: string[] = [];
  try {
    new Parser(trimmed).parse();
    localRefs = fieldRefs(trimmed);
    crossRefs = criterionRefs(trimmed);
  } catch (e) {
    const msg = e instanceof FormulaError ? e.message : "parse error";
    return {
      ok: false,
      error: msg === "trailing input" ? "unexpected symbol — check operators and parentheses" : msg,
      localRefs: [],
      crossRefs: [],
    };
  }

  if (opts?.fieldKeys) {
    const known = new Set(opts.fieldKeys);
    const bad = localRefs.filter((r) => !known.has(r));
    if (bad.length) return { ok: false, error: `unknown field(s): ${bad.join(", ")}`, localRefs, crossRefs };
  }

  if (opts?.criteriaNames) {
    const known = new Set(opts.criteriaNames.map((c) => c.trim().toLowerCase()));
    const bad = crossRefs.filter((r) => !known.has(r.trim().toLowerCase()));
    if (bad.length) return { ok: false, error: `unknown criterion ref(s): ${bad.join(", ")}`, localRefs, crossRefs };
  }

  return { ok: true, localRefs, crossRefs };
}

function toposort(deps: Map<string, Set<string>>) {
  const order: string[] = [], temp = new Set<string>(), perm = new Set<string>(), cyclic = new Set<string>();
  const visit = (n: string) => {
    if (perm.has(n)) return;
    if (temp.has(n)) { cyclic.add(n); return; }
    temp.add(n);
    for (const m of deps.get(n) ?? []) if (deps.has(m)) visit(m);
    temp.delete(n); perm.add(n); order.push(n);
  };
  for (const n of deps.keys()) visit(n);
  return { order, cyclic };
}

/** Compute all formula fields on one row. `cross(nameLower, key)` supplies
 *  other criteria's values for the same target (optional — defaults to 0).
 *
 *  No-data discipline: an empty input or a non-finite (NaN / ±Inf) result is
 *  preserved as no-data (null → "—"), never coerced to 0 unless the formula
 *  opts in with nz()/coalesce()/ifnull(). A field that fails writes null into
 *  its slot, so dependents read no-data and stay dashed too. A genuine 0 stays 0.
 *  Mirrors the backend compute_row.
 *
 *  A formula that references its OWN key reads the row's raw input, not the
 *  computed slot, so self-derived fields work without being circular. */
export function evaluateRow(
  headers: CriterionHeader[],
  data: Record<string, unknown>,
  cross?: (criterionNameLower: string, key: string) => number | undefined,
): { values: Record<string, number | null>; errors: Record<string, string> } {
  const fheaders = headers.filter(isFormula);
  const fkeys = new Set(fheaders.map((h) => h.key));
  const deps = new Map<string, Set<string>>();
  for (const h of fheaders)
    deps.set(h.key, new Set(fieldRefs(h.formula!).filter((k) => fkeys.has(k) && k !== h.key)));

  const { order, cyclic } = toposort(deps);
  const byKey = new Map(fheaders.map((h) => [h.key, h] as const));

  const original = { ...(data ?? {}) };
  const slot: Record<string, unknown> = { ...(data ?? {}) };
  const values: Record<string, number | null> = {};
  const errors: Record<string, string> = {};

  const ref = (name: string, key: string, def = 0): number => {
    const v = cross?.(name.trim().toLowerCase(), key);
    return v === undefined || Number.isNaN(v) ? def : v;
  };

  for (const key of order) {
    if (cyclic.has(key)) {
      errors[key] = "circular reference";
      values[key] = null;
      slot[key] = null;
      continue;
    }
    const h = byKey.get(key)!;
    const resolve = (name: string): number => {
      if (name === key) return toNum(original?.[name]);   // own key ← raw input; empty → EmptyValue
      return toNum(slot[name]);                           // raw OR settled formula field; empty → EmptyValue
    };
    try {
      const out = evalNode(new Parser(h.formula!).parse(), { resolve, ref });
      const num = typeof out === "number" ? out : Number(out);
      if (!Number.isFinite(num)) throw new FormulaError("not a number");
      const rnd = h.round == null ? DEFAULT_ROUND : h.round;
      const p = 10 ** rnd;
      const val = Math.round(num * p) / p;
      values[key] = val;
      slot[key] = val;
    } catch (e) {
      errors[key] = e instanceof FormulaError ? e.message : "formula error";
      values[key] = null;
      slot[key] = null;
    }
  }
  return { values, errors };
}