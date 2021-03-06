var assert = require('assert')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var suite = lab.suite;
var test = lab.test;
var before = lab.before;

var agent
var seneca

var util = require('./util.js')

suite('example suite tests ', function() {
  before({}, function(done){
    util.init(function(err, agentData, si){
      agent = agentData
      seneca = si

      seneca.add('role:foo,cmd:zig',function(args,done){
        done(null,{bar:'zig'})
      })

      seneca.add('role:foo,cmd:bar',function(args,done){
        done(null,{bar:'b'})
      })

      var qaz = function(args,done){
        done(null,{qaz:args.zoo+'z'})
      }

      seneca.add('role:foo,cmd:qaz',qaz)
      seneca.add('role:foo,cmd:qazz',qaz)


      seneca.act('role:web',{use:{
        prefix:'/my-api',
        pin:{role:'foo',cmd:'*'},
        map:{
          zig: true,
          bar: {GET:true},
          qaz: {GET:true, POST:true},
          qazz: {GET:true, alias: '/qazz/:zoo'}
        }
      }}, done)
    })
  })

  test('simple test', function(done) {
    agent
      .get('/my-api/bar')
      .expect(200)
      .end(function (err, res){
        util.log(res)
        assert.equal('b', res.body.bar, 'Invalid response')
        done(err)
      })
  })

  test('simple test', function(done) {
    agent
      .get('/my-api/qaz')
      .send({zoo: 'test'})
      .expect(200)
      .end(function (err, res){
        util.log(res)
        assert.equal('testz', res.body.qaz, 'Invalid response')
        done(err)
      })
  })

  test('simple test', function(done) {
    agent
      .post('/my-api/qaz')
      .send({zoo: 'test'})
      .expect(200)
      .end(function (err, res){
        util.log(res)
        assert.equal('testz', res.body.qaz, 'Invalid response')
        done(err)
      })
  })

  test('simple test', function(done) {
    agent
      .get('/my-api/qazz/val')
      .expect(200)
      .end(function (err, res){
        util.log(res)
        assert.equal('valz', res.body.qaz, 'Invalid response')
        done(err)
      })
  })
})
