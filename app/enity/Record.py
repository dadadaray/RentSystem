# -*- coding: UTF-8 -*-
from sqlalchemy import Integer, String, Column

from app.DB.BaseDB import Base


class Record(Base):
    __tablename__ = 'record'
    id = Column(Integer, primary_key=True)
    houseLocation = Column(String(100))
    click = Column(Integer)
