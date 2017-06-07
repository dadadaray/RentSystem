# -*- coding: UTF-8 -*-
from DB.BaseDB import BaseDB
from enity.User import User
from enity.History import History
#创建表
DB = BaseDB()
DB.create_table()

obj = DB.search_by_id(User,1)
obj1 = DB.search_by_param(User,'haha')
obj2 = DB.search_userid(self,History,1)
obj3 = DB.search_userid(self,History,2)

print(obj)
print("one",obj.userName,obj.password)
print("two",obj1.userName,obj1.password)
print("1",obj2.way,obj2.userId,obj2.locationCity,obj2.goalCity)
