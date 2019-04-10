package machine;

public class SelfExpression implements IExpression ,ILispObject {
    Integer iexp=null;
    Float fexp=null;
    Double dexp=null;
    String sexp=null;
    public SelfExpression(){}
    public SelfExpression(int exp){
    	this.iexp =exp;
    }
    public SelfExpression(double exp){
    	this.dexp = exp;
    }
    public SelfExpression(float exp){
    	this.fexp = exp;
    }
    public SelfExpression(String exp){
    	this.sexp = exp;
    }
	public int getIexp() {
		return iexp;
	}
	public Object getValue(){
		if(iexp != null){ 
			return iexp;
		}else if(fexp != null){
			return fexp;
		}else if(dexp != null){
			return dexp;
		}else if(sexp != null){
			return sexp;
		}
		return null;
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
