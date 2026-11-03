import { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import FarmSimulation from './FarmSimulation';
import './GameEngine.css';

function ResultScreen({ score, total, onFinish }) {
  const { t } = useLanguage();
  const pct = total ? Math.round((score / total) * 100) : 0;
  return (
    <div className="game-result card">
      <h2>{t('ge_complete')} 🎉</h2>
      <div className="game-result-score">{pct}%</div>
      <p>
        {score}/{total} {t('ge_correct')}
      </p>
      <button type="button" className="btn btn-primary" onClick={() => onFinish(score, total)}>
        {t('ge_claim_xp')}
      </button>
    </div>
  );
}

function QuizEngine({ data, onDone }) {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const q = data[idx];

  if (done) return <ResultScreen score={score} total={data.length} onFinish={onDone} />;
  if (!q) return null;

  const pick = (i) => {
    if (isAnswered) return;
    setSelectedOpt(i);
    setIsAnswered(true);
    const isCorrect = i === q.answer;
    const newScore = isCorrect ? score + 1 : score;

    setTimeout(() => {
      setSelectedOpt(null);
      setIsAnswered(false);
      if (idx + 1 >= data.length) {
        setScore(newScore);
        setDone(true);
      } else {
        setScore(newScore);
        setIdx((prev) => prev + 1);
      }
    }, 550);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="engine-card card">
      <div className="engine-header-row">
        <p className="engine-progress">
          {t('ge_question')} {idx + 1}/{data.length}
        </p>
        <span className="engine-score-pill">★ {score} pts</span>
      </div>
      <h3>{q.q}</h3>
      <div className="engine-options">
        {q.options.map((opt, i) => {
          let btnClass = 'engine-opt';
          if (isAnswered) {
            if (i === q.answer) btnClass += ' opt-correct';
            else if (i === selectedOpt) btnClass += ' opt-wrong';
          }
          return (
            <button
              key={i}
              type="button"
              className={btnClass}
              onClick={() => pick(i)}
              disabled={isAnswered}
            >
              <span className="opt-badge">{optionLetters[i] || (i + 1)}</span>
              <span className="opt-text">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrueFalseEngine({ data, onDone }) {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selectedVal, setSelectedVal] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const q = data[idx];

  if (done) return <ResultScreen score={score} total={data.length} onFinish={onDone} />;
  if (!q) return null;

  const pick = (val) => {
    if (isAnswered) return;
    setSelectedVal(val);
    setIsAnswered(true);
    const isCorrect = val === q.answer;
    const newScore = isCorrect ? score + 1 : score;

    setTimeout(() => {
      setSelectedVal(null);
      setIsAnswered(false);
      if (idx + 1 >= data.length) {
        setScore(newScore);
        setDone(true);
      } else {
        setScore(newScore);
        setIdx((prev) => prev + 1);
      }
    }, 550);
  };

  return (
    <div className="engine-card card">
      <div className="engine-header-row">
        <p className="engine-progress">
          {idx + 1}/{data.length}
        </p>
        <span className="engine-score-pill">★ {score} pts</span>
      </div>
      <h3>{q.q}</h3>
      <div className="engine-tf">
        <button
          type="button"
          className={`btn btn-tf ${isAnswered ? (q.answer === true ? 'opt-correct' : selectedVal === true ? 'opt-wrong' : '') : 'btn-primary'}`}
          onClick={() => pick(true)}
          disabled={isAnswered}
        >
          {t('ge_true')} ✓
        </button>
        <button
          type="button"
          className={`btn btn-tf ${isAnswered ? (q.answer === false ? 'opt-correct' : selectedVal === false ? 'opt-wrong' : '') : 'btn-secondary'}`}
          onClick={() => pick(false)}
          disabled={isAnswered}
        >
          {t('ge_false')} ✗
        </button>
      </div>
    </div>
  );
}

function MemoryEngine({ data, onDone }) {
  const { t } = useLanguage();
  const cards = useMemo(() => {
    const pairs = data.flatMap((d, i) => [
      { id: `t${i}`, text: d.term, pair: i, type: 'term' },
      { id: `m${i}`, text: d.match, pair: i, type: 'match' },
    ]);
    return pairs.sort(() => Math.random() - 0.5);
  }, [data]);

  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [first, setFirst] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (matched.length === data.length && data.length > 0) {
      const timer = setTimeout(() => onDone(data.length, data.length), 600);
      return () => clearTimeout(timer);
    }
  }, [matched.length, data.length, onDone]);

  const click = (card) => {
    if (isChecking || flipped.includes(card.id) || matched.includes(card.pair)) return;
    if (!first) {
      setFlipped([card.id]);
      setFirst(card);
      return;
    }
    if (first.pair === card.pair) {
      setMatched((m) => [...m, card.pair]);
      setFlipped([]);
      setFirst(null);
    } else {
      setIsChecking(true);
      setFlipped([first.id, card.id]);
      setTimeout(() => {
        setFlipped([]);
        setFirst(null);
        setIsChecking(false);
      }, 700);
    }
  };

  return (
    <div className="engine-card card">
      <div className="engine-header-row">
        <h3>{t('ge_match_pairs_title')}</h3>
        <span className="engine-score-pill">
          {t('ge_matched')}: {matched.length}/{data.length}
        </span>
      </div>
      <div className="memory-grid">
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`memory-card ${flipped.includes(c.id) || matched.includes(c.pair) ? 'revealed' : ''}`}
            onClick={() => click(c)}
          >
            {flipped.includes(c.id) || matched.includes(c.pair) ? c.text : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScrambleEngine({ data, onDone }) {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [done, setDone] = useState(false);
  const item = data[idx];
  const scrambled = useMemo(() => {
    if (!item?.answer) return '';
    const parts = item.kind === 'words'
      ? item.answer.split(/(\s+)/).filter(Boolean)
      : (typeof Intl.Segmenter === 'function'
        ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(item.answer)].map(({ segment }) => segment)
        : Array.from(item.answer));
    const movable = parts
      .map((part, index) => ({ part, index }))
      .filter(({ part }) => item.kind !== 'words' || !/^\s+$/.test(part));
    const shuffled = movable.map(({ part }) => part);
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    if (shuffled.length > 1 && shuffled.every((part, index) => part === movable[index].part)) {
      shuffled.push(shuffled.shift());
    }
    const output = [...parts];
    movable.forEach(({ index }, position) => { output[index] = shuffled[position]; });
    return output.join('');
  }, [item]);

  if (done) return <ResultScreen score={score} total={data.length} onFinish={onDone} />;
  if (!item) return null;

  const submit = () => {
    if (!guess.trim()) return;
    const normalize = (value) => value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
    const ok = normalize(guess) === normalize(item.answer);
    const newScore = ok ? score + 1 : score;
    setGuess('');
    if (idx + 1 >= data.length) {
      setScore(newScore);
      setDone(true);
    } else {
      setScore(newScore);
      setIdx((prev) => prev + 1);
    }
  };

  return (
    <div className="engine-card card">
      <div className="engine-header-row">
        <p className="engine-progress">
          {t('ge_word')} {idx + 1}/{data.length}
        </p>
        <span className="engine-score-pill">★ {score} pts</span>
      </div>
      <p className="scramble-hint">
        💡 <strong>{t('ge_hint')}:</strong> {item.hint}
      </p>
      <div className="scramble-display" aria-label={t('ge_scrambled_content')}>{scrambled}</div>
      <div className="input-with-button">
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={t('ge_unscramble')}
          autoFocus
        />
        <button type="button" className="btn btn-primary" onClick={submit}>
          {t('ge_check')}
        </button>
      </div>
    </div>
  );
}

function FillBlankEngine({ data, onDone }) {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [ans, setAns] = useState('');
  const [done, setDone] = useState(false);
  const item = data[idx];

  if (done) return <ResultScreen score={score} total={data.length} onFinish={onDone} />;
  if (!item) return null;

  const submit = () => {
    if (!ans.trim()) return;
    const ok = ans.trim().toLowerCase() === String(item.answer).toLowerCase();
    const newScore = ok ? score + 1 : score;
    setAns('');
    if (idx + 1 >= data.length) {
      setScore(newScore);
      setDone(true);
    } else {
      setScore(newScore);
      setIdx((prev) => prev + 1);
    }
  };

  return (
    <div className="engine-card card">
      <div className="engine-header-row">
        <p className="engine-progress">
          {idx + 1}/{data.length}
        </p>
        <span className="engine-score-pill">★ {score} pts</span>
      </div>
      <h3>{item.text}</h3>
      <div className="input-with-button">
        <input
          value={ans}
          onChange={(e) => setAns(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={t('ge_your_answer')}
          autoFocus
        />
        <button type="button" className="btn btn-primary" onClick={submit}>
          {t('submit')}
        </button>
      </div>
    </div>
  );
}

function MathSpeedEngine({ data, onDone }) {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [ans, setAns] = useState('');
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRef = useRef(null);

  useEffect(() => {
    if (done) return;
    const timer = setInterval(() => setTimeLeft((s) => (s <= 1 ? (setDone(true), 0) : s - 1)), 1000);
    return () => clearInterval(timer);
  }, [done]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [idx]);

  const item = data[idx % data.length];

  if (done) return <ResultScreen score={score} total={Math.max(idx, 1)} onFinish={onDone} />;

  const submit = (e) => {
    e?.preventDefault();
    if (ans === '') return;
    if (parseFloat(ans) === parseFloat(item.answer)) setScore((s) => s + 1);
    setAns('');
    setIdx((i) => i + 1);
  };

  return (
    <div className="engine-card card">
      <div className="engine-header-row">
        <p className="engine-progress">
          ⏱️ <strong>{timeLeft}s</strong> remaining
        </p>
        <span className="engine-score-pill">★ {t('ge_solved')}: {score}</span>
      </div>
      <h2 className="math-big">{item.q} = ?</h2>
      <form onSubmit={submit} className="input-with-button">
        <input
          ref={inputRef}
          type="number"
          step="any"
          value={ans}
          onChange={(e) => setAns(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn btn-primary">
          {t('ge_go')}
        </button>
      </form>
    </div>
  );
}

function TypingEngine({ data, onDone }) {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  const item = data[idx];

  if (done) return <ResultScreen score={score} total={data.length} onFinish={onDone} />;
  if (!item) return null;

  const submit = () => {
    if (!typed.trim()) return;
    const ok = typed.trim().toLowerCase() === item.answer.toLowerCase();
    const newScore = ok ? score + 1 : score;
    setTyped('');
    if (idx + 1 >= data.length) {
      setScore(newScore);
      setDone(true);
    } else {
      setScore(newScore);
      setIdx((prev) => prev + 1);
    }
  };

  return (
    <div className="engine-card card">
      <div className="engine-header-row">
        <p className="engine-progress">
          {idx + 1}/{data.length}
        </p>
        <span className="engine-score-pill">★ {score} pts</span>
      </div>
      <h3 className="typing-prompt">{item.prompt}</h3>
      <div className="input-with-button">
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
        />
        <button type="button" className="btn btn-primary" onClick={submit}>
          {t('ge_check')}
        </button>
      </div>
    </div>
  );
}

function SequenceEngine({ data, onDone }) {
  const { t } = useLanguage();
  const items = data.items || [];
  const correct = data.correct || items;
  const [order, setOrder] = useState([...items]);
  const [submitted, setSubmitted] = useState(false);

  const move = (from, to) => {
    if (submitted) return;
    const next = [...order];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setOrder(next);
  };

  const submit = () => {
    setSubmitted(true);
    const sc = order.every((v, i) => v === correct[i]) ? correct.length : 0;
    setTimeout(() => onDone(sc, correct.length), 800);
  };

  return (
    <div className="engine-card card">
      <div className="engine-header-row">
        <h3>{t('ge_drag_order')}</h3>
      </div>
      <ul className="sequence-list">
        {order.map((item, i) => (
          <li key={item}>
            <span>{item}</span>
            <div>
              <button type="button" disabled={i === 0 || submitted} onClick={() => move(i, i - 1)}>↑</button>
              <button type="button" disabled={i === order.length - 1 || submitted} onClick={() => move(i, i + 1)}>↓</button>
            </div>
          </li>
        ))}
      </ul>
      {!submitted && (
        <button type="button" className="btn btn-primary btn-full" onClick={submit}>
          {t('ge_check_order')}
        </button>
      )}
    </div>
  );
}

function FlashcardEngine({ data, onDone }) {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [known, setKnown] = useState(0);
  const [show, setShow] = useState(false);
  const card = data[idx];

  if (idx >= data.length) {
    return <ResultScreen score={known} total={data.length} onFinish={onDone} />;
  }

  const next = (gotIt) => {
    if (gotIt) setKnown((k) => k + 1);
    setShow(false);
    setIdx((prev) => prev + 1);
  };

  return (
    <div className="engine-card card flashcard">
      <div className="engine-header-row">
        <p className="engine-progress">
          {t('ge_card')} {idx + 1}/{data.length}
        </p>
        <span className="engine-score-pill">★ {known} known</span>
      </div>
      <div className="flash-inner" onClick={() => setShow((s) => !s)}>
        <p className="flash-side-badge">{show ? 'Answer' : 'Question (Click to flip)'}</p>
        <div className="flash-text">{show ? card.back : card.front}</div>
      </div>
      {show && (
        <div className="engine-tf">
          <button type="button" className="btn btn-secondary" onClick={() => next(false)}>
            {t('ge_review_again')}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => next(true)}>
            {t('ge_got_it')}
          </button>
        </div>
      )}
    </div>
  );
}

function MatchPairsEngine({ data, onDone }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState({ left: null, right: null });
  const [matched, setMatched] = useState([]);
  const [leftItems] = useState(() => data.map((d) => d.left).sort(() => Math.random() - 0.5));
  const [rightItems] = useState(() => data.map((d) => d.right).sort(() => Math.random() - 0.5));

  useEffect(() => {
    if (matched.length === data.length && data.length > 0) {
      const timer = setTimeout(() => onDone(data.length, data.length), 500);
      return () => clearTimeout(timer);
    }
  }, [matched.length, data.length, onDone]);

  const pickLeft = (l) => setSelected((s) => ({ ...s, left: l }));
  const pickRight = (r) => {
    const pair = data.find((d) => d.left === selected.left && d.right === r);
    if (pair) setMatched((m) => [...m, pair.left]);
    setSelected({ left: null, right: null });
  };

  return (
    <div className="engine-card card">
      <div className="engine-header-row">
        <h3>{t('ge_match_lr')}</h3>
        <span className="engine-score-pill">
          {matched.length}/{data.length} {t('ge_pairs')}
        </span>
      </div>
      <div className="match-columns">
        <div>
          {leftItems.map((l) => (
            <button
              key={l}
              type="button"
              className={`match-item ${matched.includes(l) ? 'done' : ''} ${selected.left === l ? 'sel' : ''}`}
              disabled={matched.includes(l)}
              onClick={() => pickLeft(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div>
          {rightItems.map((r) => (
            <button
              key={r}
              type="button"
              className="match-item"
              onClick={() => selected.left && pickRight(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RuralMissionEngine({ data, mode, intro, onDone }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const round = data[index];
  const missionIcon = {
    farming: '🌱',
    market: '🧺',
    panchayat: '🏘️',
    water: '💧',
    safety: '🕵️',
    language: '🌐',
  }[mode] || '🌾';

  if (!round) return null;

  const choose = (optionIndex) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    if (optionIndex === round.answer) setScore((current) => current + 1);
  };

  const continueMission = () => {
    if (index + 1 >= data.length) {
      onDone(score, data.length);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
  };

  return (
    <section className={`engine-card card rural-mission rural-mission-${mode || 'village'}`}>
      <div className="rural-mission-banner">
        <span className="rural-mission-icon" aria-hidden="true">{missionIcon}</span>
        <div>
          <p className="rural-mission-progress">
            {t('ge_question')} {index + 1}/{data.length}
          </p>
          <span>{intro}</span>
        </div>
        <span className="engine-score-pill">★ {score} pts</span>
      </div>
      <div className="rural-mission-scene">
        <p>{round.story}</p>
      </div>
      <h3 className="rural-mission-question">{round.q}</h3>
      <div className="rural-mission-options">
        {round.options.map((option, optionIndex) => {
          const answered = selected !== null;
          const correct = optionIndex === round.answer;
          const classes = [
            'rural-mission-option',
            selected === optionIndex ? 'selected' : '',
            answered && correct ? 'correct' : '',
            answered && selected === optionIndex && !correct ? 'incorrect' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={`${index}-${optionIndex}`}
              type="button"
              className={classes}
              onClick={() => choose(optionIndex)}
              disabled={answered}
            >
              <span className="rural-option-number">{String.fromCharCode(65 + optionIndex)}</span>
              <span>{option}</span>
              {answered && correct && <span aria-label="Correct answer">✓</span>}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`rural-mission-feedback ${selected === round.answer ? 'correct' : 'incorrect'}`} role="status">
          {selected === round.answer && <strong>✓ {t('ge_correct')}!</strong>}
          <p>{round.feedback}</p>
          <button type="button" className="btn btn-primary" onClick={continueMission}>
            {index + 1 === data.length ? t('ge_claim_xp') : `${t('games_next_level')} →`}
          </button>
        </div>
      )}
    </section>
  );
}

export default function GameEngine({ engine, data, mode, intro, onComplete }) {
  const onDone = (score, total) => onComplete(score, total);

  switch (engine) {
    case 'quiz': return <QuizEngine data={data} onDone={onDone} />;
    case 'true_false': return <TrueFalseEngine data={data} onDone={onDone} />;
    case 'memory': return <MemoryEngine data={data} onDone={onDone} />;
    case 'scramble': return <ScrambleEngine data={data} onDone={onDone} />;
    case 'fill_blank': return <FillBlankEngine data={data} onDone={onDone} />;
    case 'math_speed': return <MathSpeedEngine data={data} onDone={onDone} />;
    case 'typing': return <TypingEngine data={data} onDone={onDone} />;
    case 'sequence': return <SequenceEngine data={data} onDone={onDone} />;
    case 'flashcard': return <FlashcardEngine data={data} onDone={onDone} />;
    case 'match_pairs': return <MatchPairsEngine data={data} onDone={onDone} />;
    case 'rural_mission': return <RuralMissionEngine data={data} mode={mode} intro={intro} onDone={onDone} />;
    case 'farm_sim': return <FarmSimulation data={data} intro={intro} onComplete={onDone} />;
    default: return <QuizEngine data={Array.isArray(data) ? data : []} onDone={onDone} />;
  }
}
