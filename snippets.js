// snippets.js — the AI-engineer curriculum, written for an absolute beginner
// who knows Python but is brand new to AI/ML and the math behind it.
//
// Each snippet: { id, title, level, category, tags, description, explain, code }
//   - description : one plain sentence — what the code does
//   - explain     : "why it matters", in everyday language, defining every term
//   - code        : runs in the bundled env (numpy, scipy, pandas, scikit-learn,
//                   joblib + Python stdlib)
// NOTE: backslashes inside code must be doubled (\\n, \\w) so the generated
// Python source contains a real backslash.

window.CATEGORY_ORDER = [
  "Start Here",
  "Python",
  "Algorithms & DS",
  "Math for ML",
  "NumPy",
  "Pandas & Data",
  "Matplotlib",
  "Classical ML",
  "Evaluation",
  "Neural Networks",
  "PyTorch",
  "TensorFlow",
  "NLP & LLM",
  "MLOps",
];

window.SNIPPETS = [
  /* ===================== Start Here ===================== */
  {
    id: "start-here",
    title: "👋 Start here — how to learn with this app",
    level: "Beginner",
    category: "Start Here",
    tags: ["welcome", "guide"],
    description: "Read this first. It explains how to use the app and the order to learn in.",
    explain:
      "You already know Python, which is the hardest prerequisite — nice work. Everything here builds on that. Suggested path: do the topics top-to-bottom in the Roadmap. Start with Python (a warm-up you'll find easy), then Algorithms, then Math for ML (go slow here — it's new but not scary), then NumPy and Pandas (the everyday tools), then Classical ML (your first real models), and finally Neural Networks and NLP & LLM. Topics marked 'Advanced' are fine to skim now and revisit later. Don't rush — understanding one topic a day is great progress.",
    code: `# You know Python already — so you can read this. That's the whole point:
# we'll teach AI step by step, always starting from plain Python.

steps = [
    "1. Read the concept and the 'Why it matters' note",
    "2. Type the code into the editor yourself (typing beats copying)",
    "3. Press Ctrl+Enter to run it and read the output",
    "4. Use the Roadmap on the left to go in order, top to bottom",
]
for s in steps:
    print(s)

print("\\nTip: green dot = Python is ready. Then anything you write can run.")
print("You've got this. Open the 'Python' section next to warm up.")`,
  },

  /* ===================== Python ===================== */
  {
    id: "py-basics-list-comprehension",
    title: "List comprehension & average",
    level: "Beginner",
    category: "Python",
    tags: ["python", "basics"],
    description: "Build a list of squared numbers, then compute their average.",
    explain:
      "A 'list comprehension' is Python's short way to build a list from another list. You'll use this constantly in AI to transform data — for example turning raw numbers into the features a model reads. If you're comfortable here, you're ready for everything that follows.",
    code: `nums = [x for x in range(1, 11)]
squares = [n * n for n in nums]
mean = sum(squares) / len(squares)

print("squares:", squares)
print("mean:", mean)`,
  },
  {
    id: "py-dict-set",
    title: "Dictionaries & sets (counting words)",
    level: "Beginner",
    category: "Python",
    tags: ["python", "data-structures"],
    description: "Count how often each word appears; list the unique words.",
    explain:
      "A dictionary stores key→value pairs (here: word→count). A set stores only unique items. Both are instant to look things up in. AI uses them everywhere — for example a 'vocabulary' that maps each word to a number is just a dictionary.",
    code: `words = "the cat sat on the mat the cat".split()
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1

print("counts:", counts)
print("unique words:", sorted(set(words)))`,
  },
  {
    id: "py-args-kwargs",
    title: "Flexible functions (*args & **kwargs)",
    level: "Beginner",
    category: "Python",
    tags: ["python", "functions"],
    description: "Write a function that accepts any number of arguments.",
    explain:
      "`*args` collects extra positional values into a tuple; `**kwargs` collects extra named values into a dictionary. AI libraries pass settings around this way all the time, so recognizing it helps you read their code and error messages.",
    code: `def summarize(*args, **kwargs):
    print("positional:", args)
    print("keyword:", kwargs)
    return sum(args)

print("total:", summarize(1, 2, 3, label="scores", scale=2))`,
  },
  {
    id: "py-oop-class",
    title: "Classes (a simple object)",
    level: "Beginner",
    category: "Python",
    tags: ["python", "oop"],
    description: "Bundle data and behavior together in a class.",
    explain:
      "A class is a blueprint for an object that holds its own data (here: weights and bias) and has methods (functions) that use them. Later, every model you meet is an object with a `.fit()` and `.predict()` method — so getting the idea now pays off.",
    code: `class Neuron:
    def __init__(self, weights, bias):
        self.weights = weights
        self.bias = bias

    def forward(self, x):
        return sum(w * xi for w, xi in zip(self.weights, x)) + self.bias

n = Neuron([0.5, -0.3], 0.1)
print("output:", n.forward([2.0, 1.0]))`,
  },
  {
    id: "py-generators",
    title: "Generators (yield items one at a time)",
    level: "Intermediate",
    category: "Python",
    tags: ["python", "generators"],
    description: "Hand out data in small chunks instead of all at once.",
    explain:
      "`yield` makes a function produce values lazily — one piece at a time, instead of building the whole list in memory. AI datasets can be huge (millions of rows), so models are fed in small 'batches' exactly like this.",
    code: `def batches(data, size):
    for i in range(0, len(data), size):
        yield data[i:i + size]

for b in batches(list(range(10)), 3):
    print(b)`,
  },
  {
    id: "py-decorators",
    title: "Decorators (wrap a function)",
    level: "Intermediate",
    category: "Python",
    tags: ["python", "decorators"],
    description: "Add timing to a function without changing its code.",
    explain:
      "A decorator is a function that wraps another function to add behavior (here: measuring how long it runs). The `@name` line above a function applies it. You'll see decorators in AI code for caching, logging, and timing — now you'll know what they do.",
    code: `import time, functools

def timed(fn):
    @functools.wraps(fn)
    def wrap(*a, **k):
        t0 = time.time()
        r = fn(*a, **k)
        print(fn.__name__, "took", round(time.time() - t0, 4), "s")
        return r
    return wrap

@timed
def work(n):
    return sum(i * i for i in range(n))

print("result:", work(200000))`,
  },
  {
    id: "py-map-filter-reduce",
    title: "map / filter / reduce + lambda",
    level: "Beginner",
    category: "Python",
    tags: ["python", "functional"],
    description: "Transform, keep, and combine items in a list.",
    explain:
      "`map` applies a function to every item, `filter` keeps items that pass a test, and `reduce` folds the list into one value. A `lambda` is just a tiny unnamed function. This 'apply a rule to all the data at once' mindset is exactly how the NumPy library (coming up) thinks.",
    code: `from functools import reduce

nums = list(range(1, 11))
evens = list(filter(lambda x: x % 2 == 0, nums))
squared = list(map(lambda x: x * x, nums))
total = reduce(lambda a, b: a + b, nums)

print("evens:", evens)
print("squared:", squared)
print("sum:", total)`,
  },
  {
    id: "py-context-manager",
    title: "with-blocks & try/except",
    level: "Intermediate",
    category: "Python",
    tags: ["python", "errors"],
    description: "Clean up resources safely and handle errors.",
    explain:
      "A `with` block guarantees cleanup happens even if something fails (think: closing a file no matter what). `try/except` catches errors so your program doesn't crash. Real AI pipelines run for hours, so handling failures gracefully matters.",
    code: `class Collector:
    def __enter__(self):
        self.data = []
        return self
    def __exit__(self, *exc):
        print("collected", len(self.data), "items")
        return False

with Collector() as c:
    for i in range(5):
        c.data.append(i)

try:
    1 / 0
except ZeroDivisionError as e:
    print("caught:", e)`,
  },

  /* ===================== Algorithms & DS ===================== */
  {
    id: "algo-bubble-sort",
    title: "Bubble sort",
    level: "Beginner",
    category: "Algorithms & DS",
    tags: ["algorithm", "sorting"],
    description: "Sort a list by repeatedly swapping neighbors that are out of order.",
    explain:
      "Sorting means putting items in order. Bubble sort is the simplest method: compare each pair of neighbors and swap if they're backwards, over and over. It's slow on big lists, but it's the perfect first algorithm for building intuition about how code 'thinks' step by step. Watch the animation to see it happen.",
    code: `def bubble_sort(arr):
    a = arr[:]
    n = len(a)
    for i in range(n):
        for j in range(0, n - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
    return a

print("sorted:", bubble_sort([5, 2, 9, 1, 5, 6]))`,
  },
  {
    id: "algo-binary-search",
    title: "Binary search",
    level: "Beginner",
    category: "Algorithms & DS",
    tags: ["algorithm", "search"],
    description: "Find a value in a *sorted* list by halving the search range each step.",
    explain:
      "If a list is already sorted, you don't check every item — you jump to the middle, then throw away the half that can't contain your target, and repeat. This 'cut the problem in half' trick is one of the most important ideas in computing. The animation shows the range shrinking.",
    code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

arr = [1, 3, 4, 7, 9, 11, 15]
print("index of 9:", binary_search(arr, 9))
print("index of 8:", binary_search(arr, 8))`,
  },
  {
    id: "algo-merge-sort",
    title: "Merge sort",
    level: "Intermediate",
    category: "Algorithms & DS",
    tags: ["algorithm", "sorting", "recursion"],
    description: "Sort by splitting the list in half, sorting each half, then merging.",
    explain:
      "Merge sort uses 'recursion' — a function that calls itself on smaller pieces. Split until pieces are tiny, then merge them back together in order. It's much faster than bubble sort on big lists. Don't worry if recursion feels strange at first; it clicks with practice.",
    code: `def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]

print(merge_sort([5, 2, 9, 1, 7, 3, 8]))`,
  },
  {
    id: "algo-recursion-memo",
    title: "Recursion & memoization",
    level: "Intermediate",
    category: "Algorithms & DS",
    tags: ["algorithm", "recursion"],
    description: "Compute Fibonacci numbers, remembering results so it stays fast.",
    explain:
      "Recursion is a function calling itself. 'Memoization' means caching answers you've already computed so you never redo work — `@lru_cache` does this automatically. The same 'remember it instead of recomputing' idea speeds up many AI systems.",
    code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print([fib(i) for i in range(15)])`,
  },
  {
    id: "algo-dynamic-programming",
    title: "Dynamic programming (coin change)",
    level: "Advanced",
    category: "Algorithms & DS",
    tags: ["algorithm", "dp"],
    description: "Find the fewest coins that add up to an amount.",
    explain:
      "🔹 Deeper topic — skim now, return later. 'Dynamic programming' solves a big problem by first solving and storing answers to smaller versions of it, then building up. Here we find the smallest answer for every amount from 1 up to the target. It's a common interview topic.",
    code: `def coin_change(coins, amount):
    dp = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount]

print("min coins for 27:", coin_change([1, 5, 10], 27))`,
  },
  {
    id: "algo-stack-queue",
    title: "Stack & queue",
    level: "Beginner",
    category: "Algorithms & DS",
    tags: ["algorithm", "data-structures"],
    description: "Two ways to store items: last-in-first-out and first-in-first-out.",
    explain:
      "A stack is like a pile of plates — you take the last one you added (LIFO). A queue is like a line at a shop — first come, first served (FIFO). These two simple structures power tons of algorithms, including how programs explore data.",
    code: `from collections import deque

stack = []
stack.append(1); stack.append(2)
print("stack pop:", stack.pop())

q = deque()
q.append("a"); q.append("b")
print("queue dequeue:", q.popleft())`,
  },
  {
    id: "algo-tree-traversal",
    title: "Tree traversal (BFS & DFS)",
    level: "Intermediate",
    category: "Algorithms & DS",
    tags: ["algorithm", "graphs", "trees"],
    description: "Visit every node in a tree, two different ways.",
    explain:
      "A 'tree' is data that branches, like a family tree. BFS (breadth-first) visits level by level; DFS (depth-first) goes as deep as possible first. Decision-tree models (later in this app) are literally trees you walk through to make a prediction.",
    code: `from collections import deque

tree = {1: [2, 3], 2: [4, 5], 3: [6], 4: [], 5: [], 6: []}

def bfs(root):
    order, q = [], deque([root])
    while q:
        n = q.popleft(); order.append(n)
        q.extend(tree[n])
    return order

def dfs(n):
    return [n] + [x for c in tree[n] for x in dfs(c)]

print("BFS:", bfs(1))
print("DFS:", dfs(1))`,
  },
  {
    id: "algo-two-sum",
    title: "Two-sum with a dictionary",
    level: "Beginner",
    category: "Algorithms & DS",
    tags: ["algorithm", "hashing"],
    description: "Find two numbers in a list that add up to a target.",
    explain:
      "The clever trick: as you scan the list, remember each number you've seen in a dictionary. For each new number, instantly check if its 'partner' (target minus it) was already seen. Using a dictionary to remember things turns slow searches into fast ones — a pattern you'll reuse forever.",
    code: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return (seen[target - n], i)
        seen[n] = i
    return None

print(two_sum([2, 7, 11, 15], 9))`,
  },

  /* ===================== Math for ML ===================== */
  {
    id: "math-vectors",
    title: "Vectors: dot product",
    level: "Beginner",
    category: "Math for ML",
    tags: ["math", "linear-algebra", "numpy"],
    description: "Combine two lists of numbers into a single 'how aligned are they' score.",
    explain:
      "A 'vector' is just a list of numbers, like [1, 2, 3]. The 'dot product' multiplies matching items and adds them up — it tells you how much two vectors point the same way. This one operation is the heartbeat of almost all AI math, so it's worth getting comfortable. The animation shows two arrows and their alignment.",
    code: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
print("dot:", np.dot(a, b))
print("|a|:", round(float(np.linalg.norm(a)), 3))
print("cosine:", round(float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b))), 3))`,
  },
  {
    id: "math-matrix-multiply",
    title: "Matrix multiplication",
    level: "Beginner",
    category: "Math for ML",
    tags: ["math", "linear-algebra", "numpy"],
    description: "Multiply two grids of numbers with the @ operator.",
    explain:
      "A 'matrix' is a grid (a table) of numbers. Multiplying matrices combines them following a fixed rule. Every neural network is mostly just matrix multiplications stacked up, so this is a skill you'll lean on a lot. The `@` symbol means matrix-multiply in Python.",
    code: `import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
print("A @ B =\\n", A @ B)
print("Aᵀ =\\n", A.T)`,
  },
  {
    id: "math-linear-system",
    title: "Solving equations (Ax = b)",
    level: "Intermediate",
    category: "Math for ML",
    tags: ["math", "linear-algebra"],
    description: "Solve a set of equations for the unknown values.",
    explain:
      "This finds the numbers x that satisfy several equations at once. You don't have to do the algebra — NumPy solves it for you. The simplest model, linear regression, can be solved exactly like this. Treat the math as 'the computer figures out x' for now.",
    code: `import numpy as np

A = np.array([[2.0, 1.0], [1.0, 3.0]])
b = np.array([5.0, 10.0])
x = np.linalg.solve(A, b)
print("solution x:", x)
print("check A@x:", A @ x)`,
  },
  {
    id: "math-eigen",
    title: "Eigenvalues & eigenvectors",
    level: "Advanced",
    category: "Math for ML",
    tags: ["math", "linear-algebra"],
    description: "Find the special directions a matrix only stretches.",
    explain:
      "🔹 Deeper topic — skim now, return later. Some directions, when a matrix transforms them, only get longer or shorter (not rotated). Those are 'eigenvectors', and the stretch amounts are 'eigenvalues'. They power PCA (a later topic). It's okay if this feels abstract today — you'll meet it again with a picture.",
    code: `import numpy as np

A = np.array([[2.0, 0.0], [0.0, 3.0]])
vals, vecs = np.linalg.eig(A)
print("eigenvalues:", vals)
print("eigenvectors:\\n", vecs)`,
  },
  {
    id: "math-gradient",
    title: "Slope of a function (gradient)",
    level: "Intermediate",
    category: "Math for ML",
    tags: ["math", "calculus"],
    description: "Estimate how steep a function is at a point.",
    explain:
      "The 'gradient' is just the slope — how fast a function goes up or down at a point. AI models learn by checking the slope of their error and stepping 'downhill' to reduce it. You don't need calculus class: this code measures the slope by nudging the input a tiny bit.",
    code: `def f(x):
    return x ** 2 + 3 * x

def grad(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

print("f'(2) ≈", round(grad(f, 2.0), 4), "(exact 7)")`,
  },
  {
    id: "math-bayes",
    title: "Updating beliefs (Bayes' rule)",
    level: "Intermediate",
    category: "Math for ML",
    tags: ["math", "probability"],
    description: "Compute the chance you have a disease after a positive test.",
    explain:
      "Bayes' rule updates a probability when new evidence arrives. The surprise here: even with a 99%-accurate test, a positive result doesn't mean you very likely have a rare disease — because the disease is rare to begin with. Reasoning about probability like this keeps you from being fooled by numbers.",
    code: `p_d = 0.01        # prior: 1% have the disease
p_pos_d = 0.99    # test correctly flags a sick person 99% of the time
p_pos_nd = 0.05   # but also wrongly flags 5% of healthy people

p_pos = p_pos_d * p_d + p_pos_nd * (1 - p_d)
posterior = p_pos_d * p_d / p_pos
print("P(disease | positive) =", round(posterior, 3))`,
  },
  {
    id: "math-distributions",
    title: "Probability distributions",
    level: "Intermediate",
    category: "Math for ML",
    tags: ["math", "probability", "scipy"],
    description: "Work with the famous bell curve (normal distribution).",
    explain:
      "A 'distribution' describes how likely different values are. The 'normal' distribution is the classic bell curve — common in nature and all over AI (for random starting values, noise, and more). Here we read its shape and draw random samples from it.",
    code: `import numpy as np
from scipy import stats

x = np.linspace(-3, 3, 7)
print("normal pdf:", np.round(stats.norm.pdf(x), 3))
sample = stats.norm(loc=0, scale=1).rvs(size=5, random_state=0)
print("sample:", np.round(sample, 3))`,
  },
  {
    id: "math-statistics",
    title: "Summary statistics",
    level: "Beginner",
    category: "Math for ML",
    tags: ["math", "statistics", "numpy"],
    description: "Compute mean, median, spread, and percentiles of some numbers.",
    explain:
      "Before building anything, you summarize your data. Mean is the average; median is the middle value; standard deviation measures how spread out values are; percentiles tell you cutoffs. This is the very first thing you do with any new dataset.",
    code: `import numpy as np

data = np.array([4, 8, 15, 16, 23, 42])
print("mean:", data.mean(), " median:", np.median(data))
print("std:", round(data.std(), 2), " var:", round(data.var(), 2))
print("25th/75th pct:", np.percentile(data, [25, 75]))`,
  },
  {
    id: "math-hypothesis-test",
    title: "Is the difference real? (t-test)",
    level: "Advanced",
    category: "Math for ML",
    tags: ["math", "statistics", "scipy"],
    description: "Check whether two groups of numbers are meaningfully different.",
    explain:
      "🔹 Deeper topic — skim now, return later. When two groups look different, is it real or just luck? A t-test gives a 'p-value': if it's below 0.05, the difference is unlikely to be random chance. This is how you decide whether a change to a product (or a model) actually helped.",
    code: `import numpy as np
from scipy import stats

a = np.array([5.1, 4.9, 5.3, 5.0, 5.2])
b = np.array([5.5, 5.7, 5.4, 5.6, 5.8])
t, p = stats.ttest_ind(a, b)
print("t =", round(t, 3), " p =", round(p, 4))
print("significant" if p < 0.05 else "not significant")`,
  },
  {
    id: "math-correlation",
    title: "Correlation",
    level: "Beginner",
    category: "Math for ML",
    tags: ["math", "statistics", "numpy"],
    description: "Measure whether two things rise and fall together.",
    explain:
      "Correlation is a number from -1 to 1: near 1 means two things move up together, near -1 means one goes up as the other goes down, near 0 means no relationship. It helps you spot which inputs might be useful for predicting an output.",
    code: `import numpy as np

x = np.array([1, 2, 3, 4, 5])
y = np.array([2, 4, 5, 4, 6])
print("correlation:\\n", np.round(np.corrcoef(x, y), 3))
print("covariance:\\n", np.round(np.cov(x, y), 3))`,
  },

  /* ===================== NumPy ===================== */
  {
    id: "np-broadcasting",
    title: "Broadcasting",
    level: "Intermediate",
    category: "NumPy",
    tags: ["numpy"],
    description: "Subtract the column averages from a whole table at once.",
    explain:
      "NumPy is the library for fast number-crunching. 'Broadcasting' lets you combine arrays of different shapes automatically — no loops. Here we 'center' data by subtracting each column's average from every row, in one line. This is how real data prep is done.",
    code: `import numpy as np

a = np.arange(12).reshape(3, 4)
print("matrix:\\n", a)
print("col means:", a.mean(axis=0))
print("centered:\\n", a - a.mean(axis=0))`,
  },
  {
    id: "np-boolean-mask",
    title: "Filtering arrays by condition",
    level: "Beginner",
    category: "NumPy",
    tags: ["numpy"],
    description: "Pick out and change array values using a true/false test.",
    explain:
      "Instead of a loop, you can say 'give me all values greater than 0' and NumPy returns them instantly. You can also replace values that fail a test. This 'select by condition' style is faster and cleaner — and it's literally how the popular ReLU function in neural nets works (set negatives to 0).",
    code: `import numpy as np

a = np.array([3, -1, 4, -5, 9, -2])
print("positives:", a[a > 0])
a[a < 0] = 0                 # turn negatives into 0
print("clipped:", a)
print("where>3 -> 1 else 0:", np.where(a > 3, 1, 0))`,
  },
  {
    id: "np-vectorization",
    title: "Vectorization (speed without loops)",
    level: "Intermediate",
    category: "NumPy",
    tags: ["numpy", "performance"],
    description: "Do math on a million numbers at once.",
    explain:
      "'Vectorizing' means doing an operation on a whole array at once instead of looping item by item. NumPy runs this in fast, optimized code — often 10–100× quicker than a Python loop. The golden rule of numeric Python: avoid loops, use array operations.",
    code: `import numpy as np

x = np.arange(1_000_000)
print("sum of squares:", (x ** 2).sum())
print("mean:", x.mean())
print("std:", round(float(x.std()), 2))`,
  },
  {
    id: "np-reshape",
    title: "Reshaping arrays",
    level: "Intermediate",
    category: "NumPy",
    tags: ["numpy"],
    description: "Change the shape of an array and add up along an axis.",
    explain:
      "Data in AI has a 'shape' (rows × columns, or more dimensions for images). Reshaping rearranges the same numbers into a new shape. The #1 beginner error is a 'shape mismatch', so practicing this now saves headaches later.",
    code: `import numpy as np

a = np.arange(24).reshape(2, 3, 4)
print("shape:", a.shape)
print("sum all:", a.sum())
print("sum over axis 0 -> shape:", a.sum(axis=0).shape)
print("flatten -> shape:", a.flatten().shape)`,
  },

  {
    id: "np-create",
    title: "Creating arrays",
    level: "Beginner",
    category: "NumPy",
    tags: ["numpy"],
    description: "The everyday ways to make a NumPy array.",
    explain:
      "A NumPy array is the basic container holding all your numeric data in AI. Here are the ways you'll create them daily: from a Python list, all-zeros or all-ones (handy starting points), a range of numbers, or evenly spaced values.",
    code: `import numpy as np

print("from list:", np.array([1, 2, 3]))
print("zeros:", np.zeros(3))
print("ones 2x2:\\n", np.ones((2, 2)))
print("range:", np.arange(0, 10, 2))
print("even spacing:", np.linspace(0, 1, 5))`,
  },
  {
    id: "np-elementwise",
    title: "Math on whole arrays",
    level: "Beginner",
    category: "NumPy",
    tags: ["numpy"],
    description: "Apply math to every element at once — no loops.",
    explain:
      "The big idea of NumPy: write `a * 2` and every element doubles, instantly. This 'do it to the whole array' style is shorter and far faster than a Python loop, and it's exactly how data flows through AI models.",
    code: `import numpy as np

a = np.array([1.0, 2.0, 3.0, 4.0])
print("a + 10:", a + 10)
print("a * 2:", a * 2)
print("a squared:", a ** 2)
print("sqrt:", np.sqrt(a).round(3))
print("sum / mean / max:", a.sum(), a.mean(), a.max())`,
  },
  {
    id: "np-random",
    title: "Random numbers",
    level: "Beginner",
    category: "NumPy",
    tags: ["numpy", "random"],
    description: "Generate random values you can reproduce.",
    explain:
      "AI uses randomness everywhere: random starting weights, shuffling data, simulations. Creating a generator with a fixed seed (here, 0) means you get the same 'random' numbers every run — essential so your experiments are repeatable.",
    code: `import numpy as np

rng = np.random.default_rng(0)
print("uniform 0-1:", rng.random(3).round(3))
print("integers 0-9:", rng.integers(0, 10, 5))
print("from bell curve:", rng.normal(0, 1, 3).round(3))`,
  },
  {
    id: "np-stack",
    title: "Joining arrays",
    level: "Beginner",
    category: "NumPy",
    tags: ["numpy"],
    description: "Combine separate arrays by stacking or concatenating.",
    explain:
      "You constantly build a dataset out of smaller pieces — stacking rows on top of each other, putting columns side by side, or joining lists end to end. These three functions cover almost every case.",
    code: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
print("stack as rows:\\n", np.vstack([a, b]))
print("stack as columns:\\n", np.column_stack([a, b]))
print("join end to end:", np.concatenate([a, b]))`,
  },

  /* ===================== Pandas & Data ===================== */
  {
    id: "ml-pandas-groupby",
    title: "Tables with pandas (groupby)",
    level: "Intermediate",
    category: "Pandas & Data",
    tags: ["pandas", "data"],
    description: "Make a table and compute the average weight per species.",
    explain:
      "Pandas is the library for working with tables (think spreadsheets in Python). A 'DataFrame' is a table. 'groupby' bundles rows that share a value (all cats together) and summarizes each group. This split-summarize move is the bread and butter of data analysis.",
    code: `import pandas as pd

df = pd.DataFrame({
    "species": ["cat", "dog", "cat", "dog", "cat"],
    "weight":  [4.1, 12.5, 3.8, 15.0, 4.6],
})
avg = df.groupby("species")["weight"].mean()
print(avg)`,
  },
  {
    id: "pd-missing",
    title: "Handling missing data",
    level: "Beginner",
    category: "Pandas & Data",
    tags: ["pandas", "cleaning"],
    description: "Find empty cells and fill them with the column average.",
    explain:
      "Real data has gaps (missing values, shown as NaN = 'not a number'). Models can't handle gaps, so you must fill or remove them first. Filling with the column average is a common, simple fix. Cleaning data is most of the real job in AI.",
    code: `import pandas as pd
import numpy as np

df = pd.DataFrame({"a": [1.0, np.nan, 3.0], "b": [4.0, 5.0, np.nan]})
print("nulls per column:\\n", df.isnull().sum())
print("imputed:\\n", df.fillna(df.mean()))`,
  },
  {
    id: "pd-merge",
    title: "Combining tables (merge/join)",
    level: "Intermediate",
    category: "Pandas & Data",
    tags: ["pandas", "joins"],
    description: "Join two tables that share a common id column.",
    explain:
      "Your data often lives in separate tables (one with names, one with scores). 'Merging' stitches them into one using a shared key (here, `id`). It's the same idea as a database JOIN. You'll do this to assemble all the information a model needs.",
    code: `import pandas as pd

left = pd.DataFrame({"id": [1, 2, 3], "name": ["a", "b", "c"]})
right = pd.DataFrame({"id": [1, 2, 4], "score": [90, 80, 70]})
print(pd.merge(left, right, on="id", how="inner"))`,
  },
  {
    id: "data-scaling",
    title: "Feature scaling",
    level: "Beginner",
    category: "Pandas & Data",
    tags: ["preprocessing", "numpy"],
    description: "Rescale numbers so they're on the same scale.",
    explain:
      "If one column is 'age' (0–100) and another is 'salary' (0–100000), the big numbers can drown out the small ones. 'Scaling' shrinks everything to a comparable range so each feature gets a fair say. Many models need this to work well. The animation shows points being squeezed onto a common scale.",
    code: `import numpy as np

X = np.array([1.0, 2.0, 3.0, 4.0])
z = (X - X.mean()) / X.std()             # standardization
mm = (X - X.min()) / (X.max() - X.min()) # min-max to [0, 1]
print("z-score:", z.round(3))
print("min-max:", mm.round(3))`,
  },
  {
    id: "data-onehot",
    title: "One-hot encoding",
    level: "Beginner",
    category: "Pandas & Data",
    tags: ["preprocessing", "pandas"],
    description: "Turn text categories into 0/1 columns a model can read.",
    explain:
      "Models only understand numbers, not words like 'red'. One-hot encoding makes a separate 0/1 column for each category (is_red, is_green, is_blue). It avoids tricking the model into thinking categories have an order. This is a standard step for any text-category column.",
    code: `import pandas as pd

df = pd.DataFrame({"color": ["red", "green", "blue", "green"]})
print(pd.get_dummies(df, columns=["color"]).astype(int))`,
  },
  {
    id: "data-train-test-split",
    title: "Train / test split",
    level: "Beginner",
    category: "Pandas & Data",
    tags: ["preprocessing", "scikit-learn"],
    description: "Hold back some data to fairly test your model.",
    explain:
      "Golden rule of ML: never grade a model on the exact data it studied. You split your data — train the model on most of it, then test on the part it never saw. That test score is your honest estimate of how it'll do on new, real data.",
    code: `import numpy as np
from sklearn.model_selection import train_test_split

X = np.arange(20).reshape(10, 2)
y = np.arange(10)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)
print("train size:", len(X_tr), " test size:", len(X_te))`,
  },

  /* ===================== Matplotlib ===================== */
  {
    id: "mpl-line",
    title: "Line plot",
    level: "Beginner",
    category: "Matplotlib",
    tags: ["matplotlib", "plotting"],
    description: "Draw a line graph of a function — the plot renders below.",
    explain:
      "Matplotlib is THE library for turning data into pictures. 'Seeing' your data is half of AI work. `plt.plot` draws the line; `plt.show()` finishes the figure. Press Run and the chart appears right in the output area. Try changing np.sin to np.cos!",
    code: `import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
