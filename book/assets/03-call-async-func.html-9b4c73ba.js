import{_ as t,X as e,Y as p,Z as n,a0 as s,$ as o,a1 as c,D as i}from"./framework-98842e7a.js";const l={},u=c(`<h1 id="_3-在程序当中调用异步函数" tabindex="-1"><a class="header-anchor" href="#_3-在程序当中调用异步函数" aria-hidden="true">#</a> 3. 在程序当中调用异步函数</h1><blockquote><p>异步函数需要被异步函数调用，这听上去就是一个鸡生蛋蛋生鸡的问题。关键的问题在于，第一个异步函数从哪儿来？</p></blockquote><p>我们现在已经知道怎么定义异步函数了，也可以很轻松的转换将现有的异步回调 API 转成异步函数。那下一个问题就是，既然普通函数不能调用异步函数，那定义好的这些异步函数该从哪儿开始调用呢？</p><h2 id="使用-task" tabindex="-1"><a class="header-anchor" href="#使用-task" aria-hidden="true">#</a> 使用 Task</h2><h3 id="task-的创建" tabindex="-1"><a class="header-anchor" href="#task-的创建" aria-hidden="true">#</a> Task 的创建</h3><p>其实从上一节我们分析如何将回调转成异步函数的时候就已经发现，异步函数的关键在于 Continuation。所以，只要调用异步函数的位置能让异步函数获取到 Continuation，那么调用异步函数的问题就解决了。Swift 标准库提供了 Task 类来提供这个能力。</p><p>我们给出 Task 的构造器的定义：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token keyword">public</span> <span class="token keyword">init</span><span class="token punctuation">(</span>
    priority<span class="token punctuation">:</span> _Concurrency<span class="token punctuation">.</span><span class="token class-name">TaskPriority</span><span class="token operator">?</span> <span class="token operator">=</span> <span class="token nil constant">nil</span><span class="token punctuation">,</span> 
    operation<span class="token punctuation">:</span> <span class="token attribute atrule">@escaping</span> <span class="token attribute atrule">@Sendable</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token operator">-&gt;</span> <span class="token class-name">Success</span><span class="token punctuation">)</span>

<span class="token keyword">public</span> <span class="token keyword">init</span><span class="token punctuation">(</span>
    priority<span class="token punctuation">:</span> _Concurrency<span class="token punctuation">.</span><span class="token class-name">TaskPriority</span><span class="token operator">?</span> <span class="token operator">=</span> <span class="token nil constant">nil</span><span class="token punctuation">,</span> 
    operation<span class="token punctuation">:</span> <span class="token attribute atrule">@escaping</span> <span class="token attribute atrule">@Sendable</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token keyword">throws</span> <span class="token operator">-&gt;</span> <span class="token class-name">Success</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>它接收一个异步闭包作为参数，创建一个 Task 实例并运行这个异步闭包。而在这个闭包当中，我们就可以调用任意异步函数了：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token class-name">Task</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> result <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">helloAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token function">print</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除了直接构造 Task 之外，还可以调用 Task 的 detach 函数来创建一个不一样的 Task：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token class-name">Task</span><span class="token punctuation">.</span><span class="token function">detached</span> <span class="token punctuation">(</span>operation<span class="token punctuation">:</span> <span class="token punctuation">{</span>
    <span class="token keyword">await</span> <span class="token function">helloAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个函数返回的也是一个 Task 实例，我们不妨看一下它的定义：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">func</span> <span class="token function-definition function">detached</span><span class="token punctuation">(</span>
    priority<span class="token punctuation">:</span> _Concurrency<span class="token punctuation">.</span><span class="token class-name">TaskPriority</span><span class="token operator">?</span> <span class="token operator">=</span> <span class="token nil constant">nil</span><span class="token punctuation">,</span> 
    operation<span class="token punctuation">:</span> <span class="token attribute atrule">@escaping</span> <span class="token attribute atrule">@Sendable</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token operator">-&gt;</span> <span class="token class-name">Success</span>
<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> _Concurrency<span class="token punctuation">.</span><span class="token class-name">Task</span><span class="token operator">&lt;</span><span class="token class-name">Success</span><span class="token punctuation">,</span> <span class="token class-name">Failure</span><span class="token operator">&gt;</span>

<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">func</span> <span class="token function-definition function">detached</span><span class="token punctuation">(</span>
    priority<span class="token punctuation">:</span> _Concurrency<span class="token punctuation">.</span><span class="token class-name">TaskPriority</span><span class="token operator">?</span> <span class="token operator">=</span> <span class="token nil constant">nil</span><span class="token punctuation">,</span> 
    operation<span class="token punctuation">:</span> <span class="token attribute atrule">@escaping</span> <span class="token attribute atrule">@Sendable</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token keyword">throws</span> <span class="token operator">-&gt;</span> <span class="token class-name">Success</span>
<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> _Concurrency<span class="token punctuation">.</span><span class="token class-name">Task</span><span class="token operator">&lt;</span><span class="token class-name">Success</span><span class="token punctuation">,</span> <span class="token class-name">Failure</span><span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意到它其实是 Task 的静态函数，返回值正是 Task 类型。</p><h3 id="两种-task-的对比" tabindex="-1"><a class="header-anchor" href="#两种-task-的对比" aria-hidden="true">#</a> 两种 Task 的对比</h3><p>那通过 detached 函数创建的 Task 和直接使用 Task 的构造器创建的 Task 实例有什么不同呢？我们先来看一下文档的说明：</p><p><strong>detached</strong> 函数的部分注释</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token comment">/// Runs the given nonthrowing operation asynchronously</span>
<span class="token comment">/// as part of a new top-level task.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>Task 类的 <strong>init</strong> 的部分注释</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token comment">/// Runs the given nonthrowing operation asynchronously</span>
<span class="token comment">/// as part of a new top-level task on behalf of the current actor.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到这两段说明有一个共同点：通过二者创建的 Task 都是 top-level task。这是什么意思呢？这个其实是与在 TaskGroup 当中创建子任务是相对应的，前面介绍的这两种方式创建出来的任务都是顶级任务，没有父任务。TaskGroup 的内容我们下一篇文章再介绍。</p><p>接下来就是区别点了，即使用 Task 直接构造的任务实例会 <code>on behalf of the current actor</code>。Actor 我们还没有介绍，不过我们姑且理解为任务启动时所在的运行环境。这里主要包括挂起的异步函数在恢复时如何调度，以及对于 TaskLocal 变量的感知上。这些内容我们后面会专门写文章介绍。</p><p>简单来说，通过 <code>Task { ... }</code> 创建的任务会对外界的状态有感知，而通过 <code>Task.detached { ... }</code> 创建的任务就完全是个孤儿了 —— 也正是因为这一点，官方文档里面也提醒我们一般情况下不要使用 detached 来创建任务。</p><p>以上创建 Task 的方式，也被称为<strong>非结构化并发</strong>。</p><p>这里并发的意思是，Task 都会把自己的代码块传给一个后台异步队列去执行。非结构化则与添加到 TaskGroup 当中的任务相对应，添加到 TaskGroup 当中的任务的形式被称为结构化并发，这些 Task 会随着整个 TaskGroup 的取消而取消，而相对应地，顶级任务的状态管理都只与自己有关，想要取消也必须调用 Task 的 cancel 显式地对任务进行取消。</p><p>现在你应该对 TaskGroup、Actor、TaskLocal 之类的概念也产生了兴趣，如果不能理解，也先不着急，我们等后面再慢慢展开介绍。</p><p>不管怎样，讲到这里，我们已经知道如何在程序当中使用异步函数了，下面我们给出一个完整的命令行程序：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token keyword">func</span> <span class="token function-definition function">helloAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token operator">-&gt;</span> <span class="token class-name">Int</span> <span class="token punctuation">{</span>
    <span class="token keyword">await</span> withCheckedContinuation <span class="token punctuation">{</span> continuation <span class="token keyword">in</span>
        <span class="token class-name">DispatchQueue</span><span class="token punctuation">.</span><span class="token function">global</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token keyword">async</span> <span class="token punctuation">{</span>
            continuation<span class="token punctuation">.</span><span class="token function">resume</span><span class="token punctuation">(</span>returning<span class="token punctuation">:</span> <span class="token class-name">Int</span><span class="token punctuation">(</span><span class="token function">arc4random</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token class-name">Task</span><span class="token punctuation">.</span>detached <span class="token punctuation">{</span>
    <span class="token function">print</span><span class="token punctuation">(</span><span class="token keyword">await</span> <span class="token function">helloAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token class-name">Task</span> <span class="token punctuation">{</span>
    <span class="token function">print</span><span class="token punctuation">(</span><span class="token keyword">await</span> <span class="token function">helloAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// 主线程等待 1s，防止程序提前退出导致异步任务没有执行</span>
<span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span>forTimeInterval<span class="token punctuation">:</span> <span class="token number">1</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行这个程序可以得到：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>1804289383
846930886
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>嗯，这是两个随机数。在这个例子当中，我们既没有定义 Actor，也没有定义 TaskLocal，因此创建出来的两个 Task 其实是没有什么本质的区别的。</p><blockquote><p>说明：Swift 的协程需要 macOS 12.0，iOS 15.0 及以上版本才可以运行，因此大家可以在 iOS 15.0 的设备或者模拟器上体验异步函数的调用。有趣的是，在 Windows 和 Linux 上安装 Swift 5.5 的编译器之后，上述程序是可以运行的。</p></blockquote><h2 id="task-的结果" tabindex="-1"><a class="header-anchor" href="#task-的结果" aria-hidden="true">#</a> Task 的结果</h2><p>Task 的闭包有返回值作为它的结果返回。由于 Task 是异步执行的，它的结果自然也是异步的：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token comment">// Task</span>
<span class="token keyword">public</span> <span class="token keyword">var</span> value<span class="token punctuation">:</span> <span class="token class-name">Success</span> <span class="token punctuation">{</span> <span class="token keyword">get</span> <span class="token keyword">async</span> <span class="token keyword">throws</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>我们可以在其他异步函数当中使用 await 来获取它的结果：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token keyword">let</span> task <span class="token operator">=</span> <span class="token class-name">Task</span> <span class="token punctuation">{</span>
    <span class="token keyword">await</span> <span class="token function">helloAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token function">print</span><span class="token punctuation">(</span><span class="token keyword">try</span> <span class="token keyword">await</span> task<span class="token punctuation">.</span>value<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于 Task 的闭包可以抛出异常，因此对于每一个 Task 来讲，异常也是结果的一种可能。如果我们只是任性地启动了一个 Task 而不去获取它的结果的话，Task 内部抛出的任何异常都与外部无关：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token keyword">func</span> <span class="token function-definition function">errorThrown</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token keyword">throws</span> <span class="token punctuation">{</span>
    <span class="token keyword">throw</span> <span class="token string-literal"><span class="token string">&quot;Runtime Error&quot;</span></span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function-definition function">taskWithError</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token keyword">throws</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> task <span class="token operator">=</span> <span class="token class-name">Task</span> <span class="token punctuation">{</span>
        <span class="token keyword">try</span> <span class="token keyword">await</span> <span class="token function">errorThrown</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 避免程序过早退出，等 1s</span>
    <span class="token keyword">await</span> <span class="token class-name">Task</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span><span class="token number">1000_000_000</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果我们想要看看 Task 究竟抛出了什么异常，我们可以在读取它的 value 时对异常进行捕获：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token keyword">func</span> <span class="token function-definition function">taskWithError</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token keyword">throws</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> task <span class="token operator">=</span> <span class="token class-name">Task</span> <span class="token punctuation">{</span>
        <span class="token keyword">try</span> <span class="token keyword">await</span> <span class="token function">errorThrown</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">do</span> <span class="token punctuation">{</span>
        <span class="token keyword">try</span> <span class="token keyword">await</span> task<span class="token punctuation">.</span>value
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">{</span>
        <span class="token function">print</span><span class="token punctuation">(</span>error<span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们前面定义的 Task 时传入的闭包会抛异常，这样一来 Task 的第二个泛型参数 Failure 就不可能是 Never。这种情况下获取 value 的操作需要使用 try 关键字。</p><h2 id="异步-main-函数" tabindex="-1"><a class="header-anchor" href="#异步-main-函数" aria-hidden="true">#</a> 异步 main 函数</h2><p>通过创建 Task 的方式适用于所有在同步函数当中需要调用异步函数的情形。当然，对于命令行程序来讲，我们还可以直接把 main 函数定义为 async 函数：</p><p><strong>App.swift</strong></p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token attribute atrule">@main</span>
<span class="token keyword">struct</span> <span class="token class-name">App</span> <span class="token punctuation">{</span>
    <span class="token keyword">static</span> <span class="token keyword">func</span> <span class="token function-definition function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token keyword">throws</span> <span class="token punctuation">{</span>
        <span class="token operator">...</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>首先我们定义一个结构体（或者类），将其标注为 @main；接着定义一个静态的 main 函数，这个函数可以是同步函数也可以是异步函数。</p><blockquote><p>注意，通过这种方式，main.swift 文件要留空（或者直接删掉）。</p></blockquote><p>这样我们就可以愉快地调用异步函数了：</p><div class="language-swift line-numbers-mode" data-ext="swift"><pre class="language-swift"><code><span class="token keyword">import</span> <span class="token class-name">Foundation</span>

<span class="token attribute atrule">@main</span>
<span class="token keyword">struct</span> <span class="token class-name">App</span> <span class="token punctuation">{</span>
    <span class="token keyword">static</span> <span class="token keyword">func</span> <span class="token function-definition function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">async</span> <span class="token keyword">throws</span> <span class="token punctuation">{</span>
        <span class="token function">print</span><span class="token punctuation">(</span><span class="token keyword">await</span> <span class="token function">helloAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

        <span class="token keyword">let</span> detachedTask <span class="token operator">=</span> <span class="token class-name">Task</span><span class="token punctuation">.</span>detached <span class="token punctuation">{</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token class-name">Int</span> <span class="token keyword">in</span>
            <span class="token function">print</span><span class="token punctuation">(</span><span class="token keyword">await</span> <span class="token function">helloAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> <span class="token number">1</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">let</span> task <span class="token operator">=</span> <span class="token class-name">Task</span> <span class="token punctuation">{</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token class-name">Int</span> <span class="token keyword">in</span>
            <span class="token function">print</span><span class="token punctuation">(</span><span class="token keyword">await</span> <span class="token function">helloAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> <span class="token number">2</span>
        <span class="token punctuation">}</span>

        <span class="token function">print</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&quot;detached task result: </span><span class="token interpolation-punctuation punctuation">\\(</span><span class="token interpolation"><span class="token keyword">try</span> <span class="token keyword">await</span> detachedTask<span class="token punctuation">.</span>value</span><span class="token interpolation-punctuation punctuation">)</span><span class="token string">&quot;</span></span><span class="token punctuation">)</span>
        <span class="token function">print</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&quot;task result: </span><span class="token interpolation-punctuation punctuation">\\(</span><span class="token interpolation"><span class="token keyword">try</span> <span class="token keyword">await</span> task<span class="token punctuation">.</span>value</span><span class="token interpolation-punctuation punctuation">)</span><span class="token string">&quot;</span></span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>说明：异步 main 函数同样受到 macOS 运行时版本的限制，但在 Windows 和 Linux 上不受限制。</p></blockquote><h2 id="小结" tabindex="-1"><a class="header-anchor" href="#小结" aria-hidden="true">#</a> 小结</h2><p>本文我们主要介绍了如何创建调用异步函数的条件的问题，大家也可以自己体验一下 Swift 的协程了。</p><h2 id="关于作者" tabindex="-1"><a class="header-anchor" href="#关于作者" aria-hidden="true">#</a> 关于作者</h2><p><strong>霍丙乾 bennyhuo</strong>，Google 开发者专家（Kotlin 方向）；<strong>《深入理解 Kotlin 协程》</strong> 作者（机械工业出版社，2020.6）；<strong>《深入实践 Kotlin 元编程》</strong> 作者（机械工业出版社，预计 2023 Q3）；前腾讯高级工程师，现就职于猿辅导</p>`,56),r=n("li",null,"GitHub：https://github.com/bennyhuo",-1),k=n("li",null,"博客：https://www.bennyhuo.com",-1),d={href:"https://space.bilibili.com/28615855",target:"_blank",rel:"noopener noreferrer"},v=n("strong",null,"霍丙乾 bennyhuo",-1),m=n("li",null,[s("微信公众号："),n("strong",null,"霍丙乾 bennyhuo")],-1);function b(w,y){const a=i("ExternalLinkIcon");return e(),p("div",null,[u,n("ul",null,[r,k,n("li",null,[s("bilibili："),n("a",d,[v,o(a)])]),m])])}const f=t(l,[["render",b],["__file","03-call-async-func.html.vue"]]);export{f as default};
