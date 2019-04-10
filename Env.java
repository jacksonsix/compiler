package machine;

import java.lang.reflect.Field;
import java.util.LinkedList;
import java.util.List;

public class Env {
	static Frame _global;
	Frame  tail;
	public Env() throws Exception{
		
		initGlobal();		
		this.tail =_global;
	}
	public static void initGlobal() throws Exception{
		_global = new Frame();		
		List<PrimitiveProc> prims = LowerBox.collectPrim();
		for(PrimitiveProc proc : prims){
			String name =proc.getName();		
			
			_global.addMember(name, proc);
		}
	}
	private static Frame getGlobal() {
		return _global;
	}

    private Env deepcopy() throws Exception{
    	Env env = new Env();   
    	Frame cur = this.getTail();
    	if(cur == this.getGlobal()){
    		return env;
    	}
    	Frame newcur = cur.deepcopy();
    	env.pushTail(newcur);
    	
    	Frame next = cur.getUplink();
    	while(next != this.getGlobal()){
    		Frame uframe = next.deepcopy();
    		newcur.setUplink(uframe);
    		newcur = uframe;
    		next = next.getUplink();
    	}
    	return env;
    }
    public void pushTail(Frame frame){
    	this.tail = frame;
    }
    private Frame getTail(){
    	return this.tail;
    }
	public Env Extend(Env base, List<String> names,List<ILispObject> values) throws Exception{		
		Frame frame = new Frame( names, values);
        // must a seperate copy, clone is not a choice	
		Env basecopy = base.deepcopy();
		// basecopy extend
		frame.setUplink(basecopy.tail); ;
		basecopy.pushTail(frame); 		
		return basecopy;
	}
	
	public Object search(String key) throws NoSuchMethodException, SecurityException{
		return  searchin(key, this.getTail());
	}
	private Object searchin(String key, Frame f) throws NoSuchMethodException, SecurityException{
		
		if(f.assoc(key) != null){
			return f.assoc(key);
		}else if(f == Env.getGlobal()){
			return null;
		}else{
			return searchin(key, f.getUplink());
		}
		
	}
	
	public String setVarible(String key, ILispObject o){
		Frame tail = getTail();
		tail.setMember(key, o);
		return "ok";
	}
	
	public String defineVarible(String key, ILispObject o){
		Frame tail = getTail();	
		tail.addMember(key, o);
		return "ok";
	}
	
	

}

class Frame{
	List<ILispObject> values;
	List<String> names;
	Frame up;
	public Frame () {
	
		this.values = new LinkedList<ILispObject>();
		this.names = new LinkedList<String>();
	}
	public Frame (List<String> names,List<ILispObject> values) {
		super();
		this.values = values;
		this.names = names;
	}
	
	public void addMember(String name,ILispObject obj){
		values.add(obj);
		names.add(name);
	}
	
	public void setMember(String name,ILispObject obj){
		int pos = names.indexOf(name);
		if(pos >-1){
		   values.set(pos, obj);	
		}
		
	}
	public void setUplink(Frame frame){
		this.up = frame;
	}
	public Frame getUplink(){
		return this.up;
	}
	public Object assoc(String key){
		if(names.indexOf(key) > -1){
			return values.get(names.indexOf(key));
		}
		return null;
	}
	
	public Frame deepcopy(){
		List<String> newnames = new LinkedList<String>();
		for(String s: this.names){
			newnames.add(s);
		}
		List<ILispObject> newvalues = new LinkedList<ILispObject>();
		for(ILispObject o : this.values){			
			newvalues.add(o.deepcopy());					
		}
		Frame n = new Frame(newnames,newvalues);
		return n;
	}


}
