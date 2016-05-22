require(["gitbook", "jQuery"], function(gitbook, $) {
    var resetDisqus = function() {
        var $disqusDiv = $("<div>", {
            "id": "disqus_thread"
        });
        $(".book-body .page-inner").append($disqusDiv);

        if (typeof DISQUS !== "undefined") {
            DISQUS.reset({
                reload: true,
                config: function () {  
                    this.language = "en";  
                    this.page.url = window.location.href;
                }
            });
        }
    }

    gitbook.events.bind("start", function(e, config) {
        config.disqus = config.disqus || {};
        var disqus_shortname = config.disqus.shortName;

         /* * * DON'T EDIT BELOW THIS LINE * * */
        (function() {
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();

        resetDisqus();
    });

    gitbook.events.bind("page.change", resetDisqus);
});