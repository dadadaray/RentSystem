# -*- coding: UTF-8 -*-
from sqlalchemy import Integer, ForeignKey, String, Column
from sqlalchemy.orm import relationship

from app.DB.BaseDB import Base


class History(Base):
    __tablename__ = 'history'
    id = Column(Integer, primary_key=True)
    goalCity = Column(String(64))
    lowerPrice = Column(Integer)
    highPrice = Column(Integer)
    lowerArea = Column(Integer)
    highArea = Column(Integer)
    way = Column(Integer)
    userId = Column(Integer, ForeignKey("user.id",ondelete='CASCADE', onupdate='CASCADE'))

    history_user = relationship("User", foreign_keys=[userId])