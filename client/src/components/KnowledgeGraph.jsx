import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './KnowledgeGraph.css';

const STATUS_ICONS = {
  mastered: '✓',
  practicing: '◉',
  struggling: '!',
  not_started: '○',
};

export default function KnowledgeGraph({ graph, title, description, interactive = true, loading = false }) {
  const { t } = useLanguage();

  return (
    <section className="card knowledge-graph" aria-label={title}>
      <header className="knowledge-graph-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </header>
      <div className="knowledge-graph-legend">
        {['mastered', 'practicing', 'struggling', 'not_started'].map((status) => (
          <span key={status} className={`knowledge-graph-legend-item status-${status}`}>
            <i aria-hidden="true">{STATUS_ICONS[status]}</i>{t(`knowledge_${status}`)}
          </span>
        ))}
      </div>
      {loading ? <p className="knowledge-graph-empty" role="status">{t('loading')}</p> : graph?.length ? (
        <div className="knowledge-graph-subjects">
          {graph.map((subject) => (
            <section className="knowledge-subject" key={subject.id} aria-label={subject.name}>
              <h3>{subject.name}</h3>
              <ol className="knowledge-node-list">
                {subject.nodes.map((node) => (
                  <li className={`knowledge-node status-${node.status}`} key={node.id}>
                    <span className="knowledge-node-marker" aria-hidden="true">{STATUS_ICONS[node.status]}</span>
                    <div className="knowledge-node-info">
                      {interactive
                        ? <Link to={node.href}>{node.title}</Link>
                        : <strong>{node.title}</strong>}
                      <span>{t(`knowledge_${node.status}`)} · {node.mastery}%</span>
                    </div>
                    <div className="knowledge-node-progress" role="progressbar" aria-label={node.title} aria-valuenow={node.mastery} aria-valuemin="0" aria-valuemax="100">
                      <span style={{ width: `${node.mastery}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : <p className="knowledge-graph-empty">{t('knowledge_empty')}</p>}
    </section>
  );
}
