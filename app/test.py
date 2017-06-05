# -*- coding: UTF-8 -*-
from app.DB.BaseDB import BaseDB
from enity.User import User

#创建表
DB = BaseDB()
DB.create_table()

obj = DB.search_by_id(User,1)
obj1 = DB.search_by_param(User,'haha')

print(obj)
print("one",obj.userName,obj.password)
print("two",obj1.userName,obj1.password)
