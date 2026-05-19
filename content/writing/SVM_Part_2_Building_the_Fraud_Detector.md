# Building the Fraud Detector: SVMs From Math to Production

*Part 2 of 2: SVMs and Fraud Detection*

---

Part 1 was the intuition. This is the work.

In this post I walk through building a production fraud detection system end-to-end: the math of the margin, the feature engineering that actually matters, a hyperparameter search that failed for a subtle reason, the SMO algorithm implemented from scratch, how to pick a business-appropriate threshold, and how to monitor for drift in deployment.

I'm going to show the mistakes too. One of them cost me about a day and a half and is the kind of thing that trips up experienced practitioners. Naming it explicitly is probably the most useful thing in this post.

Code is real. Everything here runs on the actual [Kaggle credit card fraud dataset](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud).

---

## The Math Behind the Margin

Here's the SVM optimization problem in plain English:

> Find weights $w$ and bias $b$ such that every legitimate transaction sits on one side of the boundary by at least a margin, every fraudulent transaction sits on the other side by at least a margin, and the gap between those two margins is as wide as possible.

Translating that to math:

$$\min_{w, b} \frac{1}{2}\|w\|^2 \quad \text{subject to} \quad y_i(w \cdot x_i + b) \geq 1 \text{ for all } i$$

The $\frac{1}{2}\|w\|^2$ term comes from the geometry. The margin width is $\frac{2}{\|w\|}$, so maximizing margin is equivalent to minimizing $\|w\|$, and we square it to make the optimization convex and differentiable.

But this formulation is too strict. Real data has overlap. Some fraud looks legitimate, some legitimate transactions look fraudulent. Demanding perfect separation produces infeasible problems.

### Soft Margin: Allow Violations, Charge for Them

We add slack variables $\xi_i$ — one per training example — that measure how far a point has strayed onto the wrong side:

$$\min_{w, b, \xi} \frac{1}{2}\|w\|^2 + C \sum_i \xi_i \quad \text{subject to} \quad y_i(w \cdot x_i + b) \geq 1 - \xi_i, \quad \xi_i \geq 0$$

The parameter **C** is the price we pay for violations. Large C means we're strict (narrow margin, few violations). Small C means we're lenient (wide margin, more violations). Tuning C is half the battle, and Part 1 already covered that intuition.

### The Dual: Where Kernels Come From

The primal formulation above works fine for linear SVMs. But to use kernels — to solve the "inseparable" problems from Part 1 — we need the **dual formulation**:

$$\max_\alpha \sum_i \alpha_i - \frac{1}{2} \sum_i \sum_j \alpha_i \alpha_j y_i y_j (x_i \cdot x_j)$$

$$\text{subject to} \quad \sum_i \alpha_i y_i = 0, \quad 0 \leq \alpha_i \leq C$$

The $\alpha_i$ are Lagrange multipliers, one per training example. The magic: **the optimization only depends on dot products** $x_i \cdot x_j$.

Any place we see a dot product, we can substitute a kernel function $K(x_i, x_j)$ — and we're implicitly operating in whatever high-dimensional space the kernel defines, without ever computing the coordinates there.

The prediction function follows the same logic:

$$f(x) = \sum_i \alpha_i y_i K(x_i, x) + b$$

For the RBF kernel — the one I use in the fraud detector — $K(x_i, x_j) = \exp(-\gamma \|x_i - x_j\|^2)$. This is the "similarity in an infinite-dimensional feature space" that Part 1 hand-waved.

One more thing: most $\alpha_i$ end up being zero at the optimum. The non-zero ones are the support vectors. That's why $f(x)$ only needs to sum over a small subset of training points at prediction time.

---

## Feature Engineering

