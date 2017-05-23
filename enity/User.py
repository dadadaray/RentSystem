# -*- coding: UTF-8 -*-
from sqlalchemy import Integer, ForeignKey, String, Column
from sqlalchemy.orm import relationship
from DB.BaseDB import Base

class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    userName = Column(String(100))
    password = Column(String(100))