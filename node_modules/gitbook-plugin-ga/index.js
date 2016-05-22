module.exports = {
    book: {
        assets: "./book",
        js: [
            "plugin.js"
        ],
        html: {
            "body:end": function() {
                var config = this.options.pluginsConfig.ga || {};
                
                if (!config.token) {
                	throw "Need to option 'token' for Google Analytics plugin";
                }
                
                if (!config.configuration) {
                	config.configuration = 'auto';
                }

                if(typeof config.configuration === 'object' && config.configuration !== null) {
                	configuration = JSON.stringify(config.configuration);
                }
                else if (['auto', 'none'].indexOf(config.configuration) != -1) {
                	configuration = "'" + config.configuration + "'";
                }

                return "<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){"
                + "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),"
                + "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)"
                + "})(window,document,'script','//www.google-analytics.com/analytics.js','ga');"
                + "ga('create', '"+config.token+"', "+configuration+");"
                + "ga('send', 'pageview');</script>";
            }
        }
    }
};