plt.plot(x, np.sin(x))
plt.title("Sine wave")
plt.xlabel("x")
plt.ylabel("sin(x)")
plt.show()`,
  },
  {
    id: "mpl-scatter",
    title: "Scatter plot",
    level: "Beginner",
    category: "Matplotlib",
    tags: ["matplotlib", "plotting"],
    description: "Plot individual points, colored by value.",
    explain:
      "A scatter plot shows each data point as a dot — perfect for spotting clusters or relationships between two things. `c=y` colors the dots by their value. This is exactly how you'd visualize the clustering and classification results from this app.",
    code: `import matplotlib.pyplot as plt
import numpy as np

rng = np.random.default_rng(0)
x = rng.random(50)
y = rng.random(50)
plt.scatter(x, y, c=y, cmap="viridis")
plt.title("Scatter plot")
plt.colorbar()
plt.show()`,
  },
  {
    id: "mpl-hist",
    title: "Histogram",
    level: "Beginner",
    category: "Matplotlib",
    tags: ["matplotlib", "plotting"],
    description: "Show how values are distributed.",
    explain:
      "A histogram counts how many values fall into each bucket — it reveals the 'shape' of your data (is it a bell curve? skewed? two peaks?). Run it and you'll literally see the bell curve from the Math section. Always one of the first plots you make on a new dataset.",
    code: `import matplotlib.pyplot as plt
