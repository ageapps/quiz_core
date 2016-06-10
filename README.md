![quiz](https://cloud.githubusercontent.com/assets/16039428/15950593/9ce1af88-2eb0-11e6-9b0e-28d54b95567a.png)

# Bootstrap Quiz_core

Web application developed in *node.js* with *express* as framework for the back-end, and *HTML*, *CSS* and *JS* with *Bootstrap* in the front-end side. In local usage, it is used *SQLite* and in Heroku, *PostgreSQL*. Image management and storage is done with *Cloudinary*.

**Bootstrap Quiz_core** is a web application where anybody can SingUp and post a Quiz and the rest of the users will be able to comment and try it.

## Sections

**Bootstrap Quiz_core** has the following Sections:

  - **Home:** Home page.
  - **Quizzes:** Grid of Quizzes from all users and Categories.
  - **Users:** Table with all users signed up in **Bootstrap Quiz_core**.
  - **Categories**: Table with all the different categories of quizzes, where you can find quizzes on each category.
  - **Author**: Author page with links to personal page.

## Usage

```groovy
$ git clone https://github.com/ageapps/quiz_core.git
$ cd quiz
$ npm install
$ node ./bin/www
```

## Key-Features

  - Image asociation to every Quiz and Users
  - User management and user roles
  - Users can follow other users
  - Mail verification when signing up
  - Mail notification when any user posts a comment in your quiz
  - Comments asociated to every quiz, with confirmation by administrator or quiz author
  - Every Quiz belongs to a/many categories

## Resources

+ [node.js]: Server enviroment
+ [express]: Web application framework
+ [cloudinary]: Image management and storage
+ [nodemailer]: E-Mail sending
+ [npm]: back-end package manager
+ [bower]: front-end package manager
+ [Bootstrap]: front-end framework
+ [jQuery]: front-end JS library



[node.js]:http://nodejs.org
[jQuery]:http://jquery.com
[nodemailer]:http://www.nodemailer.com/
[cloudinary]:https://cloudinary.com/
[express]:http://expressjs.com
[bower]:http://bower.io
[Bootstrap]:http://getbootstrap.com
[npm]:https://www.npmjs.com
