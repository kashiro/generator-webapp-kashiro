'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');


var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);
  this.options = options;
  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  if (!this.options['skip-welcome-message']) {
    console.log(this.yeoman);
    console.log(chalk.magenta('Out of the box I include HTML5 Boilerplate, jQuery, and a Gruntfile.js to build your app.'));
  }

  var prompts = [{
    type: 'checkbox',
    name: 'features',
    message: 'What more would you like?',
    choices: [{
      name: 'Sass with Compass',
      value: 'includeCompass',
      checked: true
    }, {
      name: 'Jade',
      value: 'includeJade',
      checked: true
    }, {
      name: 'node-easymock',
      value: 'includeNodeEasyMock',
      checked: false
    }, {
      name: 'Bootstrap',
      value: 'includeBootstrap',
      checked: false
    }, {
      name: 'Modernizr',
      value: 'includeModernizr',
      checked: false
    }]
  }];

  this.prompt(prompts, function (answers) {
    var features = answers.features;

    function hasFeature(feat) { return features.indexOf(feat) !== -1; }

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.includeCompass      = hasFeature('includeCompass');
    this.includeJade         = hasFeature('includeJade');
    this.includeNodeEasyMock = hasFeature('includeNodeEasyMock');
    this.includeBootstrap    = hasFeature('includeBootstrap');
    this.includeModernizr    = hasFeature('includeModernizr');

    cb();
  }.bind(this));
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('favicon.ico', 'app/favicon.ico');
  this.copy('404.html', 'app/404.html');
  this.copy('robots.txt', 'app/robots.txt');
  this.copy('htaccess', 'app/.htaccess');
  this.copy('scripts.json', 'scripts.json');
  this.copy('README.md', 'README.md');
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  var css = 'main.' + (this.includeCompass ? 's' : '') + 'css';
  this.copy(css, 'app/styles/' + css);
};

AppGenerator.prototype.writeIndex = function writeIndex() {

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.indexFile = this.engine(this.indexFile, this);

  // wire Twitter Bootstrap plugins
  if (this.includeBootstrap) {
    var bs = 'bower_components/bootstrap' + (this.includeCompass ? '-sass/vendor/assets/javascripts/bootstrap/' : '/js/');
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
      bs + 'affix.js',
      bs + 'alert.js',
      bs + 'dropdown.js',
      bs + 'tooltip.js',
      bs + 'modal.js',
      bs + 'transition.js',
      bs + 'button.js',
      bs + 'popover.js',
      bs + 'carousel.js',
      bs + 'scrollspy.js',
      bs + 'collapse.js',
      bs + 'tab.js'
    ]);
  }

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: 'scripts/main.js',
    sourceFileList: ['scripts/main.js'],
    searchPath: '{app,.tmp}'
  });
};

AppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.write('app/index.html', this.indexFile);
  this.write('app/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');

  if(this.includeNodeEasyMock){
    this.mkdir('mock');
    this.mkdir('mock/api');
  }
  if(this.includeJade){
    this.mkdir('app/jade');
    this.copy('index.jade', 'app/jade/index.jade');
  }else{
    this.write('app/index.html', this.indexFile);
  }
};

AppGenerator.prototype.install = function () {
  if (this.options['skip-install']) {
    return;
  }

  var done = this.async();
  this.installDependencies({
    skipMessage: this.options['skip-install-message'],
    skipInstall: this.options['skip-install'],
    callback: done
  });
};
