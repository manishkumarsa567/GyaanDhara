const QUESTION_COUNT = 40;

function randomInt(min, max, random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function formatDecimal(value) {
  return Number(value.toFixed(2));
}

function makeQuestion(q, answer) {
  return { q, answer };
}

function addition(level, random) {
  const max = [20, 100, 1000][Math.min(level - 1, 2)] || 20;
  const left = randomInt(1, max, random);
  const right = randomInt(1, max, random);
  return makeQuestion(`${left} + ${right}`, left + right);
}

function subtraction(level, random) {
  const max = [20, 100, 1000][Math.min(level - 1, 2)] || 20;
  const left = randomInt(2, max, random);
  const right = randomInt(1, left, random);
  return makeQuestion(`${left} − ${right}`, left - right);
}

function multiplication(level, random) {
  const max = [10, 12, 20][Math.min(level - 1, 2)] || 10;
  const left = randomInt(2, max, random);
  const right = randomInt(2, max, random);
  return makeQuestion(`${left} × ${right}`, left * right);
}

function division(level, random) {
  const divisor = randomInt(2, Math.min(12 + level, 20), random);
  const quotient = randomInt(2, Math.min(12 + level, 30), random);
  return makeQuestion(`${divisor * quotient} ÷ ${divisor}`, quotient);
}

function fraction(level, random) {
  const denominator = randomInt(2, Math.min(8 + level, 12), random);
  const numerator = randomInt(1, denominator - 1, random);
  const multiplier = randomInt(2, Math.min(12 + level * 2, 40), random);
  const quantity = denominator * multiplier;
  return makeQuestion(`${numerator}/${denominator} of ${quantity}`, numerator * multiplier);
}

function decimal(level, random) {
  const left = randomInt(10, 999, random) / 10;
  const right = randomInt(10, 500, random) / 10;
  const operation = randomInt(0, 2, random);
  if (operation === 0) return makeQuestion(`${left.toFixed(1)} + ${right.toFixed(1)}`, formatDecimal(left + right));
  if (operation === 1) {
    const larger = Math.max(left, right);
    const smaller = Math.min(left, right);
    return makeQuestion(`${larger.toFixed(1)} − ${smaller.toFixed(1)}`, formatDecimal(larger - smaller));
  }
  const whole = randomInt(2, 12 + level, random);
  const decimal = randomInt(1, 9, random) / 10;
  return makeQuestion(`${decimal.toFixed(1)} × ${whole}`, formatDecimal(decimal * whole));
}

function money(level, random) {
  const price = randomInt(10, 100 + level * 100, random);
  const quantity = randomInt(2, 8, random);
  const paid = Math.ceil((price * quantity) / 100) * 100;
  return makeQuestion(`₹${paid} − (₹${price} × ${quantity})`, paid - price * quantity);
}

function solar(level, random) {
  const watts = randomInt(1, 4 + level * 2, random) * 50;
  const hours = randomInt(2, 6 + level, random);
  const panelCount = randomInt(1, 4 + level, random);
  return random() < 0.5
    ? makeQuestion(`${watts} W × ${hours} h (Wh)`, watts * hours)
    : makeQuestion(`${watts} W × ${panelCount} panels (W)`, watts * panelCount);
}

function emoji(level, random) {
  const emoji = ['🌾', '🥭', '🌱', '🥥'][randomInt(0, 3, random)];
  const count = randomInt(2, 10 + level * 5, random);
  const baskets = randomInt(2, 8, random);
  return makeQuestion(`${emoji} ${count} × ${baskets}`, count * baskets);
}

const profiles = {
  'math-speed-drill': [addition, subtraction, multiplication, division, fraction],
  'times-table-rush': [multiplication],
  'decimal-dash': [decimal],
  'money-math': [money],
  'speed-math-tournament': [addition, subtraction, multiplication, division, fraction],
  'emoji-math': [emoji],
  'solar-energy-calculator': [solar],
  'addition-speed-practice': [addition],
  'fraction-speed-practice': [fraction],
};

export function generateMathSpeedQuestions(slug, level = 1, random = Math.random) {
  const operations = profiles[slug] || profiles['math-speed-drill'];
  return Array.from({ length: QUESTION_COUNT }, (_, index) => {
    const operation = operations[index % operations.length];
    return operation(Math.max(1, Math.min(3, level)), random);
  });
}
