var should = require('./init.js');

var User;

describe('dynamodb', function(){

    before(function(done) {
      db = getSchema();
      User = db.define('User', {
        id: { type: String, keyType: "hash"},
        name: { type: String },
        email: { type: String },
        dob : { type: Date},
        age: {type: Number},
        tasks: { type: String, properties: { sharding : true, splitter : "10kb"} }
      });

      Book = db.define('Book', {
        id : { type: String, keyType: "hash"},
        subject : { type: String, keyType: "range"},
      });

      setTimeout(function(){
        done();
      },1500);

    });

  beforeEach(function(done) {
    // Table creation is async. Wait 1.5s so that
    // table gets created.
   
    console.log("------------------------------------------------------");
    done();
  });

  it('should create user without any errors', function (done) {
    console.log('should create user without any errors');
    var tempUser = new User({
      id : "1",
      name: "John Doe",
      email: "john@doe.com",
      age: 20,
      tasks: "Blah blah blah"
    });
    User.create(tempUser, function (err, user) {
      should.not.exist(err);
      user.should.have.property('id');
      user.should.have.property('name', 'John Doe');
      user.should.have.property('tasks');
      // Make sure that chunked data is not sent back to
      // the user
      user.should.not.have.property('tasks-1');
      user.should.not.have.property('tasks-2');
      done();
    });
  });
  /*
    DynamoDB handles undefined entities by storing them as the string `undefined` and null fields
    as the string `null`. Please handle undefined and null fields in your code. Do not expect adapter
    to throw an error here.
   */
  it('should handle undefined and null attributes and return the same from database', function(done){
    console.log('should handle undefined and null attributes and return the same from database');
     var tempUser = new User({
      id : "2",
      email: null,
      age: null,
      tasks: "Blah blah blah"
    });
    User.create(tempUser, function (err, user) {
      should.not.exist(err);
      (user.dob === undefined).should.be.true;
      (user.age === null).should.be.true;
      (user.email === null).should.be.true;
      done();
    });
  });

  it('should return error saying hash key cannot be null', function(done){
    console.log('should return error saying hash key cannot be null');
     var tempUser = new User({
      id: null,
      email: null,
      age: null,
      tasks: "Blah blah blah"
    });
    User.create(tempUser, function (err, user) {
      should.exist(err);
      done();
    });
  });

  it('should create two books for same id but different subjects', function (done) {
    console.log('should create two books for same id but different subjects');
    var book1 = new Book({
      id: "abcd",
      subject: "Nature"
    });

    var book2 = new Book({
      id: "abcd",
      subject: "Fiction"
    });

    Book.create(book1, function (err, _book1) {
      should.not.exist(err);
      should.exist(_book1);
      _book1.should.have.property('id', 'abcd');
      _book1.should.have.property('subject', 'Nature');

      Book.create(book2, function (err, _book2) {
        should.not.exist(err);
        should.exist(_book2);
        _book2.should.have.property('id', 'abcd');
        _book2.should.have.property('subject', 'Fiction');
        done();
      });
    });
  });
});