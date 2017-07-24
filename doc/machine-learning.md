week1
---

introduction

supervised learning = learn function(x->y) from ( X(data) + Y(tags of data) )
unsupervised learning = learn function(x->y) from only ( X(data) ) without ( Y(tags of data) )


linear regression with one variable

model representation:
 exist i, (x[i], y[i]). called training example.
 forall i, (x[i], y[i]). called training set.
 function h: X->Y. that function h use x to predicted y. h is learned by training set using learning algorithm.
 
cost function:
 m = count of training examples.
 J(theta[0], theta[1]) = (1/2*m)*sum(i for each index of training examples)((h(theta, x[i]) - y[i])^2)
 J is cost function, represent how bad the function h(theta, _) be.
 
 gradient descent:
  a = learning rate, is a small number.
  forall j, theta[j] -= a(d theta[j])(J(theta[0], theta[1]))
   the gradient: change rate of J by changing theta[j]
