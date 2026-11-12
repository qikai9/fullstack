const express = require('express')
const pool = require('./db')

const app = express()

// 只解析 JSON 请求体。格式不合法时，body-parser 会抛出
// type 为 entity.parse.failed 的错误，交给最下面的错误中间件。
app.use(express.json())

// 校验失败时抛出带 status 的错误，让路由不必各自拼 400 响应。
function badRequest(message) {
  const error = new Error(message)
  error.status = 400
  return error
}

// 标题和正文独立保存；标题必填，最多 100 个字符。
function validateTitle(body) {
  if (typeof body?.title !== 'string') {
    throw badRequest('笔记标题必须是字符串')
  }
  const title = body.title.trim()
  if (!title || Array.from(title).length > 100 || /[\r\n]/.test(title)) {
    throw badRequest('笔记标题不能为空，不能换行，且不能超过 100 个字符')
  }
  return title
}

// 笔记正文只接受去掉首尾空白后、长度在 1 到 1000 之间的字符串。
function validateContent(body) {
  const content =
    typeof body?.content === 'string' ? body.content.trim() : ''

  if (!content || content.length > 1000) {
    throw badRequest('笔记内容不能为空，且不能超过 1000 个字符')
  }

  return content
}

// :id 路由进入处理函数前先经过这里。id 保持字符串来校验，
// 避免 Number 把超大整数或 "01" 这类写法悄悄转成合法数字。
// 4294967295 是 MySQL INT UNSIGNED 的上限。
app.param('id', (req, res, next, id) => {
  const number = Number(id)

  if (
    !/^[1-9]\d*$/.test(id) ||
    !Number.isSafeInteger(number) ||
    number > 4294967295
  ) {
    return res.status(400).json({ error: '笔记编号不正确' })
  }

  req.noteId = number
  next()
})

// execute 使用占位符传参。返回值第一项是行数组。
async function findNote(id) {
  const [rows] = await pool.execute(
    'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?',
    [id],
  )
  return rows[0] || null
}

// 查：笔记列表。id 降序，新插入的笔记排在前面。
app.get('/api/notes', async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY id DESC',
  )
  res.json(rows)
})

// 查：单条笔记。编号已由 app.param 转成 req.noteId。
app.get('/api/notes/:id', async (req, res) => {
  const note = await findNote(req.noteId)

  if (!note) {
    return res.status(404).json({ error: '笔记不存在' })
  }

  res.json(note)
})

// 增：先校验，再插入。响应使用数据库里的完整行，从而带上创建时间与最后编辑时间。
app.post('/api/notes', async (req, res) => {
  const title = validateTitle(req.body)
  const content = validateContent(req.body)

  const [result] = await pool.execute(
    'INSERT INTO notes (title, content) VALUES (?, ?)',
    [title, content],
  )

  const note = await findNote(result.insertId)
  res.status(201).json(note)
})

// 改：更新后重新读取。编号不存在时 UPDATE 影响 0 行，随后查询得到 null。
app.put('/api/notes/:id', async (req, res) => {
  const title = validateTitle(req.body)
  const content = validateContent(req.body)

  await pool.execute(
    'UPDATE notes SET title = ?, content = ? WHERE id = ?',
    [title, content, req.noteId],
  )

  const note = await findNote(req.noteId)

  if (!note) {
    return res.status(404).json({ error: '笔记不存在' })
  }

  res.json(note)
})

// 删：成功时不返回正文。affectedRows 用来区分“删掉了”和“本来就没有”。
app.delete('/api/notes/:id', async (req, res) => {
  const [result] = await pool.execute(
    'DELETE FROM notes WHERE id = ?',
    [req.noteId],
  )

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: '笔记不存在' })
  }

  res.status(204).end()
})

// 前面的路由都没匹配上时才会到这里。
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

// Express 5 会把 async 路由里的异常转到这里。
// 四个参数必须保留，Express 靠参数个数识别错误处理中间件。
app.use((error, req, res, next) => {
  // 只把明确的 4xx 返回给客户端，其余一律当成服务器错误。
  const status =
    error.status >= 400 && error.status < 500 ? error.status : 500

  if (status === 500) {
    console.error(error)
  }

  const message =
    status === 500
      ? '服务器内部错误，请查看后端日志'
      : error.type === 'entity.parse.failed'
        ? '请求的 JSON 格式不正确'
        : error.message

  res.status(status).json({ error: message })
})

// 先确认数据库和 notes 表可访问，再监听端口。
// 只绑定 127.0.0.1，外网请求需要由前面的反向代理转发进来。
async function start() {
  await pool.execute('SELECT id, title, updated_at FROM notes LIMIT 1')

  const port = Number(process.env.PORT || 3001)

  app.listen(port, '127.0.0.1', () => {
    console.log(`API 已启动：http://127.0.0.1:${port}`)
  })
}

start().catch(async (error) => {
  console.error('启动失败：', error.message)
  if (error.code === 'ER_BAD_FIELD_ERROR') {
    console.error('请先在 node 目录执行 npm run db:migrate，补齐标题和编辑时间字段')
  }
  await pool.end()
  process.exitCode = 1
})
