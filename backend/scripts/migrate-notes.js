// 幂等迁移：保留正文与创建时间，旧记录以创建时间初始化编辑时间。
async function migrateNotes(pool) {
  async function readColumn(name) {
    const [rows] = await pool.execute(
      `SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
       FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'notes' AND COLUMN_NAME = ?`,
      [name],
    )
    return rows[0]
  }
  let column = await readColumn('updated_at')
  if (!column) {
    await pool.execute('ALTER TABLE notes ADD COLUMN updated_at TIMESTAMP(3) NULL DEFAULT NULL AFTER created_at')
    column = await readColumn('updated_at')
  }
  const [backfill] = await pool.execute('UPDATE notes SET updated_at = created_at WHERE updated_at IS NULL')
  if (column.COLUMN_TYPE !== 'timestamp(3)' || column.IS_NULLABLE !== 'NO' ||
      !column.EXTRA.toLowerCase().includes('on update current_timestamp(3)') ||
      String(column.COLUMN_DEFAULT).toLowerCase() !== 'current_timestamp(3)') {
    await pool.execute(`ALTER TABLE notes MODIFY COLUMN updated_at TIMESTAMP(3) NOT NULL
      DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
  }
  console.log(`编辑时间字段已就绪，补全 ${backfill.affectedRows} 条记录的初始时间`)

  let titleColumn = await readColumn('title')
  if (!titleColumn) {
    await pool.execute('ALTER TABLE notes ADD COLUMN title VARCHAR(100) NULL DEFAULT NULL AFTER id')
    titleColumn = await readColumn('title')
  }
  // 显式保留 updated_at，避免补标题被误认为用户刚刚编辑了笔记。
  // 仅给缺少标题的旧记录取正文第一行；原有正文完整保留。
  const [titles] = await pool.execute(
    `UPDATE notes
     SET title = COALESCE(NULLIF(LEFT(TRIM(SUBSTRING_INDEX(
       REPLACE(content, CHAR(13), ''), CHAR(10), 1)), 100), ''), '未命名笔记'),
         updated_at = updated_at
     WHERE title IS NULL OR TRIM(title) = ''`,
  )
  if (titleColumn.COLUMN_TYPE !== 'varchar(100)' || titleColumn.IS_NULLABLE !== 'NO' ||
      titleColumn.COLUMN_DEFAULT !== '未命名笔记') {
    const [oversize] = await pool.execute('SELECT id FROM notes WHERE CHAR_LENGTH(title) > 100 LIMIT 1')
    if (oversize.length) throw new Error('已有标题超过 100 个字符，请先处理后再迁移，避免截断')
    await pool.execute("ALTER TABLE notes MODIFY COLUMN title VARCHAR(100) NOT NULL DEFAULT '未命名笔记'")
  }
  console.log(`标题字段已就绪，为 ${titles.affectedRows} 条旧笔记生成标题`)
}
module.exports = migrateNotes
if (require.main === module) {
  const pool = require('../db')
  migrateNotes(pool).catch((error) => {
    console.error('数据库迁移失败：', error.message)
    process.exitCode = 1
  }).finally(() => pool.end())
}
