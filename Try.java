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
		testcompundexp2(evmachine,global);	
		
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

}
