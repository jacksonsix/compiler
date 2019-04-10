package machine;

import java.lang.reflect.InvocationTargetException;
import java.util.LinkedList;
import java.util.List;

public class EV {
    private void  log(String str){
    	System.out.println(str);
    }
	public Object eval(Object exp, Env env) throws Exception{
		String type="";
		if( exp instanceof  IExpression){
		   type= exp.getClass().getSimpleName();	
		}		
		else{		
			return exp;
		}
		switch(type){
		case "SelfExpression":
			return ((SelfExpression)exp).getValue();
		case "VaribleExpression":
			return ((VaribleExpression)exp).getValue(env);
		case "IfExpression":
			log("If");
			return EvalIf((IExpression)exp, env);	
		case "LambdaExpression":
			log("lambada");
			return EvalLambda((IExpression)exp,env);
		case "SequenceExpression":
			log("body sequence");
			return EvalSequenceExpression((IExpression)exp,env);
		case "CompoundExpression":
			Object lexp = ((CompoundExpression)exp).getOperator();
			
			ILispObject proc = (ILispObject)eval(lexp,env);
			List<IExpression> paras = ((CompoundExpression)exp).getParalist();
			List<Object> objs = new LinkedList<Object>();
			for(IExpression ex: paras){
				Object o = eval(ex,env);
				objs.add(o);
			}
			return apply(proc,objs,env);		
		default:
			log("something wrong, not in eval scope");
			throw new Exception("");
		}
	}
	
	
	private Object EvalSelf(IExpression exp, Env env){
		log("self value");
		
		return null;
	}
	private Object EvalIf(IExpression exp, Env env) throws Exception{
		log("Eval If");
		IfExpression iexp = (IfExpression)exp;
		IExpression pred = iexp.getPredicate();
		IExpression alt = iexp.getAlternate();
		IExpression first = iexp.getFirstexp();
		
		if(eval(pred,env) == False.value()){
			return eval(alt,env);
		}else{
			return eval(first,env);
		}
		
	}
	
	private Object EvalSequenceExpression(IExpression exp, Env env) throws Exception{
		List<IExpression> exps = ((SequenceExpression)exp).getSequence();
		return rEvalSequenceExpression(exps,env);
	}
	private Object rEvalSequenceExpression(List<IExpression> exps, Env env) throws Exception{
		if(exps == null) return IExpression.NullExpression();
		
		IExpression first = exps.get(0);
		if(first == null){
			return IExpression.NullExpression();
		}else if(exps.size() == 1){
			return eval(first,env);
		}else {
			eval(first,env);
			exps.remove(0);
			return rEvalSequenceExpression(exps, env);
		}
	}
	private Object EvalLambda(IExpression exp, Env env){
		log("Eval Lambda");
		LambdaExpression lexp = (LambdaExpression)exp; 
		List<String> paras = lexp.getParas();
		List<IExpression> body = lexp.getBody();
		Procedure proc = new Procedure(env,paras,body);
		return proc;
	}
	
	public Object apply(ILispObject proc,List<Object> paras, Env env) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException{
		log("apply");
		if(proc instanceof PrimitiveProc){
			return applyPrimitive((PrimitiveProc)proc,paras, env);
		}else{
			log("compound");
			return null;
		}
	}
	
	private Object applyPrimitive(PrimitiveProc proc,List<Object> paras, Env env) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException{
		log("prim apply");
        int size = paras.size();
        Object[] parameters = new Object[size];
        for(int i=0;i< size; i++){
        	 parameters[i] =  paras.get(i);
        }
       
        Object test = proc.getProc().invoke(LowerBox.class,parameters);
		return test;
	}
	
}
