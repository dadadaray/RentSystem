#-*- coding:utf-8 -*-
from flask import Flask, render_template,url_for,request
from flask.ext.wtf import Form
from wtforms import StringField,SubmitField
from wtforms.validators import Required
from flask import redirect
from DB.BaseDB import BaseDB

from enity.User import User

DB = BaseDB()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hard to guess string'

class NameForm(Form):
    name = StringField('What is your name',validators=[Required()])
    submit = SubmitField('Submit')

@app.route("/history")
def history():
    return render_template("history.html")
@app.route('/')
def hello_world():
    return render_template("index.html")

@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/denglu")
def denglu():
    return render_template("login.html")

@app.route("/zhuce")
def zhuce():
    return render_template("register.html")

@app.route("/login", methods=['POST','GET'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        obj1 = DB.search_User(User,username)
        if password == obj1.password:
            print(password,obj1.password)
        else:
            print("cuole")

        return render_template('index.html')
@app.route("/rent.csv")
def findCsv():
    return render_template("rent.csv")

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