import numpy as np

data = np.random.default_rng(0).normal(0, 1, 1000)
plt.hist(data, bins=30, color="skyblue", edgecolor="black")
plt.title("Histogram of a normal distribution")
plt.xlabel("value")
plt.ylabel("count")
plt.show()`,
  },
  {
    id: "mpl-bar",
    title: "Bar chart",
    level: "Beginner",
    category: "Matplotlib",
    tags: ["matplotlib", "plotting"],
    description: "Compare quantities across categories.",
    explain:
      "Bar charts compare amounts across labels (counts per category, accuracy per model). Simple but everywhere in reports and dashboards. Change the numbers and re-run to watch the bars resize.",
    code: `import matplotlib.pyplot as plt

labels = ["cat", "dog", "bird"]
counts = [12, 19, 7]
plt.bar(labels, counts, color=["#6ea8fe", "#4ade80", "#f472b6"])
plt.title("Counts by animal")
plt.ylabel("count")
plt.show()`,
  },
  {
    id: "mpl-subplots",
    title: "Multiple plots (subplots)",
    level: "Intermediate",
    category: "Matplotlib",
    tags: ["matplotlib", "plotting"],
    description: "Put several charts side by side in one figure.",
    explain:
      "`subplots` creates a grid of charts so you can compare things at a glance. `fig` is the whole picture; `axes` are the individual charts you draw on. You'll use this to show, say, training loss next to accuracy side by side.",
    code: `import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
