'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type View = 'inbox' | 'today' | 'upcoming' | 'completed';
type Priority = 'low' | 'medium' | 'high';

type Task = {
  id: string;
  title: string;
  notes: string;
  project: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  createdAt: string;
};

const PROJECTS = [
  { id: 'work', label: 'Work', color: '#6c82ae' },
  { id: 'personal', label: 'Personal', color: '#d97855' },
  { id: 'health', label: 'Health', color: '#7b9b72' },
];

const STORAGE_KEY = 'daymark.tasks.v1';

function dateKey(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function addDays(amount: number) {
  const date = new Date();
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

function starterTasks(): Task[] {
  const createdAt = new Date().toISOString();
  return [
    {
      id: 'starter-1',
      title: 'Map out the week ahead',
      notes: 'Choose the three outcomes that would make this week feel successful.',
      project: 'work',
      priority: 'high',
      dueDate: addDays(0),
      completed: false,
      createdAt,
    },
    {
      id: 'starter-2',
      title: 'Book a health check-up',
      notes: '',
      project: 'health',
      priority: 'medium',
      dueDate: addDays(1),
      completed: false,
      createdAt,
    },
    {
      id: 'starter-3',
      title: 'Pick up groceries for dinner',
      notes: 'Olive oil, tomatoes, pasta, basil.',
      project: 'personal',
      priority: 'low',
      dueDate: addDays(0),
      completed: false,
      createdAt,
    },
    {
      id: 'starter-4',
      title: 'Clear the desk and reset',
      notes: '',
      project: 'personal',
      priority: 'low',
      dueDate: addDays(-1),
      completed: true,
      createdAt,
    },
  ];
}

function dueLabel(dueDate: string, today: string) {
  if (!dueDate) return 'No date';
  if (dueDate === today) return 'Today';
  if (dueDate === addDays(1)) return 'Tomorrow';
  if (dueDate < today) return 'Overdue';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(`${dueDate}T12:00:00`),
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>('today');
  const [projectFilter, setProjectFilter] = useState('');
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [project, setProject] = useState('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = dateKey();
    setToday(current);
    setDueDate(current);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      const initial = Array.isArray(parsed) ? parsed : starterTasks();
      setTasks(initial);
      if (!saved) localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch {
      setTasks(starterTasks());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        titleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedToday = tasks.filter(
    (task) => task.completed && task.dueDate === today,
  ).length;
  const todayTotal = tasks.filter((task) => task.dueDate === today).length;
  const todayRemaining = tasks.filter(
    (task) => !task.completed && task.dueDate && task.dueDate <= today,
  ).length;
  const progress = todayTotal ? Math.round((completedToday / todayTotal) * 100) : 0;

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks
      .filter((task) => {
        if (view === 'inbox' && task.completed) return false;
        if (view === 'today' && (task.completed || !task.dueDate || task.dueDate > today)) return false;
        if (view === 'upcoming' && (task.completed || !task.dueDate || task.dueDate <= today)) return false;
        if (view === 'completed' && !task.completed) return false;
        if (projectFilter && task.project !== projectFilter) return false;
        if (query && !`${task.title} ${task.notes}`.toLowerCase().includes(query)) return false;
        return true;
      })
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (a.dueDate !== b.dueDate) return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks, view, projectFilter, search, today]);

  const currentHeading = projectFilter
    ? PROJECTS.find((item) => item.id === projectFilter)?.label ?? 'Project'
    : { inbox: 'Inbox', today: 'Today', upcoming: 'Upcoming', completed: 'Completed' }[view];

  function addTask(event: FormEvent) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const newTask: Task = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      title: cleanTitle,
      notes: '',
      project,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((current) => [newTask, ...current]);
    setTitle('');
    setAnnouncement(`Added ${cleanTitle}`);
    titleRef.current?.focus();
  }

  function toggleTask(task: Task) {
    const completed = !task.completed;
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, completed } : item)),
    );
    setAnnouncement(completed ? `Completed ${task.title}` : `Reopened ${task.title}`);
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    );
  }

  function deleteTask(task: Task) {
    setTasks((current) => current.filter((item) => item.id !== task.id));
    setSelectedId(null);
    setAnnouncement(`Deleted ${task.title}`);
  }

  function changeView(nextView: View) {
    setView(nextView);
    setProjectFilter('');
  }

  function formatLongDate() {
    if (!today) return 'Your day, clearly planned';
    return new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date(`${today}T12:00:00`));
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>Daymark</span>
        </div>

        <nav className="primary-nav" aria-label="Task views">
          <button className={view === 'inbox' && !projectFilter ? 'active' : ''} onClick={() => changeView('inbox')}>
            <span className="nav-icon" aria-hidden="true">⌁</span>
            Inbox
            <span className="nav-count">{activeTasks.length}</span>
          </button>
          <button className={view === 'today' && !projectFilter ? 'active' : ''} onClick={() => changeView('today')}>
            <span className="nav-icon calendar-icon" aria-hidden="true">{today ? Number(today.slice(-2)) : '•'}</span>
            Today
            {todayRemaining > 0 && <span className="nav-count accent-count">{todayRemaining}</span>}
          </button>
          <button className={view === 'upcoming' && !projectFilter ? 'active' : ''} onClick={() => changeView('upcoming')}>
            <span className="nav-icon" aria-hidden="true">↗</span>
            Upcoming
          </button>
          <button className={view === 'completed' && !projectFilter ? 'active' : ''} onClick={() => changeView('completed')}>
            <span className="nav-icon" aria-hidden="true">✓</span>
            Completed
          </button>
        </nav>

        <div className="projects-block">
          <p className="eyebrow">Projects</p>
          <div className="project-nav">
            {PROJECTS.map((item) => (
              <button
                key={item.id}
                className={projectFilter === item.id ? 'active-project' : ''}
                onClick={() => {
                  setView('inbox');
                  setProjectFilter(item.id);
                }}
              >
                <span className="project-dot" style={{ background: item.color }} />
                {item.label}
                <span className="nav-count">
                  {activeTasks.filter((task) => task.project === item.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-note">
          <span className="note-kicker">LOCAL & PRIVATE</span>
          <p>Your tasks stay saved in this browser.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
              aria-label="Search tasks"
            />
          </label>
          <span className="shortcut-hint">Quick add <kbd>⌘ K</kbd></span>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <p className="date-line">{formatLongDate()}</p>
              <h1>{currentHeading}</h1>
            </div>
            <span className="task-summary">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <form className="quick-add" onSubmit={addTask}>
            <div className="add-main-row">
              <span className="add-plus" aria-hidden="true">+</span>
              <input
                ref={titleRef}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What needs to be done?"
                aria-label="Task title"
              />
              <button type="button" className="details-toggle" onClick={() => setDetailsOpen((open) => !open)} aria-expanded={detailsOpen}>
                Details <span aria-hidden="true">{detailsOpen ? '−' : '+'}</span>
              </button>
              <button type="submit" className="add-button">Add task</button>
            </div>
            {detailsOpen && (
              <div className="add-details">
                <label>
                  Due
                  <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
                </label>
                <label>
                  Project
                  <select value={project} onChange={(event) => setProject(event.target.value)}>
                    {PROJECTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <label>
                  Priority
                  <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
            )}
          </form>

          <div className="list-header">
            <span>{view === 'completed' ? 'Finished' : 'To do'}</span>
            {view === 'completed' && tasks.some((task) => task.completed) && (
              <button onClick={() => setTasks((current) => current.filter((task) => !task.completed))}>Clear completed</button>
            )}
          </div>

          <div className="task-list" aria-busy={!ready}>
            {!ready ? (
              <div className="empty-state"><span>○</span><p>Gathering your tasks…</p></div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <span>✓</span>
                <h2>{search ? 'No matching tasks' : 'All clear here'}</h2>
                <p>{search ? 'Try another search phrase.' : 'Add something above, or enjoy the breathing room.'}</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const projectInfo = PROJECTS.find((item) => item.id === task.project);
                const isSelected = selectedId === task.id;
                const label = dueLabel(task.dueDate, today);
                return (
                  <article className={`task-card ${task.completed ? 'is-completed' : ''} ${isSelected ? 'is-selected' : ''}`} key={task.id}>
                    <div className="task-row">
                      <button
                        className="check-button"
                        onClick={() => toggleTask(task)}
                        aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
                        style={{ '--check-color': projectInfo?.color ?? '#7b9b72' } as React.CSSProperties}
                      >
                        {task.completed && <span aria-hidden="true">✓</span>}
                      </button>
                      <button className="task-copy" onClick={() => setSelectedId(isSelected ? null : task.id)} aria-expanded={isSelected}>
                        <span className="task-title">{task.title}</span>
                        <span className="task-meta">
                          <span className={`due ${label === 'Overdue' ? 'overdue' : ''}`}>{label}</span>
                          <span aria-hidden="true">·</span>
                          <span><i style={{ background: projectInfo?.color }} />{projectInfo?.label}</span>
                          {task.priority === 'high' && <><span aria-hidden="true">·</span><span className="high-priority">High priority</span></>}
                        </span>
                      </button>
                      <button className="edit-trigger" onClick={() => setSelectedId(isSelected ? null : task.id)} aria-label={`Edit ${task.title}`}>•••</button>
                    </div>
                    {isSelected && (
                      <div className="task-editor">
                        <label className="wide-field">
                          Task
                          <input value={task.title} onChange={(event) => updateTask(task.id, { title: event.target.value })} />
                        </label>
                        <label>
                          Due
                          <input type="date" value={task.dueDate} onChange={(event) => updateTask(task.id, { dueDate: event.target.value })} />
                        </label>
                        <label>
                          Project
                          <select value={task.project} onChange={(event) => updateTask(task.id, { project: event.target.value })}>
                            {PROJECTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                          </select>
                        </label>
                        <label>
                          Priority
                          <select value={task.priority} onChange={(event) => updateTask(task.id, { priority: event.target.value as Priority })}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </label>
                        <label className="wide-field">
                          Notes
                          <textarea value={task.notes} onChange={(event) => updateTask(task.id, { notes: event.target.value })} placeholder="Add a useful note…" rows={3} />
                        </label>
                        <div className="editor-actions">
                          <button className="delete-button" onClick={() => deleteTask(task)}>Delete task</button>
                          <button className="done-button" onClick={() => setSelectedId(null)}>Done</button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      <aside className="insights">
        <div className="insights-inner">
          <p className="eyebrow">Daily focus</p>
          <div className="progress-card">
            <div className="progress-number">{progress}<span>%</span></div>
            <p>of today complete</p>
            <div className="progress-track" aria-label={`${progress}% of today's tasks complete`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-stats">
              <span><strong>{completedToday}</strong> done</span>
              <span><strong>{todayRemaining}</strong> left</span>
            </div>
          </div>

          <div className="focus-quote">
            <span className="quote-mark quote-mark-open" aria-hidden="true">“</span>
            <p>Make room for what matters. The rest can wait.</p>
            <span className="quote-mark quote-mark-close" aria-hidden="true">”</span>
          </div>

          <div className="tip-card">
            <span className="tip-icon" aria-hidden="true">⌘</span>
            <div>
              <strong>One less click</strong>
              <p>Press <kbd>⌘ K</kbd> anytime to jump straight to quick add.</p>
            </div>
          </div>
        </div>
      </aside>

      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </main>
  );
}
