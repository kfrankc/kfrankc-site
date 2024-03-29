---
title: "Deriving the normal distribution"
date: 2018-10-19
math: true
summary: ""
type: "post"
markup: "goldmark"
---

![Normal Distribution](https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Normal_Distribution_PDF.svg/525px-Normal_Distribution_PDF.svg.png)

In every introductory statistics class, we learned about the normal distribution, which has Probability Density Function (PDF):

$$
\tag{1} f(x | \mu, \sigma^2) = \frac{1}{\sqrt{2\pi \sigma^2}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

This looks like a fairly complicated equation, but the resulting graph (shown above) has some very cool properties (integrates to 1, represents real-valued random variables whose distributions are not known etc...). I've always wondered how this is derived, and I finally found some answers via great [videos](https://www.youtube.com/watch?v=cTyPuZ9-JZ0) and [online forums](https://math.stackexchange.com/questions/384893/how-was-the-normal-distribution-derived). I will give an overview of the derivation here, based on YouTuber Mathoma's amazing video (linked above).

**Part 1: The Theory**

Mathoma gave a great analogy about how to understand this distribution: imagine you are throwing darts on a polar coordinate system, with the goal of hitting the center \\((0,0)\\). Now, given an arbitrary dart landing on coordinate \\((r, \theta)\\), we can also say that the coordinate is \\((x, y)\\) if we convert from polar to cartesian. 

We have to make a couple assumptions here before moving forward. First, we assume that \\(x\\) and \\(y\\) are statistically independent. Second, we assume that the PDF is rotationally invariant, which means the distribution of where my dart lands only depends on the distance \\(r\\), of the dart to the center.

With those assumptions, I can define PDF \\(\varphi(r) = f(x)f(y)\\). This can be rewritten as 

$$
\begin{align}
    \tag{2} \varphi(\sqrt{x^2 + y^2}) &= f(x)f(y)
\end{align}
$$

Next, suppose \\(y=0\\). We will then have

$$
\begin{aligned}
    \varphi(\sqrt{x^2 + 0^2}) &= f(x)f(0) \\\\
    \varphi(x) &= f(x)\lambda, \text{ where $\lambda$ is a constant}
\end{aligned}
$$

Plugging this back into Eq 2, we have

$$
\begin{align}
    \tag{3} \lambda f(\sqrt{x^2 + y^2}) = f(x)f(y)
\end{align}
$$

Next, we will determine the expression for $f(x)$. First, we rewrite Eq 3 as

$$
\begin{aligned}
    \frac{\lambda f(\sqrt{x^2 + y^2})}{\lambda^2} = \frac{f(x)}{\lambda} \frac{f(y)}{\lambda}
\end{aligned}
$$

For simplicity in analyzing the equation, define $g(x) = \frac{f(x)}{\lambda}$. We now have

$$
\begin{align}
    \tag{4} g(x)g(y) = g(\sqrt{x^2 + y^2})
\end{align}
$$

What kind of function should $g$ be so that Eq 4 is valid? Upon some inspection, we can see that $g$ should be an **exponential function**. Example: suppose we have $h(x) = e^x$, then $h(x)h(y) = e^xe^y = e^{x+y} = h(x+y)$.

Similarly, let $g(x) = e^{Ax^2}$, where $A$ is a constant.

$$
\begin{align*}
    g(x)g(y) &= e^{Ax^2}e^{Ay^2}\\\\
    &= e^{A(x^2 + y^2)}\\\\
    &= e^{A(\sqrt{x^2 + y^2})^2}\\\\
    &= g(\sqrt{x^2 + y^2})
\end{align*}
$$

In turn, our PDF $f$ should be

$$
\begin{align}
    \tag{5} f(x) = \lambda e^{Ax^2}
\end{align}
$$

[Plotting this equation out](https://www.desmos.com/calculator/hhsa3qpffi) with $A=-1$ (more on why $A$ is negative later) and $\lambda=1$, we see that it takes a gaussian form!

**Part 2: Massaging the Equation**

The remainder of this derivation serves to massage Eq 5 into the class of gaussians we are interested in, the normal gaussian.

First, we introduce a constraint on the function: since we are modeling probability, it makes sense for $f(x)$ to integrate to $1$.

$$
\begin{aligned}
\int_{-\infty}^{\infty}f(x)dx = 1
\end{aligned}
$$

Instead of using constant $A$, we will set $A = -h^2$, where $h$ is a constant variable. There are several reasons for this: First, it makes sense for $A$ to be negative, because we want this function (which models the probability) to decrease as we move to $+\infty$. Second, the $-h^2$ form will help when we do the integration.

We determine the value of $h^2$:

$$
\begin{aligned}
\int_{-\infty}^{\infty}\lambda e^{-h^2x^2}dx &= 1\\\\
\lambda\int_{-\infty}^{\infty}e^{-h^2x^2}dx &= 1\\\\
\end{aligned}
$$

Perform [u-substitution](https://www.wikiwand.com/en/Integration_by_substitution), with $u = hx$, $du = hdx$, and $dx = \frac{1}{h}du$. We now get

$$
\begin{align}
\tag{6} \frac{\lambda}{h}\int_{-\infty}^{\infty}e^{-u^2}du = 1
\end{align}
$$

Interestingly, the integral in Eq 6 is actually famous (it has a name!). The [Gaussian integral](https://en.wikipedia.org/wiki/Gaussian_integral), also known as the Euler-Poisson integral, is equal to $\sqrt{\pi}$ (refer to link for the integral computation).

We can now compute $h^2$:

$$
\begin{aligned}
\frac{\lambda}{h}\sqrt{\pi} &= 1\\\\
h &= \lambda \sqrt{\pi}\\\\
h^2 &= \lambda^2\pi
\end{aligned}
$$

Eq 5 becomes

$$
\begin{align}
\tag{7} f(x) = \lambda e^{-\pi \lambda^2x^2}
\end{align}
$$

If we plot $f(x)$ using different $\lambda$ values, we see that as $\lambda$ increases, the variance $\sigma^2$ decreases, since more of the area is accumulated at $x=0$. See plots for [$\lambda=1$](https://www.desmos.com/calculator/lszecvqlgt), [$\lambda=2$](https://www.desmos.com/calculator/jpwcwodqef), [$\lambda=3$](https://www.desmos.com/calculator/uzdhdukutz) as examples.

Next, we need to find the relationship between $\lambda$ and variance $\sigma^2$. From definition of [variance](https://www.wikiwand.com/en/Variance), we see that $Var(X) = E[(X - \mu)^2]$. In our case, $\mu$ is 0, so we have:

$$
\begin{aligned}
Var(x) = \sigma^2 &= \int_{-\infty}^{\infty}x^2 \lambda e^{-\pi \lambda^2x^2}dx \\\\
&= \lambda \int_{-\infty}^{\infty} x \cdot x \cdot e^{-\pi \lambda^2x^2}dx
\end{aligned}
$$

We will evaluate this integral via [integration by parts](https://www.wikiwand.com/en/Integration_by_parts). Recall that

$$
\begin{aligned}
\int udv = uv - \int vdu
\end{aligned}
$$

Let $u = x$, $du = dx$, $dv = xe^{-\pi \lambda^2x^2}dx$, $v = -\frac{1}{2\pi\lambda^2}e^{-\pi \lambda^2x^2}$:

$$
\begin{aligned}
Var(x) = \sigma^2 &= \lambda \left(x\left(-\frac{1}{2\pi\lambda^2}e^{-\pi \lambda^2x^2}\Biggr|_{-\infty}^{\infty}\right) - \int_{-\infty}^{\infty}\left(-\frac{1}{2\pi\lambda^2}e^{-\pi \lambda^2x^2}\right)dx\right)\\\\
&= \lambda \left((0) + \int_{-\infty}^{\infty}\frac{1}{2\pi\lambda^2}e^{-\pi \lambda^2x^2}dx\right)\\\\
&= \frac{1}{2\pi\lambda^2}\int_{-\infty}^{\infty}\lambda e^{-\pi \lambda^2x^2}dx
\end{aligned}
$$

The reason we switched the position of $\lambda$ and $\frac{1}{2\pi\lambda^2}$ is so we can massage the integral to be the form of the gaussian PDF, which we know integrates to 1. Now, with the equation simplified, we can solve for $\lambda$ in terms of $\sigma^2$.

$$
\begin{aligned}
\sigma^2 &= \frac{1}{2\pi\lambda^2}\\\\
\lambda^2 &= \frac{1}{\sigma^2 2\pi}\\\\
\lambda &= \frac{1}{\sqrt{2\pi\sigma^2}}
\end{aligned}
$$

$\lambda$ and $\sigma$ are inversely proportional, as expected. We can plug in our result here back into Eq 7:

$$
\begin{align}
\tag{8} f(x) &= \frac{1}{\sqrt{2\pi\sigma^2}}e^{-\pi \left(\frac{1}{(\sqrt{2\pi\sigma^2})^2}\right)x^2} \\\\
&= \frac{1}{\sqrt{2\pi\sigma^2}}e^{-\frac{x^2}{2\sigma^2}}\nonumber
\end{align}
$$

We are almost done. The above equation has mean $\mu = 0$, but if we want to represent $f(x\|\mu, \sigma^2)$, we need to add in $f(x-\mu)$. Therefore, our general PDF equation for the normal distribution is:

$$
\begin{align}
\tag{9} f(x | \mu, \sigma^2) = \frac{1}{\sqrt{2\pi \sigma^2}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}
\end{align}
$$

Eq 9 matches Eq 1, and we are now done $\blacksquare$

---

By the way, here's how I added LaTeX equations in Hugo:

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