fig, axes = plt.subplots(1, 2, figsize=(8, 3))
axes[0].plot(x, np.sin(x))
axes[0].set_title("sin")
axes[1].plot(x, np.cos(x))
axes[1].set_title("cos")
plt.tight_layout()
plt.show()`,
  },

  /* ===================== Classical ML ===================== */
  {
    id: "ml-linear-regression-gd",
    title: "Your first model: linear regression",
    level: "Intermediate",
    category: "Classical ML",
    tags: ["ml", "numpy", "training"],
    description: "Learn the best-fit line through noisy points, step by step.",
    explain:
      "This is the 'hello world' of machine learning: fit a straight line y = w·x + b to data. The model starts with random guesses for w and b, measures how wrong it is, and nudges them to be a little less wrong — over and over. Every AI model, even huge ones, learns with this same loop. The animation shows the line settling onto the points.",
    code: `import numpy as np

rng = np.random.default_rng(0)
x = np.linspace(0, 10, 50)
y = 2 * x + 1 + rng.normal(0, 1, size=x.shape)

w, b, lr = 0.0, 0.0, 0.01
for _ in range(1000):
    y_hat = w * x + b
    error = y_hat - y
    w -= lr * (2 / len(x)) * np.dot(error, x)
    b -= lr * (2 / len(x)) * error.sum()

print(f"learned w = {w:.3f} (true 2)")
print(f"learned b = {b:.3f} (true 1)")`,
  },
  {
    id: "ml-logistic-regression",
    title: "Logistic regression (yes/no prediction)",
    level: "Intermediate",
    category: "Classical ML",
    tags: ["ml", "scikit-learn", "classification"],
    description: "Train a model to sort points into two groups.",
    explain:
      "Despite the name, this is a 'classifier' — it predicts a category (yes/no, spam/not-spam). scikit-learn does the hard work: you call `.fit()` to train and `.score()` to grade. It's the simple baseline every fancier model is compared against, so always try it first.",
    code: `from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=200, n_features=2,
                           n_redundant=0, random_state=1)
