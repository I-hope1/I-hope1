import{_ as t,W as e,X as p,Y as n,$ as s,Z as c,a0 as l,C as o}from"./framework-88b7ff58.js";const i={},u=l(`<h1 id="_12-支持上下文的序列化过滤器-又一次给序列化打补丁" tabindex="-1"><a class="header-anchor" href="#_12-支持上下文的序列化过滤器-又一次给序列化打补丁" aria-hidden="true">#</a> 12. 支持上下文的序列化过滤器，又一次给序列化打补丁</h1><blockquote><p>Java 的序列化机制虽然有些问题，不过毕竟亲儿子，更新怎么能落下呢。</p></blockquote><p>接下来我们介绍 Java 17 合入的最后一个还没介绍的提案：<strong>JEP 415: Context-Specific Deserialization Filters</strong>，这是一条对于反序列化的更新。</p><p>Java 的序列化机制一向为人诟病，以至于 Effective Java 里面专门有几条讲 Java 序列化机制的，并且结论是“不要用它”。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/8941D48B.jpg" alt=""></p><p>这玩意你说咋还不废弃了呢。居然还在不断为了反序列化的安全性修修补补。</p><p>算了，我猜你们大概率用不到，不介绍了。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/8942EB6A.jpg" alt=""></p><p>好吧，其实不是，这玩意儿还是很常用的，所以还是介绍一下吧。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates-12-contextserialfilter/249FFAAB.png" alt=""></p><p>故事还要追溯到 Java 9，当时为了解决反序列化的数据的安全性问题，Java 提供了反序列化的过滤器，允许在反序列化的时候对数据做检查，这个过滤器就是 ObjectInputFilter。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">ObjectInputFilter</span> <span class="token punctuation">{</span>

    <span class="token doc-comment comment">/**
     * <span class="token keyword">@return</span>  <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Status</span><span class="token punctuation">#</span><span class="token field">ALLOWED</span></span> Status.ALLOWED<span class="token punctuation">}</span> if accepted,
     *          <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Status</span><span class="token punctuation">#</span><span class="token field">REJECTED</span></span> Status.REJECTED<span class="token punctuation">}</span> if rejected,
     *          <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Status</span><span class="token punctuation">#</span><span class="token field">UNDECIDED</span></span> Status.UNDECIDED<span class="token punctuation">}</span> if undecided.
     */</span>
    <span class="token class-name">Status</span> <span class="token function">checkInput</span><span class="token punctuation">(</span><span class="token class-name">FilterInfo</span> filterInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>它最关键的方法就是这个 checkInput，返回值则是一个枚举。</p><p>在每一个 ObjectInputStream 实例被创建的时候都会创建一个过滤器与之对应：</p><p><strong>Java 16</strong>：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token class-name">ObjectInputStream</span><span class="token punctuation">(</span><span class="token class-name">InputStream</span> in<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
    serialFilter <span class="token operator">=</span> <span class="token class-name">ObjectInputFilter<span class="token punctuation">.</span>Config</span><span class="token punctuation">.</span><span class="token function">getSerialFilter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个过滤器实际上是 JVM 全局的过滤器，可以通过系统属性 jdk.serialFilter 来配置，也可以通 ObjectInputFilter.Config#setSerialFilter 来设置。</p><p>在 ObjectInputStream 创建出来之后，我们也可以通过它的 setObjectInputFilter 来对这个实例单独设置自定义的过滤器。</p><p>以上的特性都是 Java 9 引入的，下面我们看看 Java 17 的更新：</p><p><strong>Java 17</strong></p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token class-name">ObjectInputStream</span><span class="token punctuation">(</span><span class="token class-name">InputStream</span> in<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
    serialFilter <span class="token operator">=</span> <span class="token class-name">Config</span><span class="token punctuation">.</span><span class="token function">getSerialFilterFactorySingleton</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token class-name">Config</span><span class="token punctuation">.</span><span class="token function">getSerialFilter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其实这段代码已经很明确的展示了改动之处，那就是 getSerialFilterFactorySingleton 返回的这个对象对原有的全局过滤器做了个变换。这个对象实际上是个 <code>BinaryOperator&lt;ObjectInputFilter&gt;</code>，实现这个 FilterFactory 就可以通过实现 apply 方法来完成对原有过滤器的修改：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token class-name">ObjectInputFilter</span> <span class="token function">apply</span><span class="token punctuation">(</span><span class="token class-name">ObjectInputFilter</span> objectInputFilter<span class="token punctuation">,</span> <span class="token class-name">ObjectInputFilter</span> objectInputFilter2<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以如果你乐意，你可以随机返回 objectInputFilter 或者返回 objectInputFilter2（草率。。。），也可以把它俩串联或者并联起来。换句话讲，我们除了可以通过设置全局过滤器，以及单独为每一个 ObjectInputStream 实例设置过滤器以外，还可以设置一个操纵过滤器的对象，这个对象可以根据上下文来判断具体返回什么样的过滤器。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates-12-contextserialfilter/24A164DA.png" alt=""></p><p>接下来我们再看一下提案当中给出的例子（实际的 JDK API 与提案的例子有些调整，以下代码是调整之后的）：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">FilterInThread</span> <span class="token keyword">implements</span> <span class="token class-name">BinaryOperator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ObjectInputFilter</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ThreadLocal</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ObjectInputFilter</span><span class="token punctuation">&gt;</span></span> filterThreadLocal <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ThreadLocal</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">ObjectInputFilter</span> <span class="token function">apply</span><span class="token punctuation">(</span><span class="token class-name">ObjectInputFilter</span> curr<span class="token punctuation">,</span> <span class="token class-name">ObjectInputFilter</span> next<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>curr <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">var</span> filter <span class="token operator">=</span> filterThreadLocal<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>filter <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                filter <span class="token operator">=</span> <span class="token class-name">ObjectInputFilter</span><span class="token punctuation">.</span><span class="token function">rejectUndecidedClass</span><span class="token punctuation">(</span>filter<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>next <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                filter <span class="token operator">=</span> <span class="token class-name">ObjectInputFilter</span><span class="token punctuation">.</span><span class="token function">merge</span><span class="token punctuation">(</span>next<span class="token punctuation">,</span> filter<span class="token punctuation">)</span><span class="token punctuation">;</span>
                filter <span class="token operator">=</span> <span class="token class-name">ObjectInputFilter</span><span class="token punctuation">.</span><span class="token function">rejectUndecidedClass</span><span class="token punctuation">(</span>filter<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> filter<span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>next <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                next <span class="token operator">=</span> <span class="token class-name">ObjectInputFilter</span><span class="token punctuation">.</span><span class="token function">merge</span><span class="token punctuation">(</span>next<span class="token punctuation">,</span> curr<span class="token punctuation">)</span><span class="token punctuation">;</span>
                next <span class="token operator">=</span> <span class="token class-name">ObjectInputFilter</span><span class="token punctuation">.</span><span class="token function">rejectUndecidedClass</span><span class="token punctuation">(</span>next<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">return</span> next<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> curr<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个例子其实不复杂，我最初看的时候反而被一堆注释给搞得晕头转向，所以我决定把注释都删了给你们看。。。</p><p>它的逻辑简单来说就是 apply 的时候如果 curr 为 null，就从的 ThreadLocal 当中取出当前线程对应的过滤器与 next 进行合并，否则就用 curr 与 next 合并。</p><p>但通过前面阅读代码，我们已经知道 curr 在 ObjectInputStream 创建的时候传入的一定是 null（只有在后面调用 ObjectInputStream#setObjectInputFilter 的时候 curr 才会是之前已经创建的过滤器），因此这个 FilterInThread 就可以在 ObjectInputStream 创建的时候为它添加一个线程特有的过滤器，也就是上下文相关的过滤器了。</p><p>实际上例子里面还提供了一个临时切换过滤器的方法：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">FilterInThread</span> <span class="token keyword">implements</span> <span class="token class-name">BinaryOperator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ObjectInputFilter</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
    
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">doWithSerialFilter</span><span class="token punctuation">(</span><span class="token class-name">ObjectInputFilter</span> filter<span class="token punctuation">,</span> <span class="token class-name">Runnable</span> runnable<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">var</span> prevFilter <span class="token operator">=</span> filterThreadLocal<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">try</span> <span class="token punctuation">{</span>
            filterThreadLocal<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>filter<span class="token punctuation">)</span><span class="token punctuation">;</span>
            runnable<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
            filterThreadLocal<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>prevFilter<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们可以通过调用 doWithSerialFilter 来实现将 runnable 的 run 当中所有直接创建的 ObjectInputStream 都将应用传入的这个 filter 作为自己的上下文过滤器。</p><p>有意思吧。不过一点儿也不直接。挺简单的一个东西竟然能搞得这么别扭。。。</p><p><img src="https://kotlinblog-1251218094.costj.myqcloud.com/6c8656be-f0d8-432e-9bfd-94a1fbd7cd6c/media/Java17-Updates/00DC34EC.gif" alt=""></p><p>讲到这儿，我们总算是把 Java 17 的主要更新介绍了一遍。除了这些大的更新以外，还有一些小的 Bugfix 和优化，我就不一一列举了。</p><h2 id="关于作者" tabindex="-1"><a class="header-anchor" href="#关于作者" aria-hidden="true">#</a> 关于作者</h2><p><strong>霍丙乾 bennyhuo</strong>，Google 开发者专家（Kotlin 方向）；<strong>《深入理解 Kotlin 协程》</strong> 作者（机械工业出版社，2020.6）；<strong>《深入实践 Kotlin 元编程》</strong> 作者（机械工业出版社，预计 2023 Q3）；前腾讯高级工程师，现就职于猿辅导</p>`,38),r=n("li",null,"GitHub：https://github.com/bennyhuo",-1),k=n("li",null,"博客：https://www.bennyhuo.com",-1),d={href:"https://space.bilibili.com/28615855",target:"_blank",rel:"noopener noreferrer"},v=n("strong",null,"霍丙乾 bennyhuo",-1),m=n("li",null,[s("微信公众号："),n("strong",null,"霍丙乾 bennyhuo")],-1);function b(f,g){const a=o("ExternalLinkIcon");return e(),p("div",null,[u,n("ul",null,[r,k,n("li",null,[s("bilibili："),n("a",d,[v,c(a)])]),m])])}const y=t(i,[["render",b],["__file","12-contextserialfilter.html.vue"]]);export{y as default};