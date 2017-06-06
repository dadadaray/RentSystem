#-*- coding:utf-8 -*-
from flask import Flask, render_template,url_for,request
from flask.ext.wtf import Form
from wtforms import StringField,SubmitField
from wtforms.validators import Required
from flask import redirect, make_response, flash
from DB.BaseDB import BaseDB
import datetime
import sys

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

from enity.User import User

DB = BaseDB()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hard to guess string'

class NameForm(Form):
    name = StringField('What is your name',validators=[Required()])
    submit = SubmitField('Submit')


@app.route('/')
def hello_world():
    return render_template("index.html")

@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/rent.csv")
def findCsv():
    return render_template("rent.csv")

@app.route("/denglu")
def denglu():
    return render_template("login.html")

@app.route("/zhuce")
def zhuce():
    return render_template("register.html")

@app.route("/login", methods=['POST','GET'])
def login():
    logname = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        name = request.cookies.get(username)
        #如果没有登录
        if name == None:
            obj1 = DB.search_User(User,username)
            #用户名不存在
            if obj1 == None:
                flash("用户名不存在，请重新登陆！")
            #用户名存在
            else:
                #密码正确
                if password == obj1.password:
                    logname = username
                    resp = make_response(render_template("index.html",logname = logname))
                    outdate = datetime.datetime.today()+datetime.timedelta(days=7)
                    resp.set_cookie(username,username,expires=outdate)
                    #获取当前登录用户名
                    na = request.cookies.get('username')
                    #当前登录用户不为空，登出
                    if na != None:
                        resp.delete_cookie(na)
                    #更新当前登录用户名
                    resp.set_cookie('username',username)
                    return resp
                #密码错误
                else:
                    flash("密码错误，请重新登陆！")
        #已登录
        else:
            flash("您已登录，请勿重复登录！")

        return render_template("login.html")

@app.route("/logout")
def logout():
    logname = None
    resp = make_response(render_template("index.html",logname = logname))
    na = request.cookies.get('username')
    resp.delete_cookie(na)
    return resp

@app.route("/register", methods=['POST','GET'])
def register():
    #error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        repw = request.form['prePassword']

        print("username:%s password:%s repw:%s" % (username,password,repw))
        user = User(userName=username,password=password)
        DB.insert_into_table(user)
    return render_template('login.html')


if __name__ == '__main__':
    app.run()

