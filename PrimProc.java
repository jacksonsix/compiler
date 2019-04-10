package machine;

import java.lang.reflect.Method;

public class PrimitiveProc implements ILispObject {

	String name;
	Method proc;
	boolean isPrim = true;	
	
	public PrimitiveProc(String name, Method proc) {
		super();
		this.name = name;
		this.proc = proc;
	}
	
	public String getName() {
		return name;
	}


	public void setName(String name) {
		this.name = name;
	}


	public Method getProc() {
		return proc;
	}


	public void setProc(Method proc) {
		this.proc = proc;
	}


	public boolean isPrim() {
		return isPrim;
	}


	public void setPrim(boolean isPrim) {
		this.isPrim = isPrim;
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

