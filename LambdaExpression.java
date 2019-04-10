package machine;

import java.util.List;

public class LambdaExpression implements IExpression {
	List<String> paras;
	List<IExpression> body;
	public LambdaExpression(List<String> paras, List<IExpression> body) {
		super();
		this.paras = paras;
		this.body = body;
	}
	public List<String> getParas() {
		return paras;
	}
	public void setParas(List<String> paras) {
		this.paras = paras;
	}
	public List<IExpression> getBody() {
		return body;
	}
	public void setBody(List<IExpression> body) {
		this.body = body;
	}
	

}