clf = LogisticRegression().fit(X, y)
print("train accuracy:", round(clf.score(X, y), 3))
print("coefficients:", clf.coef_.round(2))`,
  },
  {
    id: "ml-sklearn-iris",
    title: "Full example: classify flowers",
    level: "Intermediate",
    category: "Classical ML",
    tags: ["ml", "scikit-learn", "classification"],
    description: "Load data, split it, train a model, and check its accuracy.",
    explain:
      "This is a complete, real ML project in 8 lines: load data → split into train/test → fit a model → measure accuracy on unseen data. The Iris dataset (3 flower types described by 4 measurements) is the classic beginner dataset. Memorize this load→split→fit→score shape — you'll repeat it on every project.",
    code: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)

clf = LogisticRegression(max_iter=200).fit(X_tr, y_tr)
pred = clf.predict(X_te)
print("test accuracy:", round(accuracy_score(y_te, pred), 3))`,
  },
  {
    id: "ml-knn-scratch",
    title: "k-Nearest Neighbors",
    level: "Advanced",
    category: "Classical ML",
    tags: ["ml", "numpy", "classification"],
    description: "Classify a point by asking its closest neighbors to vote.",
    explain:
      "Wonderfully intuitive: to label a new point, look at the k closest known points and take the majority vote. There's no real 'training' — it just remembers the data. Great for building intuition about how 'closeness' decides a prediction. The animation shows it finding the nearest neighbors.",
    code: `import numpy as np
from collections import Counter

X = np.array([[1, 1], [1, 2], [2, 1], [6, 6], [6, 5], [5, 6]])
y = np.array([0, 0, 0, 1, 1, 1])

def knn_predict(query, k=3):
    dists = np.linalg.norm(X - query, axis=1)
    nearest = y[np.argsort(dists)[:k]]
    return Counter(nearest).most_common(1)[0][0]

print("class of [1.5, 1.5]:", knn_predict(np.array([1.5, 1.5])))
print("class of [5.5, 5.5]:", knn_predict(np.array([5.5, 5.5])))`,
  },
  {
    id: "ml-decision-tree",
    title: "Decision tree",
    level: "Intermediate",
    category: "Classical ML",
    tags: ["ml", "scikit-learn", "trees"],
    description: "Train a flowchart of yes/no questions to classify data.",
    explain:
      "A decision tree is like a game of 20 Questions: at each step it asks the most useful yes/no question to split the data, until it can guess the answer. It's easy to read and explain — you can literally see why it decided something. 'Feature importances' tell you which inputs mattered most.",
    code: `from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
clf = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X, y)
print("accuracy:", round(clf.score(X, y), 3))
print("feature importances:", clf.feature_importances_.round(2))`,
  },
  {
    id: "ml-random-forest",
    title: "Random forest",
    level: "Intermediate",
    category: "Classical ML",
    tags: ["ml", "scikit-learn", "ensemble"],
    description: "Combine many decision trees and let them vote.",
    explain:
      "One decision tree can be unreliable. A 'random forest' trains many slightly different trees and averages their votes — like asking a crowd instead of one person. It's accurate, hard to mess up, and a fantastic default choice for table data. You'll reach for this often.",
    code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
Xtr, Xte, ytr, yte = train_test_split(X, y, random_state=0)
rf = RandomForestClassifier(n_estimators=50, random_state=0).fit(Xtr, ytr)
print("test accuracy:", round(rf.score(Xte, yte), 3))`,
  },
  {
    id: "ml-svm",
    title: "Support Vector Machine (SVM)",
    level: "Advanced",
    category: "Classical ML",
    tags: ["ml", "scikit-learn", "classification"],
    description: "Find the widest possible boundary between two groups.",
    explain:
      "🔹 Deeper topic — skim now, return later. An SVM draws the dividing line that leaves the biggest gap between the two groups, which helps it handle new data well. A 'kernel' lets it draw curved boundaries too. The usage is the same as always: `.fit()` then `.score()`.",
    code: `from sklearn.svm import SVC
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=200, n_features=2,
                           n_redundant=0, random_state=2)
svm = SVC(kernel="rbf").fit(X, y)
print("accuracy:", round(svm.score(X, y), 3))
print("support vectors per class:", svm.n_support_)`,
  },
  {
    id: "ml-naive-bayes",
    title: "Naive Bayes",
    level: "Intermediate",
    category: "Classical ML",
    tags: ["ml", "scikit-learn", "probabilistic"],
    description: "A fast classifier based on probabilities.",
    explain:
      "This model uses Bayes' rule (from the Math section) and makes a simplifying 'naive' assumption that features are independent. That assumption is rarely true, yet it works surprisingly well — especially for text and spam filtering — and it trains almost instantly.",
    code: `from sklearn.naive_bayes import GaussianNB
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
nb = GaussianNB().fit(X, y)
print("accuracy:", round(nb.score(X, y), 3))`,
  },
  {
    id: "ml-kmeans-numpy",
    title: "K-means clustering",
    level: "Intermediate",
    category: "Classical ML",
    tags: ["ml", "numpy", "clustering", "unsupervised"],
    description: "Automatically group points into clusters — with no labels.",
    explain:
      "So far models learned from labeled answers. K-means is different ('unsupervised'): nobody tells it the groups; it discovers them by repeatedly assigning each point to the nearest cluster center, then moving the centers. Great for finding hidden segments, like customer types. The animation shows the centers sliding into place.",
    code: `import numpy as np

rng = np.random.default_rng(42)
pts = np.vstack([
    rng.normal([0, 0], 0.5, (20, 2)),
    rng.normal([5, 5], 0.5, (20, 2)),
])
k = 2
centroids = pts[rng.choice(len(pts), k, replace=False)]
for _ in range(10):
    dists = np.linalg.norm(pts[:, None] - centroids[None], axis=2)
    labels = dists.argmin(axis=1)
    centroids = np.array([pts[labels == i].mean(axis=0) for i in range(k)])

print("centroids:\\n", np.round(centroids, 2))`,
  },
  {
    id: "ml-pca",
    title: "PCA (simplifying data)",
    level: "Advanced",
    category: "Classical ML",
    tags: ["ml", "scikit-learn", "unsupervised"],
    description: "Squash data with many columns down to just two.",
    explain:
      "🔹 Deeper topic — skim now, return later. PCA finds the few directions that hold most of the 'spread' (information) in your data and drops the rest. It's used to shrink data so it's easier to plot or to speed up models, while keeping what matters. The animation shows points collapsing onto their most important direction.",
    code: `from sklearn.decomposition import PCA
from sklearn.datasets import load_iris

X, _ = load_iris(return_X_y=True)
pca = PCA(n_components=2).fit(X)
print("explained variance ratio:", pca.explained_variance_ratio_.round(3))
print("reduced shape:", pca.transform(X).shape)`,
  },
  {
    id: "ml-gradient-boosting",
    title: "Gradient boosting",
    level: "Advanced",
    category: "Classical ML",
    tags: ["ml", "scikit-learn", "ensemble"],
    description: "Build trees in a row, each fixing the last one's mistakes.",
    explain:
      "🔹 Deeper topic — skim now, return later. Where a random forest builds trees independently, boosting builds them one after another, each focusing on the errors the previous ones made. Tools in this family (XGBoost, LightGBM) win most competitions on table data. Same simple `.fit()` / `.score()` to use.",
    code: `from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)
Xtr, Xte, ytr, yte = train_test_split(X, y, random_state=0)
gb = GradientBoostingClassifier(random_state=0).fit(Xtr, ytr)
print("test accuracy:", round(gb.score(Xte, yte), 3))`,
  },

  /* ===================== Evaluation ===================== */
  {
    id: "eval-cross-validation",
    title: "Cross-validation",
    level: "Intermediate",
    category: "Evaluation",
    tags: ["evaluation", "scikit-learn"],
    description: "Test a model several times on different splits and average.",
    explain:
      "A single train/test split can be lucky or unlucky. Cross-validation repeats the test on several different splits and averages the scores, giving you a more trustworthy number (plus how much it wobbles). This is how pros compare models fairly.",
    code: `from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
scores = cross_val_score(LogisticRegression(max_iter=200), X, y, cv=5)
print("fold scores:", scores.round(3))
print("mean ± std:", round(scores.mean(), 3), "±", round(scores.std(), 3))`,
  },
  {
    id: "eval-confusion-matrix",
    title: "Confusion matrix, precision & recall",
    level: "Beginner",
    category: "Evaluation",
    tags: ["evaluation", "scikit-learn"],
    description: "See exactly which predictions a classifier got right and wrong.",
    explain:
      "Accuracy alone can lie (a model that always says 'not spam' looks 99% accurate if spam is rare). 'Precision' asks: of the things I flagged, how many were right? 'Recall' asks: of the things I should have caught, how many did I? Which matters depends on the cost of each mistake.",
    code: `from sklearn.metrics import confusion_matrix, classification_report

y_true = [0, 1, 1, 0, 1, 1, 0, 0]
y_pred = [0, 1, 0, 0, 1, 1, 1, 0]
print("confusion matrix:\\n", confusion_matrix(y_true, y_pred))
print(classification_report(y_true, y_pred, digits=2))`,
  },
  {
    id: "eval-roc-auc",
    title: "ROC curve & AUC",
    level: "Intermediate",
    category: "Evaluation",
    tags: ["evaluation", "scikit-learn"],
    description: "Score how well a model ranks positives above negatives.",
    explain:
      "Many models output a confidence score, not just yes/no. AUC measures how well those scores rank true positives ahead of negatives, across every possible cutoff. 1.0 is perfect, 0.5 is random guessing. It's a handy single number for comparing classifiers.",
    code: `import numpy as np
from sklearn.metrics import roc_auc_score, roc_curve

y_true = np.array([0, 0, 1, 1])
y_score = np.array([0.1, 0.4, 0.35, 0.8])
print("AUC:", roc_auc_score(y_true, y_score))
fpr, tpr, thr = roc_curve(y_true, y_score)
print("FPR:", fpr.round(2))
print("TPR:", tpr.round(2))`,
  },
  {
    id: "eval-regularization",
    title: "Overfitting & regularization",
    level: "Advanced",
    category: "Evaluation",
    tags: ["evaluation", "scikit-learn", "regularization"],
    description: "See how reining in a model helps it generalize.",
    explain:
      "🔹 Deeper topic — skim now, return later. 'Overfitting' is when a model memorizes the training data (including its noise) and then fails on new data — like memorizing answers instead of understanding. 'Regularization' gently discourages the model from getting too complex. Watch how a too-strong setting changes the fit.",
    code: `import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = np.linspace(0, 1, 20).reshape(-1, 1)
