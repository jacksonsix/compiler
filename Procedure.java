package machine;

import java.util.List;

public class Procedure implements ILispObject{
	Env env;
	List<String> paras;
	SequenceExpression body;	
	boolean isPrim = false;
	
	public Procedure(Env env, List<String> paras, List<IExpression> body) {
		this.env = env;
		this.paras = paras;
		this.body = new SequenceExpression(body);
	}
	public Env getEnv() {
		return env;
	}
	public void setEnv(Env env) {
		this.env = env;
	}

	public SequenceExpression getBody() {
		return body;
	}
	public void setBody(SequenceExpression body) {
		this.body = body;
	}
	public List<String> getParas() {
		return paras;
	}
	public void setParas(List<String> paras) {
		this.paras = paras;
	}

	@Override
	public LispObject deepcopy() {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public Object getCar() {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public void setCar(Object car) {
		// TODO Auto-generated method stub
		
	}
	@Override
	public Object getCdr() {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public void setCdr(Object cdr) {
		// TODO Auto-generated method stub
		
	}
	
	

}
