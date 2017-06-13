# -*- coding: UTF-8 -*-
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Integer, ForeignKey, String, Column
from sqlalchemy.orm import relationship
from History import History
from User import User
from Record import Record
from Base import Base

class BaseDB(object):
    #创建实例，并连接rentsystem库
    engine = create_engine("mysql+pymysql://root:@localhost/rentsystem",
                                        encoding='utf-8')

    # 创建与数据库的会话session class ,注意,这里返回给session的是个class,不是实例
    Session_class = sessionmaker(bind=engine)

    # 生成session实例 #cursor
    session = Session_class()
    '''
    功能：为所有已加载的表类创建表
    参数：无
    返回值：无
    创建人：孙晓辉
    创建日期：2017/5/20
    最后修改日期：2017/5/25
    '''
    #创建表
    def create_table(self):
        # 创建表结构
        Base.metadata.create_all(self.engine)


    '''
    功能：向表中插入数据
    参数：数据元组
    返回值：无
    创建人：孙晓辉
    创建日期：2017/5/11
    最后修改日期：2017/5/11
    '''
    #增
    def insert_into_table(self,*params):
        # 把要创建的数据对象添加到这个session里， 一会统一创建
        self.session.add_all(list(tuple(params)))
        # 统一提交，创建数据
        self.session.commit()

    #删
    '''
    功能：根据表名和主键删除单条记录
    参数：table_name   表名
          key   主键
    返回值：无
    创建人：孙晓辉
    创建日期：2017/5/20
    最后修改日期：2017/5/25
    '''
    def delete_by_id(self,table_name,key):
        try:
            obj = self.session.query(table_name).filter_by(id = key).first()
            self.session.delete(obj)
            self.session.commit()
        except Exception as e:
            print("wrong:",e)

    '''
        功能：删除所有创建的表
        参数：无
        返回值：无
        创建人：童海苹
        创建日期：2017/5/20
        最后修改日期：2017/5/20
        '''

    def delete_all(self):
        Base.metadata.drop_all(self.engine)

    # 改
    '''
    功能：修改单条记录
    参数：修改后的数据，包含主键
    返回值：无
    创建人：童海苹
    创建日期：2017/5/20
    最后修改日期：2017/5/20
    '''

    def update_record(self, record):
        try:
            self.session.merge(record)
            self.session.commit()
        except Exception as e:
            print("wrong:", e)

    # 查
    '''
    功能：根据主键单条查询
    参数：table_name   表名
          key   主键
    返回值：单条记录
    创建人：童海苹
    创建日期：2017/5/25
    最后修改日期：2017/5/25
    '''

    def search_by_id(self, table_name, key):
        try:
            obj = self.session.query(table_name).filter_by(id=key).first()
        except Exception as e:
            print("wrong:", e)
        return obj

    '''
   功能：根据属性值单条查询
   参数：table_name   表名
         param_name 属性名
         params 属性值列表
   返回值：记录列表
   创建人：孙晓辉
   创建日期：2017/6/01
   最后修改日期：2017/6/01
   '''
    def search_User(self,table_name,param):
        try:
            obj = self.session.query(table_name).filter(table_name.userName == param).first()
            return obj
        except Exception as e:
            return None

    '''
    功能：根据主键多条查询
    参数：table_name   表名
          low   最低index
          high  最高index  
    返回值：记录列表
    创建人：童海苹
    创建日期：2017/5/25
    最后修改日期：2017/5/25
    '''

    def search_by_ids(self, table_name, low, high):
        try:
            objs = self.session.query(table_name).filter(table_name.id > (low - 1)).filter(
                table_name.id < (high + 1)).all()
        except Exception as e:
            print("wrong:", e)
        return objs

    '''
    功能：根据userid查询历史记录
    参数：history  表名
            way 出行方式
            locationCity 定位的城市
            goal目标城市
            lowerPrice 最底价格
            highPrice 最高价格
            lowerArea 最低面积
            highArea 最高面积
    返回值：记录列表
    创建人：房子毅
    创建日期：2017/6/7
    最后修改日期：2017/5/25
    '''
    def search_userid(self,table_name,userid):
        try:
            objs = self.session.query(table_name).filter(table_name.userId == userid).all()
            return objs
        except Exception as e:
            print("wrong:", e)