y = np.sin(2 * np.pi * X).ravel() + rng.normal(0, 0.1, 20)
for alpha in [0.0, 0.001, 1.0]:
    m = make_pipeline(PolynomialFeatures(9), Ridge(alpha=alpha)).fit(X, y)
    print(f"alpha={alpha}: train R² = {m.score(X, y):.3f}")`,
  },
  {
    id: "ml-mse",
    title: "Measuring error: MSE",
    level: "Beginner",
    category: "Evaluation",
    tags: ["evaluation", "numpy", "loss"],
    description: "Score how far predictions are from the true values.",
    explain:
      "MSE (mean squared error) measures how wrong a number-prediction is: take each error, square it (so big misses count extra and negatives don't cancel out), then average. A model 'learns' by trying to make this number as small as possible. The animation shows errors as squares.",
    code: `import numpy as np

def mse(y_true, y_pred):
    return np.mean((y_true - y_pred) ** 2)

y_true = np.array([3.0, -0.5, 2.0, 7.0])
y_pred = np.array([2.5, 0.0, 2.0, 8.0])
print("MSE:", mse(y_true, y_pred))`,
  },
  {
    id: "eval-regression-metrics",
    title: "Regression metrics (MSE / MAE / R²)",
    level: "Beginner",
    category: "Evaluation",
    tags: ["evaluation", "scikit-learn"],
    description: "Three ways to score predictions of a number.",
    explain:
      "When predicting numbers (not categories), you score with: MAE (average miss, easy to read), MSE (punishes big misses), and R² (how much better than just guessing the average — 1.0 is perfect, 0 is no better than guessing). Report more than one for a full picture.",
    code: `import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

y_true = np.array([3.0, -0.5, 2.0, 7.0])
y_pred = np.array([2.5, 0.0, 2.0, 8.0])
print("MSE:", mean_squared_error(y_true, y_pred))
print("MAE:", mean_absolute_error(y_true, y_pred))
print("R²:", round(r2_score(y_true, y_pred), 3))`,
  },

  /* ===================== Neural Networks ===================== */
  {
    id: "ml-perceptron",
    title: "The perceptron (one neuron)",
    level: "Intermediate",
    category: "Neural Networks",
    tags: ["nn", "numpy", "classification"],
    description: "Train a single artificial neuron to learn the AND rule.",
    explain:
      "A neuron does three things: multiply each input by a 'weight', add them up, and decide yes/no. Training means adjusting the weights whenever it gets an answer wrong. Stack thousands of these and you get a neural network — so this tiny example is the seed of all deep learning. The animation shows the dividing line it learns.",
    code: `import numpy as np

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([0, 0, 0, 1])      # AND
w, b, lr = np.zeros(2), 0.0, 0.1
for _ in range(20):
    for xi, target in zip(X, y):
        pred = 1 if np.dot(w, xi) + b > 0 else 0
        update = lr * (target - pred)
        w += update * xi
        b += update

print("weights:", w, " bias:", round(b, 2))
for xi in X:
    print(xi, "->", 1 if np.dot(w, xi) + b > 0 else 0)`,
  },
  {
    id: "ml-sigmoid",
    title: "Sigmoid (squash to 0–1)",
    level: "Beginner",
    category: "Neural Networks",
    tags: ["nn", "numpy", "activation"],
    description: "Turn any number into a value between 0 and 1.",
    explain:
      "The sigmoid function takes any number and squashes it into the range 0–1, so you can read the output as a probability ('70% likely yes'). It's a classic 'activation function' — the part of a neuron that adds a curve so networks can learn non-straight patterns. The animation traces its S-shape.",
    code: `import numpy as np

def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))

x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])
print("input :", x)
print("output:", np.round(sigmoid(x), 3))`,
  },
  {
    id: "nn-activations",
    title: "Activation functions",
    level: "Beginner",
    category: "Neural Networks",
    tags: ["nn", "numpy", "activation"],
    description: "Compare three common 'shape' functions used in neurons.",
    explain:
      "Activation functions add a bend to a neuron's output — without them, stacking neurons would still only draw straight lines. ReLU (keep positives, zero out negatives) is the modern favorite because it's simple and fast. The animation overlays ReLU, sigmoid, and tanh so you can see their shapes.",
    code: `import numpy as np

x = np.linspace(-3, 3, 7)
print("x:      ", x)
print("relu:   ", np.maximum(0, x).round(2))
print("sigmoid:", (1 / (1 + np.exp(-x))).round(2))
print("tanh:   ", np.tanh(x).round(2))`,
  },
  {
    id: "ml-softmax",
    title: "Softmax (probabilities that add to 1)",
    level: "Intermediate",
    category: "Neural Networks",
    tags: ["nn", "numpy", "activation"],
    description: "Turn a list of scores into percentages that sum to 100%.",
    explain:
      "When a model must pick one of several categories, softmax converts its raw scores into probabilities that add up to 1 (e.g. cat 70%, dog 25%, bird 5%). It's the final step in most classifiers and a key piece of the attention mechanism in LLMs. The animation shows the bars shifting as scores change.",
    code: `import numpy as np

def softmax(z):
    z = z - np.max(z)        # subtract the max first (keeps numbers stable)
    e = np.exp(z)
    return e / e.sum()

scores = np.array([2.0, 1.0, 0.1])
probs = softmax(scores)
print("probabilities:", np.round(probs, 3))
print("sum:", probs.sum())`,
  },
  {
    id: "nn-forward-pass",
    title: "A network making a prediction",
    level: "Intermediate",
    category: "Neural Networks",
    tags: ["nn", "numpy"],
    description: "Push an input through a small 2-layer network.",
    explain:
      "A 'forward pass' is the network turning an input into an output. It's just: multiply by weights, add bias, apply an activation, then repeat for the next layer. That's the whole prediction step — even giant models do exactly this, just with far more layers and numbers.",
    code: `import numpy as np

def relu(x):
    return np.maximum(0, x)

np.random.seed(0)
x = np.array([0.5, -0.2])
W1, b1 = np.random.randn(2, 4), np.zeros(4)
W2, b2 = np.random.randn(4, 1), np.zeros(1)

h = relu(x @ W1 + b1)          # layer 1: combine inputs, then activate
out = h @ W2 + b2              # layer 2: combine again to get the output
print("hidden:", h.round(2))
print("output:", out.round(3))`,
  },
  {
    id: "nn-backprop",
    title: "How networks learn (backpropagation)",
    level: "Advanced",
    category: "Neural Networks",
    tags: ["nn", "numpy", "training"],
    description: "Train a tiny network to solve XOR, adjusting weights by hand.",
    explain:
      "🔹 Deeper topic — the payoff of the whole journey. 'Backpropagation' is how a network learns: after a wrong guess, it figures out how much each weight contributed to the error and nudges them all to do better next time. Run it and watch the predictions move toward the correct 0,1,1,0. You don't need to follow every line — just see that it learns by repetition.",
    code: `import numpy as np

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)   # XOR
rng = np.random.default_rng(1)
W1, b1 = rng.normal(0, 1, (2, 4)), np.zeros((1, 4))
W2, b2 = rng.normal(0, 1, (4, 1)), np.zeros((1, 1))
sig = lambda z: 1 / (1 + np.exp(-z))

lr = 0.5
for _ in range(5000):
    # forward pass: make a prediction
    h = sig(X @ W1 + b1)
    out = sig(h @ W2 + b2)
    # backward pass: measure error and nudge every weight to reduce it
    d_out = (out - y) * out * (1 - out)
    d_h = (d_out @ W2.T) * h * (1 - h)
    W2 -= lr * h.T @ d_out
    b2 -= lr * d_out.sum(0, keepdims=True)
    W1 -= lr * X.T @ d_h
    b1 -= lr * d_h.sum(0, keepdims=True)

print("predictions:", out.round(2).ravel(), "(target 0 1 1 0)")`,
  },
  {
    id: "nn-gradient-descent",
    title: "Gradient descent (learning = rolling downhill)",
    level: "Beginner",
    category: "Neural Networks",
    tags: ["nn", "optimization"],
    description: "Find the lowest point of a curve by stepping downhill.",
    explain:
      "Imagine the model's error as a valley; learning means walking downhill to the bottom (the smallest error). Each step goes in the steepest-down direction. The 'learning rate' is your step size: too big and you overshoot, too small and it takes forever. The animation shows the ball rolling to the minimum.",
    code: `def grad(x):
    return 2 * (x - 3)        # the slope of (x-3)^2

x, lr = 0.0, 0.1
for i in range(20):
    x -= lr * grad(x)         # step downhill
    if i % 5 == 0:
        print(f"step {i:2d}: x = {x:.3f}")
print("converged x ≈", round(x, 3), "(min at 3)")`,
  },
  {
    id: "nn-cross-entropy",
    title: "Cross-entropy (loss for classifiers)",
    level: "Intermediate",
    category: "Neural Networks",
    tags: ["nn", "numpy", "loss"],
    description: "Score how wrong a yes/no probability guess is.",
    explain:
      "When a model outputs probabilities, cross-entropy measures how wrong they are — and it punishes confident mistakes harshly (saying '99% yes' when the answer is no costs a lot). It's the standard scoring rule classifiers try to minimize while learning. The animation shows the loss shooting up as a confident guess turns out wrong.",
    code: `import numpy as np

def cross_entropy(y_true, y_prob):
    y_prob = np.clip(y_prob, 1e-12, 1 - 1e-12)
    return -np.mean(y_true * np.log(y_prob) + (1 - y_true) * np.log(1 - y_prob))

