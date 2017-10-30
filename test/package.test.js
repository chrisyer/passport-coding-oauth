var assert = require('assert');

var strategy = require('..');

describe('package',function(){
    it('should export Strategy constructor directly from package',function(){
        assert.equal(typeof(strategy),'function');
        assert.equal(strategy,strategy.Strategy);
    });

    it('should export Strategy constructor', function() {
        assert.equal(typeof(strategy.Strategy),'function');
      });
});