// walkthroughs.js — a short, plain-English "how the code works" walkthrough for
// every snippet, keyed by id. Rendered as a numbered list under the code.
// Kept separate from snippets.js so explanations are easy to extend.

window.WALKTHROUGHS = {
  /* Start Here */
  "start-here": [
    "Makes a list of 4 instruction strings.",
    "Loops over them and prints each line.",
    "Prints a closing tip (the \\n adds a blank line first).",
  ],

  /* Python */
  "py-basics-list-comprehension": [
    "Builds nums = [1..10] with a list comprehension.",
    "Builds squares by multiplying each n by itself.",
    "Adds the squares and divides by the count to get the mean.",
  ],
  "py-dict-set": [
    "Splits the sentence into a list of words.",
    "Loops words; counts.get(w, 0) + 1 adds one each time a word appears.",
    "set(words) keeps only unique words; sorted() orders them.",
  ],
  "py-args-kwargs": [
    "*args gathers the loose numbers (1, 2, 3) into a tuple.",
    "**kwargs gathers the named ones (label=, scale=) into a dict.",
    "Prints both, then returns sum(args).",
  ],
  "py-oop-class": [
    "Defines a Neuron class that stores weights and a bias.",
    "forward() multiplies each weight by its input, sums them, adds the bias.",
    "Creates a neuron and calls forward([2.0, 1.0]).",
  ],
  "py-generators": [
    "batches() steps through the data in jumps of `size`.",
    "yield hands back one slice at a time instead of building them all.",
    "The for-loop prints each batch as it arrives.",
  ],
  "py-decorators": [
    "timed() wraps a function: records the start time, runs it, prints elapsed.",
    "@timed attaches that timing behavior to work().",
    "Calling work(200000) runs it and prints how long it took.",
  ],
  "py-map-filter-reduce": [
    "filter keeps the even numbers; map squares each number.",
    "reduce folds the list down to a single sum.",
    "The lambdas are tiny one-line functions passed in.",
  ],
  "py-context-manager": [
    "Collector defines __enter__/__exit__ so it works in a `with` block.",
    "Inside the with, it appends 5 items; on exit it auto-prints the count.",
    "try/except catches the divide-by-zero instead of crashing.",
  ],

  /* Algorithms & DS */
  "algo-bubble-sort": [
    "Copies the list so the original isn't changed.",
    "Nested loops compare each neighbour pair and swap if left > right.",
    "After all passes the list is sorted; returns it.",
  ],
  "algo-binary-search": [
    "Keeps a lo/hi window over the sorted list.",
    "Checks the middle item; if it's the target, returns its index.",
    "Otherwise throws away the half that can't hold it and repeats (-1 if absent).",
  ],
  "algo-merge-sort": [
    "Base case: a list of 0 or 1 items is already sorted.",
    "Splits in half and merge_sorts each half (recursion).",
    "Merges the two sorted halves by repeatedly taking the smaller front item.",
  ],
  "algo-recursion-memo": [
    "@lru_cache remembers each result so fib(n) is computed only once.",
    "fib calls itself: fib(n-1) + fib(n-2), stopping when n < 2.",
    "Prints the first 15 Fibonacci numbers.",
  ],
  "algo-dynamic-programming": [
    "dp[a] = fewest coins to make amount a; dp[0]=0, the rest start at infinity.",
    "For each amount, tries each coin and keeps the smallest dp[a-c] + 1.",
    "Returns dp[amount].",
  ],
  "algo-stack-queue": [
    "A list as a stack: append pushes, pop() removes the LAST item (LIFO).",
    "A deque as a queue: append adds, popleft() removes the FIRST item (FIFO).",
  ],
  "algo-tree-traversal": [
    "tree is a dict mapping each node to its list of children.",
    "bfs uses a queue to visit nodes level by level.",
    "dfs recurses into each child, going as deep as possible first.",
  ],
  "algo-two-sum": [
    "seen remembers each number already passed (value to index).",
    "For each n, checks if its partner (target - n) is already in seen.",
    "If so, returns the pair; otherwise stores n and continues.",
  ],

  /* Math for ML */
  "math-vectors": [
    "Makes two vectors a and b.",
    "np.dot multiplies matching items and adds them up.",
    "norm is each vector's length; cosine divides dot by the lengths to score alignment.",
  ],
  "math-matrix-multiply": [
    "Defines two 2x2 matrices A and B.",
    "A @ B performs matrix multiplication.",
    "A.T swaps rows and columns (transpose).",
  ],
  "math-linear-system": [
    "A holds the equation coefficients, b the right-hand side.",
    "np.linalg.solve finds the x where A·x = b.",
    "Prints x and verifies that A @ x equals b.",
  ],
  "math-eigen": [
    "Defines a 2x2 matrix A.",
    "np.linalg.eig returns its eigenvalues and eigenvectors.",
  ],
  "math-gradient": [
    "f(x) is the function we want the slope of.",
    "grad nudges x by a tiny h on each side and measures rise over run.",
    "Estimates the slope at x = 2 (the exact answer is 7).",
  ],
  "math-bayes": [
    "Sets the prior plus the test's true- and false-positive rates.",
    "p_pos = the overall chance of a positive result.",
    "Bayes' rule: posterior = (true-positive x prior) / p_pos.",
  ],
  "math-distributions": [
    "x is 7 evenly spaced points from -3 to 3.",
    "stats.norm.pdf gives the bell-curve height at each point.",
    "rvs draws 5 random samples (seeded so they repeat).",
  ],
  "math-statistics": [
    "Makes an array of numbers.",
    "Computes mean, median, standard deviation and variance.",
    "np.percentile returns the 25th and 75th cutoffs.",
  ],
  "math-hypothesis-test": [
    "Defines two small groups, a and b.",
    "ttest_ind returns a t-value and a p-value.",
    "If p < 0.05 the difference is called 'significant'.",
  ],
  "math-correlation": [
    "Two related arrays x and y.",
    "corrcoef gives the correlation (-1 to 1); cov gives the covariance.",
  ],

  /* NumPy */
  "np-broadcasting": [
    "Makes a 3x4 matrix.",
    "mean(axis=0) is the average of each column.",
    "Subtracting it centres every column — broadcasting matches the shapes for you.",
  ],
  "np-boolean-mask": [
    "a > 0 builds a True/False mask; a[mask] selects the matching values.",
    "a[a < 0] = 0 turns every negative into zero.",
    "np.where picks 1 or 0 per element based on a test.",
  ],
  "np-vectorization": [
    "Makes one million numbers.",
    "(x ** 2).sum() squares and adds them all at once — no Python loop.",
    "Also computes the mean and standard deviation.",
  ],
  "np-reshape": [
    "Makes 24 numbers shaped into 2x3x4.",
    "sum() adds everything; sum(axis=0) collapses the first dimension.",
    "flatten() returns it to a flat 1-D array.",
  ],
  "np-create": [
    "Shows np.array (from a list), zeros, ones, arange and linspace.",
    "Each line is a different common way to create an array.",
  ],
  "np-elementwise": [
    "One array a.",
    "+10, *2 and **2 apply to every element at once.",
    "np.sqrt transforms each value; sum/mean/max summarise the array.",
  ],
  "np-random": [
    "Creates a seeded generator so results repeat.",
    "Draws uniform (0-1), integer, and bell-curve random numbers.",
  ],
  "np-stack": [
    "vstack stacks a and b as rows; column_stack as side-by-side columns.",
    "concatenate joins them end to end into one array.",
  ],

  /* Pandas & Data */
  "ml-pandas-groupby": [
    "Builds a table of species and weights.",
    "groupby('species') bundles the cats and dogs together.",
    ".mean() then averages the weight within each group.",
  ],
  "pd-missing": [
    "Builds a table with NaN (missing) cells.",
    "isnull().sum() counts the gaps in each column.",
    "fillna(df.mean()) fills each gap with that column's average.",
  ],
  "pd-merge": [
    "Two tables that share an id column.",
    "pd.merge joins them on id; how='inner' keeps only ids found in both.",
  ],
  "data-scaling": [
    "Starts with one array X.",
    "z-score: subtract the mean, divide by the standard deviation.",
    "min-max: rescale the values into the 0-1 range.",
  ],
  "data-onehot": [
    "A table with a 'color' category column.",
    "get_dummies makes a 0/1 column for each colour; astype(int) shows them as 1/0.",
  ],
  "data-train-test-split": [
    "Makes X (features) and y (labels).",
    "train_test_split holds out 30% as a test set.",
    "Prints the train and test sizes.",
  ],

  /* Matplotlib */
  "mpl-line": [
    "x is 100 points from 0 to 10.",
    "plt.plot draws sin(x); title/xlabel/ylabel annotate it.",
    "plt.show() finishes the figure — it appears as an image below.",
  ],
  "mpl-scatter": [
    "Generates 50 random x and y points.",
    "scatter draws a dot per point, coloured by its y value (cmap).",
    "colorbar adds the legend; show renders it.",
  ],
  "mpl-hist": [
    "Draws 1000 samples from a bell curve.",
    "hist groups them into 30 bars (bins).",
    "The picture shows the distribution's shape.",
  ],
  "mpl-bar": [
    "Defines labels and their counts.",
    "plt.bar draws one coloured bar per label.",
  ],
  "mpl-subplots": [
    "subplots(1, 2) creates two charts side by side.",
    "Draws sin on the left axis and cos on the right.",
    "tight_layout spaces them neatly; both render.",
  ],

  /* Classical ML */
  "ml-linear-regression-gd": [
    "Makes noisy points scattered around the line y = 2x + 1.",
    "Each loop predicts y_hat, measures the error, and nudges w and b downhill.",
    "After 1000 steps w and b land near 2 and 1.",
  ],
  "ml-logistic-regression": [
    "make_classification builds a 2-feature dataset.",
    ".fit() trains the classifier; .score() reports accuracy.",
    "coef_ are the weights it learned.",
  ],
  "ml-sklearn-iris": [
    "Loads Iris into X (measurements) and y (species).",
    "Splits 70/30, then fits LogisticRegression on the train part.",
    "Predicts on the unseen test set and prints accuracy.",
  ],
  "ml-knn-scratch": [
    "X holds points, y their class labels.",
    "knn_predict measures distance to every point, keeps the k closest, takes the majority vote.",
    "Predicts the class for two query points.",
  ],
  "ml-decision-tree": [
    "Loads Iris.",
    "Fits a depth-3 decision tree; score is its accuracy.",
    "feature_importances_ shows which measurements mattered most.",
  ],
  "ml-random-forest": [
    "Loads Iris and splits train/test.",
    "Trains 50 trees; their combined vote makes each prediction.",
    "Prints accuracy on the test set.",
  ],
  "ml-svm": [
    "Builds a 2-feature dataset.",
    "Fits an RBF-kernel SVM; score is its accuracy.",
    "n_support_ counts the boundary (support) points per class.",
  ],
  "ml-naive-bayes": [
    "Loads Iris.",
    "GaussianNB fits using probabilities, then prints accuracy.",
  ],
  "ml-kmeans-numpy": [
    "Makes two blobs of points.",
    "Picks random centres, then loops: assign each point to its nearest centre, move each centre to its group's mean.",
    "Prints the final centres.",
  ],
  "ml-pca": [
    "Loads Iris (4 columns).",
    "PCA(2) finds the two most informative directions and projects onto them.",
    "explained_variance_ratio_ shows how much information each keeps.",
  ],
  "ml-gradient-boosting": [
    "Loads the breast-cancer dataset and splits it.",
    "Trains boosted trees, each correcting the previous ones' errors.",
    "Prints accuracy on the test set.",
  ],

  /* Evaluation */
  "eval-cross-validation": [
    "Loads Iris.",
    "cross_val_score trains and tests 5 times on different splits.",
    "Prints each fold's score plus the mean and spread.",
  ],
  "eval-confusion-matrix": [
    "Lists the true labels and the predicted labels.",
    "confusion_matrix tallies right vs wrong for each class.",
    "classification_report prints precision, recall and F1.",
  ],
  "eval-roc-auc": [
    "True labels plus the model's confidence scores.",
    "roc_auc_score rates how well it ranks positives above negatives (1 = perfect).",
    "roc_curve returns the false- and true-positive rates.",
  ],
  "eval-regularization": [
    "Makes a wavy (sine) dataset.",
    "Fits a degree-9 polynomial three times with different Ridge strengths (alpha).",
    "Prints train R² for each so you can see alpha rein the model in.",
  ],
  "ml-mse": [
    "mse() squares every error and averages them.",
    "Compares a true array against a predicted one.",
  ],
  "eval-regression-metrics": [
    "True numbers vs predicted numbers.",
    "Prints MSE, MAE and R² — three views of the same error.",
  ],

  /* Neural Networks */
  "ml-perceptron": [
    "X is the four AND inputs, y the correct answers.",
    "For each example it predicts, then nudges the weights and bias only when wrong.",
    "Prints the learned weights and checks all four inputs.",
  ],
  "ml-sigmoid": [
    "sigmoid squashes any number into the 0-1 range.",
    "Applies it to 5 inputs and prints the rounded results.",
  ],
  "nn-activations": [
    "x is 7 points from -3 to 3.",
    "Computes relu, sigmoid and tanh for each.",
    "Prints all three so you can compare their shapes.",
  ],
  "ml-softmax": [
    "Subtracts the max (for numerical stability), then exponentiates.",
    "Divides by the total so the outputs add up to 1.",
    "Turns 3 scores into probabilities.",
  ],
  "nn-forward-pass": [
    "Sets random weights for a 2 to 4 to 1 network.",
    "Layer 1 computes relu(x @ W1 + b1); layer 2 computes h @ W2 + b2.",
    "Prints the hidden values and the final output.",
  ],
  "nn-backprop": [
    "import numpy as np — load NumPy for all the array math.",
    "X = np.array([[0,0],[0,1],[1,0],[1,1]]) — the four XOR inputs, one pair per row.",
    "y = np.array([[0],[1],[1],[0]]) — the correct XOR answer for each input, as a column.",
    "rng = np.random.default_rng(1) — a seeded random generator so the run repeats identically.",
    "W1, b1 = rng.normal(0,1,(2,4)), zeros(1,4) — layer 1: a 2→4 weight matrix (4 hidden neurons); biases start at 0.",
    "W2, b2 = rng.normal(0,1,(4,1)), zeros(1,1) — layer 2: 4→1 weights that turn the 4 hidden values into one output.",
    "sig = lambda z: 1/(1+np.exp(-z)) — the sigmoid, which squashes any number into the 0–1 range.",
    "lr = 0.5 — the learning rate: how big each weight adjustment is.",
    "for _ in range(5000): — repeat the train step 5000 times.",
    "h = sig(X @ W1 + b1) — FORWARD layer 1: combine inputs with weights, add bias, squash → the 4 hidden values.",
    "out = sig(h @ W2 + b2) — FORWARD layer 2: combine the hidden values into one squashed prediction per input.",
    "d_out = (out - y) * out * (1 - out) — BACKWARD: the output error (out − y) times sigmoid's slope out·(1−out). How the output wants to change.",
    "d_h = (d_out @ W2.T) * h * (1 - h) — push that error back through W2 to the hidden layer (the chain rule), times the hidden sigmoid slope.",
    "W2 -= lr * h.T @ d_out — nudge layer-2 weights down by each hidden value's share of the error.",
    "b2 -= lr * d_out.sum(0, keepdims=True) — nudge the layer-2 bias by the total output error.",
    "W1 -= lr * X.T @ d_h — nudge layer-1 weights using the inputs and the hidden error.",
    "b1 -= lr * d_h.sum(0, keepdims=True) — nudge the layer-1 bias by the total hidden error.",
    "print(out.round(2)...) — after 5000 rounds the predictions hug the targets 0, 1, 1, 0. (PyTorch's autograd does steps 12–17 for you automatically.)",
  ],
  "nn-gradient-descent": [
    "grad is the slope of (x - 3)².",
    "Each step moves x downhill: x -= lr * grad(x).",
    "It converges to x ≈ 3, the lowest point.",
  ],
  "nn-cross-entropy": [
    "cross_entropy clips the probabilities, then averages the -log loss.",
    "Compares confident-correct predictions against unsure ones — bad guesses cost far more.",
  ],

  /* PyTorch */
  "torch-tensors": [
    "Makes a 2x2 tensor.",
    "Shows its shape, adds 10 to every element, and matrix-multiplies it (@).",
  ],
  "torch-autograd": [
    "x is marked requires_grad=True so PyTorch tracks operations on it.",
    "y = x² + 3x; calling y.backward() fills x.grad with dy/dx (7 at x=2).",
  ],
  "torch-nn-module": [
    "Net subclasses nn.Module with two Linear layers.",
    "forward() applies relu after the first layer, then the second.",
    "Builds the model and pushes one input through it.",
  ],
  "torch-training-loop": [
    "Sets up y = 2x + 1 data, a Linear model, an SGD optimizer and MSE loss.",
    "Each loop: predict, compute loss, zero_grad, backward, step.",
    "Prints the final loss and the learned w, b (near 2 and 1).",
  ],

  /* TensorFlow */
  "tf-tensors": [
    "Makes a constant 2x2 tensor.",
    "Shows its shape, adds 10, and matrix-multiplies with tf.matmul.",
  ],
  "tf-keras-model": [
    "Sequential lists two Dense layers (relu then softmax).",
    "summary() prints the network's structure.",
  ],
  "tf-keras-train": [
    "Creates random data X and y.",
    "Builds the model; compile() sets the optimizer, loss and metric.",
    "fit() trains it for 5 epochs.",
  ],
  "tf-predict": [
    "Builds a one-layer softmax model.",
    "predict() returns a probability per class for one sample.",
    "argmax picks the highest-probability class.",
  ],

  /* NLP & LLM */
  "nlp-tokenization": [
    "The regex \\w+ splits the text into word tokens.",
    "Builds a vocab dict mapping each unique word to an id.",
    "Converts the tokens into their id numbers.",
  ],
  "nlp-bag-of-words": [
    "CountVectorizer learns the vocabulary from the sentences.",
    "Transforms each sentence into a row of word counts.",
  ],
  "nlp-tfidf": [
    "TfidfVectorizer learns the terms and their weights.",
    "Common words get a lower weight, rare/informative ones higher.",
    "Prints the resulting tf-idf matrix.",
  ],
  "nlp-cosine": [
    "Defines toy 3-number embeddings for three words.",
    "cos() computes dot / (lengths) to score closeness.",
    "king~queen comes out high; king~apple comes out low.",
  ],
  "nlp-attention": [
    "import numpy as np — load NumPy for the matrix math.",
    "np.random.seed(0) — fix the randomness so the numbers repeat each run.",
    "X = np.random.randn(3, 4) — 3 tokens (words), each turned into a 4-number vector. Shape 3×4.",
    "Wq, Wk, Wv = (randn(4,4) for _ in range(3)) — three 4×4 weight matrices; a real model learns these during training.",
    "Q, K, V = X @ Wq, X @ Wk, X @ Wv — transform each word into a Query (what it's looking for), Key (what it offers), and Value (its content). Each is 3×4.",
    "def softmax(z): ... — turns a row of scores into positive weights that add up to 1; subtracting the row max keeps exp() from overflowing.",
    "Q @ K.T — every word's query dotted with every word's key → a 3×3 grid of raw relevance scores (row i = how much word i cares about each word).",
    "... / np.sqrt(4) — divide by the square root of the vector size so the scores don't grow too large.",
    "attn = softmax(...) — softmax each row, so its weights are positive and sum to 1: that's the attention pattern.",
    "out = attn @ V — blend the Values by those weights; each word's new vector is a weighted mix of all words' values. Shape 3×4.",
    "print(attn.round(2)) — shows the 3×3 attention grid (who paid attention to whom).",
    "print(out.shape) — confirms the output stays 3×4. Stack this block many times with millions of weights and you have a Transformer / GPT.",
  ],
  "nlp-positional-encoding": [
    "Builds a grid of angles from position and dimension.",
    "Even columns use sin, odd columns use cos.",
    "Returns the encoding for 4 positions at dimension 6.",
  ],
  "llm-rag-retrieval": [
    "TF-IDF turns the documents and the query into vectors.",
    "cosine_similarity ranks each document against the query.",
    "argmax picks and prints the best-matching document.",
  ],
  "nlp-ngram-generation": [
    "Builds a map of each word to the words that follow it.",
    "Starting at 'i', repeatedly picks a random next word.",
    "Joins the words into a generated sentence.",
  ],
  "llm-temperature": [
    "Takes fixed logits and divides them by the temperature.",
    "softmax turns the result into probabilities.",
    "Low temperature sharpens the choice; high temperature flattens it.",
  ],

  /* MLOps */
  "mlops-save-load": [
    "Trains a model on Iris.",
    "joblib.dump saves it (here into memory; normally a file).",
    "joblib.load reloads it — accuracy is identical.",
  ],
  "mlops-pipeline": [
    "Pipeline chains a scaler and then the classifier.",
    "fit() applies both steps in order on the training data.",
    "score() reuses the exact same steps on the test data.",
  ],
  "mlops-reproducibility": [
    "set_seed seeds both Python's and numpy's randomness.",
    "Same seed → identical 'random' numbers on both runs.",
  ],
  "mlops-data-validation": [
    "A table with a bad age (-3) and a missing income.",
    "Defines checks: ages non-negative, income not missing.",
    "Prints PASS or FAIL for each check.",
  ],
};
