# -*- coding: UTF-8 -*-
from app.DB.BaseDB import BaseDB
from enity.User import User

#创建表
DB = BaseDB()
DB.create_table()

obj = DB.search_by_param(User, 'userName', ['abc'])

print(obj)
print("two",obj.userName,obj.password)
