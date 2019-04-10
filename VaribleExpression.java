package machine;

public class VaribleExpression implements IExpression {
	String name;
	ILispObject value;
	public VaribleExpression(){}
	public VaribleExpression(String name) {
		super();
		this.name = name;		
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public ILispObject getValue(Env env) {
		try {
			ILispObject o =  (ILispObject)env.search(this.name);
			return o;
		} catch (NoSuchMethodException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SecurityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		 
		return value;
	}
	public void setValue(ILispObject value) {
		this.value = value;
	}
	
	
	

}
