Disqus integration for GitBook
==============

You can use install it via **NPM**:

```
$ npm install gitbook-plugin-disqus
```

And use it for your book with:

```
$ gitbook build ./ --plugins=disqus
```


You can set the Disqus shortname using the plugins configuration (command line option: `--pluginsConfig`) with the following content:

```
{
    "disqus": {
        "shortName": "XXXXXXX"
    }
}
```

