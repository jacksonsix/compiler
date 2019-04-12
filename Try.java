package machine;

import java.lang.reflect.InvocationTargetException;
import java.util.LinkedList;
import java.util.List;

public class Try {
	public static void main(String[] args) throws Exception{
		EV evmachine = new EV();
		Env global = new Env();  
		//testdeepcopy();
		//testprimfuncs(global);
		//testcompundexp(evmachine,global);	
		//testcompundexp2(evmachine,global);	
		//testenv(evmachine,global);
		//testlambda(evmachine,global);
		testlambcomp(evmachine,global);
	}
	
	private static void testdeepcopy() throws InstantiationException, IllegalAccessException{
		List<IExpression> paras = new LinkedList<IExpression>();
		paras.add(new SelfExpression(3.4));
		CompoundExpression exp = new CompoundExpression(new SelfExpression(1),paras);
		Object o = IExpression.deepcopy(exp);
	}
	
	private static void testprimfuncs(Env global) throws NoSuchMethodException, SecurityException, IllegalAccessException, IllegalArgumentException, InvocationTargetException{
		    Object me = global.search("car");
	        PrimitiveProc prim = (PrimitiveProc)me;
	        LispObject lo = new LispObject(new SelfExpression(2),new SelfExpression("23"));
	        
	        
	        Object[] parameters = new Object[1];
	        parameters[0] =  lo;
	        Object test = prim.getProc().invoke(LowerBox.class,parameters);
	        
	        Object cons = global.search("cons");
	        PrimitiveProc prim1 = (PrimitiveProc)cons;
	        
	        Object[] parameters1 = new Object[2];
	        parameters1[0] = new SelfExpression(44);
	        parameters1[1] = new SelfExpression("next");
	        LispObject newone = (LispObject)prim1.getProc().invoke(LowerBox.class, parameters1);
	        
		
	}
	
	private static void testcompundexp(EV evmachine,Env global){
		// 
		LispObject lo = new LispObject(new SelfExpression(2),new SelfExpression("23"));
		global.defineVarible("d", lo);
		
		VaribleExpression op = new VaribleExpression("cdr");		
		
		List<IExpression> paras = new LinkedList<IExpression>();				
		VaribleExpression obj = new VaribleExpression("d");		
		paras.add(obj);
		
		CompoundExpression exp = new CompoundExpression(op,paras);
		try {
			Object o = evmachine.eval(exp,global);
			System.out.println(o.getClass().getName());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private static void testcompundexp2(EV evmachine,Env global){
		// 
		LispObject lo = new LispObject(new SelfExpression(2),new SelfExpression("23"));
		global.defineVarible("d", lo);
		
		SelfExpression se = new SelfExpression(8);
		global.defineVarible("second", se);
		
		VaribleExpression op = new VaribleExpression("cons");		
		
		List<IExpression> paras = new LinkedList<IExpression>();				
		VaribleExpression obj = new VaribleExpression("d");		
		
		paras.add(obj);
		paras.add(se);
		
		CompoundExpression exp = new CompoundExpression(op,paras);
		try {
			Object o = evmachine.eval(exp,global);
			System.out.println(o.getClass().getName());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	private static void testenv(EV evmachine,Env global) throws Exception{
		// 
		LispObject lo = new LispObject(new SelfExpression(2),new SelfExpression("23"));
		global.defineVarible("d", lo);
		
		SelfExpression se = new SelfExpression(8);
		global.setVarible("d", se);
		
		List<String> ns = new LinkedList<String>();
		List<Object> os = new  LinkedList<Object>();
		ns.add("f");
		os.add( new Integer(3));
		Env ext = global.Extend(global, ns, os);
	
		List<String> ns1 = new LinkedList<String>();
		List<Object> os1 = new  LinkedList<Object>();
		ns1.add("ff");
		os1.add( new Integer(3));
		Env ext1 = global.Extend(ext, ns1, os1);

	}
	private static void testlambda(EV evmachine,Env global) throws Exception{	
		List<String> paras = new LinkedList<String>();
		List<IExpression> body = new LinkedList<IExpression>();
		body.add(new SelfExpression(3));
		LambdaExpression exp = new LambdaExpression(paras,body);
		Object o = evmachine.eval(exp,global);

	}
	private static void testlambcomp(EV evmachine,Env global) throws Exception{
		List<String> paras = new LinkedList<String>();
		List<IExpression> body = new LinkedList<IExpression>();
		body.add(new SelfExpression(3));
		LambdaExpression exp = new LambdaExpression(paras,body);
		//Object o = evmachine.eval(exp,global);
		//VaribleExpression vexp = new VaribleExpression("l1");
		//vexp.setValue(evmachine.eval(exp,global));
		//List<IExpression> empty = new List<IExpression>();
		CompoundExpression cexp = new CompoundExpression(exp,null);
		Object o = evmachine.eval(cexp,global);
	}

}
