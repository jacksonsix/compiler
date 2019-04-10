package machine;

import java.util.List;

public class CompoundExpression implements IExpression {
    IExpression operator;
    List<IExpression> paralist;
    public CompoundExpression(){}
	public CompoundExpression(IExpression operator, List<IExpression> paralist) {
		super();
		this.operator = operator;
		this.paralist = paralist;
	}
	public IExpression getOperator() {
		return operator;
	}
	public void setOperator(IExpression operator) {
		this.operator = operator;
	}
	public List<IExpression> getParalist() {
		return paralist;
	}
	public void setParalist(List<IExpression> paralist) {
		this.paralist = paralist;
	}
    
    
    
}
