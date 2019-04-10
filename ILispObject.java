package machine;

public interface ILispObject {
	Object getCar() ;
	void setCar(Object car);
	Object getCdr();
	void setCdr(Object cdr);	
	ILispObject deepcopy();
}
