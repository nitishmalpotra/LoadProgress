import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, RefreshCw, Trophy } from 'lucide-react';
import type { PersonalRecord, PersonalRecordType } from '@/models';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import styles from '@/views/styles/Records.module.css';

const recordOrder: PersonalRecordType[] = ['1RM', 'Weight at Reps', 'Volume', 'Total Reps'];

const recordLabels: Record<PersonalRecordType, string> = {
  '1RM': 'Estimated 1RM',
  'Weight at Reps': 'Weight at Reps',
  Volume: 'Daily Volume',
  'Total Reps': 'Total Reps'
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);

const formatRecordValue = (record: PersonalRecord) => {
  if (record.type === 'Volume') {
    return `${Math.round(record.value).toLocaleString()} kg reps`;
  }

  if (record.type === 'Total Reps') {
    return `${Math.round(record.value).toLocaleString()} reps`;
  }

  return `${record.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
};

function bestRecords(records: PersonalRecord[]) {
  const bestByExerciseAndType = records.reduce<Record<string, PersonalRecord>>((best, record) => {
    const key =
      record.type === 'Weight at Reps'
        ? `${record.exerciseId}:${record.type}:${record.reps}`
        : `${record.exerciseId}:${record.type}`;
    const existing = best[key];

    if (!existing || record.value > existing.value) {
      best[key] = record;
    }

    return best;
  }, {});

  return Object.values(bestByExerciseAndType).sort((left, right) => {
    const typeRank = recordOrder.indexOf(left.type) - recordOrder.indexOf(right.type);
    return typeRank === 0 ? right.value - left.value : typeRank;
  });
}

export function RecordsTab() {
  const exercisesById = useWorkoutStore((state) => state.exercisesById);
  const personalRecords = useWorkoutStore((state) => state.personalRecords);
  const isLoading = useWorkoutStore((state) => state.isLoading);
  const error = useWorkoutStore((state) => state.error);
  const loadWorkoutData = useWorkoutStore((state) => state.loadWorkoutData);

  useEffect(() => {
    void loadWorkoutData().catch(() => undefined);
  }, [loadWorkoutData]);

  const records = useMemo(() => bestRecords(personalRecords), [personalRecords]);
  const recentRecords = useMemo(
    () =>
      personalRecords
        .slice()
        .sort((left, right) => right.date.getTime() - left.date.getTime())
        .slice(0, 4),
    [personalRecords]
  );
  const recordCounts = useMemo(
    () =>
      recordOrder.map((type) => ({
        type,
        count: personalRecords.filter((record) => record.type === type).length
      })),
    [personalRecords]
  );

  return (
    <section className={styles.recordsPage} aria-labelledby="records-title">
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Personal Records</p>
        <h1 id="records-title">PRs</h1>
        <p>Best lifts and recent milestones from your logged training.</p>
      </header>

      {error ? (
        <div className={styles.statePanel} role="alert">
          <h2>Records could not load</h2>
          <p>{error}</p>
          <button type="button" onClick={() => void loadWorkoutData().catch(() => undefined)}>
            <RefreshCw size={17} />
            Retry
          </button>
        </div>
      ) : null}

      {isLoading && records.length === 0 ? (
        <div className={styles.statePanel}>
          <h2>Loading records</h2>
          <p>Reading personal bests saved on this device.</p>
        </div>
      ) : null}

      {!isLoading && !error && records.length === 0 ? (
        <div className={styles.statePanel}>
          <h2>No personal records yet</h2>
          <p>Log a weighted set to create 1RM, volume, and weight-at-reps records.</p>
          <Link to="/">
            <Trophy size={17} />
            Log a set
          </Link>
        </div>
      ) : null}

      {records.length > 0 ? (
        <>
          <section className={styles.summaryGrid} aria-label="Record type counts">
            {recordCounts.map((item) => (
              <article className={styles.summaryCard} key={item.type}>
                <span>{recordLabels[item.type]}</span>
                <strong>{item.count}</strong>
              </article>
            ))}
          </section>

          <section className={styles.recordPanel} aria-labelledby="best-records-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="best-records-title">Personal Bests</h2>
                <p>{records.length} current bests</p>
              </div>
              <Trophy aria-hidden="true" size={20} />
            </div>
            <div className={styles.recordList}>
              {records.map((record) => {
                const exercise = exercisesById[record.exerciseId];
                return (
                  <Link
                    className={styles.recordRow}
                    key={`${record.exerciseId}-${record.type}-${record.reps}`}
                    to={`/exercises/${record.exerciseId}`}
                  >
                    <span>
                      <strong>{exercise?.name ?? 'Unknown Exercise'}</strong>
                      <small>
                        {recordLabels[record.type]}
                        {record.type === 'Weight at Reps' ? ` · ${record.reps} reps` : ''}
                      </small>
                    </span>
                    <span className={styles.recordValue}>
                      {formatRecordValue(record)}
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className={styles.recordPanel} aria-labelledby="recent-records-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="recent-records-title">Recent</h2>
                <p>Latest record entries</p>
              </div>
            </div>
            <div className={styles.recentList}>
              {recentRecords.map((record) => (
                <div className={styles.recentRow} key={record.id}>
                  <span>{formatDate(record.date)}</span>
                  <strong>{exercisesById[record.exerciseId]?.name ?? 'Unknown Exercise'}</strong>
                  <small>{recordLabels[record.type]}</small>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
