#-*- coding:utf-8 -*-
from flask import Flask, render_template,url_for,request
from flask.ext.wtf import Form
from wtforms import StringField,SubmitField
from wtforms.validators import Required
from flask import redirect
from DB.BaseDB import BaseDB

from enity.User import User

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
    return 'index'

@app.route("/login")
def login():
    return 'index'

@app.route("/register", methods=['POST','GET'])
def register():
    #error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        repw = request.form['prePassword']

        print("username:%s password:%s repw:%s" % (username,password,repw))
        user = User(userName=username,password=password)
        DB = BaseDB()
        DB.insert_into_table(user)
    return render_template('register.html')


if __name__ == '__main__':
    app.run()

