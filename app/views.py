#-*- coding:utf-8 -*-
from flask import Flask, render_template
from flask.ext.wtf import Form
from wtforms import StringField,SubmitField
from wtforms.validators import Required

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hard to guess string'

class NameForm(Form):
    name = StringField('What is your name',validators=[Required()])
    submit = SubmitField('Submit')

@app.route('/rent.csv')
def findcsv():
    return render_template("rent.csv")

@app.route('/')
def hello_world():
    return render_template("index.html")

@app.route("/index")
def index():
    return 'index'

@app.route("/login", methods=['GET'])
def login():
    return render_template('login.html')

@app.route("/login", methods=['POST'])
def login_real():


@app.route("/register", methods=['POST'])
def register_real():




@app.route("/register", methods=['GET'])
def register():
        return render_template('register.html')


if __name__ == '__main__':
    app.run()

