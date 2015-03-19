[![Build Status](https://secure.travis-ci.org/toddmoore/test-generator.png?branch=master)](https://travis-ci.org/toddmoore/test-generator)
  
int-searchable
===========
Generator will ask you for your GitHub username which will be used for jspm configuration.

###Set GitHub authentification to avoid GitHub rate limit:
```bash
jspm endpoint config github 
```

###Setup Travis with Github and Sauce Labs

 1. We assume you have registered [GitHub](https://github.com/join), [NPM](https://www.npmjs.com/signup), [Travis](https://travis-ci.org) and [Sauce Labs](https://saucelabs.com/opensauce) accounts

 2. Install [travis cli](https://github.com/travis-ci/travis.rb#env) by:
  ```bash
  gem install travis
  ```

 3. Enable you new lib repo for travis build by running comman:
  ```bash
  travis enable
  ```

 4. Add travis [environment variables](http://blog.travis-ci.com/2014-08-22-environment-variables/) by command line:
  ```bash
  travis env set SAUCE_USERNAME my_sauce_user
  travis env set SAUCE_ACCESS_KEY my_sauce_key
  ```

 5. Set GitHub authentification env variable to avoid GitHub rate limit in travis build:
  ```bash
  travis env set JSPM_AUTH "$(node -pe 'JSON.parse(process.argv[1]).endpoints.github.auth' "$(cat ~/.jspm/config)")"
  ```

 6. Enable NPM deployment from travis build
  ```bash
  travis setup s3
  ```