y = np.array([1, 0, 1, 1])
print("good preds:", round(cross_entropy(y, np.array([0.9, 0.1, 0.8, 0.7])), 3))
print("bad preds :", round(cross_entropy(y, np.array([0.5, 0.5, 0.5, 0.5])), 3))`,
  },

  /* ===================== PyTorch (reference) ===================== */
  {
    id: "torch-tensors",
    title: "PyTorch tensors",
    level: "Intermediate",
    category: "PyTorch",
    tags: ["pytorch", "deep-learning"],
    runnable: false,
    description: "PyTorch's core data type, like a NumPy array.",
    explain:
      "📖 Read-only here. PyTorch is the most popular deep-learning framework. A 'tensor' is just like a NumPy array, but it can run on a GPU (fast!) and remembers how to compute gradients for learning. If you know NumPy, you already know 90% of this. To run it: `pip install torch`, or use Google Colab (free GPUs).",
    code: `import torch

x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
print("tensor:\\n", x)
print("shape:", x.shape)
print("x + 10:\\n", x + 10)
print("matrix multiply:\\n", x @ x)`,
  },
  {
    id: "torch-autograd",
    title: "Automatic gradients (autograd)",
    level: "Intermediate",
    category: "PyTorch",
    tags: ["pytorch", "deep-learning"],
    runnable: false,
    description: "Let PyTorch compute slopes (gradients) for you.",
    explain:
      "📖 Read-only here. Remember computing slopes by hand in the Math section, and backprop in Neural Networks? PyTorch does all of that automatically: mark a value with `requires_grad=True`, call `.backward()`, and it fills in the gradient. This one feature is why training big models is practical.",
    code: `import torch

x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x        # y = x^2 + 3x
y.backward()              # compute dy/dx automatically
print("y:", y.item())
print("dy/dx at x=2:", x.grad.item(), "(should be 7)")`,
  },
  {
    id: "torch-nn-module",
    title: "Building a network (nn.Module)",
    level: "Advanced",
    category: "PyTorch",
    tags: ["pytorch", "deep-learning"],
    runnable: false,
    description: "Define a neural network by stacking layers.",
    explain:
      "📖 Read-only here. You build networks by subclassing `nn.Module` and listing layers like `nn.Linear`. The `forward` method is the same forward-pass idea you learned earlier — combine inputs, apply an activation (relu), repeat. PyTorch just gives you the layers pre-built.",
    code: `import torch
import torch.nn as nn

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(2, 4)   # layer: 2 inputs -> 4
        self.fc2 = nn.Linear(4, 1)   # layer: 4 -> 1 output
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return self.fc2(x)

model = Net()
print(model)
print("output:", model(torch.tensor([[0.5, -0.2]])))`,
  },
  {
    id: "torch-training-loop",
    title: "The PyTorch training loop",
    level: "Advanced",
    category: "PyTorch",
    tags: ["pytorch", "deep-learning", "training"],
    runnable: false,
    description: "Train a model the standard PyTorch way.",
    explain:
      "📖 Read-only here, but this is the big one. The standard loop: predict → measure loss → `backward()` for gradients → `optimizer.step()` to update. It's the same recipe as the from-scratch linear regression you ran earlier, just shorter. Learn this loop and you can train almost anything in PyTorch.",
    code: `import torch
import torch.nn as nn

# fit y = 2x + 1
x = torch.linspace(0, 10, 50).reshape(-1, 1)
y = 2 * x + 1
model = nn.Linear(1, 1)
opt = torch.optim.SGD(model.parameters(), lr=0.01)
loss_fn = nn.MSELoss()

for epoch in range(200):
    pred = model(x)
    loss = loss_fn(pred, y)
    opt.zero_grad()      # clear old gradients
    loss.backward()      # compute new gradients
    opt.step()           # update the weights

print("final loss:", round(loss.item(), 4))
w, b = [p.item() for p in model.parameters()]
print(f"learned w={w:.2f}, b={b:.2f} (true 2, 1)")`,
  },

  /* ===================== TensorFlow (reference) ===================== */
  {
    id: "tf-tensors",
    title: "TensorFlow tensors",
    level: "Intermediate",
    category: "TensorFlow",
    tags: ["tensorflow", "deep-learning"],
    runnable: false,
    description: "TensorFlow's core data type.",
    explain:
      "📖 Read-only here. TensorFlow is Google's deep-learning framework — PyTorch's main rival. Its 'tensors' behave much like NumPy arrays. Most people use its friendly Keras API (next lessons). To run it: `pip install tensorflow`, or use Google Colab.",
    code: `import tensorflow as tf

x = tf.constant([[1.0, 2.0], [3.0, 4.0]])
print("tensor:\\n", x)
print("shape:", x.shape)
print("x + 10:\\n", x + 10)
print("matrix multiply:\\n", tf.matmul(x, x))`,
  },
  {
    id: "tf-keras-model",
    title: "Build a model with Keras",
    level: "Intermediate",
    category: "TensorFlow",
    tags: ["tensorflow", "keras", "deep-learning"],
    runnable: false,
    description: "Stack layers into a network with Keras.",
    explain:
      "📖 Read-only here. Keras (part of TensorFlow) lets you build a network just by listing its layers — wonderfully beginner-friendly. 'Dense' is a fully-connected layer; 'softmax' (which you've met) outputs class probabilities. This model takes 4 numbers in and predicts 1 of 3 classes.",
    code: `from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Dense(8, activation="relu", input_shape=(4,)),
    layers.Dense(3, activation="softmax"),
])
model.summary()`,
  },
  {
    id: "tf-keras-train",
    title: "Train a Keras model",
    level: "Intermediate",
    category: "TensorFlow",
    tags: ["tensorflow", "keras", "training"],
    runnable: false,
    description: "Compile and fit a model in a few lines.",
    explain:
      "📖 Read-only here. The Keras workflow is just `compile()` then `fit()`. You pick an optimizer (adam), a loss (cross-entropy — which you learned!), and a metric (accuracy). Three lines to train a neural network — this simplicity is why beginners love Keras.",
    code: `from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

X = np.random.rand(100, 4)
y = np.random.randint(0, 3, 100)

model = keras.Sequential([
    layers.Dense(8, activation="relu", input_shape=(4,)),
    layers.Dense(3, activation="softmax"),
])
model.compile(optimizer="adam",
              loss="sparse_categorical_crossentropy",
              metrics=["accuracy"])
model.fit(X, y, epochs=5, verbose=1)`,
  },
  {
    id: "tf-predict",
    title: "Make predictions with Keras",
    level: "Beginner",
    category: "TensorFlow",
    tags: ["tensorflow", "keras"],
    runnable: false,
    description: "Get class probabilities for a new sample.",
    explain:
      "📖 Read-only here. After training, `predict()` returns a probability for each class, and `argmax` picks the winner. It's the same predict → probabilities → pick-the-best pattern you saw with scikit-learn and PyTorch — the skills transfer across all three.",
    code: `from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

model = keras.Sequential([
    layers.Dense(3, activation="softmax", input_shape=(4,)),
])
sample = np.random.rand(1, 4)
probs = model.predict(sample)
print("class probabilities:", probs.round(3))
print("predicted class:", probs.argmax())`,
  },

  /* ===================== NLP & LLM ===================== */
  {
    id: "nlp-tokenization",
    title: "Tokenization (text → numbers)",
    level: "Beginner",
    category: "NLP & LLM",
    tags: ["nlp", "llm"],
    description: "Split a sentence into words and give each a number id.",
    explain:
      "Models can't read text directly — they read numbers. 'Tokenizing' breaks text into pieces (here, words) and maps each to an id. This is literally step one inside ChatGPT and every language model (they use smaller word-pieces, but the idea is identical).",
    code: `import re

text = "AI engineers build LLMs! Tokens are not words."
tokens = re.findall(r"\\w+", text.lower())
vocab = {t: i for i, t in enumerate(sorted(set(tokens)))}
ids = [vocab[t] for t in tokens]
print("tokens:", tokens)
print("ids:", ids)`,
  },
  {
    id: "nlp-bag-of-words",
    title: "Bag of words",
    level: "Beginner",
    category: "NLP & LLM",
    tags: ["nlp", "scikit-learn"],
    description: "Turn sentences into vectors of word counts.",
    explain:
      "The simplest way to turn text into numbers: count how many times each word appears, ignoring order. Each sentence becomes a row of counts. It's basic, but it's a strong starting point for tasks like sorting emails into topics.",
    code: `from sklearn.feature_extraction.text import CountVectorizer

corpus = ["the cat sat", "the dog ran", "the cat ran fast"]
cv = CountVectorizer()
X = cv.fit_transform(corpus)
print("vocab:", cv.get_feature_names_out())
print("counts:\\n", X.toarray())`,
  },
  {
    id: "nlp-tfidf",
    title: "TF-IDF (which words matter)",
    level: "Intermediate",
    category: "NLP & LLM",
    tags: ["nlp", "scikit-learn"],
    description: "Weight words by how distinctive they are to a document.",
    explain:
      "Plain word counts over-value common words like 'the'. TF-IDF lowers the weight of words that appear everywhere and boosts rare, telling words. It's the classic technique behind search engines and document matching — and the foundation for the next topic, RAG.",
    code: `from sklearn.feature_extraction.text import TfidfVectorizer

