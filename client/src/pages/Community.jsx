import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Community.css';

const socketUrl = import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin;

export default function Community() {
  const { user, refreshUser } = useAuth();
  const { t, lang } = useLanguage();
  const socketRef = useRef(null);
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState('');
  const [members, setMembers] = useState([]);
  const [roomCount, setRoomCount] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answeredQuestion, setAnsweredQuestion] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [scoreboard, setScoreboard] = useState([]);
  const [roomStatus, setRoomStatus] = useState('disconnected');
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [mentorStatus, setMentorStatus] = useState(null);
  const [question, setQuestion] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [collective, setCollective] = useState(null);
  const [collectiveLoading, setCollectiveLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');

  const reloadMentoring = useCallback(async () => {
    const [available, mine, status] = await Promise.all([
      api.mentorRequests(),
      api.myMentorRequests(),
      api.mentorStatus(),
    ]);
    setRequests(available);
    setMyRequests(mine);
    setMentorStatus(status);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.communityStudyLessons(), api.subjects(), api.mentorRequests(), api.myMentorRequests(), api.mentorStatus()])
      .then(([studyLessons, subjectList, available, mine, status]) => {
        if (!active) return;
        setLessons(studyLessons);
        setSubjects(subjectList);
        setRequests(available);
        setMyRequests(mine);
        setMentorStatus(status);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || t('community_load_error'));
      });
    return () => {
      active = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [t]);

  useEffect(() => {
    let active = true;
    setCollectiveLoading(true);
    api.communityCollective()
      .then((result) => { if (active) setCollective(result); })
      .catch((requestError) => { if (active) setError(requestError.message || t('community_collective_error')); })
      .finally(() => { if (active) setCollectiveLoading(false); });
    return () => { active = false; };
  }, [t]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;
    const onConnect = () => {
      setRoomStatus('connected');
      if (selectedLesson) {
        socket.emit('room:join', { lessonId: Number(selectedLesson), language: lang }, (result) => {
          if (result?.error) {
            setError(result.error);
            setRoomStatus('disconnected');
          } else {
            setMembers(result.members || []);
            setRoomCount(result.count || 0);
            setScoreboard(result.scoreboard || []);
          }
        });
      }
    };
    const onConnectError = (connectionError) => {
      setRoomStatus('disconnected');
      setError(connectionError.message || t('community_connection_error'));
    };
    const onDisconnect = () => {
      setRoomStatus('disconnected');
      setMembers([]);
      setRoomCount(0);
    };
    const onPresence = (presence) => {
      setMembers(presence.members || []);
      setRoomCount(presence.count || 0);
    };
    const onQuestion = (nextQuestion) => {
      setActiveQuestion(nextQuestion);
      setAnsweredQuestion(null);
      setReveal(null);
    };
    const onReveal = (result) => setReveal(result);
    const onScoreboard = (result) => setScoreboard(result.scoreboard || []);
    const onComplete = (result) => {
      setScoreboard(result.scoreboard || []);
      setActiveQuestion(null);
      setAnsweredQuestion(null);
      setReveal(null);
      setNotice(t('community_flash_complete'));
    };
    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.on('room:presence', onPresence);
    socket.on('flash:question', onQuestion);
    socket.on('flash:reveal', onReveal);
    socket.on('flash:scoreboard', onScoreboard);
    socket.on('flash:complete', onComplete);
    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.off('room:presence', onPresence);
      socket.off('flash:question', onQuestion);
      socket.off('flash:reveal', onReveal);
      socket.off('flash:scoreboard', onScoreboard);
      socket.off('flash:complete', onComplete);
    };
  }, [lang, selectedLesson, t, roomStatus]);

  const joinRoom = () => {
    setError('');
    setNotice('');
    if (!selectedLesson) {
      setError(t('community_choose_lesson'));
      return;
    }
    let socket = socketRef.current;
    if (!socket) {
      socket = io(socketUrl, {
        autoConnect: false,
        auth: { token: localStorage.getItem('token') },
      });
      socketRef.current = socket;
      setRoomStatus('connecting');
      socket.connect();
    } else if (socket.connected) {
      setRoomStatus('connected');
      socket.emit('room:join', { lessonId: Number(selectedLesson), language: lang }, (result) => {
        if (result?.error) setError(result.error);
        else {
          setMembers(result.members || []);
          setRoomCount(result.count || 0);
          setScoreboard(result.scoreboard || []);
        }
      });
    } else {
      setRoomStatus('connecting');
      socket.connect();
    }
  };

  const leaveRoom = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setRoomStatus('disconnected');
    setMembers([]);
    setRoomCount(0);
    setActiveQuestion(null);
    setAnsweredQuestion(null);
    setReveal(null);
    setScoreboard([]);
  };

  const startFlash = () => {
    socketRef.current?.emit('flash:start', (result) => {
      if (result?.error) setError(result.error);
    });
  };

  const submitFlashAnswer = (optionIndex) => {
    if (!activeQuestion || answeredQuestion === activeQuestion.id) return;
    setAnsweredQuestion(activeQuestion.id);
    socketRef.current?.emit('flash:answer', { optionIndex }, (result) => {
      if (result?.error) {
        setAnsweredQuestion(null);
        setError(result.error);
      }
      else setNotice(t('community_answer_received'));
    });
  };

  const postQuestion = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api.createMentorRequest({ question, subjectId: subjectId || null });
      setQuestion('');
      setNotice(t('community_question_posted'));
      await reloadMentoring();
    } catch (requestError) {
      setError(requestError.message || t('community_post_error'));
    } finally {
      setBusy(false);
    }
  };

  const submitMentorAnswer = async (requestId) => {
    const response = answers[requestId] || '';
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await api.answerMentorRequest(requestId, response);
      refreshUser({ ...user, xp: result.mentorXp, level: result.mentorLevel });
      setAnswers((current) => ({ ...current, [requestId]: '' }));
      setNotice(t('community_mentor_reward', { xp: result.xpAwarded }));
      await reloadMentoring();
    } catch (requestError) {
      setError(requestError.message || t('community_answer_error'));
    } finally {
      setBusy(false);
    }
  };

  const createAlliance = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const alliance = await api.createAlliance();
      setCollective((current) => ({ ...current, alliance }));
      setNotice(t('community_alliance_created'));
    } catch (requestError) {
      setError(requestError.message || t('community_alliance_error'));
    } finally {
      setBusy(false);
    }
  };

  const joinAlliance = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const alliance = await api.joinAlliance(joinCode);
      setCollective((current) => ({ ...current, alliance }));
      setJoinCode('');
      setNotice(t('community_alliance_joined'));
    } catch (requestError) {
      setError(requestError.message || t('community_alliance_error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="community-page">
      <header className="community-heading">
        <p className="community-eyebrow">🤝 {t('community_eyebrow')}</p>
        <h1 className="page-title">{t('community_title')}</h1>
        <p className="page-subtitle">{t('community_subtitle')}</p>
      </header>
      {error && <p className="community-message error" role="alert">{error}</p>}
      {notice && <p className="community-message success" role="status">{notice}</p>}

      <section className="community-collective-grid" aria-label={t('community_collective_title')}>
        <article className="card community-collective-card village-tree-card">
          <div className="community-collective-heading">
            <span aria-hidden="true">🌳</span>
            <div><p>{t('community_collective_eyebrow')}</p><h2>{t('community_tree_title')}</h2></div>
          </div>
          {collectiveLoading ? <p role="status">{t('loading')}</p> : collective?.villageTree?.requiresLocation ? (
            <div className="community-location-prompt">
              <p>{t('community_tree_add_location')}</p>
              <Link to="/profile" className="btn btn-secondary btn-sm">{t('community_tree_profile')}</Link>
            </div>
          ) : collective?.villageTree && (
            <>
              <p className="community-collective-copy">{t('community_tree_help')}</p>
              <div className="community-tree-visual" aria-hidden="true">
                <span>{collective.villageTree.growth >= 75 ? '🌳' : collective.villageTree.growth >= 40 ? '🌿' : '🌱'}</span>
                <i className="community-tree-ground" />
              </div>
              <div className="community-tree-progress" role="progressbar" aria-label={t('community_tree_growth')} aria-valuenow={collective.villageTree.growth} aria-valuemin="0" aria-valuemax="100">
                <span style={{ width: `${collective.villageTree.growth}%` }} />
              </div>
              {collective.villageTree.privacyThresholdMet ? (
                <p className="community-tree-stats">{t('community_tree_stats', { lessons: collective.villageTree.completedLessons, learners: collective.villageTree.contributors })}</p>
              ) : (
                <p className="community-tree-stats">{t('community_tree_privacy', { count: collective.villageTree.minimumContributors })}</p>
              )}
              <ul className="community-tree-milestones">
                {collective.villageTree.milestones.map((milestone) => (
                  <li key={milestone.id} className={milestone.unlocked ? 'unlocked' : ''}>
                    <span aria-hidden="true">{milestone.unlocked ? '✓' : '○'}</span>
                    <span>{t(milestone.rewardKey)}</span>
                    {!milestone.unlocked && <small>{milestone.goal} {t('community_tree_lessons_goal')}</small>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>

        <article className="card community-collective-card alliance-card">
          <div className="community-collective-heading">
            <span aria-hidden="true">🧩</span>
            <div><p>{t('community_collective_eyebrow')}</p><h2>{t('community_alliance_title')}</h2></div>
          </div>
          <p className="community-collective-copy">{t('community_alliance_help')}</p>
          {collectiveLoading ? <p role="status">{t('loading')}</p> : collective?.alliance ? (
            <>
              <div className="community-alliance-code">
                <span>{t('community_alliance_code')}</span>
                <strong>{collective.alliance.joinCode}</strong>
                <small>{t('community_alliance_share')}</small>
              </div>
              <div className="community-alliance-progress">
                <p>{t('community_alliance_members', { count: collective.alliance.memberCount, max: collective.alliance.maxMembers })}</p>
                <p className={collective.alliance.progress.math ? 'complete' : ''}>{collective.alliance.progress.math ? '✓' : '○'} {t('community_alliance_math')}</p>
                <p className={collective.alliance.progress.science ? 'complete' : ''}>{collective.alliance.progress.science ? '✓' : '○'} {t('community_alliance_science')}</p>
                {collective.alliance.progress.completed && <strong className="community-alliance-complete">🎉 {t('community_alliance_complete')}</strong>}
              </div>
              <ul className="community-alliance-members">
                {collective.alliance.members.map((member, index) => (
                  <li key={`${member.label}-${index}`}>
                    <strong>{member.label}</strong>
                    <span>{member.completedMath ? `✓ ${t('community_alliance_math')}` : ''}{member.completedMath && member.completedScience ? ' · ' : ''}{member.completedScience ? `✓ ${t('community_alliance_science')}` : ''}{!member.completedMath && !member.completedScience ? t('community_alliance_not_started') : ''}</span>
                  </li>
                ))}
              </ul>
              {!collective.alliance.progress.completed && <Link className="btn btn-primary btn-sm" to="/subjects">{t('community_alliance_contribute')} →</Link>}
            </>
          ) : (
            <div className="community-alliance-actions">
              {user?.village && user?.district ? (
                <button type="button" className="btn btn-primary" onClick={createAlliance} disabled={busy}>{t('community_alliance_create')}</button>
              ) : (
                <div className="community-location-prompt">
                  <p>{t('community_alliance_add_location')}</p>
                  <Link to="/profile" className="btn btn-secondary btn-sm">{t('community_tree_profile')}</Link>
                </div>
              )}
              <form onSubmit={joinAlliance}>
                <label>{t('community_alliance_join_label')}
                  <input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={10} minLength={10} pattern="[A-Fa-f0-9]{10}" required placeholder={t('community_alliance_code_placeholder')} />
                </label>
                <button type="submit" className="btn btn-secondary" disabled={busy || joinCode.length !== 10}>{t('community_alliance_join')}</button>
              </form>
            </div>
          )}
          <p className="community-privacy-note">{t('community_alliance_privacy')}</p>
        </article>
      </section>

      <section className="card community-panel">
        <div className="community-panel-heading">
          <span aria-hidden="true">🪁</span>
          <div><h2>{t('community_rooms_title')}</h2><p>{t('community_rooms_help')}</p></div>
        </div>
        <div className="community-room-controls">
          <label>{t('community_lesson_room')}
            <select value={selectedLesson} onChange={(event) => setSelectedLesson(event.target.value)} disabled={roomStatus === 'connected'}>
              <option value="">{t('community_choose_lesson')}</option>
              {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.subject}: {lesson.title}</option>)}
            </select>
          </label>
          {roomStatus === 'connected'
            ? <button type="button" className="btn btn-secondary" onClick={leaveRoom}>{t('community_leave_room')}</button>
            : <button type="button" className="btn btn-primary" onClick={joinRoom} disabled={roomStatus === 'connecting'}>{roomStatus === 'connecting' ? t('community_connecting') : t('community_join_room')}</button>}
        </div>
        {roomStatus === 'connected' && (
          <div className="community-room-live">
            <div className="community-live-heading">
              <span className="community-live-dot" />
              <strong>{t('community_room_live', { count: roomCount })}</strong>
              <button type="button" className="btn btn-primary btn-sm" onClick={startFlash} disabled={Boolean(activeQuestion)}>{t('community_start_flash')}</button>
            </div>
            <p className="community-privacy-note">{t('community_anonymous_note')}</p>
            <div className="community-avatar-list" aria-label={t('community_online_learners')}>
              {members.map((member) => <span className="community-avatar" key={member.id}>{member.avatar}</span>)}
            </div>
            {activeQuestion && (
              <article className="community-flash-question">
                <p>{t('community_flash_progress', { current: activeQuestion.number, total: activeQuestion.total })}</p>
                <h3>{activeQuestion.question}</h3>
                <div className="community-flash-options">
                  {activeQuestion.options.map((option, index) => (
                    <button type="button" key={option} disabled={Boolean(reveal) || answeredQuestion === activeQuestion.id} onClick={() => submitFlashAnswer(index)}>{option}</button>
                  ))}
                </div>
                {reveal && <p className="community-flash-reveal">{t('community_correct_answer', { answer: activeQuestion.options[reveal.correctIndex] })} {reveal.explanation}</p>}
              </article>
            )}
            {scoreboard.length > 0 && (
              <ol className="community-scoreboard">
                {scoreboard.slice(0, 5).map((player, index) => <li key={`${player.avatar}-${index}`}><span>{player.avatar} {t('community_player_number', { number: index + 1 })}</span><strong>{player.score}</strong></li>)}
              </ol>
            )}
          </div>
        )}
      </section>

      <section className="card community-panel">
        <div className="community-panel-heading">
          <span aria-hidden="true">🌱</span>
          <div><h2>{t('community_buddy_title')}</h2><p>{t('community_buddy_help')}</p></div>
        </div>
        <div className="community-mentor-status">
          <strong>{mentorStatus?.unlocked ? `🏅 ${t('community_mentor_unlocked')}` : `🔒 ${t('community_mentor_locked')}`}</strong>
          <span>{t('community_mentor_level', { level: user?.level || 1 })}</span>
          {mentorStatus?.unlocked && <span>{t('community_mentor_daily', { answers: mentorStatus.answersToday, limit: mentorStatus.dailyAnswerLimit, xp: mentorStatus.xpToday, xpLimit: mentorStatus.dailyXpLimit })}</span>}
        </div>
        <p className="community-privacy-note">{t('community_ai_review_note')}</p>
        <form className="community-question-form" onSubmit={postQuestion}>
          <label>{t('community_question_label')}
            <textarea required minLength={10} maxLength={500} rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t('community_question_placeholder')} />
          </label>
          <div className="community-room-controls">
            <label>{t('community_subject')}
              <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
                <option value="">{t('community_any_subject')}</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>{t('community_post_question')}</button>
          </div>
        </form>

        {mentorStatus?.unlocked && (
          <div className="community-requests">
            <h3>{t('community_open_questions')}</h3>
            {requests.length ? requests.map((request) => (
              <article className="community-request" key={request.id}>
                <span className="community-request-subject">{request.subject || t('community_any_subject')}</span>
                <p>{request.question}</p>
                <label>{t('community_your_answer')}
                  <textarea minLength={20} maxLength={800} rows={3} value={answers[request.id] || ''} onChange={(event) => setAnswers((current) => ({ ...current, [request.id]: event.target.value }))} />
                </label>
                <button type="button" className="btn btn-secondary" disabled={busy || (answers[request.id] || '').trim().length < 20} onClick={() => submitMentorAnswer(request.id)}>{t('community_send_for_review')}</button>
              </article>
            )) : <p>{t('community_no_questions')}</p>}
          </div>
        )}
        <div className="community-my-questions">
          <h3>{t('community_my_questions')}</h3>
          {myRequests.length ? myRequests.map((item) => (
            <article key={item.id}>
              <p>{item.question}</p>
              <span>{item.answer ? `${t('community_mentor_reply')}: ${item.answer}` : t('community_waiting_for_mentor')}</span>
            </article>
          )) : <p>{t('community_no_own_questions')}</p>}
        </div>
      </section>
    </div>
  );
}
