import { useEffect, useRef, useState } from 'react'
import './Notes.css'

const MAX_LENGTH = 1000
const MAX_TITLE_LENGTH = 100

function Icon({ name, size = 20 }) {
  const paths = {
    notebook: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v18M3 7h4M3 12h4M3 17h4M12 8h4M12 12h4" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    edit: <><path d="m16 3 5 5L9 20l-6 1 1-6Z" /><path d="m13 6 5 5" /></>,
    trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v6M14 10v6" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    text: <><path d="M4 5h16M12 5v15M8 20h8" /></>,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

async function request(path = '', options = {}) {
  let response
  try {
    response = await fetch(`/api/notes${path}`, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    })
  } catch {
    throw new Error('暂时无法连接，请检查网络后重试')
  }
  if (response.status === 204) return null
  let data
  try {
    data = JSON.parse(await response.text())
  } catch {
    throw new Error(response.ok ? '没有收到预期的数据，请稍后重试' : `服务暂时不可用（${response.status}），请稍后重试`)
  }
  if (!response.ok) throw new Error(data?.error || `请求失败（${response.status}）`)
  return data
}

function timestamp(note) {
  return new Date(note.updated_at || note.created_at).getTime() || 0
}

function formatDate(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return '暂无时间'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(date)
}

function isToday(value) {
  return Boolean(value) && new Date(value).toDateString() === new Date().toDateString()
}

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('all')
  const [sort, setSort] = useState('updated')
  const [connected, setConnected] = useState(false)
  const [retry, setRetry] = useState(0)
  const searchRef = useRef(null)
  const titleRef = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    let active = true
    request().then((data) => {
      if (!Array.isArray(data)) throw new Error('笔记列表格式不正确')
      if (active) { setNotes(data); setConnected(true); setError('') }
    }).catch((err) => {
      if (active) { setError(err.message); setConnected(false) }
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [retry])

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const todayCount = notes.filter((note) => isToday(note.updated_at || note.created_at)).length
  const totalCharacters = notes.reduce((total, note) => total + Array.from(note.title || '').length + note.content.length, 0)
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredNotes = notes
    .filter((note) => view === 'all' || isToday(note.updated_at || note.created_at))
    .filter((note) => `${note.title || ''}\n${note.content}`.toLocaleLowerCase().includes(normalizedQuery))
    .sort((a, b) => sort === 'updated' ? timestamp(b) - timestamp(a) || b.id - a.id : b.id - a.id)
  const editingNote = notes.find((note) => note.id === editingId)

  function resetForm() { setEditingId(null); setTitle(''); setContent('') }

  function focusEditor() {
    titleRef.current?.focus()
    titleRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center',
    })
  }

  function startNew() {
    if (busy || loading || !connected) return
    resetForm(); setError(''); setNotice(''); focusEditor()
  }

  function startEditing(note) {
    if (busy) return
    setEditingId(note.id); setTitle(note.title || ''); setContent(note.content); setError(''); setNotice(''); focusEditor()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (busy || loading || !connected || !title.trim() || !content.trim()) return
    setBusy(true); setError(''); setNotice('')
    try {
      const isEditing = editingId !== null
      const saved = await request(isEditing ? `/${editingId}` : '', {
        method: isEditing ? 'PUT' : 'POST', body: JSON.stringify({ title, content }),
      })
      setNotes((current) => isEditing ? current.map((note) => note.id === saved.id ? saved : note) : [saved, ...current])
      resetForm()
      setNotice(isEditing ? '修改已保存，编辑时间已更新' : '新笔记已保存')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function handleDelete(id) {
    if (busy || !window.confirm('确定删除这条笔记吗？删除后无法恢复。')) return
    setBusy(true); setError(''); setNotice('')
    try {
      await request(`/${id}`, { method: 'DELETE' })
      setNotes((current) => current.filter((note) => note.id !== id))
      if (editingId === id) resetForm()
      setNotice('笔记已删除')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  function reload() { setLoading(true); setError(''); setRetry((value) => value + 1) }

  return (
    <div className="notes-app">
      <aside className="notes-sidebar" aria-label="笔记导航">
        <a className="notes-brand" href="#"><span className="notes-brand-mark"><Icon name="notebook" size={25} /></span><span>拾记<small>NOTES & IDEAS</small></span></a>
        <div className="notes-workspace"><span className="notes-avatar">我</span><div><strong>我的个人空间</strong><small>一点灵感，一点积累</small></div></div>
        <p className="notes-nav-label">我的工作台</p>
        <nav className="notes-nav">
          <button className={view === 'all' ? 'is-active' : ''} onClick={() => setView('all')} aria-current={view === 'all' ? 'page' : undefined}><Icon name="grid" /><span>全部笔记</span><span className="notes-nav-count">{loading ? '—' : notes.length}</span></button>
          <button className={view === 'today' ? 'is-active' : ''} onClick={() => setView('today')} aria-current={view === 'today' ? 'page' : undefined}><Icon name="clock" /><span>今日更新</span><span className="notes-nav-count">{loading ? '—' : todayCount}</span></button>
        </nav>
        <div className="notes-sidebar-note"><Icon name="spark" size={24} /><p>好想法值得被记住。</p><span>不用完整，不必完美。<br />从写下第一句话开始。</span></div>
        <div className={`notes-connection ${!connected && !loading ? 'is-offline' : ''}`} role="status"><span />{loading ? '正在连接…' : connected ? '笔记已同步' : '暂未连接'}</div>
      </aside>

      <div className="notes-main">
        <header className="notes-topbar">
          <div className="notes-breadcrumb">个人空间<span>/</span><strong>我的笔记</strong></div>
          <div className="notes-search"><Icon name="search" size={18} /><input ref={searchRef} type="search" aria-label="搜索笔记" placeholder="搜索灵感、关键词…" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></div>
          <button className="notes-button notes-button-primary notes-topbar-new" onClick={startNew} disabled={loading || busy || !connected}><Icon name="plus" size={18} />新建笔记</button>
        </header>

        <main className="notes-content">
          <div className="notes-page-heading"><div><p className="notes-eyebrow">A LITTLE SPACE FOR YOUR THOUGHTS</p><h1>我的笔记<span>·</span></h1><p className="notes-description">记录当下的灵感，也留一点空间给明天。</p></div><div className="notes-date"><Icon name="clock" size={16} /><span>{new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())}</span></div></div>

          <section className="notes-stats" aria-label="笔记概览">
            <div className="notes-stat"><span className="notes-stat-icon"><Icon name="notebook" size={21} /></span><div><span>全部笔记</span><strong>{loading ? '—' : notes.length}<small>篇</small></strong></div><span className="notes-stat-caption">每一篇都是积累</span></div>
            <div className="notes-stat"><span className="notes-stat-icon notes-stat-icon-warm"><Icon name="clock" size={21} /></span><div><span>今日更新</span><strong>{loading ? '—' : todayCount}<small>篇</small></strong></div><span className="notes-stat-caption">让想法持续生长</span></div>
            <div className="notes-stat"><span className="notes-stat-icon notes-stat-icon-blue"><Icon name="text" size={21} /></span><div><span>累计记录</span><strong>{loading ? '—' : totalCharacters.toLocaleString()}<small>字</small></strong></div><span className="notes-stat-caption">写下自己的日常</span></div>
          </section>

          {error && <div className="notes-message notes-message-error" role="alert"><Icon name="alert" size={19} /><span>{error}</span>{!connected && !loading && <button onClick={reload}>重新连接</button>}<button className="notes-message-close" onClick={() => setError('')} aria-label="关闭错误提示"><Icon name="close" size={16} /></button></div>}
          {notice && <div className="notes-message notes-message-success" role="status"><Icon name="check" size={18} /><span>{notice}</span><button className="notes-message-close" onClick={() => setNotice('')} aria-label="关闭成功提示"><Icon name="close" size={16} /></button></div>}

          <div className="notes-layout">
            <section className="notes-collection" aria-labelledby="notes-list-heading">
              <div className="notes-section-heading"><h2 id="notes-list-heading">{view === 'all' ? '全部笔记' : '今日更新'}<span>{filteredNotes.length}</span></h2><label className="notes-sort"><Icon name="clock" size={15} /><select aria-label="笔记排序" value={sort} onChange={(event) => setSort(event.target.value)}><option value="updated">最近编辑</option><option value="created">最新创建</option></select><Icon name="chevron" size={14} /></label></div>
              {loading ? <div className="notes-loading" role="status"><span className="notes-spinner" />正在整理你的笔记…</div> : !connected ? <div className="notes-empty"><span className="notes-empty-icon"><Icon name="alert" size={28} /></span><h3>笔记暂时没有连接</h3><p>请稍后重试，你已有的内容不会因此被清除。</p><button className="notes-button notes-button-secondary" onClick={reload}>重新连接</button></div> : filteredNotes.length === 0 ? <div className="notes-empty"><span className="notes-empty-icon"><Icon name={normalizedQuery ? 'search' : 'notebook'} size={29} /></span><h3>{normalizedQuery ? '没有找到相关笔记' : view === 'today' ? '今天的灵感，还在路上' : '从一个小想法开始'}</h3><p>{normalizedQuery ? '换个关键词，或清空搜索看看。' : '写下一句话，留住此刻值得记住的事。'}</p><button className="notes-button notes-button-secondary" onClick={normalizedQuery ? () => setQuery('') : startNew} disabled={busy}>{normalizedQuery ? '清空搜索' : '写下第一句'}<Icon name="arrow" size={16} /></button></div> : <ul className="notes-grid">{filteredNotes.map((note) => {
                return <li className={`note-card ${editingId === note.id ? 'is-editing' : ''}`} key={note.id}>
                  <div className="note-card-top"><span className="note-card-label"><span />{editingId === note.id ? '正在编辑' : '随手记'}</span><div className="note-card-actions"><button onClick={() => startEditing(note)} disabled={busy} aria-label={`编辑笔记 ${note.id}`} title="编辑笔记"><Icon name="edit" size={16} /></button><button className="note-delete" onClick={() => handleDelete(note.id)} disabled={busy} aria-label={`删除笔记 ${note.id}`} title="删除笔记"><Icon name="trash" size={16} /></button></div></div>
                  <h3>{note.title || '未命名笔记'}</h3><p className="note-card-body">{note.content}</p>
                  <footer className="note-card-footer"><div><span><Icon name="clock" size={13} />编辑于 <time dateTime={note.updated_at || note.created_at}>{formatDate(note.updated_at || note.created_at)}</time></span><span className="note-created">创建于 <time dateTime={note.created_at}>{formatDate(note.created_at)}</time></span></div><span className="note-word-count">{Array.from(note.title || '').length + note.content.length} 字</span></footer>
                </li>
              })}</ul>}
              {!loading && connected && filteredNotes.length > 0 && <p className="notes-list-end"><span />{normalizedQuery ? `找到 ${filteredNotes.length} 篇相关笔记` : '每一笔，都是自己的足迹'}<span /></p>}
            </section>

            <aside className="notes-editor-panel" aria-label={editingId === null ? '新建笔记' : '编辑笔记'}>
              <div className="notes-editor-heading"><span className="notes-editor-icon"><Icon name="edit" size={20} /></span><div><h2>{editingId === null ? '捕捉一个想法' : '继续这个想法'}</h2><p>{editingId === null ? '随手记录，灵感不必等待。' : '好想法，值得慢慢打磨。'}</p></div>{editingId !== null && <button className="notes-editor-cancel" onClick={resetForm} disabled={busy} aria-label="取消编辑"><Icon name="close" size={18} /></button>}</div>
              <form onSubmit={handleSubmit}>
                <label htmlFor="note-title" className="notes-field-label">笔记标题<span className="notes-title-count">{Array.from(title).length} / {MAX_TITLE_LENGTH}</span></label>
                <input
                  id="note-title"
                  className="notes-title-input"
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(Array.from(event.target.value).slice(0, MAX_TITLE_LENGTH).join(''))}
                  placeholder="给这个想法起个名字"
                  disabled={busy || loading || !connected}
                  required
                  maxLength={MAX_TITLE_LENGTH * 2}
                  autoComplete="off"
                />
                <label htmlFor="note-content" className="notes-field-label">笔记内容{editingId !== null && <span>编辑中</span>}</label>
                <textarea id="note-content" ref={editorRef} value={content} onChange={(event) => setContent(event.target.value)} placeholder={'今天有什么值得记下的？\n\n一个灵感、一段心得，\n或者一件小小的好事…'} disabled={busy || loading || !connected} required maxLength={MAX_LENGTH} rows={10} />
                <div className="notes-editor-meta"><span><span className={title.trim() || content.trim() ? 'has-draft' : ''} />{title.trim() || content.trim() ? '草稿待保存' : '等待你的第一个字'}</span><span className={content.length >= MAX_LENGTH ? 'is-limit' : ''}>{content.length} / {MAX_LENGTH}</span></div>
                {editingNote && <div className="notes-edit-history"><Icon name="clock" size={14} />上次编辑于 {formatDate(editingNote.updated_at || editingNote.created_at)}</div>}
                <button className="notes-button notes-button-primary notes-save" type="submit" disabled={busy || loading || !connected || !title.trim() || !content.trim()}>{busy ? <span className="notes-spinner" /> : <Icon name="check" size={17} />}{busy ? '正在保存…' : editingId === null ? '保存笔记' : '保存修改'}{!busy && <Icon name="arrow" size={17} />}</button>
                {editingId !== null && <button type="button" className="notes-cancel-text" onClick={resetForm} disabled={busy}>取消编辑</button>}
              </form>
              <div className="notes-editor-tip"><Icon name="spark" size={16} /><p>写下来，就是想法的开始。<br />保存后，可以随时回来继续编辑。</p></div>
            </aside>
          </div>
          <footer className="notes-page-footer"><span>拾记 · 给想法一个安放的地方</span><span>慢慢记录，自有回响。</span></footer>
        </main>
      </div>
    </div>
  )
}