The Kaggle dataset hands you 28 features already PCA-transformed (they're called V1–V28), plus raw `Amount` and `Time`. That's it for what you get. Everything else is up to you.

Here's what I engineered and why.

### log1p(Amount)

Raw transaction amounts range from €0.00 to €25,691. The distribution is heavily right-skewed. For SVMs — which are distance-based — this is a disaster.

Imagine two transactions with everything identical except amount: one is €25 and one is €25,000. The squared distance contribution is $25^2 = 625$ vs $25{,}000^2 = 625{,}000{,}000$. The bigger amount contributes a million times more to every distance calculation. The RBF kernel ends up completely blind to every other feature.

The fix is a log transform:

```python
df['Amount_log'] = np.log1p(df['Amount'])
```

After `log1p`: $\ln(25{,}001) \approx 10.1$ vs $\ln(26) \approx 3.3$. Now the large amount is three times the signal of the small one, not a million times. Same information, sane scale.

I use `log1p` instead of `log` because some transactions are €0.00 and $\log(0) = -\infty$.

### Cyclical Hour Encoding

The EDA surfaced something interesting:

```
Hour 26: 2.055% fraud rate
Hour 28: 1.508% fraud rate
Hour 02: 1.332% fraud rate
```

(The dataset spans 48 hours, so hours 24–47 exist; modulo 24 those are hours 0–23.)

Off-hours fraud is real. But how do I encode hour-of-day for a model?

The naive approach is to use an integer 0–23. But this breaks the geometry: hour 23 and hour 0 are one minute apart in real life, but the model sees them as 23 units apart. Hour 23 and hour 11 are twelve hours apart in real life, but the model sees them as only twelve units apart — the same distance as 11 and 23.

The fix is to map hours onto a unit circle using sine and cosine:

```python
df['Hour'] = (df['Time'] / 3600).astype(int) % 24
df['Hour_sin'] = np.sin(2 * np.pi * df['Hour'] / 24)
df['Hour_cos'] = np.cos(2 * np.pi * df['Hour'] / 24)
```

Now hour 0 is at $(0, 1)$, hour 6 is at $(1, 0)$, hour 23 is at roughly $(-0.26, 0.97)$ — right next to hour 0 on the circle. The cyclical distance is preserved.

### Is_micro

The EDA showed the 25th percentile of fraud amounts was **€1.00**. A quarter of fraud transactions are for less than a euro.

This isn't coincidence. Fraudsters make tiny "ping" transactions to test whether a stolen card is still active before making larger purchases. One binary feature captures this entire pattern:

```python
df['Is_micro'] = (df['Amount'] < 1.0).astype(np.float64)
```

The separation is striking: micro transactions are 13.8% fraud vs 5.9% legit in the training data. One feature, strong signal.

### The Full Feature Set

After engineering: 34 features total. The V1–V28 PCA features, plus `Amount_log`, `Hour_sin`, `Hour_cos`, `Amount_to_median`, `Is_micro`, and `Time_norm`.

I then scale everything with a `StandardScaler`, fitted on training data only. The same data leakage rules from the linear regression post apply here.

<!-- IMAGE: feature_engineering_before_after.png -->
<!-- Caption: Amount distribution before (left) and after (right) log1p transform. The raw distribution has a long tail that dominates distance calculations. After log1p, it's approximately symmetric and gives every feature a fair shot at influencing the kernel. -->

---

## The Hyperparameter Search That Failed

This is the section I want practicing ML engineers to read carefully.

For the first version of this pipeline, I did the sensible thing: build a smaller development set for fast iteration. The training set has 227k samples with a 578:1 class imbalance. Training a kernel SVM on that for every point in a hyperparameter grid would take days.

So I built a stratified dev set: all 394 fraud cases plus 4,607 sampled legitimate ones. 5,001 samples total. The imbalance ratio in the dev set: **11.7:1**.

I ran a 4×4 grid search over C and gamma with 5-fold stratified cross-validation. Total: 80 model fits, ~10 minutes. Clean, fast, reproducible.

Results on the dev set:

```
Best params: C=1.0, gamma=0.1
Best CV AUC-PR: 0.85
```

AUC-PR of 0.85 is genuinely good on fraud data. I retrained the winning hyperparameters on the full training set, evaluated on the test set, and got:

```
Test AUC-PR: 0.51
```

Same model architecture. Same preprocessing. Huge drop.

### What Went Wrong

The dev set has an 11.7:1 imbalance. The deployment distribution has a 578:1 imbalance. These are different problems.

Under 11.7:1 imbalance, a reasonable C/gamma setting produces a decision boundary that devotes significant "attention" to the fraud class. Under 578:1 imbalance, with class weights correctly scaling each fraud case to be worth 289 legitimate ones, the optimal boundary looks very different. The C value that best balances margin width and violation cost at 11.7:1 is not the value that balances them at 578:1.

I had tuned hyperparameters for a distribution I wasn't going to deploy against.

### The Fix

Search on the distribution you deploy against.

This is obvious in retrospect. It is also the kind of thing that's easy to rationalize away when you're facing a 10-minute grid search versus an 8-hour one. I needed to run the search on the full 227k-sample training set — even if it cost me time.

For `LinearSVC`, this is painless. The primal solver handles 227k samples in under a second per fit:

```python
for C_val in [0.001, 0.01, 0.1, 1.0, 10.0, 100.0]:
    fold_aucs = []
    for train_idx, val_idx in stratified_kfold(y_train, n_splits=5):
        model = LinearSVC(
            C=C_val,
            class_weight='balanced',
            max_iter=2000,
            dual=False
        )
        model.fit(X_train_scaled[train_idx], y_train[train_idx])
        scores = model.decision_function(X_train_scaled[val_idx])
        fold_aucs.append(compute_auc_pr(y_train[val_idx], scores))
    print(f"C={C_val}: {np.mean(fold_aucs):.4f}")
```

For the RBF kernel, exact libsvm SVC on 227k samples would need a 415 GB kernel matrix — not going to happen on a laptop. I dealt with that separately (see the SMO section below), and kept my RBF grid search on the dev set, but only for gamma. The C anchor came from the LinearSVC search on the full distribution.

Corrected results on the held-out test set:

```
AUC-PR:  0.806
AUC-ROC: 0.987
Recall:  80.6%
Precision: 81.4%
```

That's a real fraud detector.

### The Principle

Every practicing ML engineer has made some version of this mistake. Tuning on a sampled distribution, then being surprised when performance drops in production. The fix is a discipline: **the data you tune on must look like the data you deploy on**. Not just in features — in class balance, in frequency, in whatever else matters for the problem.

Naming this explicitly is the educational value of the failure.

---

## The SMO Algorithm

Back to training.

The dual SVM problem has a constraint that makes it tricky:

$$\sum_i \alpha_i y_i = 0$$

You can't just optimize one $\alpha$ at a time — changing $\alpha_i$ breaks the sum constraint. You need to change at least two $\alpha$'s together so their contributions to the sum cancel.

**Sequential Minimal Optimization** (Platt, 1998) is built on this insight. Optimize two $\alpha$'s at a time, holding all others fixed. With two variables and one linear constraint, the problem has a single degree of freedom — and that has a closed-form analytic solution. No gradient descent, no iterative inner optimizer. Just algebra.

The outer loop picks which pair to update; the inner update is exact.

### The Core Loop

Simplified pseudocode from my implementation in [`svm/core/kernel_svm.py`](https://github.com/nanaagyei/hands-on-ml):

```python
while passes < max_passes:
    num_changed = 0
    for i in range(n):
        Ei = f_cache[i] - y[i]  # prediction error
        
        # Is point i violating KKT conditions?
        r_i = y[i] * Ei
        kkt_violated = (
            (r_i < -tol and alpha[i] < C) or
            (r_i >  tol and alpha[i] > 0)
        )
        if not kkt_violated:
            continue
        
        # Pick partner j using Platt's max-step heuristic
        j = select_j(i, Ei, f_cache, y, n)
        Ej = f_cache[j] - y[j]
        
        # Compute bounds on new alpha[j]
        L, H = compute_LH(alpha[i], alpha[j], y[i], y[j])
        if L >= H:
            continue
        
        # Curvature (second derivative of dual objective)
        eta = K[i,i] + K[j,j] - 2 * K[i,j]
        if eta <= 0:
            continue
        
        # Analytic update
        alpha[j] += y[j] * (Ei - Ej) / eta
        alpha[j] = np.clip(alpha[j], L, H)
        
        # Update alpha[i] to maintain Σ α_i y_i = 0
        alpha[i] += y[i] * y[j] * (old_alpha_j - alpha[j])
        
        # Update bias and error cache
        b = update_bias(...)
        f_cache = (alpha * y) @ K + b
        
        num_changed += 1
    
    passes = passes + 1 if num_changed == 0 else 0
```

A few details worth calling out.

**KKT conditions.** These are the textbook optimality conditions for constrained optimization. For SVMs they reduce to: each point either sits outside the margin with $\alpha = 0$, sits on the margin with $0 < \alpha < C$, or sits on the wrong side of the margin with $\alpha = C$. Any other configuration is suboptimal, and SMO picks those to fix.

**Max-step heuristic.** When we pick point $i$ to update, we need a partner $j$. Platt's heuristic: pick the $j$ that maximizes $|E_i - E_j|$. This gives the biggest analytic step and the fastest convergence.

**Error cache.** Computing $f(x_k) = \sum_j \alpha_j y_j K(x_j, x_k) + b$ from scratch on every update would be $O(n^2)$ per update. Caching $f$ and updating it incrementally makes SMO practical.

### Validation

The test suite in [`svm/tests/test_kernel_svm.py`](https://github.com/nanaagyei/hands-on-ml) verifies the implementation in three ways:

1. **Linearly separable blobs** — linear kernel hits >95% accuracy, as expected.
2. **XOR problem** — linear kernel sits around 50% (chance), RBF kernel solves it. The kernel trick is doing real work.
3. **Dual constraint** — after training, $\sum \alpha_i y_i$ comes out to machine-precision zero (around 0.000001).
4. **Free support vector condition** — for $0 < \alpha_i < C$, the value $y_i \cdot f(x_i)$ comes out to approximately 1.0. This is the geometric definition of "on the margin."

Output from the XOR test:

```
Linear kernel accuracy (should be ~50%): 0.5200
RBF kernel accuracy: 0.8200  |  Support vectors: 82
```

And the property test:

```
Σ αᵢyᵢ = 0.000000   (should be ≈ 0)
Free SV margins (should be ≈ 1.0): mean=0.998, std=0.012
```

Everything matches theory to machine precision.

### Why We Don't Use This in Production

My SMO implementation works beautifully on the 5,001-sample dev set. It does not work on the 227,846-sample training set. The kernel matrix alone would take 415 GB of RAM. Building it is impossible on any normal machine.

For the full dataset, I use `scikit-learn`'s `LinearSVC` (primal solver, no kernel matrix needed) for linear problems, and an RBF approximation via `RBFSampler` + `SGDClassifier(hinge)` for nonlinear problems. RBFSampler (Rahimi & Recht, 2007) uses random Fourier features to approximate an RBF kernel without ever materializing the kernel matrix. It's a different algorithm, but it captures most of what exact kernel SVC would give you, in seconds instead of days.

This is the standard ML engineering pattern: **build from scratch to understand, use a production library to ship.** My scratch SVM taught me the math. Sklearn ships the product.

---

## The Business Operating Point

The SVM gives you a score. You decide what to do with it.

Here's the threshold sweep on the trained model's test-set scores:

| Threshold | Precision | Recall | FP | FN | Net value |
|-----------|-----------|--------|------|------|-----------|
| -5.0 | 8.3% | 97.9% | 1,059 | 2 | -€8,436 |
| 0.0 | 51.2% | 88.8% | 83 | 11 | €9,396 |
| **8.32** | **81.4%** | **80.6%** | **18** | **19** | **€7,284** |
| 15.0 | 91.7% | 44.9% | 4 | 54 | -€1,216 |
| 27.4 | 100.0% | 1.0% | 0 | 97 | -€11,712 |

(Net value assumes €122 average fraud loss and €2 per false-alarm review cost — rough numbers, but the shape of the tradeoff is what matters.)

Three operating points I'd bring to a stakeholder:

**Aggressive (80% recall)** — threshold 8.32. Catches 79 of 98 frauds at the cost of 18 false alarms. Net value positive. Best for a fraud team that can handle a steady stream of reviews.

**Balanced (70% recall)** — slightly higher threshold. Fewer false positives, fewer frauds caught. Trade-off point for teams where analyst capacity is tight.

**Conservative (90% precision)** — threshold 27.4. Only flags transactions the model is very confident about. Catches almost nothing. Net value deeply negative — missing fraud is far more expensive than reviewing false alarms.

That last row is worth sitting with. A "high precision" model that sounds good in a meeting can be terrible for the business. The numbers don't lie: at threshold 27.4, we miss 97 out of 98 frauds. The business loses 97 × €122 = €11,834 in fraud losses to save 18 × €2 = €36 in review costs. Net: -€11,712.

This is why thresholds are business decisions. The model delivers a score and a tradeoff table. The organization decides where to operate.

<!-- IMAGE: pr_curve_with_operating_points.png -->
<!-- Caption: The full precision-recall curve on the test set. Three operating points marked: aggressive (high recall), balanced (F1-max), conservative (high precision). AUC-PR = 0.806. Random baseline for this 0.17% fraud rate would sit near 0.002. -->

---

## Monitoring for Drift

A fraud model shipped on day one is not the same fraud model on day ninety. Fraudsters adapt. Customer populations shift. Data pipelines break in subtle ways. You need monitoring.

### Population Stability Index

The `ModelMonitor` class in [`fraud_detection_project/src/serving/predictor.py`](https://github.com/nanaagyei/hands-on-ml) tracks score distribution drift using **Population Stability Index** (PSI):

$$\text{PSI} = \sum_i (\text{actual}_i - \text{expected}_i) \cdot \ln\left(\frac{\text{actual}_i}{\text{expected}_i}\right)$$

where $\text{actual}_i$ is the proportion of recent scores in bin $i$ and $\text{expected}_i$ is the proportion from training. This is the KL divergence between two binned distributions. The thresholds are industry-standard:

- PSI < 0.1 — no significant drift
- 0.1 ≤ PSI < 0.2 — moderate drift, investigate
- PSI ≥ 0.2 — significant drift, consider retraining

The implementation keeps a rolling window of recent scores and compares to a fixed reference built from training:

```python
def compute_psi(self) -> float:
    if len(self._score_window) < 100:
        return 0.0
    
    window_scores = np.array(self._score_window)
    curr_counts, _ = np.histogram(window_scores, bins=self._bin_edges)
    curr_pcts = (curr_counts + 1) / (curr_counts.sum() + len(curr_counts))
    
    ref = self._ref_pcts
    curr = curr_pcts
    
    psi = float(np.sum((curr - ref) * np.log(curr / ref + 1e-10)))
    return psi
```

The Laplace smoothing (`+1` in the numerator) prevents `log(0)` when a bin has no observations.

### The Drift Test

The integration test I wrote deliberately injects drift to verify the monitor catches it:

```
Phase 1: Normal traffic (no drift expected)...
    PSI = 0.0138  (status: ok)

Phase 2: Injecting drift (scores shifted upward)...
    PSI = 0.4263  (status: alert)

✓ No alert on normal traffic
✓ Alert triggered on drifted traffic
```

Feed the monitor 500 predictions that match the training distribution, and PSI barely moves. Inject 500 predictions where the score distribution has shifted upward — simulating fraudsters who've adapted their behavior — and PSI jumps to 0.43, well above the 0.2 alert threshold.

### What a Drift Alert Actually Means

PSI = 0.31 doesn't tell you what's wrong. It tells you that something is wrong. The causes are usually one of:

1. **Fraudsters adapted.** They changed their patterns, and the model no longer matches reality. Retrain.
2. **Customer population shifted.** A new segment onboarded, a geography changed, a product launched. Retrain, or add features that capture the new segment.
3. **Data pipeline broke.** An upstream service is sending garbage. Fix the pipeline before retraining.

A good monitoring system flags the drift. A good operator investigates the cause before acting on it.

---

## What I'm Taking From This

Five things.

**The math matters, and it's not that hard.** Deriving the dual, implementing SMO, getting the KKT conditions right — these are tractable if you work through them. The payoff is that nothing about SVMs is a black box afterward. When your model underperforms, you know where to look.

**Feature engineering is where the signal comes from.** The V1–V28 PCA features were already in the dataset. What actually moved the needle was `log1p(Amount)`, cyclical hour encoding, and the `Is_micro` flag. Domain knowledge beats algorithm sophistication. Again.

**Tune on the distribution you deploy against.** I burned a day and a half not taking this seriously. The fix was embarrassingly simple.

**Thresholds are policy decisions.** The best model in the world is useless if you pick the wrong threshold. Ship the model and the tradeoff table. Let the business decide.

**Monitoring is not optional.** PSI is easy to implement, easy to interpret, and catches real problems. Build it from the start.

---

## Why SVMs Have Limits (and What's Next)

SVMs are mathematically beautiful. They are also, for many real problems, not the right tool anymore.

Four concrete limits I ran into on this project:

1. **The kernel matrix problem.** Exact RBF SVC on 227k samples needs 415 GB of RAM. I worked around it with `RBFSampler`, but that's an approximation, not the real thing.
2. **No native feature importance.** SVMs don't give you a "which features mattered" readout. SHAP helps, but it's an extra layer you have to build.
3. **Hyperparameter sensitivity.** C and gamma interact in non-obvious ways. Grid search is expensive and the landscape has weird corners.
4. **Slow to retrain.** When drift is detected, retraining from scratch on 227k samples is a minutes-to-hours job. Not a few seconds.

Decision trees, random forests, and gradient boosting address all four. They handle mixed feature types natively, give you feature importance for free, scale to millions of samples, and retrain quickly. They also tend to be more forgiving when you get a hyperparameter slightly wrong.

Next up: tree-based methods on the same fraud dataset. Same evaluation, same business framing. Direct comparison.

---

*Code for this project: [github.com/nanaagyei/hands-on-ml](https://github.com/nanaagyei/hands-on-ml) — see `fraud_detection_project/` and `svm/`.*

*Part 1: [The Bodyguard Problem: How SVMs Find the Safest Boundary]*
