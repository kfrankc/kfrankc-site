---
title: "Enabling MathJax"
date: 2018-10-09
math: true
summary: ""
type: "post"
markup: "goldmark"
---

It's cool to enable LaTeX rendering. Here's how to do it on Hugo:

In the `partials/` folder, create a new partial called `math.html`:

```html
<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML">
</script>
<script type="text/x-mathjax-config">
    MathJax.Hub.Config({
        TeX: {
        equationNumbers: {
          autoNumber: "AMS"
        }
      },
      tex2jax: {
        inlineMath: [ ['$','$'], ["\\(","\\)"] ],
        displayMath: [ ['$$','$$'] ],
        processEscapes: true
      }
    });
</script>
```

In the layouts HTML file, add the following:

```go
{{ if or .Params.math .Site.Params.math }}
  {{ partial "math.html" . }}
{{ end }}
```

Now I can write LaTeX on each post simply by defining `math: true` in the front matter:

$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}$$