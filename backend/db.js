// 创建可复用的 MySQL 连接池，供 index.js 里的查询使用。
// 路由不在这里写 SQL，只通过导出的 pool 借用连接。
const path = require('node:path')
const mysql = require('mysql2/promise')

// 从本文件旁边的 .env 读取数据库地址、账号和库名。
require('dotenv').config({
  path: path.join(__dirname, '.env'),
})

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // 使用 utf8mb4，笔记内容可以保存中文和 emoji。
  charset: 'utf8mb4',
  // 连接都在使用时，新的查询排队等待，而不是直接失败。
  waitForConnections: true,
  // 最多同时保持 5 条连接。
  connectionLimit: 5,
})

module.exports = pool
