package machine;

public class LispObject implements ILispObject {
	Object car;
	Object cdr;
	public LispObject(Object car, Object cdr) {
		super();
		this.car = car;
		this.cdr = cdr;
	}
	public Object getCar() {
		return car;
	}
	public void setCar(Object car) {
		this.car = car;
	}
	public Object getCdr() {
		return cdr;
	}
	public void setCdr(Object cdr) {
		this.cdr = cdr;
	}
	
	@Override
	public ILispObject deepcopy() {
		// TODO Auto-generated method stub
		return null;
	}
	

}
