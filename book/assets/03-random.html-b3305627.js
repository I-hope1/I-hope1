import{_ as t,X as p,Y as e,Z as n,a0 as s,$ as o,a1 as c,D as l}from"./framework-98842e7a.js";const i={},u=c(`<h1 id="_3-随机数生成器来了一波稳稳的增强" tabindex="-1"><a class="header-anchor" href="#_3-随机数生成器来了一波稳稳的增强" aria-hidden="true">#</a> 3. 随机数生成器来了一波稳稳的增强</h1><blockquote><p>JDK 当中的随机数生成器其实对于普通开发者来讲基本够用，不过对于一些比较复杂的场景来讲，原有的类结构对扩展并不是很友好。</p></blockquote><p>这一条更新来自：<strong>JEP 356: Enhanced Pseudo-Random Number Generators</strong>，相比之下，这一条实用多了。</p><p>我们都用过随机数，不过一般情况下我们很少去认真的对待随机数的具体结果，就好像它是真的随机一样。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">var</span> random <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Random</span><span class="token punctuation">(</span><span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">currentTimeMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>random<span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除了 Random 类，JDK 当中还提供了另外几个随机数的成员：</p><ul><li>ThreadLocalRandom：顾名思义，提供线程间独立的随机序列。它只有一个实例，多个线程用到这个实例，也会在线程内部各自更新状态。它同时也是 Random 的子类，不过它几乎把所有 Random 的方法又实现了一遍。</li><li>SplittableRandom：非线程安全，但可以 fork 的随机序列实现，适用于拆分子任务的场景。</li></ul><p>ThreadLocalRandom 继承自 Random，而 SplittableRandom 与它俩则没什么实际的关系，因此如果我们在代码当中想要动态切换 Random 和 SplittableRandom 就只能定义两个成员，并且在用到的地方做判断：</p><p><strong>Java 16</strong></p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">SplittableRandom</span> splittableRandom <span class="token operator">=</span> <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">;</span>
<span class="token class-name">Random</span> random <span class="token operator">=</span> <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">;</span>

<span class="token keyword">boolean</span> useSplittableRandom <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

<span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
    
<span class="token keyword">if</span> <span class="token punctuation">(</span>useSplittableRandom<span class="token punctuation">)</span> <span class="token punctuation">{</span>
   nextInt <span class="token operator">=</span> splittableRandom<span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    nextInt <span class="token operator">=</span> random<span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而且如果想要自己扩展随机数的算法，也只能自己去实现，原有的定义方式缺乏一个统一的接口。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/70DF0D1E.gif" alt=""></p><p>Java 17 为了解决这个问题，定义了几个接口：</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/image-20210920200204792.png" alt=""></p><p>这样我们就可以面向接口编程啦~</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/70DF7260.jpg" alt=""></p><p>另外，尽管各个实现的细节不太一样，但思路基本上一致，因此老版本当中的几个随机数的类当中存在大量重复或者相似的代码。连 JDK 都存在 CV 代码的情况，那我们为了快速实现需求 CV 代码也不丢人，对不。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/70E0D77D.jpg" alt=""></p><p>Java 17 把这些高度相似的逻辑抽了出来，搞了一个新的类：RandomSupport，又一个 3000 行的 Java 文件。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/image-20210920200711381.png" alt=""></p><p>所以以前：</p><p>**Java 16 **</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// Random.java</span>
<span class="token keyword">public</span> <span class="token class-name">DoubleStream</span> <span class="token function">doubles</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token class-name">StreamSupport</span><span class="token punctuation">.</span>doubleStream
        <span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">RandomDoublesSpliterator</span>
         <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> <span class="token number">0L</span><span class="token punctuation">,</span> <span class="token class-name">Long</span><span class="token punctuation">.</span><span class="token constant">MAX_VALUE</span><span class="token punctuation">,</span> <span class="token class-name">Double</span><span class="token punctuation">.</span><span class="token constant">MAX_VALUE</span><span class="token punctuation">,</span> <span class="token number">0.0</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
         <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">// SplittableRandom.java</span>
<span class="token keyword">public</span> <span class="token class-name">DoubleStream</span> <span class="token function">doubles</span><span class="token punctuation">(</span><span class="token keyword">long</span> streamSize<span class="token punctuation">,</span> <span class="token keyword">double</span> randomNumberOrigin<span class="token punctuation">,</span>
                            <span class="token keyword">double</span> randomNumberBound<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>streamSize <span class="token operator">&lt;</span> <span class="token number">0L</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token constant">BAD_SIZE</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>randomNumberOrigin <span class="token operator">&lt;</span> randomNumberBound<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token constant">BAD_RANGE</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token class-name">StreamSupport</span><span class="token punctuation">.</span>doubleStream
        <span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">RandomDoublesSpliterator</span>
         <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> <span class="token number">0L</span><span class="token punctuation">,</span> streamSize<span class="token punctuation">,</span> randomNumberOrigin<span class="token punctuation">,</span> randomNumberBound<span class="token punctuation">)</span><span class="token punctuation">,</span>
         <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>有相似的地方吧。我们再来看看 Java 17 的实现：</p><p><strong>Java 17</strong></p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// Random.java</span>
<span class="token keyword">public</span> <span class="token class-name">DoubleStream</span> <span class="token function">doubles</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token class-name">AbstractSpliteratorGenerator</span><span class="token punctuation">.</span><span class="token function">doubles</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">//SplittableRandom.java</span>
<span class="token keyword">private</span> <span class="token class-name">AbstractSplittableGeneratorProxy</span> proxy<span class="token punctuation">;</span>
<span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
<span class="token keyword">public</span> <span class="token class-name">DoubleStream</span> <span class="token function">doubles</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> proxy<span class="token punctuation">.</span><span class="token function">doubles</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
<span class="token keyword">private</span> <span class="token keyword">class</span> <span class="token class-name">AbstractSplittableGeneratorProxy</span> <span class="token keyword">extends</span> <span class="token class-name">AbstractSplittableGenerator</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token class-name">SplittableRandom</span><span class="token punctuation">.</span><span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">long</span> <span class="token function">nextLong</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token class-name">SplittableRandom</span><span class="token punctuation">.</span><span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">nextLong</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>util<span class="token punctuation">.</span></span>SplittableRandom</span> <span class="token function">split</span><span class="token punctuation">(</span><span class="token class-name">SplittableGenerator</span> source<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">SplittableRandom</span><span class="token punctuation">(</span>source<span class="token punctuation">.</span><span class="token function">nextLong</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">mixGamma</span><span class="token punctuation">(</span>source<span class="token punctuation">.</span><span class="token function">nextLong</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而这个 AbstractSplittableGenerator 就定义在 RandomSupport.java 当中，是 RandomSupport 一个内部类。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/70E83674.jpg" alt=""></p><p>你以为这就没了？不是的。提案的说明当中提到，提案的目标不是实现很多的随机数产生算法，不过这次还是添加了一些常见的实现，所以你会在 JDK 17 当中看到多了一个模块：</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/image-20210920201524206.png" alt=""></p><p>这些实现都有自己的名字，用注解标注出来，例如：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@RandomGeneratorProperties</span><span class="token punctuation">(</span>
        name <span class="token operator">=</span> <span class="token string">&quot;L32X64MixRandom&quot;</span><span class="token punctuation">,</span>
        group <span class="token operator">=</span> <span class="token string">&quot;LXM&quot;</span><span class="token punctuation">,</span>
        i <span class="token operator">=</span> <span class="token number">64</span><span class="token punctuation">,</span> j <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">,</span> k <span class="token operator">=</span> <span class="token number">32</span><span class="token punctuation">,</span>
        equidistribution <span class="token operator">=</span> <span class="token number">1</span>
<span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">L32X64MixRandom</span> <span class="token keyword">extends</span> <span class="token class-name">AbstractSplittableWithBrineGenerator</span> <span class="token punctuation">{</span> <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们可以通过名字来获取它们的实例：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">var</span> random <span class="token operator">=</span> <span class="token class-name">RandomGenerator</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token string">&quot;L32X64MixRandom&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>random<span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/70EF16B5.jpg" alt=""></p><p>好啦，关于随机数的更新又讲完啦。你不会又觉得这玩意没啥用吧。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates-03-random/07E713C6.jpg" alt="img"></p><h2 id="关于作者" tabindex="-1"><a class="header-anchor" href="#关于作者" aria-hidden="true">#</a> 关于作者</h2><p><strong>霍丙乾 bennyhuo</strong>，Google 开发者专家（Kotlin 方向）；<strong>《深入理解 Kotlin 协程》</strong> 作者（机械工业出版社，2020.6）；<strong>《深入实践 Kotlin 元编程》</strong> 作者（机械工业出版社，预计 2023 Q3）；前腾讯高级工程师，现就职于猿辅导</p>`,39),d=n("li",null,"GitHub：https://github.com/bennyhuo",-1),k=n("li",null,"博客：https://www.bennyhuo.com",-1),r={href:"https://space.bilibili.com/28615855",target:"_blank",rel:"noopener noreferrer"},m=n("strong",null,"霍丙乾 bennyhuo",-1),v=n("li",null,[s("微信公众号："),n("strong",null,"霍丙乾 bennyhuo")],-1);function b(g,f){const a=l("ExternalLinkIcon");return p(),e("div",null,[u,n("ul",null,[d,k,n("li",null,[s("bilibili："),n("a",r,[m,o(a)])]),v])])}const w=t(i,[["render",b],["__file","03-random.html.vue"]]);export{w as default};