corpus = ["machine learning is fun",
          "deep learning is powerful",
          "i love machine learning"]
tf = TfidfVectorizer()
X = tf.fit_transform(corpus)
print("terms:", tf.get_feature_names_out())
print("tf-idf:\\n", X.toarray().round(2))`,
  },
  {
    id: "nlp-cosine",
    title: "Embeddings & similarity",
    level: "Intermediate",
    category: "NLP & LLM",
    tags: ["nlp", "llm", "embeddings", "numpy"],
    description: "Measure how similar two word-meanings are.",
    explain:
      "An 'embedding' represents a word's meaning as a list of numbers, so similar meanings sit close together. 'Cosine similarity' scores how close two of them are (1 = very similar). This is the core idea behind semantic search and how LLMs find relevant information. The animation shows two vectors and their closeness.",
    code: `import numpy as np

emb = {
    "king":  np.array([0.9, 0.1, 0.8]),
    "queen": np.array([0.8, 0.2, 0.9]),
    "apple": np.array([0.1, 0.9, 0.0]),
}
def cos(a, b):
    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))

print("king ~ queen:", round(cos(emb["king"], emb["queen"]), 3))
print("king ~ apple:", round(cos(emb["king"], emb["apple"]), 3))`,
  },
  {
    id: "nlp-attention",
    title: "Self-attention (the heart of LLMs)",
    level: "Advanced",
    category: "NLP & LLM",
    tags: ["nlp", "llm", "transformers", "numpy"],
    description: "Let each word look at the other words to gather context.",
    explain:
      "🔹 Deeper topic — this is the engine inside GPT. 'Attention' lets each word decide how much to pay attention to every other word, so 'it' can connect to the right noun, for example. Scaled up and stacked, this is what makes modern LLMs work. The animation shows the attention weights as a heatmap.",
    code: `import numpy as np

np.random.seed(0)
X = np.random.randn(3, 4)                 # 3 words, each a 4-number vector
Wq, Wk, Wv = (np.random.randn(4, 4) for _ in range(3))
Q, K, V = X @ Wq, X @ Wk, X @ Wv          # queries, keys, values

def softmax(z):
    e = np.exp(z - z.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

# each word scores every word, then mixes their values by those scores
attn = softmax(Q @ K.T / np.sqrt(4))
out = attn @ V
print("attention weights:\\n", attn.round(2))
print("output shape:", out.shape)`,
  },
  {
    id: "nlp-positional-encoding",
    title: "Positional encoding (word order)",
    level: "Advanced",
    category: "NLP & LLM",
    tags: ["nlp", "llm", "transformers", "numpy"],
    description: "Give a model a sense of word position.",
    explain:
      "🔹 Deeper topic — skim now, return later. Attention by itself doesn't know word order ('dog bites man' vs 'man bites dog'). Positional encoding adds a unique number pattern for each position so the model can tell them apart. You can revisit this after attention clicks.",
    code: `import numpy as np

def positional_encoding(seq_len, d):
    pos = np.arange(seq_len)[:, None]
    i = np.arange(d)[None, :]
    angle = pos / np.power(10000, (2 * (i // 2)) / d)
    pe = np.zeros((seq_len, d))
    pe[:, 0::2] = np.sin(angle[:, 0::2])
    pe[:, 1::2] = np.cos(angle[:, 1::2])
    return pe

print(positional_encoding(4, 6).round(2))`,
  },
  {
    id: "llm-rag-retrieval",
    title: "RAG: finding the right document",
    level: "Intermediate",
    category: "NLP & LLM",
    tags: ["llm", "rag", "scikit-learn"],
    description: "Pick the document that best answers a question.",
    explain:
      "RAG ('retrieval-augmented generation') is how chatbots answer using your own documents: turn the question and the documents into vectors, find the closest document, and hand it to the LLM as context. This snippet is that 'find the closest document' step — a skill in huge demand right now.",
    code: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

docs = [
    "Python is a popular programming language.",
    "Transformers and attention power modern LLMs.",
    "The mitochondria is the powerhouse of the cell.",
]
query = "What runs large language models?"
vec = TfidfVectorizer().fit(docs + [query])
sims = cosine_similarity(vec.transform([query]), vec.transform(docs))[0]
print("similarities:", sims.round(3))
print("retrieved:", docs[sims.argmax()])`,
  },
  {
    id: "nlp-ngram-generation",
    title: "Tiny text generator",
    level: "Beginner",
    category: "NLP & LLM",
    tags: ["nlp", "llm"],
    description: "Predict the next word from the previous one, and string them together.",
    explain:
      "This baby language model learns which word tends to follow which, then generates text by predicting one word at a time. That's exactly what an LLM does — guess the next word, over and over — just with vastly more data and smarts. A great 'aha' for what 'generating text' really means.",
    code: `import random
from collections import defaultdict

text = "i love ai i love ml i love data".split()
model = defaultdict(list)
for a, b in zip(text, text[1:]):
    model[a].append(b)

random.seed(0)
word, out = "i", ["i"]
for _ in range(5):
    word = random.choice(model[word])
    out.append(word)
print(" ".join(out))`,
  },
  {
    id: "llm-temperature",
    title: "Temperature (creativity knob)",
    level: "Intermediate",
    category: "NLP & LLM",
    tags: ["llm", "numpy", "sampling"],
    description: "See how 'temperature' makes an LLM more or less random.",
    explain:
      "When an LLM picks the next word, 'temperature' controls how adventurous it is. Low temperature → safe, predictable, repetitive. High temperature → creative, varied, sometimes weird. It's a setting you'll adjust constantly when building with LLMs. The animation shows the choices sharpening and flattening.",
    code: `import numpy as np

logits = np.array([2.0, 1.2, 0.8, 0.4, 0.1])
def sample_probs(logits, temp):
    z = logits / temp
    p = np.exp(z - z.max())
    return (p / p.sum()).round(2)

print("temp=0.5 (sharp): ", sample_probs(logits, 0.5))
print("temp=1.0 (normal):", sample_probs(logits, 1.0))
print("temp=2.0 (flat):  ", sample_probs(logits, 2.0))`,
  },

  /* ===================== MLOps ===================== */
  {
    id: "mlops-save-load",
    title: "Saving & loading a model",
    level: "Beginner",
    category: "MLOps",
    tags: ["mlops", "joblib", "scikit-learn"],
    description: "Train a model, save it, and load it back.",
    explain:
      "You train a model once, but use it many times — so you save the trained model to a file and reload it whenever you need a prediction (no retraining). 'MLOps' is the practical side of AI: getting models into real apps. This is the most basic, essential piece.",
    code: `import io, joblib
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
clf = LogisticRegression(max_iter=200).fit(X, y)

buf = io.BytesIO()
joblib.dump(clf, buf)          # to a file: joblib.dump(clf, "model.joblib")
buf.seek(0)
loaded = joblib.load(buf)
print("reloaded model accuracy:", round(loaded.score(X, y), 3))`,
  },
  {
    id: "mlops-pipeline",
    title: "Pipelines (bundle the steps)",
    level: "Intermediate",
    category: "MLOps",
    tags: ["mlops", "scikit-learn"],
    description: "Glue preprocessing and the model into one object.",
    explain:
      "Real projects have steps before the model (like scaling). A Pipeline bundles 'scale, then predict' into a single object that applies the steps in the right order automatically — preventing mistakes and making the model easy to ship. A small habit that saves big headaches.",
    code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
Xtr, Xte, ytr, yte = train_test_split(X, y, random_state=0)
pipe = Pipeline([("scale", StandardScaler()),
                 ("clf", LogisticRegression(max_iter=200))])
pipe.fit(Xtr, ytr)
print("pipeline test accuracy:", round(pipe.score(Xte, yte), 3))`,
  },
  {
    id: "mlops-reproducibility",
    title: "Reproducibility (set a seed)",
    level: "Beginner",
    category: "MLOps",
    tags: ["mlops"],
    description: "Make random results come out the same every run.",
    explain:
      "AI uses randomness (random starting weights, random splits). If you don't 'seed' it, you get different results every run and can't tell if a change actually helped. Setting a seed makes runs repeatable — essential for debugging and for trusting your experiments.",
    code: `import random
import numpy as np

def set_seed(s):
    random.seed(s)
    np.random.seed(s)

set_seed(42)
print("run 1:", np.random.rand(3).round(3))
set_seed(42)
print("run 2:", np.random.rand(3).round(3), "  <- identical")`,
  },
  {
    id: "mlops-data-validation",
    title: "Checking your data",
    level: "Intermediate",
    category: "MLOps",
    tags: ["mlops", "pandas"],
    description: "Run simple checks to catch bad data before training.",
    explain:
      "'Garbage in, garbage out' — a model trained on bad data makes bad predictions. Automated checks (no negative ages, no missing values) catch problems early. Writing little sanity checks like these is a habit that separates reliable AI work from fragile demos.",
    code: `import pandas as pd

df = pd.DataFrame({"age": [25, -3, 40], "income": [50000, 60000, None]})
checks = {
    "age_non_negative": bool((df["age"] >= 0).all()),
    "no_missing_income": bool(df["income"].notnull().all()),
}
for name, ok in checks.items():
    print(f"{name}: {'PASS' if ok else 'FAIL'}")`,
  },
];
