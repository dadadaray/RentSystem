# -*- coding: UTF-8 -*-
from sqlalchemy import Integer, ForeignKey, String, Column
from sqlalchemy.orm import relationship
from DB.BaseDB import Base

class Record(Base):
    __tablename__ = 'record'
    id = Column(Integer, primary_key=True)
    houseLocation = Column(String(100))
    click = Column(Integer)
