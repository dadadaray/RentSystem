#-*- coding:utf-8 -*-
from flask import Flask, render_template,url_for,request
from flask.ext.wtf import Form
from wtforms import StringField,SubmitField
from wtforms.validators import Required
from flask import redirect
from DB.BaseDB import BaseDB

from enity.History import History

