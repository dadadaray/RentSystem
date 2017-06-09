# -*- coding: UTF-8 -*-
from sqlalchemy import Integer, String, Column
from Base import Base

class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    userName = Column(String(100))
    password = Column(String(100))