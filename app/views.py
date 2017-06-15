# -*- coding:utf-8 -*-
from flask import Flask, render_template, url_for, request, session, json
from flask.ext.wtf import Form
from wtforms import StringField, SubmitField
from wtforms.validators import Required
from flask import redirect, make_response, flash
from DB.BaseDB import BaseDB
from DB.User import User
from DB.Record import Record
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
    name = StringField('What is your name', validators=[Required()])
    submit = SubmitField('Submit')


@app.route("/record", methods=['POST', 'GET'])
def record():
    chooseSpace = json.loads(json.dumps(request.form.get('chooseSpace'))).encode('utf-8').decode('latin1')
    print(chooseSpace)
    try:
        obj1 = DB.search_Click(Record, chooseSpace)
        id1 = obj1.id
        sum = obj1.click + 1
        record = Record(id=id1, houseLocation=chooseSpace, click=sum)
        DB.update_record(record)
        print("更新记录成功！")
    except Exception as e:
        sum = 1
        record = Record(houseLocation=chooseSpace, click=sum)
        DB.insert_into_table(record)
        print("插入新记录成功！")

    return render_template("index.html")


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
        print(objs)
        return render_template("history.html", logname=logname, total=objs)
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
    if name == None:
        one = DB.search_record(Record)
        list1 = []
        list2 = []
        list3 = []
        for item in one:
            list2.append(item.houseLocation)
            list1.append(item.click)
        for i in range(len(list1) - 1):
            for j in range(len(list1) - 1):
                if list1[j] < list1[j + 1]:
                    list1[j + 1], list1[j] = list1[j], list1[j + 1]
                    list2[j + 1], list2[j] = list2[j], list2[j + 1]
        q = len(list2)
        if (q >= 4):
            for z in range(4):
                list3.append(list2[z])
        else:
            for z in range(q):
                list3.append(list2[z])
        return render_template("index.html", logname=logname, total=list3)

    return render_template("index.html");


@app.route("/rent.csv")
def findCsv():
    return render_template("rent.csv")


@app.route("/his", methods=['POST', 'GET'])
def setHistory():
    if request.method == 'POST':
        try:
            name = session['username']
        except Exception as e:
            name = None
        # 没登录时不存入历史记录
        if name != None:
            obj1 = DB.search_User(User, name)
            id1 = obj1.id
            # 从json中获取表单数据
            chooseSpace = json.loads(json.dumps(request.form.get('chooseSpace'))).encode('utf-8').decode('latin1')
            try:
                lPrice = json.loads(request.form.get('lowPrice'))
            except Exception as e:
                lPrice = 0

            try:
                hPrice = json.loads(request.form.get('highPrice'))
            except Exception as e:
                hPrice = 0

            try:
                lArea = json.loads(request.form.get('lowArea'))
            except Exception as e:
                lArea = 0

            try:
                hArea = json.loads(request.form.get('highArea'))
            except Exception as e:
                hArea = 0

            vehicle = json.loads(json.dumps(request.form.get('vehicle')))

            # 保存历史记录
            history = History(goalCity=chooseSpace, lowerPrice=lPrice, highPrice=hPrice, lowerArea=lArea,
                              highArea=hArea, way=vehicle, userId=id1)
            DB.insert_into_table(history)

    return render_template("index.html")


@app.route("/denglu")
def denglu():
    return render_template("login.html")


@app.route("/login", methods=['POST', 'GET'])
def login():
    logname = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        try:
            name = session['username']
        except Exception as e:
            name = None
        print("1", name)
        # 如果没有登录
        if name == None or username != name:
            obj1 = DB.search_User(User, username)
            # 用户名不存在
            if obj1 == None:
                flash("用户名不存在，请重新登陆！")
            # 用户名存在
            else:
                # 密码正确
                if password == obj1.password:
                    logname = username
                    resp = make_response(render_template("index.html", logname=logname))
                    session['username'] = username
                    print("username", session['username'])
                    return resp
                # 密码错误
                else:
                    flash("密码错误，请重新登陆！")
        # 已登录
        else:
            flash("您已登录，请勿重复登录！")

        return render_template("login.html")


@app.route("/logout")
def logout():
    logname = None
    resp = make_response(render_template("index.html", logname=logname))
    session['username'] = None
    return resp


@app.route("/zhuce")
def zhuce():
    return render_template("register.html")


@app.route("/register", methods=['POST', 'GET'])
def register():
    # error = None
    if request.method == 'POST':
        username = request.form['username'].encode('utf-8').decode('latin1')
        password = request.form['password']
        repw = request.form['prePassword']

        # 验证用户名是否已存在
        obj2 = DB.search_User(User, username)
        if obj2 == None:

            # 验证密码和确认密码是否一致
            if password != repw:
                flash("密码和确认密码不一致！")
                return render_template('register.html')
            user = User(userName=username, password=password)
            DB.insert_into_table(user)
            return render_template('login.html')
        else:
            flash("用户名已存在！")
            return render_template('register.html')


if __name__ == '__main__':
    app.run()
