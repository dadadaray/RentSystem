# -*- coding: UTF-8 -*-
import MySQLdb

# 打开数据库连接
db = MySQLdb.connect("localhost","root","","giant_db" )

# 使用cursor()方法获取操作游标
cursor = db.cursor()

# 使用execute方法执行SQL语句
cursor.execute("select * from user")

# 使用 fetchone() 方法获取一条数据库。
data = cursor.fetchall()

for oo in data:
   print oo

cursor.close()

# 关闭数据库连接
db.close()