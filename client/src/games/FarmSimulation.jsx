import { useState } from 'react';
import { applyFarmChoice, getFarmOutcome, initialFarmState } from './farmSimulationState';

const RESOURCE_LABELS = {
  water: { label: 'Water reserve', icon: '💧' },
  soil: { label: 'Soil health', icon: '🌱' },
  crops: { label: 'Crop health', icon: '🌾' },
};

function ResourceMeter({ resource, value }) {
  const { label, icon } = RESOURCE_LABELS[resource];
  return (
    <div className={`farm-resource farm-resource-${resource}`}>
      <div className="farm-resource-label">
        <span aria-hidden="true">{icon}</span>
        <strong>{label}</strong>
        <span>{value}%</span>
      </div>
      <div className="farm-resource-track" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
        <div style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function FarmSimulation({ data, intro, onComplete }) {
  const [resources, setResources] = useState(initialFarmState);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [points, setPoints] = useState(0);
  const round = data[roundIndex];

  if (!round) return null;

  const choose = (optionIndex) => {
    if (selected !== null) return;
    const option = round.options[optionIndex];
    setResources((current) => applyFarmChoice(current, option.effects));
    setPoints((current) => current + option.points);
    setSelected(optionIndex);
  };

  const nextTurn = () => {
    if (roundIndex + 1 === data.length) {
      onComplete(points, data.length * 3);
      return;
    }
    setRoundIndex((current) => current + 1);
    setSelected(null);
  };

  return (
    <section className="engine-card farm-simulation-card">
      <div className="engine-header-row farm-game-header">
        <div>
          <p className="farm-game-kicker">VILLAGE FARM · SEASON {roundIndex + 1}</p>
          <h2>Manage your farm</h2>
        </div>
        <span className="engine-score-pill">★ {points} points</span>
      </div>
      <p className="farm-game-intro">{intro}</p>
      <div className="farm-resource-grid">
        {Object.keys(RESOURCE_LABELS).map((resource) => (
          <ResourceMeter key={resource} resource={resource} value={resources[resource]} />
        ))}
      </div>
      <div className="farm-turn-progress" aria-label={`Season ${roundIndex + 1} of ${data.length}`}>
        {data.map((item, index) => (
          <span
            key={item.q}
            className={index < roundIndex ? 'complete' : index === roundIndex ? 'current' : ''}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="farm-scene">
        <span aria-hidden="true">🌤️</span>
        <p>{round.story}</p>
      </div>
      <h3 className="farm-decision">{round.q}</h3>
      <div className="farm-options">
        {round.options.map((option, index) => (
          <button
            type="button"
            className={`farm-option ${selected === index ? (option.points === 3 ? 'best' : 'chosen') : ''}`}
            onClick={() => choose(index)}
            disabled={selected !== null}
            key={option.label}
          >
            <span className="farm-option-number">{String.fromCharCode(65 + index)}</span>
            <span>{option.label}</span>
            {selected === index && <span aria-hidden="true">{option.points === 3 ? '✓' : '↗'}</span>}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className={`farm-feedback ${round.options[selected].points === 3 ? 'good' : 'learning'}`} role="status">
          <p>{round.options[selected].feedback}</p>
          <div className="farm-impact-list">
            {Object.entries(round.options[selected].effects).filter(([, change]) => change !== 0).map(([resource, change]) => (
              <span key={resource}>
                {RESOURCE_LABELS[resource].icon} {change > 0 ? '+' : ''}{change} {resource === 'crops' ? 'crop' : resource}
              </span>
            ))}
          </div>
          {roundIndex + 1 === data.length && (
            <p className="farm-final-outcome">End-of-season farm health: {getFarmOutcome(resources)}%</p>
          )}
          <button type="button" className="btn btn-primary" onClick={nextTurn}>
            {roundIndex + 1 === data.length ? 'Finish season' : 'Next farm decision →'}
          </button>
        </div>
      )}
    </section>
  );
}
