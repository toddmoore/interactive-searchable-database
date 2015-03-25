define([], function() {
  'use strict';

  function addCSS(url) {
    var head = document.querySelector('head');
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', url);
    head.appendChild(link);
  }

  return {
    boot: function(el, context, config, mediator) {
      // Load CSS
      addCSS('http://pasteup.guim.co.uk/0.0.5/css/fonts.pasteup.min.css');
      addCSS(
        'http://interactive.guim.co.uk/next-gen/au/2015/mar/interactive-searchable/css/reset.css'
      );
      addCSS(
        'http://interactive.guim.co.uk/visuals-blank-page/guardian-poll-projections/assets-1426693564091/css/main.css'
      );
      addCSS(
        'http://assets.guim.co.uk/stylesheets/0a849da71459dc6551f21cd90a47e38f/global.css'
      );
      addCSS(
        'http://interactive.guim.co.uk/next-gen/au/2015/mar/interactive-searchable/css/main.css'
      );


      // Add Traceur Runtime
      var traceur = document.createElement('script');
      traceur.setAttribute("type", "text/javascript");
      traceur.setAttribute("src",
        "http://interactive.guim.co.uk/next-gen/au/2015/mar/interactive-searchable/traceur-runtime.js"
      );
      document.getElementsByTagName("head")[0].appendChild(traceur);
      traceur.addEventListener("load", function() {
        // Add minified build
        var build = document.createElement('script');
        build.setAttribute("type", "text/javascript");
        build.setAttribute("src",
          "http://interactive.guim.co.uk/next-gen/au/2015/mar/interactive-searchable/build.js"
        );
        document.getElementsByTagName("head")[0].appendChild(build);
      });


    }
  };
});
