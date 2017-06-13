#-*- coding:utf-8 -*-
from flask import Flask, render_template,url_for,request, session
from flask.ext.wtf import Form
from wtforms import StringField,SubmitField
from wtforms.validators import Required
from flask import redirect, make_response, flash
from DB.BaseDB import BaseDB
from DB.User import User
from DB.History import History
import datetime
import sys


default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

DB = BaseDB()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hard to guess string'

class NameForm(Form):
    name = StringField('What is your name',validators=[Required()])
    submit = SubmitField('Submit')

# @app.route("/history")
# def history():
#     name = session['username']
#     obj = DB.search_User(User, name)
#     id = obj.id
#     print(id)
#     print(obj.password)
#     obj2 = DB.search_userid(history,id)
#     total = []
#     for obj1 in obj2:
#         temp = []
#         temp.append(obj1.goalCity)
#         temp.append(obj1.lowerPrice)
#         temp.append(obj1.highPrice)
#         temp.append(obj1.lowerArea)
#         temp.append(obj1.highArea)
#         temp.append(obj1.way)
#         total.append(temp)
#     resp = make_response(render_template("history.html",obj3=total))
#     print("33333")
#     return render_template("history.html")
@app.route("/history")
def history():
    name = session['username']
    obj1 = DB.search_User(User, name)
    id = obj1.id
    print(id)
    objs = DB.search_userid(History, id)
    logname = None
    try:
        name = session['username']
    except Exception as e:
        name = None
    if name != None:
        logname = name
        print("第一个")
        print(objs)
        return render_template("history.html", logname=logname,total = objs)
    print("第二个")
    return render_template("history.html")


@app.route('/')
@app.route("/index")
def index():
    logname = None
    try:
        name = session['username']
    except Exception as e:
        name = None
    if name != None:
        logname = name
        resp = make_response(render_template("index.html", logname=logname))
        return resp
    return render_template("index.html")

@app.route("/rent.csv")
def findCsv():
    return render_template("rent.csv")

@app.route("/his", methods=['POST','GET'])
def setHistory():
    if request.method == 'POST':
        name = session['username']
        if name != None:
            obj1 = DB.search_User(User, name)
            id1 = obj1.id
            chooseSpace = request.form['chooseSpace']
            hPrice = request.form['highPrice']
            lPrice = request.form['lowPrice']
            hArea = request.form['highArea']
            lArea = request.form['lowArea']
            vehicle = request.form['vehicle']

            history = History(goalCity=chooseSpace, lowerPrice=lPrice, highPrice=hPrice, lowerArea=lArea,
                              highArea=hArea, way=vehicle, userId=id1)
            DB.insert_into_table(history)
        else:
            #没登录时待解决
            print("没登录！")

    return render_template("index.html")

@app.route("/denglu")
def denglu():
    return render_template("login.html")

@app.route("/login", methods=['POST','GET'])
def login():
    logname = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        try:
            name = session['username']
        except Exception as e:
            name = None
        print("1",name)
        #如果没有登录
        if name == None or username != name:
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
                    session['username'] = username
                    print("username",session['username'])
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
    session['username'] = None
    return resp

@app.route("/zhuce")
def zhuce():
    return render_template("register.html")

@app.route("/register", methods=['POST','GET'])
def register():
    #error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        repw = request.form['prePassword']

        #验证用户名是否已存在
        obj2 = DB.search_User(User, username)
        if obj2 == None:

            # 验证密码和确认密码是否一致
            if password != repw:
                flash("密码和确认密码不一致！")
            user = User(userName=username, password=password)
            DB.insert_into_table(user)
            return render_template('login.html')
        else:
            flash("用户名已存在！")
            return render_template('register.html')



if __name__ == '__main__':
    app.run()

