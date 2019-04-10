package machine;

public class IfExpression implements   IExpression{
   IExpression predicate;
   IExpression firstexp;
   IExpression alternate;
   public IfExpression(){}
public IfExpression(IExpression predicate, IExpression firstexp, IExpression alternate) {
	super();
	this.predicate = predicate;
	this.firstexp = firstexp;
	this.alternate = alternate;
}
public IExpression getPredicate() {
	return predicate;
}
public void setPredicate(IExpression predicate) {
	this.predicate = predicate;
}
public IExpression getFirstexp() {
	return firstexp;
}
public void setFirstexp(IExpression firstexp) {
	this.firstexp = firstexp;
}
public IExpression getAlternate() {
	return alternate;
}
public void setAlternate(IExpression alternate) {
	this.alternate = alternate;
}
   
}
